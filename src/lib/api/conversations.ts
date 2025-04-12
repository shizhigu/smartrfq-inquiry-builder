import { API_CONFIG, useMockData } from '../config';
import { mockConversations } from '../mock/mockData';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  projectId: string;
  supplierId: string;
  subject: string;
  lastMessagePreview: string;
  lastMessageDate: string;
  unreadCount: number;
  messageCount: number;
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
  status?: string;
  last_activity?: string;
}

export interface ConversationResponse {
  items: Conversation[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/**
 * 获取项目的所有会话
 */
export async function getConversations(
  token: string,
  projectId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ConversationResponse> {
  // 使用模拟数据（如果启用）
  if (useMockData()) {
    console.log('Using mock data for getConversations with projectId:', projectId);
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // For mock data, it's okay to use non-UUID project IDs like "project_2"
    // 按照项目ID过滤会话
    const filteredConversations = mockConversations.filter(
      conv => conv.projectId === projectId
    );
    
    // 创建分页响应
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredConversations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredConversations.length / pageSize);
    
    return {
      items: paginatedItems,
      total: filteredConversations.length,
      page,
      page_size: pageSize,
      pages: totalPages
    };
  }
  
  // 实际 API 调用 - validate UUID format for real API calls
  // Check if projectId is a valid UUID before making the API call
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId);
  
  if (!isValidUUID) {
    console.error('Invalid project ID format for API call:', projectId);
    // Return empty response instead of making invalid API call
    return {
      items: [],
      total: 0,
      page,
      page_size: pageSize,
      pages: 0
    };
  }
  
  const url = new URL(`${API_CONFIG.BASE_URL}/conversations`);
  
  // 添加查询参数
  if (projectId) {
    url.searchParams.append('project_id', projectId);
  }
  url.searchParams.append('page', page.toString());
  url.searchParams.append('page_size', pageSize.toString());
  
  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch conversations');
  }

  return await response.json();
}

/**
 * 获取单个会话详情
 */
export async function getConversation(
  token: string,
  conversationId: string
): Promise<Conversation> {
  // 使用模拟数据（如果启用）
  if (useMockData()) {
    console.log('Using mock data for getConversation');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return {
      ...conversation,
      // lastMessageDate is already a string, no need to convert
    };
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/conversations/${conversationId}`, 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch conversation');
  }

  return await response.json();
}

/**
 * 创建新会话
 */
export async function createConversation(
  token: string,
  projectId: string,
  supplierId: string,
  subject: string,
  initialMessage: string
): Promise<Conversation> {
  // 使用模拟数据（如果启用）
  if (useMockData()) {
    console.log('Using mock data for createConversation');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      projectId,
      supplierId,
      subject,
      lastMessagePreview: initialMessage.substring(0, 100) + (initialMessage.length > 100 ? '...' : ''),
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
      messageCount: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 在实际应用中，这会持久化到服务器
    (mockConversations as any).push({
      ...newConversation,
      lastMessageDate: new Date()
    });
    
    return newConversation;
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/conversations`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        supplier_id: supplierId,
        subject,
        message: initialMessage
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create conversation');
  }

  return await response.json();
}

/**
 * 将会话标记为已读
 */
export async function markConversationAsRead(
  token: string,
  conversationId: string
): Promise<void> {
  // 使用模拟数据（如果启用）
  if (useMockData()) {
    console.log('Using mock data for markConversationAsRead');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
    
    return;
  }
  
  // 实际 API 调用 - wrapped in try/catch to handle 404 errors gracefully
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/conversations/${conversationId}/read`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      // Check if it's a 404 specifically
      if (response.status === 404) {
        console.error('Endpoint not found: The /conversations/:id/read endpoint is not available');
        // Still mark it as read locally
        // We could implement a fallback method here if needed
        return;
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to mark conversation as read');
    }
  } catch (error) {
    console.error('Failed to mark conversation as read:', error);
    // Don't rethrow the error to avoid breaking the UI
    // Just log it and continue
  }
}

/**
 * 归档会话
 */
export async function archiveConversation(
  token: string,
  conversationId: string
): Promise<void> {
  // 使用模拟数据（如果启用）
  if (useMockData()) {
    console.log('Using mock data for archiveConversation');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 在实际应用中，我们会从激活的会话列表中移除此会话
    const index = mockConversations.findIndex(conv => conv.id === conversationId);
    if (index !== -1) {
      mockConversations.splice(index, 1);
    }
    
    return;
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/conversations/${conversationId}/archive`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to archive conversation');
  }
}
