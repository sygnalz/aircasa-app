import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Minimize2, 
  Send, 
  Bot,
  User
} from 'lucide-react';

const AiChatWidgetSimple = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'AI',
      text: '👋 Hi! I\'m your AirCasa AI assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const toggleWidget = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'USER',
      text: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai_${Date.now()}`,
        type: 'AI',
        text: getSimpleResponse(userMessage.text),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getSimpleResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('property') || lowerInput.includes('house')) {
      return "I can help you with property-related questions. What would you like to know about your property?";
    }
    if (lowerInput.includes('task') || lowerInput.includes('progress')) {
      return "I can help you track your property setup progress. Check your Property Setup Progress panel to see which tasks need attention.";
    }
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm here to help you with your real estate journey. What can I assist you with?";
    }
    
    return "Thanks for your message! I'm a simple AI assistant here to help with your AirCasa experience. What would you like to know?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 z-50">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white">
        {/* Header */}
        <CardHeader className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-medium">AirCasa AI Assistant</CardTitle>
            </div>
            <button
              onClick={toggleWidget}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${
                  message.type === 'USER' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'USER' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}>
                  {message.type === 'USER' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`max-w-[80%] ${
                  message.type === 'USER' ? 'items-end' : 'items-start'
                } flex flex-col`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.type === 'USER'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Input area */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="1"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AiChatWidgetSimple;