/**
 * Accessibility Handler - Full Implementation
 * Provides comprehensive accessibility features for the notes app
 */

class AccessibilityHandler {
  constructor() {
    console.log('🎯 Initializing Accessibility Handler...');
    
    // Settings
    this.settings = {
      darkMode: false,
      textToSpeech: false,
      ttsLanguage: 'en-US',
      zoom: 100,
      magnifier: false,
      highContrast: false,
      fontSize: 'medium'
    };
    
    // Text-to-Speech
    this.synthesis = window.speechSynthesis;
    this.utterance = null;
    this.voices = [];
    this.isSpeaking = false;
    
    // Magnifier
    this.magnifierElement = null;
    this.magnifierActive = false;
    
    // Load saved settings
    this.loadSettings();
    
    // Wait for voices to load
    if (this.synthesis) {
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
    
    console.log('✅ Accessibility Handler initialized');
  }
  
  /**
   * Initialize all accessibility features
   */
  initialize() {
    console.log('Setting up accessibility features...');
    
    // Apply saved settings
    if (this.settings.darkMode) {
      this.enableDarkMode();
    }
    
    if (this.settings.zoom !== 100) {
      this.setZoom(this.settings.zoom);
    }
    
    if (this.settings.highContrast) {
      this.enableHighContrast();
    }
    
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    console.log('✅ Accessibility features ready');
  }
  
  /**
   * Load available TTS voices
   */
  loadVoices() {
    this.voices = this.synthesis.getVoices();
    console.log(`Loaded ${this.voices.length} voices`);
    
    // Populate voice selector if it exists
    const voiceSelect = document.getElementById('tts-voice-select');
    if (voiceSelect && this.voices.length > 0) {
      voiceSelect.innerHTML = '<option value="">Select voice...</option>';
      
      // Group voices by language
      const languages = {
        'en': 'English',
        'fr': 'French', 
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'es': 'Spanish'
      };
      
      Object.keys(languages).forEach(lang => {
        const langVoices = this.voices.filter(v => v.lang.startsWith(lang));
        if (langVoices.length > 0) {
          const optgroup = document.createElement('optgroup');
          optgroup.label = languages[lang];
          
          langVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            optgroup.appendChild(option);
          });
          
          voiceSelect.appendChild(optgroup);
        }
      });
      
      // Select saved voice
      if (this.settings.ttsLanguage) {
        voiceSelect.value = this.settings.ttsLanguage;
      }
    }
  }
  
  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    this.settings.darkMode = !this.settings.darkMode;
    
    if (this.settings.darkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
    
    this.saveSettings();
    return this.settings.darkMode;
  }
  
  enableDarkMode() {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    
    const btn = document.getElementById('dark-mode-btn');
    if (btn) {
      btn.textContent = '☀️';
      btn.title = 'Light Mode';
    }
  }
  
  disableDarkMode() {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    
    const btn = document.getElementById('dark-mode-btn');
    if (btn) {
      btn.textContent = '🌙';
      btn.title = 'Dark Mode';
    }
  }
  
  /**
   * Text-to-Speech functionality
   */
  speak(text, language = null) {
    if (!this.synthesis) {
      console.error('Text-to-Speech not supported in this browser');
      return false;
    }
    
    // Stop any ongoing speech
    this.stopSpeaking();
    
    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language or selection
    const voiceName = language || this.settings.ttsLanguage;
    const selectedVoice = this.voices.find(v => v.name === voiceName || v.lang === voiceName);
    
    if (selectedVoice) {
      this.utterance.voice = selectedVoice;
      this.utterance.lang = selectedVoice.lang;
    }
    
    // Set properties
    this.utterance.rate = 1.0;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;
    
    // Event handlers
    this.utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateTTSButton(true);
    };
    
    this.utterance.onend = () => {
      this.isSpeaking = false;
      this.updateTTSButton(false);
    };
    
    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.updateTTSButton(false);
    };
    
    // Speak
    this.synthesis.speak(this.utterance);
    return true;
  }
  
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.updateTTSButton(false);
    }
  }
  
  updateTTSButton(speaking) {
    const btn = document.getElementById('tts-btn');
    if (btn) {
      if (speaking) {
        btn.textContent = '⏹️ Stop';
        btn.classList.add('speaking');
      } else {
        btn.textContent = '🔊 Read Note';
        btn.classList.remove('speaking');
      }
    }
  }
  
  readCurrentNote() {
    const noteContent = document.getElementById('noteContent');
    if (!noteContent) {
      console.warn('No note content to read');
      return;
    }
    
    const text = noteContent.textContent || noteContent.innerText;
    if (!text || text.trim().length === 0) {
      alert('No text to read. Please type something in the note first.');
      return;
    }
    
    this.speak(text);
  }
  
  /**
   * Zoom controls
   */
  setZoom(level) {
    // Clamp between 50% and 300%
    level = Math.max(50, Math.min(300, level));
    this.settings.zoom = level;
    
    // Apply zoom
    document.documentElement.style.fontSize = `${level}%`;
    
    // Update display
    const display = document.getElementById('zoom-level-display');
    if (display) {
      display.textContent = `${level}%`;
    }
    
    const slider = document.getElementById('zoom-slider');
    if (slider) {
      slider.value = level;
    }
    
    this.saveSettings();
    return level;
  }
  
  zoomIn() {
    return this.setZoom(this.settings.zoom + 10);
  }
  
  zoomOut() {
    return this.setZoom(this.settings.zoom - 10);
  }
  
  resetZoom() {
    return this.setZoom(100);
  }
  
  /**
   * Screen Magnifier
   */
  toggleMagnifier() {
    this.magnifierActive = !this.magnifierActive;
    
    if (this.magnifierActive) {
      this.enableMagnifier();
    } else {
      this.disableMagnifier();
    }
    
    return this.magnifierActive;
  }
  
  enableMagnifier() {
    if (this.magnifierElement) return;
    
    // Create magnifier container
    this.magnifierElement = document.createElement('div');
    this.magnifierElement.id = 'screen-magnifier';
    this.magnifierElement.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border: 4px solid #2c3e50;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      display: none;
      background: white;
      box-shadow: 0 0 30px rgba(0,0,0,0.7);
      overflow: hidden;
    `;
    
    // Create canvas for magnified rendering
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
    this.magnifierElement.appendChild(canvas);
    
    document.body.appendChild(this.magnifierElement);
    
    const ctx = canvas.getContext('2d');
    
    // Track mouse movement
    this.magnifierMouseMove = (e) => {
      if (!this.magnifierElement || !ctx) return;
      
      try {
        const x = e.clientX;
        const y = e.clientY;
        
        // Position magnifier
        this.magnifierElement.style.left = (x - 150) + 'px';
        this.magnifierElement.style.top = (y - 150) + 'px';
        this.magnifierElement.style.display = 'block';
        
        // Get element at cursor
        const elementAtCursor = document.elementFromPoint(x, y);
        if (!elementAtCursor) return;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);
        
        // Get text from element and nearby
        let text = elementAtCursor.textContent?.trim() || '';
        if (!text) {
          text = elementAtCursor.parentElement?.textContent?.trim() || 'No content';
        }
        
        // Limit text length
        text = text.substring(0, 150);
        
        // Draw magnified text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.lineWidth = 2;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // Wrap text and draw
        const lineHeight = 40;
        const maxWidth = 280;
        const words = text.split(' ');
        let line = '';
        let y_offset = 20;
        
        for (let word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, 10, y_offset);
            y_offset += lineHeight;
            line = word + ' ';
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 10, y_offset);
        
      } catch (error) {
        console.error('Magnifier error:', error);
      }
    };
    
    document.addEventListener('mousemove', this.magnifierMouseMove);
    
    // Update button
    const btn = document.getElementById('magnifier-btn');
    if (btn) {
      btn.classList.add('active');
      btn.textContent = '🔍 Magnifier ON';
    }
  }
  
  disableMagnifier() {
    if (this.magnifierElement) {
      this.magnifierElement.remove();
      this.magnifierElement = null;
    }
    
    if (this.magnifierMouseMove) {
      document.removeEventListener('mousemove', this.magnifierMouseMove);
      this.magnifierMouseMove = null;
    }
    
    const btn = document.getElementById('magnifier-btn');
    if (btn) {
      btn.classList.remove('active');
      btn.textContent = '🔍 Magnifier';
    }
  }
  
  captureScreen() {
    // Simple screenshot using html2canvas would go here
    // For now, return empty data URL
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
  
  /**
   * High Contrast Mode
   */
  toggleHighContrast() {
    this.settings.highContrast = !this.settings.highContrast;
    
    if (this.settings.highContrast) {
      this.enableHighContrast();
    } else {
      this.disableHighContrast();
    }
    
    this.saveSettings();
    return this.settings.highContrast;
  }
  
  enableHighContrast() {
    document.body.classList.add('high-contrast');
  }
  
  disableHighContrast() {
    document.body.classList.remove('high-contrast');
  }
  
  /**
   * Keyboard Shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + D - Toggle Dark Mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleDarkMode();
      }
      
      // Ctrl/Cmd + Shift + R - Read Note
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.readCurrentNote();
      }
      
      // Ctrl/Cmd + Plus - Zoom In
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this.zoomIn();
      }
      
      // Ctrl/Cmd + Minus - Zoom Out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        this.zoomOut();
      }
      
      // Ctrl/Cmd + 0 - Reset Zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        this.resetZoom();
      }
    });
  }
  
  /**
   * Settings persistence
   */
  saveSettings() {
    localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
  }
  
  loadSettings() {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      darkMode: this.settings.darkMode,
      textToSpeech: this.isSpeaking,
      zoom: this.settings.zoom,
      magnifier: this.magnifierActive,
      highContrast: this.settings.highContrast,
      voicesLoaded: this.voices.length,
      available: true
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AccessibilityHandler = AccessibilityHandler;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityHandler;
}

console.log('✅ AccessibilityHandler class loaded');
