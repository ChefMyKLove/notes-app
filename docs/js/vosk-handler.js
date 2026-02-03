/**
 * Vosk Speech Recognition Handler
 * Manages offline speech-to-text using Vosk-Browser in several languages
 */

class VoskHandler {
  constructor(config = {}) {
    this.model = null;
    this.recognizer = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.audioWorkletNode = null;
    this.isListening = false;
    
    // Configuration
    this.config = {
      sampleRate: 16000, // Vosk standard
      onResult: config.onResult || ((text) => console.log('Result:', text)),
      onPartial: config.onPartial || ((text) => console.log('Partial:', text)),
      onError: config.onError || ((error) => console.error('Vosk Error:', error)),
      onStatusChange: config.onStatusChange || ((status) => console.log('Status:', status)),
      ...config
    };
    
    // Available models - Using locally hosted models (in /docs/models/ folder)
// Available models - Hosted on Google Drive (direct download links)
this.availableModels = [
  {
    name: 'English (Small - 40MB)',
    code: 'vosk-model-small-en-us-0.15',
    url: 'https://drive.google.com/uc?export=download&id=1cxw7-KF0F8NImxM3ZLQqEukkXqscblvo',
    size: '40MB',
    language: 'en'
  },
  {
    name: 'French (Small - 41MB)',
    code: 'vosk-model-small-fr-0.22',
    url: 'https://drive.google.com/uc?export=download&id=1mIuSG7Eu-SE0I4gD5ymA7_1chL16-OGA',
    size: '41MB',
    language: 'fr'
  },
  {
    name: 'Portuguese (Small - 31MB)',
    code: 'vosk-model-small-pt-0.3',
    url: 'https://drive.google.com/uc?export=download&id=1Ofh-o6q1qaAYEXCE1LBok8yLvNVr_R8w',
    size: '31MB',
    language: 'pt'
  },
  {
    name: 'Chinese (Small - 42MB)',
    code: 'vosk-model-small-cn-0.22',
    url: 'https://drive.google.com/uc?export=download&id=1LFYolZ54MzzKWzPR-f2LWotd_gQ7Gtl1',
    size: '42MB',
    language: 'zh'
  }
];
  }
  
  /**
   * Get list of available models
   */
  getAvailableModels() {
    return this.availableModels;
  }
  
  /**
   * Load a Vosk model
   * @param {string} modelUrl - URL to the model file
   * @param {Function} progressCallback - Optional callback for download progress
   */
  async loadModel(modelUrl, progressCallback = null) {
    try {
      this.updateStatus('loading', 'Loading model... This may take 10-30 seconds');
      
      if (!window.Vosk) {
        throw new Error('Vosk library not loaded. Please include vosk-browser script.');
      }
      
      // Create model with progress tracking if available
      this.model = await Vosk.createModel(modelUrl);
      
      if (!this.model) {
        throw new Error('Failed to create model');
      }
      
      // Create recognizer with correct sample rate
      this.recognizer = new this.model.KaldiRecognizer(this.config.sampleRate);
      
      // Set up event listeners
      this.recognizer.on("result", (message) => {
        const text = message.result?.text || '';
        if (text.trim()) {
          this.config.onResult(text);
        }
      });
      
      this.recognizer.on("partialresult", (message) => {
        const partial = message.result?.partial || '';
        if (partial.trim()) {
          this.config.onPartial(partial);
        }
      });
      
      this.updateStatus('ready', 'Model loaded successfully! Ready to record.');
      return true;
      
    } catch (error) {
      this.updateStatus('error', `Failed to load model: ${error.message}`);
      this.config.onError(error);
      return false;
    }
  }
  
  /**
   * Start listening to microphone
   */
  async startListening() {
    if (!this.recognizer) {
      throw new Error('Model not loaded. Please load a model first.');
    }
    
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }
    
    try {
      this.updateStatus('loading', 'Requesting microphone access...');
      
      // Request microphone access with optimal settings
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: this.config.sampleRate
        },
        video: false
      });
      
      // Create AudioContext with correct sample rate
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Use ScriptProcessor (deprecated but widely supported)
      // TODO: Migrate to AudioWorklet for production
      const bufferSize = 4096;
      const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (!this.isListening) return;
        
        try {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Use acceptWaveformFloat for Float32Array data with sample rate
          this.recognizer.acceptWaveformFloat(inputData, this.audioContext.sampleRate);
          
        } catch (error) {
          console.error('Error processing audio:', error);
          this.config.onError(error);
        }
      };
      
      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
      // Store reference for cleanup
      this.audioWorkletNode = processor;
      
      this.isListening = true;
      this.updateStatus('recording', 'Listening... Speak naturally.');
      
    } catch (error) {
      this.updateStatus('error', `Microphone access denied: ${error.message}`);
      this.config.onError(error);
      throw error;
    }
  }
  
  /**
   * Stop listening
   */
  async stopListening() {
    if (!this.isListening) {
      return;
    }
    
    this.isListening = false;
    
    // Stop all audio processing
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.updateStatus('ready', 'Recording stopped. Ready for next recording.');
  }
  
  /**
   * Update status with callback
   */
  updateStatus(state, message) {
    this.config.onStatusChange({ state, message });
  }
  
  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.stopListening();
    this.model = null;
    this.recognizer = null;
  }
  
  /**
   * Check if Vosk is available and HTTPS is enabled
   */
  static checkSupport() {
    const errors = [];
    
    if (!window.Vosk) {
      errors.push('Vosk library not loaded');
    }
    
    if (!window.isSecureContext) {
      errors.push('HTTPS required for microphone access');
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errors.push('getUserMedia not supported in this browser');
    }
    
    if (!window.AudioContext && !window.webkitAudioContext) {
      errors.push('Web Audio API not supported');
    }
    
    return {
      supported: errors.length === 0,
      errors
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoskHandler;
}
