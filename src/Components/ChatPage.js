import React, { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation.js';
import { useNavigate, Link } from 'react-router-dom';
import ImageViewerModal from './ImageViewerModal.js';
import LoadingSpinner from './LoadingSpinner.js';
import { motion } from 'framer-motion';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [viewerImage, setViewerImage] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (type) => {
    const fileInput = document.getElementById('file-upload');
    fileInput.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*';
    fileInput.click();
    setShowAttachMenu(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum size is 10MB.');
        return;
      }

      // Determine file type
      const fileType = selectedFile.type.split('/')[0]; // 'image', 'video', etc.
      
      setFile(selectedFile);
      
      // Create preview URL
      if (fileType === 'image') {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else if (fileType === 'video') {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        // For other file types, just show the filename
        setFilePreview('document');
      }
    }
  };

  // Add this to clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (filePreview && filePreview !== 'document') {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!message && !file) || !selectedChat) return;

    try {
      const formData = new FormData();
      if (message) formData.append('message', message);
      if (file) {
        // Validate file size
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size too large. Maximum size is 10MB.');
        }
        formData.append('file', file);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const updatedChat = await response.json();

      // Update the chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === updatedChat._id ? updatedChat : chat
        )
      );

      // Update selected chat
      setSelectedChat(updatedChat);

      // Clear the input fields
      setMessage('');
      if (file) {
        setFile(null);
        setFilePreview(null);
      }

      // Scroll to bottom after sending message
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message);
    }
  };

  const getOtherParty = (chat) => {
    const isCustomer = user._id === chat.customerId._id;
    return isCustomer ? chat.sellerId : chat.customerId;
  };

  const handleProfileClick = async (otherParty) => {
    try {
      // Always navigate to the seller's profile
      navigate(`/seller/${otherParty._id}`);
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  };

  // Update handleKeyPress to handle Shift+Enter correctly
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleImageClick = (imagePath) => {
    console.log('Image clicked:', imagePath);
    setViewerImage(imagePath);
  };

  // First, let's create a helper function for getting the correct image URL
  const getProfileImageUrl = (user) => {
    if (!user || !user.profileImage) return '/default-avatar.png';
    return `http://localhost:5000/uploads/${user.profileImage.replace('/uploads/', '')}`;
  };

  // Add this function before the return statement
  const getMessagePreview = (msg) => {
    if (!msg) return 'No messages yet';
    if (msg.message) return msg.message;
    if (msg.file) {
      if (msg.file.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️ Image';
      if (msg.file.match(/\.(mp4|webm)$/i)) return '🎥 Video';
      return '📎 File';
    }
    return 'No messages yet';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#98cf9a] to-white">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-[80vh]">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_84,_0.7)] hover:shadow-[0_20px_60px_rgba(8,_112,_84,_0.8)] transition-all duration-300"
          >
            <div className="grid grid-cols-3 h-[calc(100vh-160px)]">
              {/* Left sidebar - Chat list */}
              <div className="col-span-1 border-r border-[#D1E7D2]/50 max-h-full overflow-hidden flex flex-col bg-white/50 rounded-l-2xl">
                <div className="p-4 border-b border-[#D1E7D2] bg-white/80 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold text-[#3B4540]">Messages</h2>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {chats.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 text-center text-gray-500"
                    >
                      No messages yet
                    </motion.div>
                  ) : (
                    chats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-4 cursor-pointer hover:bg-[#DFEEE2]/70 transition-all duration-300 flex items-center gap-3 ${
                          selectedChat?._id === chat._id ? 'bg-[#DFEEE2]/80' : ''
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={getProfileImageUrl(getOtherParty(chat))}
                            alt={`${getOtherParty(chat)?.name}'s profile`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#3B4540]">{getOtherParty(chat)?.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {getMessagePreview(chat.messages[chat.messages.length - 1])}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Right side - Chat messages */}
              <div className="col-span-2 flex flex-col max-h-full overflow-hidden bg-white/80 rounded-r-2xl">
                {selectedChat ? (
                  <>
                    {/* Chat header */}
                    <div className="p-4 border-b border-[#D1E7D2] bg-white/90 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const otherParty = selectedChat.customerId._id === user._id 
                            ? selectedChat.sellerId 
                            : selectedChat.customerId;
                          
                          return (
                            <>
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                  src={getProfileImageUrl(otherParty)}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <h3 
                                className="text-lg font-semibold text-[#3B4540] hover:text-[#438951] cursor-pointer"
                                onClick={() => handleProfileClick(otherParty)}
                              >
                                {otherParty?.name}
                              </h3>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {selectedChat.messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start gap-2 ${
                            msg.senderId === user._id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.senderId !== user._id && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={getProfileImageUrl(getOtherParty(selectedChat))}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.senderId === user._id
                                ? 'bg-[#438951] text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            {msg.message && (
                              <p className="whitespace-pre-wrap mb-2">{msg.message}</p>
                            )}
                            
                            {msg.file && (
                              <div className="mt-2">
                                {msg.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                  <div 
                                    className="relative group cursor-pointer"
                                    onClick={() => {
                                      console.log('Clicking image...');
                                      handleImageClick(`http://localhost:5000${msg.file}`);
                                    }}
                                  >
                                    <img
                                      src={`http://localhost:5000${msg.file}`}
                                      alt="Attachment"
                                      className="max-w-full rounded-lg hover:opacity-95 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                                        Click to view
                                      </div>
                                    </div>
                                  </div>
                                ) : msg.file.match(/\.(mp4|webm)$/i) ? (
                                  <div className="rounded-lg overflow-hidden bg-black">
                                    <video
                                      controls
                                      className="max-w-full"
                                    >
                                      <source src={`http://localhost:5000${msg.file}`} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 bg-white bg-opacity-10 rounded-lg p-2 hover:bg-opacity-20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <a
                                      href={`http://localhost:5000${msg.file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline flex-1"
                                    >
                                      {msg.file.split('/').pop()} {/* Show filename */}
                                      <span className="text-xs opacity-75 ml-1">
                                        Click to download
                                      </span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <span className="text-xs opacity-75 mt-1 block">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="border-t border-[#D1E7D2] bg-white/90 backdrop-blur-sm p-4 rounded-br-2xl">
                      <form onSubmit={sendMessage} className="space-y-2">
                        {/* File Preview Section */}
                        {file && (
                          <div className="mb-2 relative inline-block">
                            {filePreview && filePreview !== 'document' ? (
                              file.type.startsWith('image/') ? (
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  className="max-h-32 rounded-lg"
                                />
                              ) : file.type.startsWith('video/') ? (
                                <video
                                  src={filePreview}
                                  className="max-h-32 rounded-lg"
                                  controls
                                />
                              ) : null
                            ) : (
                              <div className="p-2 bg-gray-100 rounded-lg inline-flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                {file.name}
                              </div>
                            )}
                            {/* Remove file button */}
                            <button
                              type="button"
                              onClick={() => {
                                setFile(null);
                                setFilePreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            ref={messageInputRef}
                            placeholder="Type a message..."
                            rows="1"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#438951] resize-none"
                            style={{ minHeight: '42px', maxHeight: '120px' }}
                          />
                          
                          {/* Attach button and menu */}
                          <div className="relative" ref={attachMenuRef}>
                            <button
                              type="button"
                              onClick={() => setShowAttachMenu(!showAttachMenu)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              Attach
                            </button>

                            {showAttachMenu && (
                              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                <label
                                  htmlFor="file-upload"
                                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-[#DFEEE2] transition-colors cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                  Upload File
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Hidden file input */}
                          <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                          />

                          {/* Send button */}
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#438951] text-white rounded-lg hover:bg-[#357241] transition-colors flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Send
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center text-gray-500"
                  >
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-[#98cf9a] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-lg">Select a chat to start messaging</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {viewerImage && (
        <ImageViewerModal 
          src={viewerImage} 
          onClose={() => setViewerImage(null)} 
        />
      )}
    </div>
  );
};

// Add this CSS to your global styles
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #98cf9a;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #7ab17c;
}
`;

export default ChatPage; 