// HariBabaChat.jsx
import React, { useState , useRef , useEffect} from 'react';
import DOMPurify from 'dompurify';

const HariBabaChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste beta ! Kaise madad kar sakta hoon?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatBoxRef = useRef(null);

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
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text })) })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
         { 
          sender: 'bot',
          text: data.response && data.response.length >0 
                ? data.response 
                : '😢 Kuch galat ho gaya. Pls Try Again'
        }]);

    } catch (err) {
      console.log(err)
      setMessages(prev => [...prev, { sender: 'bot', text: '😢 Kuch galat ho gaya. Dubara koshish karo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div  className={`bg-white text-black border shadow-xl rounded-xl flex flex-col transition-all duration-500 ${isExpanded ? 'w-[70vw] h-[70vh]' : 'w-80 h-[450px]'}`}>
          {/* Header */}
          <div className="bg-green-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span className="font-bold">Hari Kaka 🤖</span>
            <div className="space-x-2">
              <button onClick={() => setIsExpanded(prev => !prev)} title="Expand/Shrink">⤢</button>
              <button onClick={() => setIsOpen(false)} title="Close">✖</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatBoxRef} className="flex-1  overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 text-sm max-w-[70%] break-words w-fit ${
                  msg.sender === 'user'
                    ? 'bg-green-200 self-end text-right ml-auto rounded-tl-xl rounded-br-xl rounded-bl-xl'
                    : 'bg-white border self-start text-left rounded-tr-xl rounded-br-xl rounded-bl-xl'
                }`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}
              />
            ))}
            {loading && <div className="text-sm text-gray-500">Hari kaka soch rahe hain...</div>}
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HariBabaChat;
