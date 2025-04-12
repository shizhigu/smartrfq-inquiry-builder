import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { 
  getConversations, 
  getConversation,
  createConversation, 
  Conversation
} from '@/lib/api/conversations';
import { 
  getEmailsForConversation, 
  getEmail, 
  sendEmail, 
  downloadAttachment,
  Email
} from '@/lib/api/emails';
import { getSupplier } from '@/lib/api/suppliers';

// Extended conversation type with supplier details
export interface ConversationWithSupplier extends Conversation {
  supplierName?: string;
  supplierEmail?: string;
}

interface EmailsState {
  conversations: ConversationWithSupplier[];
  emails: Record<string, Email[]>;
  selectedConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  totalConversations: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseEmailsReturn {
  conversations: ConversationWithSupplier[];
  emails: Email[];
  selectedConversation: ConversationWithSupplier | null;
  isLoading: boolean;
  error: string | null;
  
  page: number;
  pageSize: number;
  totalPages: number;
  totalConversations: number;
  
  fetchConversations: (page?: number) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (supplierId: string, subject: string, initialMessage: string) => Promise<void>;
  
  fetchEmails: (conversationId: string) => Promise<void>;
  sendNewEmail: (content: string, subject?: string, attachments?: File[]) => Promise<void>;
  downloadEmailAttachment: (attachmentId: string, filename: string) => Promise<void>;
  
  clearSelectedConversation: () => void;
}

export const useEmails = (): UseEmailsReturn => {
  const { getToken } = useAuth();
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const requestInProgress = useRef(false);
  
  const [state, setState] = useState<EmailsState>({
    conversations: [],
    emails: {},
    selectedConversationId: null,
    isLoading: false,
    error: null,
    totalConversations: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  });
  
  // Function to fetch supplier details for conversations
  const enrichConversationsWithSupplierInfo = async (
    token: string,
    conversations: Conversation[]
  ): Promise<ConversationWithSupplier[]> => {
    const enrichedConversations: ConversationWithSupplier[] = [];
    
    for (const conversation of conversations) {
      try {
        // Only attempt to fetch supplier details if supplierId exists and is valid
        if (conversation.supplierId) {
          console.log(`Fetching supplier details for ID: ${conversation.supplierId}`);
          
          // Get supplier details
          const supplier = await getSupplier(token, conversation.supplierId);
          
          // Add supplier details to conversation
          enrichedConversations.push({
            ...conversation,
            supplierName: supplier.name,
            supplierEmail: supplier.email
          });
        } else {
          // If there's no supplierId, just add the conversation with placeholder data
          console.warn(`Conversation ${conversation.id} has no supplierId`);
          enrichedConversations.push({
            ...conversation,
            supplierName: 'Unknown Supplier',
            supplierEmail: 'No email available'
          });
        }
      } catch (error) {
        console.error(`Failed to fetch supplier details for conversation ${conversation.id}:`, error);
        // Still include the conversation, but with error indication
        enrichedConversations.push({
          ...conversation,
          supplierName: 'Error Loading Supplier',
          supplierEmail: 'Could not load email'
        });
      }
    }
    
    return enrichedConversations;
  };
  
  const fetchConversations = useCallback(async (page: number = 1) => {
    if (requestInProgress.current || !selectedProjectId) {
      if (!selectedProjectId) {
        setState(prev => ({ ...prev, error: 'No project selected', isLoading: false }));
      }
      return;
    }
    
    requestInProgress.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const response = await getConversations(token, selectedProjectId, page, state.pageSize);
      
      // Enrich conversations with supplier details
      const enrichedConversations = await enrichConversationsWithSupplierInfo(token, response.items);
      
      setState(prev => ({
        ...prev,
        conversations: enrichedConversations,
        totalConversations: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.pages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
        isLoading: false
      }));
      toast.error('Failed to fetch conversations');
    } finally {
      requestInProgress.current = false;
    }
  }, [getToken, selectedProjectId, state.pageSize]);
  
  const selectConversation = async (conversationId: string) => {
    setState(prev => ({ ...prev, selectedConversationId: conversationId, isLoading: true }));
    
    try {
      if (!state.emails[conversationId]) {
        await fetchEmails(conversationId);
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load conversation',
        isLoading: false 
      }));
    }
  };
  
  const fetchEmails = async (conversationId: string) => {
    if (!conversationId) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const emails = await getEmailsForConversation(token, conversationId);
      
      setState(prev => ({
        ...prev,
        emails: { ...prev.emails, [conversationId]: emails },
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch emails',
        isLoading: false 
      }));
      toast.error('Failed to fetch emails');
    }
  };
  
  const createNewConversation = async (supplierId: string, subject: string, initialMessage: string) => {
    if (!selectedProjectId) {
      setState(prev => ({ ...prev, error: 'No project selected' }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const newConversation = await createConversation(
        token, 
        selectedProjectId, 
        supplierId, 
        subject, 
        initialMessage
      );
      
      await fetchConversations();
      
      await selectConversation(newConversation.id);
      
      toast.success('Conversation created successfully');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create conversation',
        isLoading: false 
      }));
      toast.error('Failed to create conversation');
    }
  };
  
  const sendNewEmail = async (content: string, subject?: string, attachments?: File[]) => {
    if (!state.selectedConversationId) {
      toast.error('No conversation selected');
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const newEmail = await sendEmail(
        token, 
        state.selectedConversationId, 
        content, 
        subject, 
        attachments
      );
      
      setState(prev => {
        const conversationEmails = prev.emails[state.selectedConversationId!] || [];
        return {
          ...prev,
          emails: { 
            ...prev.emails, 
            [state.selectedConversationId!]: [...conversationEmails, newEmail] 
          },
          isLoading: false
        };
      });
      
      await fetchConversations(state.page);
      
      toast.success('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to send email',
        isLoading: false 
      }));
      toast.error('Failed to send email');
    }
  };
  
  const downloadEmailAttachment = async (attachmentId: string, filename: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const blob = await downloadAttachment(token, attachmentId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error('Failed to download attachment');
    }
  };
  
  const clearSelectedConversation = () => {
    setState(prev => ({ ...prev, selectedConversationId: null }));
  };
  
  useEffect(() => {
    requestInProgress.current = false;
    
    if (selectedProjectId) {
      fetchConversations();
    } else {
      setState({
        conversations: [],
        emails: {},
        selectedConversationId: null,
        isLoading: false,
        error: null,
        totalConversations: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      });
    }
  }, [selectedProjectId, fetchConversations]);
  
  const selectedConversation = state.selectedConversationId
    ? state.conversations.find(c => c.id === state.selectedConversationId) || null
    : null;
  
  const emails = state.selectedConversationId 
    ? state.emails[state.selectedConversationId] || []
    : [];
  
  return {
    conversations: state.conversations,
    emails,
    selectedConversation,
    isLoading: state.isLoading,
    error: state.error,
    
    page: state.page,
    pageSize: state.pageSize,
    totalPages: state.totalPages,
    totalConversations: state.totalConversations,
    
    fetchConversations,
    selectConversation,
    createNewConversation,
    
    fetchEmails,
    sendNewEmail,
    downloadEmailAttachment,
    
    clearSelectedConversation,
  };
};
