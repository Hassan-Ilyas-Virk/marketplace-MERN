import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import geminiLogo from '../assets/gemini.png';

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const chatContainerRef = useRef(null);
  const [typingInterval, setTypingInterval] = useState(null);

  const API_KEY = "AIzaSyD8LyEhycHovd5oSkGyyVAaKeUyhknFlaQ";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.profileImage) {
      setUserProfilePic(`http://localhost:5000${user.profileImage}`);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const showTypingEffect = (text, callback) => {
    const words = text.split(" ");
    let currentText = "";
    let currentWordIndex = 0;

    const interval = setInterval(() => {
      currentText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
      callback(currentText);

      if (currentWordIndex === words.length) {
        clearInterval(interval);
        setTypingInterval(null);
        setIsGenerating(false);
      }
    }, 75);

    setTypingInterval(interval);
  };

  const handleStopResponse = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      setTypingInterval(null);
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating) return;

    setIsGenerating(true);
    
    // Add user message with user's profile picture
    const newUserMessage = {
      type: 'outgoing',
      content: userInput,
      avatar: userProfilePic || 'user_profile_picture.jpg'
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            role: "user", 
            parts: [{ text: userInput + "\n\nPlease keep your response within 5 lines." }] 
          }],
        }),
      });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

      const apiResponse = data?.candidates[0].content.parts[0].text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );

      const botMessage = {
        type: 'incoming',
        content: '',
        avatar: geminiLogo
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      showTypingEffect(apiResponse, (text) => {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { ...botMessage, content: text }
        ]);
      });

    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'incoming',
        content: `Error: ${error.message}`,
        avatar: geminiLogo,
        error: true
      }]);
      setIsGenerating(false);
    }
  };

  const chatVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="chat"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-96 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl"
          >
            <motion.div 
              className="flex justify-between items-center p-4 border-b border-[#1DB954]/20"
              whileHover={{ backgroundColor: 'rgba(29, 185, 84, 0.05)' }}
            >
              <h3 className="font-semibold text-[#3B4540]">Chat Assistant</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-[#1DB954]/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-[#3B4540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
            </motion.div>

            <div className="h-96 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#1DB954]/20" ref={chatContainerRef}>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-start max-w-[70%] ${message.error ? 'text-red-500' : ''}`}>
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        src={message.type === 'outgoing' ? userProfilePic : geminiLogo} 
                        alt={message.type === 'outgoing' ? 'User Avatar' : 'Gemini AI'} 
                        className="w-8 h-8 rounded-full mr-2 shadow-md"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-2xl p-3 shadow-sm ${
                          message.type === 'outgoing' 
                            ? 'bg-[#1DB954] text-white' 
                            : 'bg-white/80 backdrop-blur-sm text-[#3B4540]'
                        }`}
                      >
                        <p>{message.content}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#1DB954]/20 p-4">
              <div className="flex gap-2">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-[#1DB954]/20 rounded-xl 
                    focus:ring-[#1DB954] focus:border-[#1DB954] bg-white/50 backdrop-blur-sm"
                  disabled={isGenerating}
                />
                {isGenerating ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleStopResponse}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-md 
                      hover:bg-red-600 transition-colors duration-300"
                  >
                    Stop
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 bg-[#1DB954] text-white rounded-xl shadow-md 
                      hover:bg-[#15a043] transition-colors duration-300"
                  >
                    Send
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-16 h-16 bg-[#1DB954] text-white rounded-full flex items-center 
              justify-center shadow-lg hover:bg-[#15a043] hover:shadow-xl 
              transition-all duration-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" 
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;   