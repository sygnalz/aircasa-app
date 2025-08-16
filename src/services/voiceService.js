/**
 * Voice Service for aiChat
 * Handles speech recognition and text-to-speech functionality
 */

import { AI_CHAT_CONFIG } from '@/config/aiChatConfig';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSupported = this.checkSupport();
    this.currentUtterance = null;
    
    this.initializeSpeechRecognition();
  }

  /**
   * CHECK BROWSER SUPPORT
   */
  
  checkSupport() {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    
    console.log('🎤 Voice support:', { recognition: hasRecognition, synthesis: hasSynthesis });
    return { recognition: hasRecognition, synthesis: hasSynthesis };
  }

  /**
   * SPEECH RECOGNITION SETUP
   */

  initializeSpeechRecognition() {
    if (!this.isSupported.recognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event listeners
    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.isListening = true;
      this.onListeningStart?.();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript);
        this.onTranscript?.(finalTranscript.trim());
      }

      if (interimTranscript) {
        this.onInterimTranscript?.(interimTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error);
      this.isListening = false;
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.isListening = false;
      this.onListeningEnd?.();
    };
  }

  /**
   * SPEECH RECOGNITION CONTROL
   */

  async startListening() {
    if (!this.isSupported.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw new Error('Microphone access denied');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * TEXT-TO-SPEECH
   */

  speak(text, options = {}) {
    if (!this.isSupported.synthesis) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Stop any current speech
      this.stopSpeaking();

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice options
      this.currentUtterance.rate = options.rate || 1.0;
      this.currentUtterance.pitch = options.pitch || 1.0;
      this.currentUtterance.volume = options.volume || 1.0;
      
      // Set voice if specified
      if (options.voiceId) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === options.voiceId || voice.voiceURI === options.voiceId
        );
        if (selectedVoice) {
          this.currentUtterance.voice = selectedVoice;
        }
      }

      // Set up event listeners
      this.currentUtterance.onstart = () => {
        console.log('🔊 Speech synthesis started');
        this.onSpeechStart?.();
      };

      this.currentUtterance.onend = () => {
        console.log('🔊 Speech synthesis ended');
        this.currentUtterance = null;
        this.onSpeechEnd?.();
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('🔊 Speech synthesis error:', event);
        this.currentUtterance = null;
        this.onSpeechError?.(event.error);
        reject(event.error);
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * VOICE MANAGEMENT
   */

  getAvailableVoices() {
    if (!this.isSupported.synthesis) return [];
    
    return this.synthesis.getVoices().map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  async waitForVoices() {
    return new Promise((resolve) => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Wait for voices to load
      const onVoicesChanged = () => {
        const loadedVoices = this.synthesis.getVoices();
        if (loadedVoices.length > 0) {
          this.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(loadedVoices);
        }
      };

      this.synthesis.addEventListener('voiceschanged', onVoicesChanged);
    });
  }

  /**
   * ELEVENLABS INTEGRATION
   */

  async generateElevenLabsAudio(text, voiceId, options = {}) {
    const apiKey = AI_CHAT_CONFIG.ELEVENLABS.API_KEY;
    
    if (!apiKey) {
      console.log('🎵 ElevenLabs API key not available, skipping generation');
      return null;
    }

    try {
      console.log('🎵 Generating ElevenLabs audio:', { 
        text: text.substring(0, 50) + '...', 
        voiceId: voiceId || AI_CHAT_CONFIG.ELEVENLABS.VOICE_ID 
      });

      const targetVoiceId = voiceId || AI_CHAT_CONFIG.ELEVENLABS.VOICE_ID;
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`;

      const requestBody = {
        text: text,
        model_id: AI_CHAT_CONFIG.ELEVENLABS.MODEL_ID || "eleven_monolingual_v1",
        voice_settings: {
          stability: options.stability || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.stability,
          similarity_boost: options.similarity_boost || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.similarity_boost,
          style: options.style || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.style,
          use_speaker_boost: options.use_speaker_boost || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.use_speaker_boost
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      // Convert response to blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('✅ ElevenLabs audio generated successfully');
      return audioUrl;

    } catch (error) {
      console.error('❌ ElevenLabs generation failed:', error);
      return null;
    }
  }

  /**
   * Play ElevenLabs generated audio
   */
  async playElevenLabsAudio(audioUrl, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.setAttribute('data-aichat', 'true');
      
      // Configure audio
      audio.volume = options.volume || 1.0;
      audio.playbackRate = options.playbackRate || 1.0;

      audio.onloadstart = () => {
        console.log('🔊 ElevenLabs audio loading...');
        this.onSpeechStart?.();
      };

      audio.onplay = () => {
        console.log('🔊 ElevenLabs audio started playing');
      };

      audio.onended = () => {
        console.log('🔊 ElevenLabs audio finished');
        this.onSpeechEnd?.();
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        console.error('🔊 ElevenLabs audio error:', error);
        this.onSpeechError?.(error);
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Enhanced voice generation with ElevenLabs fallback
   */
  async generateAndPlayVoice(text, options = {}) {
    try {
      // Try ElevenLabs first if available
      if (AI_CHAT_CONFIG.ELEVENLABS.API_KEY) {
        const audioUrl = await this.generateElevenLabsAudio(text, options.voiceId, options);
        if (audioUrl) {
          await this.playElevenLabsAudio(audioUrl, options);
          return true;
        }
      }

      // Fallback to browser synthesis
      if (this.isSupported.synthesis) {
        await this.speak(text, options);
        return true;
      }

      console.warn('No voice synthesis available');
      return false;

    } catch (error) {
      console.error('Voice generation failed:', error);
      
      // Ultimate fallback to browser synthesis
      if (this.isSupported.synthesis) {
        try {
          await this.speak(text, options);
          return true;
        } catch (fallbackError) {
          console.error('Fallback voice synthesis also failed:', fallbackError);
        }
      }
      
      return false;
    }
  }

  /**
   * EVENT HANDLERS (Set by external components)
   */

  onListeningStart = null;
  onListeningEnd = null;
  onTranscript = null;
  onInterimTranscript = null;
  onSpeechStart = null;
  onSpeechEnd = null;
  onSpeechError = null;
  onError = null;

  /**
   * UTILITY METHODS
   */

  isSpeechRecognitionSupported() {
    return this.isSupported.recognition;
  }

  isSpeechSynthesisSupported() {
    return this.isSupported.synthesis;
  }

  isCurrentlyListening() {
    return this.isListening;
  }

  isCurrentlySpeaking() {
    return this.synthesis?.speaking || false;
  }
}

// Create singleton instance
const voiceService = new VoiceService();
export default voiceService;