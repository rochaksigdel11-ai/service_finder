import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, MessageCircle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Conversation {
  id: number;
  freelancerName: string;
  freelancerAvatar: string;
  lastMessage: string;
  unread: number;
}

interface Message {
  id: number;
  conversationId: number;
  sender: string;
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user, notify } = useApp();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch conversations
    axios.get('/api/chat/conversations/')  // TODO: Backend endpoint
      .then(res => setConversations(res.data))
      .catch(() => notify('Failed to load conversations', 'error'));

    if (conversationId) {
      // Fetch messages for selected
      axios.get(`/api/chat/messages/${conversationId}/`)
        .then(res => setMessages(res.data))
        .catch(() => notify('Failed to load messages', 'error'));
    }
  }, [conversationId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: Date.now(),  // Temp ID
        conversationId: selectedConversation.id,
        sender: 'You',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
      // TODO: POST to /api/chat/messages/
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">Please log in to chat.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/services" className="flex items-center text-slate-300 hover:text-white">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6 h-[70vh]">
          {/* Conversations List */}
          <div className="md:col-span-1 bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white">Conversations</h2>
            </div>
            <div className="overflow-y-auto">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 ${selectedConversation?.id === conversation.id ? 'bg-violet-600' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {conversation.freelancerAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{conversation.freelancerName}</p>
                      <p className="text-sm text-slate-400 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <span className="bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-slate-800 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-700 bg-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {selectedConversation.freelancerAvatar}
                    </div>
                    <div>
                      <p className="font-medium text-white">{selectedConversation.freelancerName}</p>
                      <p className="text-sm text-emerald-400">Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(m => m.conversationId === selectedConversation.id)
                    .map(message => (
                      <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'You' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${message.sender === 'You' ? 'text-violet-100' : 'text-slate-500'}`}>{message.timestamp}</p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

axios.get('http://127.0.0.1:8000/api/orders/')
axios.get('http://127.0.0.1:8000/api/chat/conversations/')

