export interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: any; // Firestore Timestamp
  chatId: string;
}

export interface Chat {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage?: string;
  lastMessageTimestamp?: any;
  status: 'open' | 'closed' | 'pending';
  agentId?: string;
  unreadCount: number;
}

export interface Agent {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
}

export interface UazapiConfig {
  baseUrl: string;
  apiKey: string;
  instanceId: string;
}
