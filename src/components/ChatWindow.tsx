import React from 'react';
import { Send, Phone, User, MoreVertical, Paperclip } from 'lucide-react';
import { Chat, Message } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatWindowProps {
  chat?: Chat;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ chat, messages, onSendMessage }: ChatWindowProps) {
  const [text, setText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
          <Phone className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Uazapi WhatsApp</h2>
        <p className="mt-2">Selecione uma conversa para começar o atendimento</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#e5ddd5] relative">
      {/* Chat Header */}
      <div className="p-3 bg-white border-b flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            {chat.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chat.customerName}</h3>
            <p className="text-xs text-gray-500">{chat.customerPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-emerald-600 transition">
            <User className="w-5 h-5" />
          </button>
          <button className="hover:text-emerald-600 transition">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-sm relative ${
                msg.sender === 'agent'
                  ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                  : 'bg-white text-gray-900 rounded-tl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-400">
                  {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm', { locale: ptBR }) : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t flex items-center gap-3">
        <button className="text-gray-500 hover:text-emerald-600 transition">
          <Paperclip className="w-6 h-6" />
        </button>
        <form onSubmit={handleSend} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
