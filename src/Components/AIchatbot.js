import React, { useState, useRef, useEffect } from 'react';
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="w-96 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex items-start max-w-[70%] ${message.error ? 'text-red-500' : ''}`}>
                  <img 
                    src={message.type === 'outgoing' ? userProfilePic : geminiLogo} 
                    alt={message.type === 'outgoing' ? 'User Avatar' : 'Gemini AI'} 
                    className="w-8 h-8 rounded-full mr-2 shadow-md"
                  />
                  <div className={`rounded-lg p-3 ${
                    message.type === 'outgoing' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-md"
                disabled={isGenerating}
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStopResponse}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;   