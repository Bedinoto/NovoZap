/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import { Chat, Message, Agent, UazapiConfig } from './types';
import { mockService } from './services/mockService';
import { UazapiService } from './services/uazapiService';
import { LogIn, MessageSquare, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [agent, setAgent] = React.useState<Agent | null>(null);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | undefined>();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [uazapiConfig, setUazapiConfig] = React.useState<UazapiConfig>({
    baseUrl: process.env.UAZAPI_BASE_URL || 'https://free.uazapi.com',
    apiKey: process.env.UAZAPI_ADMIN_TOKEN || 'ZaW1qwTEkuq7Ub1cBUuyMiK5bNSu3nnMQ9lh7klElc2clSRV8t',
    instanceId: ''
  });

  // Load chats on login
  React.useEffect(() => {
    if (isLoggedIn) {
      mockService.getChats().then(setChats);
    }
  }, [isLoggedIn]);

  // Load messages when active chat changes
  React.useEffect(() => {
    if (activeChatId) {
      mockService.getMessages(activeChatId).then(setMessages);
    }
  }, [activeChatId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login
    setAgent({
      uid: '1',
      name: 'Atendente Demo',
      email: 'demo@uazapi.com',
      role: 'agent'
    });
    setIsLoggedIn(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    // 1. Update UI immediately (optimistic update)
    const newMessage = await mockService.sendMessage(activeChatId, text);
    setMessages(prev => [...prev, newMessage]);
    
    // 2. Refresh chat list to show last message
    const updatedChats = await mockService.getChats();
    setChats(updatedChats);

    // 3. Send via Uazapi if configured
    if (uazapiConfig.apiKey && uazapiConfig.instanceId) {
      const uazapi = new UazapiService(uazapiConfig);
      try {
        await uazapi.sendMessage(chat.customerPhone, text);
      } catch (error) {
        console.error('Failed to send via Uazapi:', error);
        // In a real app, we'd show an error state for the message
      }
    }
  };

  const handleIncomingSimulated = () => {
    const phones = ['5511999999999', '5511888888888', '5511777777777'];
    const randomPhone = phones[Math.floor(Math.random() * phones.length)];
    const texts = ['Olá!', 'Tudo bem?', 'Como funciona?', 'Gostaria de um orçamento.', 'Obrigado!'];
    const randomText = texts[Math.floor(Math.random() * texts.length)];

    mockService.addIncomingMessage(randomPhone, randomText).then(msg => {
      // Refresh chats list
      mockService.getChats().then(setChats);
      
      // Update messages if this is the active chat
      // We use a functional update and check the current active chat from state
      setMessages(prev => {
        // We need to know if the message belongs to the active chat
        // We can check the chatId of the new message against the activeChatId
        if (activeChatId === msg.chatId) {
          return [...prev, msg];
        }
        return prev;
      });
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-emerald-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Uazapi Multi-Agent</h1>
            <p className="text-gray-500 text-sm text-center mt-2">
              Plataforma de atendimento profissional para WhatsApp
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                defaultValue="demo@uazapi.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                defaultValue="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Entrar no Painel
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Powered by Uazapi Cloud</p>
          </div>
        </div>
      </div>
    );
  }

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onLogout={() => setIsLoggedIn(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          chat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </main>

      {/* Simulation Button for Demo */}
      <button
        onClick={handleIncomingSimulated}
        className="fixed bottom-20 right-6 bg-white text-emerald-600 p-3 rounded-full shadow-lg border border-emerald-100 hover:bg-emerald-50 transition flex items-center gap-2 text-xs font-bold"
      >
        <MessageSquare className="w-4 h-4" />
        Simular Mensagem
      </button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={uazapiConfig}
        onSave={setUazapiConfig}
      />
    </div>
  );
}

