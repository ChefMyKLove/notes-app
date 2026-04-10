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
      fontSize: 'medium',
      dyslexiaFont: false,
      wordSpacing: 'normal', // normal, medium, wide
      readingGuide: false,
      distractionFree: false
    };
    
    // Text-to-Speech
    this.synthesis = window.speechSynthesis;
    this.utterance = null;
    this.voices = [];
    this.isSpeaking = false;
    
    // Magnifier
    this.magnifierElement = null;
    this.magnifierActive = false;

    // Reading Guide
    this.readingGuideElement = null;
    this.readingGuideActive = false;
    
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
    
    const MAGNIFIER_SIZE = 450;
    const ZOOM_LEVEL = 2;
    
    // Create square magnifier container
    this.magnifierElement = document.createElement('div');
    this.magnifierElement.id = 'screen-magnifier';
    this.magnifierElement.style.cssText = `
      position: fixed;
      width: ${MAGNIFIER_SIZE}px;
      height: ${MAGNIFIER_SIZE}px;
      border: 4px solid #2c3e50;
      pointer-events: none;
      z-index: 10000;
      display: none;
      background: white;
      box-shadow: 0 0 30px rgba(0,0,0,0.7);
      overflow: hidden;
    `;
    
    // Create inner viewport that will hold magnified content
    const viewport = document.createElement('div');
    viewport.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;
    this.magnifierElement.appendChild(viewport);
    
    document.body.appendChild(this.magnifierElement);
    
    // Store reference
    const magnifier = this.magnifierElement;
    
    // Track mouse movement
    this.magnifierMouseMove = (e) => {
      if (!magnifier) return;
      
      try {
        const x = e.clientX;
        const y = e.clientY;
        
        // Position magnifier centered on cursor
        magnifier.style.left = (x - MAGNIFIER_SIZE / 2) + 'px';
        magnifier.style.top = (y - MAGNIFIER_SIZE / 2) + 'px';
        magnifier.style.display = 'block';
        
        // Get element at cursor
        const elementAtCursor = document.elementFromPoint(x, y);
        if (!elementAtCursor || elementAtCursor.id === 'screen-magnifier') return;
        
        // Clear viewport and clone the body for magnification
        viewport.innerHTML = '';
        
        // Clone the visible content
        const clone = document.body.cloneNode(true);
        
        // Hide the magnifier in the clone to avoid recursion
        const clonedMagnifier = clone.querySelector('#screen-magnifier');
        if (clonedMagnifier) clonedMagnifier.style.display = 'none';
        
        // Create wrapper for scaling
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position: absolute;
          transform: scale(${ZOOM_LEVEL});
          transform-origin: top left;
          width: ${window.innerWidth}px;
          height: ${window.innerHeight}px;
          top: 0;
          left: 0;
        `;
        wrapper.appendChild(clone);
        
        // Position to show area under cursor magnified and centered
        const offsetX = -(x * ZOOM_LEVEL) + (MAGNIFIER_SIZE / 2);
        const offsetY = -(y * ZOOM_LEVEL) + (MAGNIFIER_SIZE / 2);
        
        wrapper.style.left = offsetX + 'px';
        wrapper.style.top = offsetY + 'px';
        
        viewport.appendChild(wrapper);
        
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
   * Toggle Dyslexia-Friendly Font
   */
  toggleDyslexiaFont() {
    this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
    
    if (this.settings.dyslexiaFont) {
      document.documentElement.style.fontFamily = 'OpenDyslexic, Verdana, Arial, sans-serif';
      document.body.style.fontFamily = 'OpenDyslexic, Verdana, Arial, sans-serif';
    } else {
      document.documentElement.style.fontFamily = '';
      document.body.style.fontFamily = '';
    }
    
    // Update button
    const btn = document.getElementById('dyslexia-font-btn');
    if (btn) {
      btn.textContent = this.settings.dyslexiaFont ? 'Font: Dyslexia-Friendly' : 'Font: Standard';
      btn.classList.toggle('active');
    }
    
    this.saveSettings();
    return this.settings.dyslexiaFont;
  }
    }
    
    // Update button
    const btn = document.getElementById('dyslexia-font-btn');
    if (btn) {
      btn.textContent = this.settings.dyslexiaFont ? 'Font: Dyslexia-Friendly' : 'Font: Standard';
      btn.classList.toggle('active');
    }
    
    this.saveSettings();
    return this.settings.dyslexiaFont;
  }

  /**
   * Adjust word/letter spacing
   */
  adjustWordSpacing(direction) {
    const spacings = { normal: 0, medium: 1, wide: 2 };
    const spacingValues = [0, 1, 2];
    const currentIndex = spacingValues.indexOf(spacings[this.settings.wordSpacing]);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex > 2) newIndex = 2;
    
    const newSpacing = Object.keys(spacings)[newIndex];
    this.settings.wordSpacing = newSpacing;
    
    // Apply spacing
    const spacingMap = {
      normal: { letter: '0.05em', word: '0.25em', line: '1.5' },
      medium: { letter: '0.1em', word: '0.5em', line: '1.8' },
      wide: { letter: '0.15em', word: '0.75em', line: '2' }
    };
    
    const spacing = spacingMap[newSpacing];
    document.documentElement.style.letterSpacing = spacing.letter;
    document.documentElement.style.wordSpacing = spacing.word;
    document.documentElement.style.lineHeight = spacing.line;
    
    // Update button
    const valueDisplay = document.getElementById('spacing-value');
    if (valueDisplay) {
      valueDisplay.textContent = newSpacing.charAt(0).toUpperCase() + newSpacing.slice(1);
    }
    
    this.saveSettings();
    return newSpacing;
  }

  /**
   * Toggle Reading Guide (horizontal line following cursor)
   */
  toggleReadingGuide() {
    this.readingGuideActive = !this.readingGuideActive;
    
    if (this.readingGuideActive) {
      this.enableReadingGuide();
    } else {
      this.disableReadingGuide();
    }
    
    // Update button
    const btn = document.getElementById('reading-guide-btn');
    if (btn) {
      btn.textContent = this.readingGuideActive ? 'Reading Guide: ON' : 'Reading Guide: OFF';
      btn.classList.toggle('active');
    }
    
    this.saveSettings();
    return this.readingGuideActive;
  }

  enableReadingGuide() {
    if (this.readingGuideElement) return;
    
    this.readingGuideElement = document.createElement('div');
    this.readingGuideElement.id = 'reading-guide';
    this.readingGuideElement.style.cssText = `
      position: fixed;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #FF6B6B, transparent);
      pointer-events: none;
      z-index: 9999;
      display: none;
      box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
    `;
    
    document.body.appendChild(this.readingGuideElement);
    
    // Track mouse movement
    this.readingGuideMouseMove = (e) => {
      if (!this.readingGuideElement) return;
      this.readingGuideElement.style.top = e.clientY + 'px';
      this.readingGuideElement.style.display = 'block';
    };
    
    document.addEventListener('mousemove', this.readingGuideMouseMove);
  }

  disableReadingGuide() {
    if (this.readingGuideElement) {
      this.readingGuideElement.remove();
      this.readingGuideElement = null;
    }
    
    if (this.readingGuideMouseMove) {
      document.removeEventListener('mousemove', this.readingGuideMouseMove);
    }
  }
    };
    
    document.addEventListener('mousemove', this.readingGuideMouseMove);
  }

  disableReadingGuide() {
    if (this.readingGuideElement) {
      this.readingGuideElement.remove();
      this.readingGuideElement = null;
    }
    
    if (this.readingGuideMouseMove) {
      document.removeEventListener('mousemove', this.readingGuideMouseMove);
    }
  }

  /**
   * Toggle Distraction-Free Mode (hide sidebar and toolbars)
   */
  toggleDistractionFree() {
    this.settings.distractionFree = !this.settings.distractionFree;
    
    if (this.settings.distractionFree) {
      // Hide sidebar
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.style.display = 'none';
      
      // Hide Vosk controls
      const voskControls = document.getElementById('vosk-controls');
      if (voskControls) voskControls.style.display = 'none';
      
      // Make main content full width
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.style.width = '100%';
    } else {
      // Show sidebar
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.style.display = '';
      
      // Show Vosk controls
      const voskControls = document.getElementById('vosk-controls');
      if (voskControls) voskControls.style.display = '';
      
      // Reset main content width
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.style.width = '';
    }
    
    // Update button
    const btn = document.getElementById('distraction-free-btn');
    if (btn) {
      btn.textContent = this.settings.distractionFree ? 'Distraction-Free: ON' : 'Distraction-Free: OFF';
      btn.classList.toggle('active');
    }
    
    this.saveSettings();
    return this.settings.distractionFree;
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
      dyslexiaFont: this.settings.dyslexiaFont,
      wordSpacing: this.settings.wordSpacing,
      readingGuide: this.readingGuideActive,
      distractionFree: this.settings.distractionFree,
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
