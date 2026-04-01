import React from 'react';
import { LogOut, MessageSquare, Settings, Users, Search } from 'lucide-react';
import { Chat } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ chats, activeChatId, onSelectChat, onLogout, onOpenSettings }: SidebarProps) {
  const [search, setSearch] = React.useState('');

  const filteredChats = chats.filter(chat => 
    chat.customerName.toLowerCase().includes(search.toLowerCase()) ||
    chat.customerPhone.includes(search)
  );

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-emerald-600 text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h1 className="font-bold text-lg">Uazapi Multi</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenSettings} className="p-1 hover:bg-emerald-700 rounded transition">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={onLogout} className="p-1 hover:bg-emerald-700 rounded transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Nenhuma conversa encontrada
          </div>
        ) : (
          filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b text-left ${
                activeChatId === chat.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
              }`}
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shrink-0">
                {chat.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.customerName}</h3>
                  {chat.lastMessageTimestamp && (
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {format(chat.lastMessageTimestamp.toDate(), 'HH:mm', { locale: ptBR })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {chat.lastMessage || 'Sem mensagens'}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-medium">
                    {chat.status}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
