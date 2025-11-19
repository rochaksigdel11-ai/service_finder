// frontend/src/pages/ChatPage.tsx — FINAL REAL-TIME VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/chat/conversations/')
      .then(res => setConversations(res.data))
      .catch(() => notify('Failed to load chats', 'error'));
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (conversationId) {
      const convo = conversations.find(c => c.id === parseInt(conversationId));
      setSelectedConversation(convo || null);

      axios.get(`http://127.0.0.1:8000/api/chat/messages/${conversationId}/`)
        .then(res => setMessages(res.data))
        .catch(() => notify('Failed to load messages', 'error'));
    }
  }, [conversationId, conversations]);

  // WebSocket Real-Time Connection
  useEffect(() => {
    if (conversationId && user) {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${conversationId}/`);
      
      ws.onopen = () => console.log('Chat connected');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, {
          id: Date.now(),
          conversationId: parseInt(conversationId),
          sender: data.user === user.username ? 'You' : data.user,
          text: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      };
      ws.onerror = () => notify('Chat connection error', 'error');
      ws.onclose = () => console.log('Chat disconnected');

      setSocket(ws);
      return () => ws.close();
    }
  }, [conversationId, user]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    const messageData = {
      message: newMessage,
    };

    socket.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Please log in to chat</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <header className="bg-black/50 backdrop-blur p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/services" className="text-white flex items-center gap-2 hover:text-yellow-400">
            <ChevronLeft /> Back to Services
          </Link>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6 h-[75vh]">
          {/* Conversations List */}
          <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
            <div className="p-4 bg-purple-600 text-white">
              <h2 className="font-bold text-lg">All Chats</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No conversations yet</p>
              ) : (
                conversations.map(convo => (
                  <Link
                    key={convo.id}
                    to={`/chat/${convo.id}`}
                    className={`block p-4 border-b border-white/10 hover:bg-white/10 transition ${parseInt(conversationId || '0') === convo.id ? 'bg-white/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {convo.freelancerAvatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{convo.freelancerName}</p>
                        <p className="text-sm text-gray-300 truncate">{convo.lastMessage}</p>
                      </div>
                      {convo.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur rounded-2xl flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-purple-600 text-white rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                      {selectedConversation.freelancerAvatar}
                    </div>
                    <div>
                      <p className="font-bold">{selectedConversation.freelancerName}</p>
                      <p className="text-sm opacity-80">Active now</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-5 py-3 rounded-2xl ${msg.sender === 'You' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/20 text-white'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-5 py-3 bg-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full hover:scale-110 transition"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-xl">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}