// src/pages/FakeChatDemo.tsx → RAJU EDITION (FOR YOUR A3 REPORT & DEMO)
import React from 'react';
import { MessageCircle, Send, ArrowLeft, Code2, Globe, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FakeChatDemo() {
  const fakeConversations = [
    { 
      id: 1, 
      name: "Raju", 
      avatar: "R", 
      lastMsg: "Website ready ho sir! Deploy gardim?", 
      unread: 2, 
      service: "Full-Stack Web Development" 
    },
   
  ];

  const rajuMessages = [
    { id: 1, sender: "you", text: "Namaste Raju bro, can you build a full website for my business?", time: "09:15 AM" },
    { id: 2, sender: "other", text: "Namaste sir! Absolutely! What kind of website do you need? E-commerce, portfolio, company site?", time: "09:18 AM" },
    { id: 3, sender: "you", text: "Service booking website jastai — like ServiceFinder Nepal jastai", time: "09:20 AM" },
    { id: 4, sender: "other", text: "Wah sir! Exactly my expertise! I can build it with React + Django just like yours — full professional", time: "09:22 AM" },
    { id: 5, sender: "other", text: "Features I will add:\n• Real-time booking\n• Live chat\n• Payment gateway\n• Admin + Seller dashboard\n• Mobile responsive", time: "09:25 AM" },
    { id: 6, sender: "you", text: "Perfect! How many days?", time: "09:27 AM" },
    { id: 7, sender: "other", text: "7–10 days ma fully ready garidinchu sir! With testing + deployment", time: "09:28 AM" },
    { id: 8, sender: "other", text: "Figma design pani banaidinchu free ma", time: "09:29 AM" },
    { id: 9, sender: "you", text: "Done deal bro! Advance pathaudai chu", time: "09:30 AM" },
    { id: 10, sender: "other", text: "Thank you so much sir! Work start garyo — aajai evening ma first demo dekhna painxa", time: "09:31 AM" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 p-5 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-white hover:text-cyan-300 transition">
            <ArrowLeft className="w-7 h-7" />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Messages
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8 h-[82vh]">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-purple-600 to-cyan-600">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Globe className="w-7 h-7" />
                Active Chats
              </h2>
            </div>
            {fakeConversations.map(c => (
              <div key={c.id} className={`p-5 border-b border-white/10 hover:bg-white/10 transition-all cursor-pointer ${c.id === 1 ? 'bg-white/20 border-l-4 border-l-cyan-400' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {c.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-lg">{c.name}</h3>
                      {c.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                          {c.unread} New
                        </span>
                      )}
                    </div>
                    <p className="text-cyan-300 font-medium">{c.service}</p>
                    <p className="text-white/70 text-sm mt-1 truncate">{c.lastMsg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Chat */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 flex flex-col shadow-2xl">
            {/* Raju Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                    R
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-4 border-purple-600 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    Raju 
                    <CheckCircle className="w-6 h-6 text-yellow-300" />
                  </h3>
                  <p className="text-white/90 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Professional website Development 
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {rajuMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg px-7 py-5 rounded-3xl shadow-xl ${
                    msg.sender === 'you' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white/20 text-white border border-white/10'
                  }`}>
                    <p className="text-lg leading-relaxed">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-3 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Amazing work Raju! When can we launch?"
                  className="flex-1 bg-white/20 rounded-2xl px-8 py-5 text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-lg"
                  readOnly
                />
                <button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-10 py-5 rounded-2xl font-bold shadow-2xl transform hover:scale-110 transition-all flex items-center gap-3">
                  <Send className="w-6 h-6" />
                  <span className="hidden sm:inline text-lg">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}