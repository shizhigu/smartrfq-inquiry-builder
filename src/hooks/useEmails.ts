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
import { useEmailStore } from '@/stores/emailStore';

interface QuotationItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConversationWithSupplier extends Conversation {
  supplierName?: string;
  supplierEmail?: string;
  aiDetectedItems?: QuotationItem[];
  lastMessageWithItems?: string;
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
  
  fetchConversations: (page?: number, forceRefresh?: boolean) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (supplierId: string, subject: string, initialMessage: string) => Promise<void>;
  
  fetchEmails: (conversationId: string) => Promise<void>;
  sendNewEmail: (content: string, subject?: string, attachments?: File[]) => Promise<void>;
  downloadEmailAttachment: (attachmentId: string, filename: string) => Promise<void>;
  
  clearSelectedConversation: () => void;
}

export const useEmails = (): UseEmailsReturn => {
  const { getToken } = useAuth();
  const projectStoreSelectedId = useProjectStore(state => state.selectedProjectId);
  const requestInProgress = useRef(false);
  
  const { 
    conversations, 
    addConversations, 
    setConversations,
    setSelectedProjectId,
    setPage,
    setTotalPages,
    setTotalConversations,
    page, 
    pageSize, 
    totalPages, 
    totalConversations,
    isLoading: storeIsLoading,
    setLoading: setStoreLoading,
    error: storeError,
    setError: setStoreError,
    selectedConversationId,
    setSelectedConversationId
  } = useEmailStore();
  
  const selectedProjectId = useEmailStore(state => state.selectedProjectId);
  
  useEffect(() => {
    setSelectedProjectId(projectStoreSelectedId);
  }, [projectStoreSelectedId, setSelectedProjectId]);
  
  const [emails, setEmails] = useState<Record<string, Email[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const extractSupplierInfo = (conversation: Conversation): ConversationWithSupplier => {
    if (conversation.supplier_name || conversation.supplier_email) {
      return {
        ...conversation,
        supplierName: conversation.supplier_name || "Unknown Supplier",
        supplierEmail: conversation.supplier_email || "No email available"
      };
    }
    
    if (conversation.supplierId) {
      const supplierIdShort = conversation.supplierId.substring(0, 8);
      return {
        ...conversation,
        supplierName: `Supplier ${supplierIdShort}`,
        supplierEmail: "supplier@example.com"
      };
    }
    
    return {
      ...conversation,
      supplierName: "Unknown Supplier",
      supplierEmail: "No email available"
    };
  };
  
  const fetchConversations = useCallback(async (pageNum: number = 1, forceRefresh: boolean = false) => {
    const projectConversations = conversations[selectedProjectId] || [];
    
    if (!forceRefresh && projectConversations.length > 0 && pageNum === 1) {
      console.log('Using cached conversations from store');
      return;
    }
    
    if (requestInProgress.current || !selectedProjectId) {
      if (!selectedProjectId) {
        setError('No project selected');
        setStoreError('No project selected');
      }
      return;
    }
    
    requestInProgress.current = true;
    setIsLoading(true);
    setStoreLoading(true);
    setError(null);
    setStoreError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      console.log(`Fetching conversations for project: ${selectedProjectId}, page: ${pageNum}`);
      const response = await getConversations(token, selectedProjectId, pageNum, pageSize);
      
      const enrichedConversationsPromises = response.items.map(async (conversation) => {
        try {
          const detailedConversation = await getConversation(token, conversation.id);
          return extractSupplierInfo(detailedConversation);
        } catch (error) {
          console.error(`Failed to get detailed info for conversation ${conversation.id}:`, error);
          return extractSupplierInfo(conversation);
        }
      });
      
      const enrichedConversations = await Promise.all(enrichedConversationsPromises);
      
      if (pageNum === 1) {
        setConversations(selectedProjectId, enrichedConversations);
      } else {
        addConversations(selectedProjectId, enrichedConversations);
      }
      
      setPage(response.page);
      setTotalPages(response.pages);
      setTotalConversations(response.total);
      
      setIsLoading(false);
      setStoreLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
      setError(errorMessage);
      setStoreError(errorMessage);
      toast.error('Failed to fetch conversations');
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
      setStoreLoading(false);
    }
  }, [getToken, selectedProjectId, pageSize, conversations, addConversations, setConversations, setPage, setTotalPages, setTotalConversations, setStoreLoading, setStoreError]);
  
  const selectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsLoading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      console.log(`Fetching detailed conversation with ID: ${conversationId}`);
      const detailedConversation = await getConversation(token, conversationId);
      
      const enrichedConversation = extractSupplierInfo(detailedConversation);
      
      const projectConversations = [...(conversations[selectedProjectId] || [])];
      const index = projectConversations.findIndex(c => c.id === conversationId);
      
      if (index !== -1) {
        projectConversations[index] = enrichedConversation;
        setConversations(selectedProjectId, projectConversations);
      }
      
      if (!emails[conversationId]) {
        await fetchEmails(conversationId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error selecting conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  const fetchEmails = async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const fetchedEmails = await getEmailsForConversation(token, conversationId);
      
      setEmails(prev => ({
        ...prev,
        [conversationId]: fetchedEmails
      }));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails';
      setError(errorMessage);
      setIsLoading(false);
      toast.error('Failed to fetch emails');
    }
  };
  
  const createNewConversation = async (supplierId: string, subject: string, initialMessage: string) => {
    if (!selectedProjectId) {
      setError('No project selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
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
      
      await fetchConversations(1, true);
      
      await selectConversation(newConversation.id);
      
      toast.success('Conversation created successfully');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      setError(errorMessage);
      toast.error('Failed to create conversation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendNewEmail = async (content: string, subject?: string, attachments?: File[]) => {
    if (!selectedConversationId) {
      toast.error('No conversation selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const newEmail = await sendEmail(
        token, 
        selectedConversationId, 
        content, 
        subject, 
        attachments
      );
      
      setEmails(prev => {
        const conversationEmails = prev[selectedConversationId] || [];
        return {
          ...prev,
          [selectedConversationId]: [...conversationEmails, newEmail]
        };
      });
      
      await fetchConversations(page, true);
      
      toast.success('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      setError(errorMessage);
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
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
    setSelectedConversationId(null);
  };
  
  useEffect(() => {
    requestInProgress.current = false;
    
    if (selectedProjectId) {
      fetchConversations();
    }
  }, [selectedProjectId, fetchConversations]);
  
  const projectConversations = conversations[selectedProjectId] || [];
  
  const selectedConversation = selectedConversationId
    ? projectConversations.find(c => c.id === selectedConversationId) || null
    : null;
  
  const conversationEmails = selectedConversationId 
    ? emails[selectedConversationId] || [] 
    : [];
  
  return {
    conversations: projectConversations,
    emails: conversationEmails,
    selectedConversation,
    isLoading: isLoading || storeIsLoading,
    error: error || storeError,
    
    page,
    pageSize,
    totalPages,
    totalConversations,
    
    fetchConversations,
    selectConversation,
    createNewConversation,
    
    fetchEmails,
    sendNewEmail,
    downloadEmailAttachment,
    
    clearSelectedConversation,
  };
};
