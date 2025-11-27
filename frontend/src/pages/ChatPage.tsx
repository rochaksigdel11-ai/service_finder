// src/pages/ChatPage.tsx — REAL DATA ONLY
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Send, MessageCircle, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Conversation {
  id: number;
  freelancerName: string;
  freelancerAvatar: string;
  lastMessage: string;
  unread: number;
  serviceName?: string;
}

interface Message {
  id: number;
  conversationId: number;
  sender: string;
  text: string;
  timestamp: string;
  is_read?: boolean;
}

export default function ChatPage() {
  const { user, notify } = useApp();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationsError, setConversationsError] = useState('');
  const [messagesError, setMessagesError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  // Fetch real conversations from Django API
  const fetchConversations = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);
    setConversationsError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/chat/conversations/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Real conversations loaded:', response.data);
      setConversations(response.data);
      
      // Auto-select first conversation if none selected
      if (response.data.length > 0 && !conversationId) {
        navigate(`/chat/conversation/${response.data[0].id}`);
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load conversations';
      setConversationsError(errorMessage);
      notify(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real messages for selected conversation
  const fetchMessages = async (convId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setMessagesError('');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/chat/messages/${convId}/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Real messages loaded:', response.data);
      setMessages(response.data);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load messages';
      setMessagesError(errorMessage);
      notify(errorMessage, 'error');
    }
  };

  // Load messages when conversation is selected
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  // Send real message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    setIsSending(true);
    
    // Optimistic UI update
    const tempMessage: Message = {
      id: Date.now(), // Temporary ID for immediate UI feedback
      conversationId: parseInt(conversationId),
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('access_token');
      
      // Send real message via API
      await axios.post(`http://127.0.0.1:8000/api/chat/messages/${conversationId}/`, {
        text: newMessage
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Real message sent successfully');
      
      // Refresh messages to get actual response from the other user
      setTimeout(() => {
        fetchMessages(conversationId);
        fetchConversations(); // Update conversation list with new last message
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      notify(errorMessage, 'error');
      
      // Remove optimistic message if send failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRefreshConversations = () => {
    fetchConversations();
  };

  const handleRefreshMessages = () => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading real chat data...</p>
        </div>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.id === parseInt(conversationId || '0'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-white flex items-center gap-2 hover:text-yellow-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-white">Real-Time Messages</h1>
          <div className="flex items-center gap-3 text-white">
            <User className="w-5 h-5" />
            <span className="font-semibold">{user?.username}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[80vh]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex justify-between items-center">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Your Chats
              </h2>
              <button
                onClick={handleRefreshConversations}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Refresh conversations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto h-full">
              {conversationsError ? (
                <div className="text-center p-6">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-300 text-sm mb-4">{conversationsError}</p>
                  <button
                    onClick={handleRefreshConversations}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-8">
                  <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg mb-2">No conversations found</p>
                  <p className="text-white/50 text-sm mb-6">Book a service to start chatting</p>
                  <Link
                    to="/services"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-6 py-3 rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-all inline-block"
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                conversations.map(convo => (
                  <div
                    key={convo.id}
                    onClick={() => navigate(`/chat/conversation/${convo.id}`)}
                    className={`p-4 border-b border-white/10 cursor-pointer transition-all ${
                      parseInt(conversationId || '0') === convo.id 
                        ? 'bg-white/20 border-l-4 border-l-cyan-400' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {convo.freelancerAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white truncate">{convo.freelancerName}</h3>
                          {convo.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {convo.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-cyan-300 text-sm truncate">{convo.serviceName}</p>
                        <p className="text-white/70 text-sm truncate mt-1">{convo.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      {selectedConversation.freelancerAvatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{selectedConversation.freelancerName}</h3>
                      <p className="text-white/80">{selectedConversation.serviceName}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshMessages}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Refresh messages"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5">
                  {messagesError ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-300 text-lg mb-4">{messagesError}</p>
                        <button
                          onClick={handleRefreshMessages}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 px-6 py-3 rounded-full transition-colors"
                        >
                          Retry Loading Messages
                        </button>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white/70">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl">No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation by sending a message</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md px-6 py-4 rounded-3xl shadow-2xl ${
                          msg.sender === 'You' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : 'bg-white/20 text-white border border-white/10'
                        }`}>
                          <p className="font-semibold text-sm opacity-90 mb-2">
                            {msg.sender}
                          </p>
                          <p className="text-lg leading-relaxed">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-3 text-right">
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your real message..."
                      className="flex-1 bg-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 border border-white/10 focus:border-purple-400 transition-all"
                      disabled={isSending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 px-8 py-4 rounded-2xl font-bold shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                  <p className="text-white/50 text-sm mt-3 text-center">
                    Press Enter to send • Real messages only
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white/70">
                  <MessageCircle className="w-24 h-24 mx-auto mb-6 opacity-30" />
                  <h3 className="text-2xl font-bold mb-2">Real Chat System</h3>
                  <p className="text-lg mb-4">Select a conversation to start messaging</p>
                  <p className="text-sm text-white/50">
                    All data is loaded directly from the database
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}