import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';

const ChatContainer = () => {
  const { messages, selectedUser, getMessages, subscribeToMessages } = useChatStore();
  const { user: authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket subscriptions with proper cleanup
  useEffect(() => {
    if (!selectedUser?._id) return; // Prevent running if no user is selected
  
    const cleanup = subscribeToMessages();
  
    return () => {
      cleanup?.(); // Ensure cleanup runs to remove old listeners
    };
  }, [selectedUser?._id]); // Remove subscribeToMessages from dependencies
  

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isSender = message.senderId?._id === authUser._id; // Added optional chaining
          const profilePicture = (isSender 
            ? authUser?.profilePicture 
            : selectedUser?.profilePicture) || '/avatar.png';

          return (
            <div
              key={message._id}
              className={`chat ${isSender ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 h-10 rounded-full border-2 border-white">
                  <img
                    src={profilePicture}
                    alt="profile"
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="chat-header text-sm text-gray-500 mb-1">
                {formatMessageTime(message.createdAt)}
              </div>
              
              <div className={`chat-bubble ${message.image ? 'p-2' : ''} max-w-2xl break-words`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-lg mb-2 max-h-64 object-cover" // Fixed className
                  />
                )}
                {message.message && <p className="text-gray-900">{message.message}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;