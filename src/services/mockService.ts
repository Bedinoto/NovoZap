import { Chat, Message, Agent } from './types';

// In-memory mock data for demo since Firebase was declined
let chats: Chat[] = [
  {
    id: '1',
    customerName: 'João Silva',
    customerPhone: '5511999999999',
    lastMessage: 'Olá, gostaria de saber o preço.',
    lastMessageTimestamp: { toDate: () => new Date() },
    status: 'open',
    unreadCount: 2
  },
  {
    id: '2',
    customerName: 'Maria Oliveira',
    customerPhone: '5511888888888',
    lastMessage: 'Obrigada pelo atendimento!',
    lastMessageTimestamp: { toDate: () => new Date(Date.now() - 3600000) },
    status: 'closed',
    unreadCount: 0
  }
];

let messages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', chatId: '1', sender: 'customer', text: 'Olá, tudo bem?', timestamp: { toDate: () => new Date(Date.now() - 7200000) } },
    { id: 'm2', chatId: '1', sender: 'agent', text: 'Olá! Em que posso ajudar?', timestamp: { toDate: () => new Date(Date.now() - 7100000) } },
    { id: 'm3', chatId: '1', sender: 'customer', text: 'Gostaria de saber o preço do plano premium.', timestamp: { toDate: () => new Date(Date.now() - 7000000) } },
  ],
  '2': [
    { id: 'm4', chatId: '2', sender: 'customer', text: 'Oi, meu pedido chegou!', timestamp: { toDate: () => new Date(Date.now() - 86400000) } },
    { id: 'm5', chatId: '2', sender: 'agent', text: 'Que ótimo! Ficamos felizes.', timestamp: { toDate: () => new Date(Date.now() - 86300000) } },
  ]
};

export const mockService = {
  getChats: () => Promise.resolve([...chats]),
  getMessages: (chatId: string) => Promise.resolve([...(messages[chatId] || [])]),
  
  sendMessage: (chatId: string, text: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      chatId,
      sender: 'agent',
      text,
      timestamp: { toDate: () => new Date() }
    };
    
    if (!messages[chatId]) messages[chatId] = [];
    messages[chatId].push(newMessage);
    
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = text;
      chats[chatIndex].lastMessageTimestamp = newMessage.timestamp;
    }
    
    return Promise.resolve(newMessage);
  },

  addIncomingMessage: (phone: string, text: string) => {
    let chat = chats.find(c => c.customerPhone === phone);
    
    if (!chat) {
      chat = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        customerName: 'Novo Cliente',
        customerPhone: phone,
        status: 'open',
        unreadCount: 0
      };
      chats.push(chat);
    }
    
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      chatId: chat.id,
      sender: 'customer',
      text,
      timestamp: { toDate: () => new Date() }
    };
    
    if (!messages[chat.id]) messages[chat.id] = [];
    messages[chat.id].push(newMessage);
    
    chat.lastMessage = text;
    chat.lastMessageTimestamp = newMessage.timestamp;
    chat.unreadCount++;
    
    return Promise.resolve(newMessage);
  }
};
