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

// 内部状态接口
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

// Hook 返回类型
interface UseEmailsReturn {
  // 数据
  conversations: Conversation[];
  emails: Email[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  
  // 分页
  page: number;
  pageSize: number;
  totalPages: number;
  totalConversations: number;
  
  // 会话操作
  fetchConversations: (page?: number) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (supplierId: string, subject: string, initialMessage: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  
  // 邮件操作
  fetchEmails: (conversationId: string) => Promise<void>;
  sendNewEmail: (content: string, subject?: string, attachments?: File[]) => Promise<void>;
  markEmailRead: (emailId: string) => Promise<void>;
  downloadEmailAttachment: (attachmentId: string, filename: string) => Promise<void>;
  
  // 界面操作
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
  
  // 获取会话列表 - using useCallback with proper dependencies to prevent recreation
  const fetchConversations = useCallback(async (page: number = 1) => {
    // Check if there's already a request in progress or if no project is selected
    if (requestInProgress.current || !selectedProjectId) {
      if (!selectedProjectId) {
        setState(prev => ({ ...prev, error: 'No project selected', isLoading: false }));
      }
      return;
    }
    
    // Set the request flag to prevent duplicate requests
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
      // Always clear the request flag when done, regardless of success or failure
      requestInProgress.current = false;
    }
  }, [getToken, selectedProjectId, state.pageSize]);
  
  // 选择特定会话
  const selectConversation = async (conversationId: string) => {
    setState(prev => ({ ...prev, selectedConversationId: conversationId, isLoading: true }));
    
    try {
      // 如果还没有获取过此会话的邮件，则获取它们
      if (!state.emails[conversationId]) {
        await fetchEmails(conversationId);
      }
      
      // 将会话标记为已读
      await markConversationRead(conversationId);
    } catch (error) {
      console.error('Error selecting conversation:', error);
      // 即使出错，我们仍然保持会话被选中，但会显示错误消息
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load conversation',
        isLoading: false 
      }));
    }
  };
  
  // 获取会话中的邮件
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
  
  // 创建新会话
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
      
      // 重新获取会话列表
      await fetchConversations();
      
      // 选择新创建的会话
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
  
  // 发送新邮件
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
      
      // 更新本地状态
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
      
      // 重新获取会话列表以更新最新消息预览
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
  
  // 将会话标记为已读
  const markConversationRead = async (conversationId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await markConversationAsRead(token, conversationId);
      
      // 更新本地状态
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      }));
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
      // 不显示错误消息，因为这不是一个关键操作
    }
  };
  
  // 将邮件标记为已读
  const markEmailRead = async (emailId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      await markEmailAsRead(token, emailId);
      
      // 更新本地状态
      setState(prev => {
        // 找到邮件所在的会话
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
      // 不显示错误消息，因为这不是一个关键操作
    }
  };
  
  // 下载附件
  const downloadEmailAttachment = async (attachmentId: string, filename: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get authentication token');
      }
      
      const blob = await downloadAttachment(token, attachmentId);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error('Failed to download attachment');
    }
  };
  
  // 清除选中的会话
  const clearSelectedConversation = () => {
    setState(prev => ({ ...prev, selectedConversationId: null }));
  };
  
  // 当项目变更时，获取会话列表
  useEffect(() => {
    // Reset the request flag when project changes
    requestInProgress.current = false;
    
    // Check if there's a valid project ID before fetching
    if (selectedProjectId) {
      // Fetch conversations only if not already loading
      fetchConversations();
    } else {
      // If no project selected, reset state
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
    
    // Only include selectedProjectId in the dependency array
    // This prevents fetchConversations from causing re-renders
  }, [selectedProjectId]);
  
  // 找到选中的会话
  const selectedConversation = state.selectedConversationId
    ? state.conversations.find(c => c.id === state.selectedConversationId) || null
    : null;
  
  // 获取当前会话的邮件
  const emails = state.selectedConversationId 
    ? state.emails[state.selectedConversationId] || []
    : [];
  
  return {
    // 数据
    conversations: state.conversations,
    emails,
    selectedConversation,
    isLoading: state.isLoading,
    error: state.error,
    
    // 分页
    page: state.page,
    pageSize: state.pageSize,
    totalPages: state.totalPages,
    totalConversations: state.totalConversations,
    
    // 会话操作
    fetchConversations,
    selectConversation,
    createNewConversation,
    markConversationRead,
    
    // 邮件操作
    fetchEmails,
    sendNewEmail,
    markEmailRead,
    downloadEmailAttachment,
    
    // 界面操作
    clearSelectedConversation,
  };
};
