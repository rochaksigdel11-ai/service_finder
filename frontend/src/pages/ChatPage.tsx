// src/pages/ChatPage.tsx — FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  sender: string;
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user, notify } = useApp();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication first
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch conversations
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);
    axios.get('http://127.0.0.1:8000/api/chat/conversations/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => setConversations(res.data))
      .catch((error) => {
        console.error('Failed to load chats:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
        notify('Failed to load chats', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [notify, navigate]);

  // Load messages when conversation selected
  useEffect(() => {
    if (conversationId) {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      axios.get(`http://127.0.0.1:8000/api/chat/messages/${conversationId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => setMessages(res.data))
        .catch((error) => {
          console.error('Failed to load messages:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login');
          }
          notify('Failed to load messages', 'error');
        });
    }
  }, [conversationId, notify, navigate]);

  // WebSocket Real-Time Connection — FIXED with better error handling
  useEffect(() => {
    if (conversationId && user) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const ws = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${conversationId}/?token=${token}`);

        ws.onopen = () => {
          console.log('Real-time chat connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, {
              id: Date.now(),
              sender: data.sender === user.username ? 'You' : data.sender,
              text: data.message,
              timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }]);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (e) => {
          console.error("WebSocket error:", e);
          notify('Chat connection issue', 'error');
        };

        ws.onclose = (event) => {
          console.log('Chat disconnected:', event.code, event.reason);
          if (event.code === 1006) {
            // Connection abnormal closure - might be auth issue
            console.log('WebSocket connection closed abnormally');
          }
        };

        setSocket(ws);
        
        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        notify('Failed to connect to chat', 'error');
      }
    }
  }, [conversationId, user, notify, navigate]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      notify('Cannot send message - connection issue', 'error');
      return;
    }

    try {
      socket.send(JSON.stringify({ message: newMessage }));
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      notify('Failed to send message', 'error');
    }
  };

  // REMOVED the problematic user check that was causing redirect loops
  // The ProtectedRoute already handles authentication

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading chats...</div>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.id === parseInt(conversationId || '0'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <header className="bg-black/50 backdrop-blur p-4 sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/my-bookings" className="text-white flex items-center gap-2 hover:text-yellow-400">
            <ChevronLeft /> Back to Bookings
          </Link>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6 h-[80vh]">
          {/* Conversations List */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h2 className="font-bold text-xl">All Chats</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No conversations yet</p>
              ) : (
                conversations.map(convo => (
                  <Link
                    key={convo.id}
                    to={`/chat/${convo.id}`}
                    className={`block p-4 border-b border-white/10 hover:bg-white/10 transition-all ${
                      parseInt(conversationId || '0') === convo.id ? 'bg-white/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {convo.freelancerAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{convo.freelancerName}</p>
                        <p className="text-sm text-gray-300 truncate">{convo.lastMessage || 'No messages'}</p>
                      </div>
                      {convo.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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
          <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl flex flex-col border border-white/20">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      {selectedConversation.freelancerAvatar}
                    </div>
                    <div>
                      <p className="font-bold text-xl">{selectedConversation.freelancerName}</p>
                      <p className="text-sm opacity-80">
                        {socket?.readyState === WebSocket.OPEN ? 'Online' : 'Connecting...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-400 py-20">Start the conversation!</p>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-6 py-4 rounded-3xl shadow-lg ${
                          msg.sender === 'You' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-white/20 text-white'
                        }`}>
                          <p className="font-semibold text-sm opacity-90">{msg.sender}</p>
                          <p className="text-lg">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-2 text-right">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-6 py-4 bg-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!socket || socket.readyState !== WebSocket.OPEN}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-lg transform hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 text-white/30 mx-auto mb-6" />
                  <p className="text-white/70 text-2xl">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}