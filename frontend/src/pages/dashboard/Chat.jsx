import React, { useState, useEffect, useRef } from 'react';
import ConversationList from '../../components/chat/ConversationList';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import ChatSidebar from '../../components/chat/ChatSidebar';
import { chatService } from '../../services/chatService';
import { useToast } from '../../components/common/ToastContext';
import { useMood } from '../../components/common/MoodContext';
import { useData } from '../../components/common/DataContext';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();
  const { refreshMood } = useMood();
  const { refreshAll } = useData();

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      const data = await chatService.getConversations();
      setConversations(data);
      if (data.length > 0) setActiveId(data[0].id);
    };
    loadConversations();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeId) return;
    const loadMessages = async () => {
      const data = await chatService.getConversation(activeId);
      setMessages(data);
    };
    loadMessages();
  }, [activeId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    await chatService.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) handleNewChat();
    addToast('Conversation deleted', 'info');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add optimistic user message
    const userMsg = { id: `temp_${Date.now()}`, sender: 'user', text: currentInput, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    
    // If it's a new chat, we'd normally create it on the backend first
    let chatId = activeId;
    if (!chatId) {
      chatId = `new_${Date.now()}`;
      setActiveId(chatId);
      setConversations(prev => [{ id: chatId, title: currentInput.substring(0, 30) + '...', updatedAt: new Date().toISOString() }, ...prev]);
    }

    try {
      const botResponse = await chatService.sendMessage(chatId, currentInput);
      setMessages(prev => [...prev, botResponse]);
      // Refresh mood data so tracker + analytics update automatically
      refreshMood();
      refreshAll();
    } catch (err) {
      addToast('Failed to send message', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "I'm feeling really stressed today.",
    "Can you guide me through a breathing exercise?",
    "How can I improve my sleep?"
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 overflow-hidden bg-white dark:bg-slate-900 animate-fade-in-up">
      <ConversationList 
        conversations={conversations} 
        activeId={activeId} 
        setActiveId={setActiveId} 
        onNewChat={handleNewChat}
        onDelete={handleDelete}
      />
      
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-900 relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 -rotate-12">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How can I support you today?</h2>
                <p className="text-slate-500 dark:text-slate-400">This is a safe space. Share whatever is on your mind.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                {suggestedQuestions.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="p-4 text-sm text-left bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  isLatestBot={msg.sender === 'bot' && index === messages.length - 1} 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <ChatInput 
          input={input} 
          setInput={setInput} 
          handleSend={handleSend} 
          isLoading={isLoading} 
        />
      </div>

      <ChatSidebar currentMessages={messages} />
    </div>
  );
};

export default Chat;
