import { API_CONFIG } from '../config';
import { ENABLE_MOCKS } from '../mock/mockData';

export interface EmailSender {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  url: string;
  content_type: string;
}

export interface Email {
  id: string;
  conversation_id: string;
  subject: string;
  content: string;
  from: EmailSender;
  to: EmailSender;
  timestamp: string;
  read: boolean;
  attachments: EmailAttachment[];
}

// 模拟邮件数据
const mockEmailsForConversation: Record<string, Email[]> = {
  'conv1': [
    {
      id: 'email1',
      conversation_id: 'conv1',
      subject: 'RFQ for Project Components',
      content: 'Hello, I would like to request a quote for the following items...',
      from: { id: 'user', name: 'Me', email: 'me@company.com' },
      to: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      timestamp: new Date('2025-04-05T14:30:00').toISOString(),
      read: true,
      attachments: [
        {
          id: 'att1',
          name: 'specifications.pdf',
          size: 245000,
          url: '/files/specifications.pdf',
          content_type: 'application/pdf'
        },
        {
          id: 'att2',
          name: 'drawing.dwg',
          size: 183000,
          url: '/files/drawing.dwg',
          content_type: 'application/acad'
        }
      ]
    },
    {
      id: 'email2',
      conversation_id: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Thank you for your inquiry. We can provide the following quotes...',
      from: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      to: { id: 'user', name: 'Me', email: 'me@company.com' },
      timestamp: new Date('2025-04-06T09:45:00').toISOString(),
      read: true,
      attachments: [
        {
          id: 'att3',
          name: 'quote.pdf',
          size: 126000,
          url: '/files/quote.pdf',
          content_type: 'application/pdf'
        }
      ]
    },
    {
      id: 'email3',
      conversation_id: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Thank you for the quote. I have a few questions about the specifications...',
      from: { id: 'user', name: 'Me', email: 'me@company.com' },
      to: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      timestamp: new Date('2025-04-07T11:20:00').toISOString(),
      read: true,
      attachments: []
    },
    {
      id: 'email4',
      conversation_id: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Here are the answers to your questions about the specifications. Please let me know if you need any further clarification...',
      from: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      to: { id: 'user', name: 'Me', email: 'me@company.com' },
      timestamp: new Date('2025-04-09T14:30:00').toISOString(),
      read: false,
      attachments: [
        {
          id: 'att4',
          name: 'revised_quote.pdf',
          size: 132000,
          url: '/files/revised_quote.pdf',
          content_type: 'application/pdf'
        }
      ]
    }
  ],
  'conv2': [
    {
      id: 'email5',
      conversation_id: 'conv2',
      subject: 'Quote Request for Custom Parts',
      content: 'We are looking for custom parts with the following specifications...',
      from: { id: 'user', name: 'Me', email: 'me@company.com' },
      to: { id: '2', name: 'XYZ Manufacturing', email: 'info@xyzmanufacturing.com' },
      timestamp: new Date('2025-04-08T08:15:00').toISOString(),
      read: true,
      attachments: []
    },
    {
      id: 'email6',
      conversation_id: 'conv2',
      subject: 'RE: Quote Request for Custom Parts',
      content: 'We have reviewed your request and would like to discuss the specifications further...',
      from: { id: '2', name: 'XYZ Manufacturing', email: 'info@xyzmanufacturing.com' },
      to: { id: 'user', name: 'Me', email: 'me@company.com' },
      timestamp: new Date('2025-04-08T09:15:00').toISOString(),
      read: true,
      attachments: []
    }
  ]
};

/**
 * 获取会话中的所有邮件
 */
export async function getEmailsForConversation(
  token: string,
  conversationId: string
): Promise<Email[]> {
  // 使用模拟数据（如果启用）
  if (ENABLE_MOCKS) {
    console.log('Using mock data for getEmailsForConversation');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const emails = mockEmailsForConversation[conversationId] || [];
    
    if (!emails.length) {
      throw new Error('No emails found for this conversation');
    }
    
    return emails;
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/conversations/${conversationId}/emails`, 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch emails');
  }

  return await response.json();
}

/**
 * 获取单个邮件详情
 */
export async function getEmail(
  token: string,
  emailId: string
): Promise<Email> {
  // 使用模拟数据（如果启用）
  if (ENABLE_MOCKS) {
    console.log('Using mock data for getEmail');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 在所有会话中查找邮件
    for (const conversationId in mockEmailsForConversation) {
      const email = mockEmailsForConversation[conversationId].find(
        email => email.id === emailId
      );
      
      if (email) {
        return email;
      }
    }
    
    throw new Error('Email not found');
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/emails/${emailId}`, 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch email');
  }

  return await response.json();
}

/**
 * 将邮件标记为已读
 */
export async function markEmailAsRead(
  token: string,
  emailId: string
): Promise<void> {
  // 使用模拟数据（如果启用）
  if (ENABLE_MOCKS) {
    console.log('Using mock data for markEmailAsRead');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 在所有会话中查找邮件
    for (const conversationId in mockEmailsForConversation) {
      const email = mockEmailsForConversation[conversationId].find(
        email => email.id === emailId
      );
      
      if (email) {
        email.read = true;
        return;
      }
    }
    
    throw new Error('Email not found');
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/emails/${emailId}/read`, 
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
    throw new Error(errorData.error?.message || 'Failed to mark email as read');
  }
}

/**
 * 发送新邮件
 */
export async function sendEmail(
  token: string,
  conversationId: string,
  content: string,
  subject?: string,
  attachments?: File[]
): Promise<Email> {
  // 使用模拟数据（如果启用）
  if (ENABLE_MOCKS) {
    console.log('Using mock data for sendEmail');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 查找会话
    if (!mockEmailsForConversation[conversationId]) {
      throw new Error('Conversation not found');
    }
    
    const conversation = mockEmailsForConversation[conversationId];
    
    // 获取最后一封邮件，并确定收件人
    const lastEmail = conversation[conversation.length - 1];
    const from = { id: 'user', name: 'Me', email: 'me@company.com' };
    const to = lastEmail.from.id !== 'user' ? lastEmail.from : lastEmail.to;
    
    // 创建新邮件
    const newEmail: Email = {
      id: `email_${Date.now()}`,
      conversation_id: conversationId,
      subject: subject || (lastEmail.subject.startsWith('RE: ') 
        ? lastEmail.subject 
        : `RE: ${lastEmail.subject}`),
      content,
      from,
      to,
      timestamp: new Date().toISOString(),
      read: true,
      attachments: []
    };
    
    // 添加到会话
    conversation.push(newEmail);
    
    return newEmail;
  }
  
  // 实际 API 调用 - 使用 FormData 来处理附件
  const formData = new FormData();
  formData.append('content', content);
  
  if (subject) {
    formData.append('subject', subject);
  }
  
  if (attachments && attachments.length > 0) {
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }
  
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/conversations/${conversationId}/emails`, 
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to send email');
  }

  return await response.json();
}

/**
 * 下载邮件附件
 */
export async function downloadAttachment(
  token: string,
  attachmentId: string
): Promise<Blob> {
  // 使用模拟数据（如果启用）
  if (ENABLE_MOCKS) {
    console.log('Using mock data for downloadAttachment');
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 在实际应用中，我们会返回文件内容
    // 这里我们只返回一个空的 Blob 对象
    return new Blob(['Mock attachment content'], { type: 'application/octet-stream' });
  }
  
  // 实际 API 调用
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/attachments/${attachmentId}/download`, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to download attachment');
  }

  return await response.blob();
}

// 导出模拟数据以供在其他文件中使用
export { mockEmailsForConversation }; 