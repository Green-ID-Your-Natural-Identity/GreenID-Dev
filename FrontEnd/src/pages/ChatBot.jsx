import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import DOMPurify from 'dompurify';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! 🌿 I\'m your eco-friendly assistant. How can I help you today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.sender === 'user' ? 'user' : 'model', 
            content: m.text 
          })) 
        })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot',
          text: data.response && data.response.length > 0 
                ? data.response 
                : '😢 Something went wrong. Please try again.'
        }
      ]);

    } catch (err) {
      console.log(err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '😢 Connection error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-h-screen min-w-[100vw] bg-gradient-to-br from-blue-200 via-white to-green-200 overflow-x-hidden">
      {/* Navigation Bar - Glass Effect (Same as other pages) */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <img 
                src="/Purple1.png" 
                alt="GreenID Logo" 
                className="h-16"
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/activity-log')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Activity Log
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="px-4 py-2 text-gray-900 bg-white/70 rounded-lg font-semibold shadow-sm"
              >
                Chatbot
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gray-900/90 hover:bg-gray-900 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container - Two Column Layout */}
      <div className="h-[calc(100vh-88px)] max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
          {/* Left Column - Chat Interface (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col h-[95%]">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
              {/* Chat Header */}
              <div className="bg-blue-400 text-white p-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl">
                    🤖
                  </div>
                  <div>
                    <h1 className="text-2xl left-align font-bold">Hari Kaka</h1>
                    <p className="text-blue-100 text-sm">Your sustainable living companion</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={chatBoxRef}
                className="max-h-[50vh] flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🤖</span>
                          <span className="text-xs font-semibold text-gray-500">Hari Kaka</span>
                        </div>
                      )}
                      <div 
                        className={`text-sm leading-relaxed text-left ${msg.sender === 'user' ? 'text-white' : 'text-gray-900'}`}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}
                      />
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 border-2 border-gray-300 focus:border-blue-500 rounded-2xl px-5 py-3 text-base text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-500"
                    placeholder="Ask me anything about sustainability... 🌱"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!userInput.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Suggested Questions (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col h-[95%]">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-2">💡 Quick Questions</h2>
              <p className="text-sm text-gray-600 mb-4">Click to ask instantly</p>
              
              <div className="grid grid-cols-2 gap-3 flex-1">
                <button
                  onClick={() => setUserInput('How can I reduce my carbon footprint?')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🌍</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Carbon Footprint</p>
                  <p className="text-[10px] text-gray-600">Reduce emissions</p>
                </button>
                
                <button
                  onClick={() => setUserInput('What are some eco-friendly habits?')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">♻️</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Eco Habits</p>
                  <p className="text-[10px] text-gray-600">Daily practices</p>
                </button>
                
                <button
                  onClick={() => setUserInput('Tell me about renewable energy')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">⚡</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Renewable Energy</p>
                  <p className="text-[10px] text-gray-600">Clean solutions</p>
                </button>

                <button
                  onClick={() => setUserInput('How to start composting at home?')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🌱</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Composting</p>
                  <p className="text-[10px] text-gray-600">Waste to nutrients</p>
                </button>

                <button
                  onClick={() => setUserInput('What is sustainable fashion?')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">👕</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Sustainable Fashion</p>
                  <p className="text-[10px] text-gray-600">Eco-friendly clothing</p>
                </button>

                <button
                  onClick={() => setUserInput('How to save water at home?')}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-3 text-left transition-all group flex flex-col"
                >
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">💧</span>
                  <p className="font-semibold text-gray-900 text-xs mb-1">Water Conservation</p>
                  <p className="text-[10px] text-gray-600">Water-saving tips</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
