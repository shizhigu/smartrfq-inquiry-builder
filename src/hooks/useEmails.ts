import { useState, useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useAuth, useOrganization } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { 
  getConversations, 
  getConversation,
  createConversation, 
  markConversationAsRead,
  Conversation
} from '@/lib/api/conversations';
import { 
  getEmailsForConversation, 
  getEmail, 
  markEmailAsRead, 
  sendEmail, 
  downloadAttachment,
  Email
} from '@/lib/api/emails';

interface EmailsState {
  conversations: Conversation[];
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
  conversations: Conversation[];
  emails: Email[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  
  page: number;
  pageSize: number;
  totalPages: number;
  totalConversations: number;
  
  fetchConversations: (page?: number) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (supplierId: string, subject: string, initialMessage: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  
  fetchEmails: (conversationId: string) => Promise<void>;
  sendNewEmail: (content: string, subject?: string, attachments?: File[]) => Promise<void>;
  markEmailRead: (emailId: string) => Promise<void>;
  downloadEmailAttachment: (attachmentId: string, filename: string) => Promise<void>;
  
  clearSelectedConversation: () => void;
}

export const useEmails = (): UseEmailsReturn => {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
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
      
      setState(prev => ({
        ...prev,
        conversations: response.items,
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
      
      await markConversationRead(conversationId);
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
  
  const markConversationRead = async (conversationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await markConversationAsRead(token, conversationId);
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        ),
        isLoading: false
      }));
    }
  };
  
  const markEmailRead = async (emailId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await markEmailAsRead(token, emailId);
      
      setState(prev => {
        let updatedEmails = { ...prev.emails };
        
        for (const conversationId in updatedEmails) {
          updatedEmails[conversationId] = updatedEmails[conversationId].map(email => 
            email.id === emailId ? { ...email, read: true } : email
          );
        }
        
        return { ...prev, emails: updatedEmails };
      });
    } catch (error) {
      console.error('Failed to mark email as read:', error);
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
  }, [selectedProjectId]);
  
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
    markConversationRead,
    
    fetchEmails,
    sendNewEmail,
    markEmailRead,
    downloadEmailAttachment,
    
    clearSelectedConversation,
  };
};
