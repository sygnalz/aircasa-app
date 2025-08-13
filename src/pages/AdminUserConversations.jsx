import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { getUserConversationDetails } from "@/api/functions";
import { sendAdminMessage } from "@/api/functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Bot, User as UserIcon, Shield, Loader2 } from "lucide-react";

export default function AdminUserConversations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const userId = searchParams.get("userId");
  const userEmail = searchParams.get("email");
  const userName = searchParams.get("name");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await User.me();
        if (!admin || admin.role !== 'admin') {
          navigate(createPageUrl("Dashboard"));
          return;
        }
        fetchConversationDetails();
      } catch (e) {
        navigate(createPageUrl("Auth"));
      }
    };
    checkAdmin();
  }, [userId]);

  const fetchConversationDetails = async () => {
    if (!userId) {
      setError("User ID is missing from URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getUserConversationDetails({ userId });
      if (response && response.status === 200 && response.data.success) {
        setMessages(response.data.data || []);
      } else {
        throw new Error(response?.data?.error || "Failed to fetch conversation details.");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    // Use the conversation_id from the first message if it exists, otherwise generate one.
    const conversationId = messages.length > 0 ? messages[0].conversation_id : `conv_${Date.now()}`;

    setIsSending(true);
    try {
      const response = await sendAdminMessage({
        app_owner_user_id: userId,
        conversation_id: conversationId,
        message_content: newMessage,
      });

      if (response && response.status === 200 && response.data.success) {
        setNewMessage("");
        await fetchConversationDetails(); // Re-fetch history to show the new message
      } else {
        throw new Error(response?.data?.error || "Failed to send message.");
      }
    } catch (err) {
      alert(`Error sending message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getMessageRoleDetails = (role) => {
    switch (role) {
      case 'user':
        return {
          Icon: UserIcon,
          alignment: 'justify-end',
          bgColor: 'bg-blue-600 text-white',
          senderName: userName || "User",
        };
      case 'ai':
        return {
          Icon: Bot,
          alignment: 'justify-start',
          bgColor: 'bg-slate-700 text-gray-200',
          senderName: "Casa AI",
        };
      case 'admin':
        return {
          Icon: Shield,
          alignment: 'justify-start',
          bgColor: 'bg-green-600 text-white',
          senderName: 'Administrator',
        };
      default:
        return { Icon: UserIcon, alignment: 'justify-start', bgColor: 'bg-gray-500', senderName: 'System' };
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col h-screen">
      {/* Header */}
      <header className="p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("AdminConversations"))}
                className="flex items-center gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Logs
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{userName || "User"}</h1>
                <p className="text-sm text-gray-400">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-gray-400 mt-2">Loading conversation...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p>Error: {error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>No messages in this conversation yet.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const { Icon, alignment, bgColor, senderName } = getMessageRoleDetails(msg.role);
              const isUser = msg.role === 'user';
              
              return (
                <div key={msg.id} className={`flex items-end gap-3 ${alignment}`}>
                  {!isUser && (
                    <Avatar className="h-8 w-8 self-start">
                      <AvatarFallback className="bg-slate-600 text-white">
                        <Icon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-lg lg:max-w-2xl`}>
                     <div className={`text-xs mb-1 ${isUser ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                        {senderName}
                     </div>
                     <div className={`px-4 py-2 rounded-xl ${bgColor}`}>
                        <p className="whitespace-pre-wrap">{msg.conversations}</p>
                     </div>
                     <div className={`text-xs mt-1 ${isUser ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleString()}
                     </div>
                  </div>
                  {isUser && (
                    <Avatar className="h-8 w-8 self-start">
                      <AvatarFallback className="bg-blue-800 text-white">
                        <UserIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-slate-700 bg-slate-900 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              placeholder="Type your message as an admin..."
              className="bg-slate-800 border-slate-700 text-white pr-24 rounded-full py-3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending || isLoading}
            />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 rounded-full"
              onClick={handleSendMessage}
              disabled={isSending || isLoading || !newMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}