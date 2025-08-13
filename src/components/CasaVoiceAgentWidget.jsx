
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Maximize2, Minimize2, Mic, MicOff, Volume2, VolumeX, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/api/entities';
import { aiChat } from '@/api/functions';
import { generateSpeech } from '@/api/functions';
import { getVoices } from '@/api/functions';
import { getUserChatHistory } from '@/api/functions'; // Added import for chat history

export default function CasaVoiceAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('iP95p4xoKVk53GoZ742B'); // Default to Chris (American)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Add state for conversation history pagination
  const [historyOffset, setHistoryOffset] = useState(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const hasSpokenGreeting = useRef(false);
  const messagesEndRef = useRef(null); // Add ref for auto-scrolling

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech recognition setup and audio player event listeners
  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        
        recognitionRef.current.onresult = (event) => {
          if (event && event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (transcript && typeof transcript === 'string') {
              setInputText(transcript);
              setTimeout(() => handleSendMessage(transcript), 100);
            }
          }
        };
      }
    } catch (e) { console.error("Speech recognition setup failed:", e) }

    const audioPlayer = audioPlayerRef.current;
    const onSpeakingEnd = () => setIsSpeaking(false);
    if (audioPlayer) {
      audioPlayer.addEventListener('ended', onSpeakingEnd);
      audioPlayer.addEventListener('error', onSpeakingEnd);
      return () => {
        audioPlayer.removeEventListener('ended', onSpeakingEnd);
        audioPlayer.removeEventListener('error', onSpeakingEnd);
      };
    }
  }, []);
  
  // Load voices and saved preferences on mount
  useEffect(() => {
    const savedVoice = localStorage.getItem('casa-ai-voice');
    if (savedVoice) {
      setSelectedVoiceId(savedVoice);
    }
    
    const fetchVoices = async () => {
      // --- Caching Logic ---
      const cachedVoicesData = localStorage.getItem('casa-ai-available-voices');
      const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

      if (cachedVoicesData) {
        try {
            const { voices, timestamp } = JSON.parse(cachedVoicesData);
            const cacheAge = Date.now() - timestamp;
            // Cache is valid for 1 day
            if (cacheAge < ONE_DAY_IN_MS && voices && voices.length > 0) {
              setAvailableVoices(voices);
              return; // Exit if cache is valid and not empty
            }
        } catch(e) {
            console.error("Failed to parse cached voices, refetching.", e);
            localStorage.removeItem('casa-ai-available-voices'); // Clear bad cache
        }
      }

      // --- Fetch from backend if cache is invalid or missing ---
      try {
        const response = await getVoices();
        if (response && response.status === 200 && response.data) {
          setAvailableVoices(response.data);
          // Save to cache
          const cacheData = {
            voices: response.data,
            timestamp: Date.now()
          };
          localStorage.setItem('casa-ai-available-voices', JSON.stringify(cacheData));
        } else {
            // This handles the case where the function returns an error, e.g., non-200 status
            // Try to use stale cache if it exists, but it means `response` was not valid success
            console.warn("Failed to fetch voices from API, trying stale cache as fallback.");
            if (cachedVoicesData) { // Check if we even had a cached data initially
                try {
                    const { voices } = JSON.parse(cachedVoicesData);
                    if (voices && voices.length > 0) {
                        setAvailableVoices(voices);
                    }
                } catch(e) {
                    console.error("Failed to parse stale cached voices on API failure.", e);
                }
            }
        }
      } catch (error) {
        console.error("Failed to fetch voices:", error);
        // If fetch fails (e.g., network error), still try to use stale cache as a fallback
        if (cachedVoicesData) { // Check if we even had a cached data initially
            try {
                const { voices } = JSON.parse(cachedVoicesData);
                if (voices && voices.length > 0) {
                    setAvailableVoices(voices);
                }
            } catch(e) {
                console.error("Failed to parse stale cached voices on network error.", e);
            }
        }
      }
    };
    
    fetchVoices();
  }, []);

  // Save voice choice to local storage when it changes
  useEffect(() => {
    localStorage.setItem('casa-ai-voice', selectedVoiceId);
  }, [selectedVoiceId]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        // If user is not logged in or cannot be fetched, set a generic greeting
        const greeting = "Hi! I'm Casa AI, your personal real estate assistant. Please sign in for personalized help.";
        setMessages([{ id: 1, text: greeting, isBot: true, timestamp: new Date() }]);
      }
    };
    fetchInitialData();
  }, []);
  
  // New useEffect to load chat history when widget is opened or user changes
  useEffect(() => {
    if (isOpen && user) {
        loadInitialHistory();
    } else {
        // Reset history and speaking flag when widget is closed
        setMessages([]);
        setHistoryOffset(null);
        setHasMoreHistory(false);
        hasSpokenGreeting.current = false; 
    }
  }, [isOpen, user]);

  const loadInitialHistory = async () => {
    setIsLoadingHistory(true);
    try {
        const response = await getUserChatHistory({ limit: 50, offset: null });
        if (response && response.status === 200 && response.data && response.data.success) {
            const fetchedMessages = response.data.messages || [];
            if (fetchedMessages.length > 0) {
                // Fix: Use correct field name and role mapping
                const formattedMessages = fetchedMessages.map((msg, index) => ({
                    id: msg.id || `${Date.now()}-${index}`, // Fallback ID, safer with Date.now()
                    text: msg.content, // Use 'content' from backend
                    isBot: msg.role !== 'user', // Show all non-user messages as bot (AI and admin)
                    role: msg.role, // Keep original role for styling
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(formattedMessages);
                if (response.data.nextOffset) {
                    setHistoryOffset(response.data.nextOffset);
                    setHasMoreHistory(true);
                } else {
                    setHasMoreHistory(false);
                }
            } else {
                // If no history, create the first-time greeting
                const firstName = user?.full_name?.split(' ')[0] || 'there';
                const greeting = `Hi ${firstName}! I'm Casa AI, your personal real estate assistant. What can I help you with today?`;
                setMessages([{ id: 1, text: greeting, isBot: true, timestamp: new Date() }]);
            }
        } else {
            throw new Error("Failed to fetch history or history data invalid.");
        }
    } catch (error) {
        console.error("Error loading chat history:", error);
        const errorMsg = "Sorry, I couldn't load our past conversation.";
        setMessages([{ id: 'history-err', text: errorMsg, isBot: true, timestamp: new Date() }]); // Replaces all messages
    } finally {
        setIsLoadingHistory(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMoreHistory || isLoadingHistory) return;
    
    setIsLoadingHistory(true);
    try {
        const response = await getUserChatHistory({ limit: 50, offset: historyOffset });
        if (response && response.status === 200 && response.data && response.data.success) {
            const olderMessages = response.data.messages || [];
            const formattedOlderMessages = olderMessages.map((msg, index) => ({
                id: msg.id || `${Date.now()}-${index}-older`, // Fallback ID, safer with Date.now()
                text: msg.content, // Use 'content' from backend
                isBot: msg.role !== 'user', // Show all non-user messages as bot
                role: msg.role, // Keep original role
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(prev => [...formattedOlderMessages, ...prev]);
            if (response.data.nextOffset) {
                setHistoryOffset(response.data.nextOffset);
                setHasMoreHistory(true);
            } else {
                setHasMoreHistory(false);
            }
        }
    } catch (error) {
        console.error("Error loading more history:", error);
    } finally {
        setIsLoadingHistory(false);
    }
  };

  const fallbackToBrowserVoice = useCallback((text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        const voices = speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
            const usVoice = voices.find(v => v && v.lang && v.lang.startsWith('en-US'));
            if (usVoice) utterance.voice = usVoice;
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          if (!audioPlayerRef.current || audioPlayerRef.current.paused) {
            setIsSpeaking(false);
          }
        };
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } catch (fallbackError) {
      console.error("Browser voice fallback failed:", fallbackError);
      setIsSpeaking(false);
    }
  }, []);

  // Memoize speakText to ensure it always has the latest voice selection
  const speakText = useCallback(async (text) => {
    if (!voiceEnabled || !text || typeof text !== 'string' || !text.trim()) return;
    
    // Prevent starting a new speech if currently speaking
    if (isSpeaking) {
      // Optional: if new speech comes in, stop current and start new
      // if (audioPlayerRef.current) {
      //   audioPlayerRef.current.pause();
      //   audioPlayerRef.current.currentTime = 0;
      // }
      return; 
    }

    setIsSpeaking(true);
    try {
      // The "voiceId" here is now guaranteed to be the correct, up-to-date selection
      const response = await generateSpeech({ text, voiceId: selectedVoiceId });
      
      if (response && response.status === 200 && response.data && response.data.audio) {
        // Decode the Base64 string to a Blob
        const binaryString = atob(response.data.audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes.buffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = audioPlayerRef.current;
        audio.src = audioUrl;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback failed, falling back to browser voice.", error);
            fallbackToBrowserVoice(text);
          });
        }
      } else {
        throw new Error("Backend did not return valid audio data.");
      }
    } catch (error) {
      console.warn("Could not use ElevenLabs:", error.message);
      fallbackToBrowserVoice(text);
    }
  }, [selectedVoiceId, voiceEnabled, fallbackToBrowserVoice, isSpeaking]); // isSpeaking is here to prevent concurrent calls

  // Update greeting useEffect to depend on the memoized speakText function
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    if (isOpen && !hasSpokenGreeting.current && messages.length > 0 && voiceEnabled) {
        // Only speak the first message (initial greeting or first history message)
        if(messages[0] && messages[0].text) {
          speakText(messages[0].text);
          hasSpokenGreeting.current = true;
        }
    } else if (!isOpen && audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setIsSpeaking(false);
    }
  }, [isOpen, messages, voiceEnabled, speakText]);

  const playPreview = (e, url) => {
    e.stopPropagation(); // Prevent the SelectItem from closing or changing value
    if (audioPlayerRef.current && url) {
        audioPlayerRef.current.pause(); // Stop any current playback
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play().catch(err => console.error("Preview playback failed:", err));
    }
  };

  const startListening = () => { if (recognitionRef.current) recognitionRef.current.start(); };
  const stopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputText;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: textToSend, isBot: false, role: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiChat({ message: textToSend });
      const botResponseText = response.status === 200 ? response.data.message : "I'm having trouble connecting right now.";
      
      const botMessage = { id: Date.now() + 1, text: botResponseText, isBot: true, role: 'assistant', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      
      speakText(botResponseText);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorText = "Sorry, an unexpected error occurred.";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: errorText, isBot: true, role: 'assistant', timestamp: new Date() }]);
      speakText(errorText);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return (
    <>
      <div className={`fixed z-50 ${isFullScreen ? 'inset-0 p-4' : 'bottom-6 right-6'}`}>
        {isOpen && (
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${
            isFullScreen ? 'w-full h-full' : 'mb-4 w-80 h-96'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Casa Voice Agent</h3>
                  <p className="text-xs text-blue-100">Your Personal Real Estate Assistant</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => setIsSettingsOpen(!isSettingsOpen)} variant="ghost" size="sm" className="text-white hover:bg-white/20" title="Settings">
                    <Settings className={`w-4 h-4 transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                  </Button>
                  <Button onClick={() => setVoiceEnabled(!voiceEnabled)} variant="ghost" size="sm" className="text-white hover:bg-white/20" title={voiceEnabled ? "Disable Voice" : "Enable Voice"}>
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button onClick={toggleFullScreen} variant="ghost" size="sm" className="text-white hover:bg-white/20" title={isFullScreen ? "Minimize" : "Maximize"}>
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {isSettingsOpen && (
                <div className="mt-4 bg-black/20 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Voice Selection</h4>
                    <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                        <SelectTrigger className="w-full bg-white/20 border-white/30 text-white">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableVoices.map(voice => (
                                <SelectItem key={voice.id} value={voice.id}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{voice.name} ({voice.accent})</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 ml-4"
                                            onClick={(e) => playPreview(e, voice.preview_url)}
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingHistory && (
                 <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading history...</p>
                 </div>
              )}
              {hasMoreHistory && !isLoadingHistory && (
                <div className="text-center">
                    <Button variant="link" size="sm" onClick={handleLoadMore} disabled={isLoadingHistory}>
                        Load More
                    </Button>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`${isFullScreen ? 'max-w-2xl' : 'max-w-xs'} px-3 py-2 rounded-lg text-sm ${
                    message.isBot 
                      ? (message.role === 'admin' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800'
                        )
                      : 'bg-blue-600 text-white'
                  }`}>
                    {message.role === 'admin' && (
                      <div className="text-xs opacity-75 mb-1 font-semibold">Administrator</div>
                    )}
                    {message.text}
                    {message.isBot && isSpeaking && messages[messages.length - 1].id === message.id && (
                      <div className="flex items-center mt-1">
                        <Volume2 className="w-3 h-3 text-blue-600 mr-1 animate-pulse" />
                        <span className="text-xs text-blue-600">Speaking...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator for new messages */}
              {isLoading && (
                 <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  className="flex-1"
                  disabled={isLoading || isListening}
                />
                {speechSupported && (
                  <Button onClick={isListening ? stopListening : startListening} disabled={isLoading || !voiceEnabled} className={`${isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`} title={isListening ? "Stop listening" : "Start voice input"}>
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button onClick={() => handleSendMessage()} disabled={isLoading || !inputText.trim() || isListening} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button onClick={() => setIsOpen(!isOpen)} className={`rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 ${isFullScreen ? 'hidden' : 'w-14 h-14'}`}>
          {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </Button>
      </div>
      <audio ref={audioPlayerRef} hidden />
    </>
  );
}
