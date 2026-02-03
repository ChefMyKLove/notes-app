/**
 * Vosk Speech Recognition Handler
 * Manages offline speech-to-text using Vosk-Browser
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
    
    // CORS Proxy options (in order of preference)
    this.corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    // Current proxy index
    this.currentProxyIndex = 0;
    
    // Available models
    this.modelBaseUrls = {
      'en': 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
      'fr': 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip',
      'pt': 'https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip',
      'es': 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip',
      'zh': 'https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip'
    };
    
    this.availableModels = [
      {
        name: 'English (Small - 40MB)',
        code: 'vosk-model-small-en-us-0.15',
        baseUrl: this.modelBaseUrls.en,
        size: '40MB',
        language: 'en'
      },
      {
        name: 'French (Small - 41MB)',
        code: 'vosk-model-small-fr-0.22',
        baseUrl: this.modelBaseUrls.fr,
        size: '41MB',
        language: 'fr'
      },
      {
        name: 'Portuguese (Small - 31MB)',
        code: 'vosk-model-small-pt-0.3',
        baseUrl: this.modelBaseUrls.pt,
        size: '31MB',
        language: 'pt'
      },
      {
        name: 'Spanish (Small - 39MB)',
        code: 'vosk-model-small-es-0.42',
        baseUrl: this.modelBaseUrls.es,
        size: '39MB',
        language: 'es'
      },
      {
        name: 'Chinese (Small - 42MB)',
        code: 'vosk-model-small-cn-0.22',
        baseUrl: this.modelBaseUrls.zh,
        size: '42MB',
        language: 'zh'
      }
    ];
  }  
  /**
   * Get list of available models with current proxy
   */
  getAvailableModels() {
    return this.availableModels.map(model => ({
      ...model,
      url: this.buildProxiedUrl(model.baseUrl)
    }));
  }
  
  /**
   * Build URL with current CORS proxy
   */
  buildProxiedUrl(baseUrl) {
    const proxy = this.corsProxies[this.currentProxyIndex];
    if (proxy.includes('allorigins')) {
      return proxy + encodeURIComponent(baseUrl);
    } else if (proxy.includes('corsproxy')) {
      return proxy + encodeURIComponent(baseUrl);
    } else {
      return proxy + baseUrl;
    }
  }
  
  /**
   * Try next CORS proxy
   */
  tryNextProxy() {
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
    console.log(`Switching to proxy: ${this.corsProxies[this.currentProxyIndex]}`);
  }
  
  /**
   * Load a Vosk model with retry logic
   * @param {string} modelUrl - URL to the model file (can be base URL or proxied)
   * @param {Function} progressCallback - Optional callback for download progress
   */
  async loadModel(modelUrl, progressCallback = null) {
    const maxRetries = this.corsProxies.length;
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Build proxied URL if it's a base URL
        const finalUrl = modelUrl.includes('alphacephei.com') 
          ? this.buildProxiedUrl(modelUrl)
          : modelUrl;
          
        this.updateStatus('loading', `Downloading model (attempt ${attempt + 1}/${maxRetries})... This may take 30-90 seconds`);
        
        if (!window.Vosk) {
          throw new Error('Vosk library not loaded. Please include vosk-browser script.');
        }
        
        console.log(`Attempting to load model from: ${finalUrl}`);
        
        // Create model
        this.model = await Vosk.createModel(finalUrl);
        
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
        console.error(`Model load attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        // Try next proxy if available
        if (attempt < maxRetries - 1) {
          this.tryNextProxy();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    // All attempts failed
    this.updateStatus('error', `Failed to load model after ${maxRetries} attempts: ${lastError.message}`);
    this.config.onError(lastError);
    return false;
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
          
          // Use acceptWaveformFloat for Float32Array data
          this.recognizer.acceptWaveformFloat(inputData);
          
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
