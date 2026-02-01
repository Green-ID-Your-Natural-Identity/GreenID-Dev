import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingChatWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Bubble */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs animate-fadeIn border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
            <p className="text-xs text-gray-600">
              Chat with our eco-assistant for sustainability tips!
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => navigate('/chatbot')}
          className="w-full mt-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg"
        >
          Start Chat
        </button>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => navigate('/chatbot')}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center group"
        title="Chat with Eco Assistant"
      >
        <svg 
          className="w-7 h-7 group-hover:scale-110 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        
        {/* Pulse Animation */}
        <span className="absolute w-14 h-14 bg-blue-400 rounded-full animate-ping opacity-20"></span>
      </button>
    </div>
  );
};

export default FloatingChatWidget;
