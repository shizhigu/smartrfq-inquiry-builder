
import { create } from 'zustand';
import { ConversationWithSupplier } from '@/hooks/useEmails';

interface EmailState {
  // Store conversations by project ID
  conversations: Record<string, ConversationWithSupplier[]>;
  selectedConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalConversations: number;
  
  // Actions
  setConversations: (projectId: string, conversations: ConversationWithSupplier[]) => void;
  addConversations: (projectId: string, conversations: ConversationWithSupplier[]) => void;
  updateConversation: (projectId: string, conversationId: string, updates: Partial<ConversationWithSupplier>) => void;
  setSelectedConversationId: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalConversations: (total: number) => void;
}

export const useEmailStore = create<EmailState>((set) => ({
  conversations: {},
  selectedConversationId: null,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  totalConversations: 0,
  
  setConversations: (projectId, conversations) => set(state => ({
    conversations: {
      ...state.conversations,
      [projectId]: conversations
    }
  })),
  
  addConversations: (projectId, newConversations) => set(state => {
    const existingConversations = state.conversations[projectId] || [];
    
    // Add only conversations that don't already exist in the array
    const updatedConversations = [...existingConversations];
    
    newConversations.forEach(newConv => {
      const exists = updatedConversations.some(conv => conv.id === newConv.id);
      if (!exists) {
        updatedConversations.push(newConv);
      }
    });
    
    return {
      conversations: {
        ...state.conversations,
        [projectId]: updatedConversations
      }
    };
  }),
  
  updateConversation: (projectId, conversationId, updates) => set(state => {
    const projectConversations = state.conversations[projectId] || [];
    const updatedConversations = projectConversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    );
    
    return {
      conversations: {
        ...state.conversations,
        [projectId]: updatedConversations
      }
    };
  }),
  
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalConversations: (totalConversations) => set({ totalConversations })
}));
