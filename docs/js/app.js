// ==========================================
// CONFIGURATION
// ==========================================

// Auto-detect environment (production vs local)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'  // Local development
  : 'https://detailed-hortense-chefmyklove-26470e11.koyeb.app/api';  // Production

console.log('API Base URL:', API_BASE_URL);

// ============================================
// GLOBAL FUNCTIONS (Must be defined before DOM ready for onclick handlers)
// ============================================

// Force switchAuthForm into global scope immediately for inline onclick handlers
window.switchAuthForm = function(formType) {
  console.log('switchAuthForm called with:', formType);
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');
  
  // Clear any existing errors
  if (loginError) loginError.textContent = '';
  if (registerError) registerError.textContent = '';
  
  if (formType === 'register') {
    if (loginForm) {
      loginForm.classList.remove('active');
      loginForm.style.display = 'none';
    }
    if (registerForm) {
      registerForm.classList.add('active');
      registerForm.style.display = 'block';
    }
  } else if (formType === 'login') {
    if (registerForm) {
      registerForm.classList.remove('active');
      registerForm.style.display = 'none';
    }
    if (loginForm) {
      loginForm.classList.add('active');
      loginForm.style.display = 'block';
    }
  }
};
let accessibilityHandler = null;

// TTS Settings
let ttsSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  selectedVoice: null
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let currentUser = null;
let currentNoteId = null;
let notes = [];
let voskHandler = null;

// ==========================================
// DOM ELEMENTS - MUST BE DECLARED AFTER DOM LOADS
// ==========================================

let authContainer, appContainer, loginForm, registerForm;
let loginFormElement, registerFormElement, logoutBtn, currentUserDisplay;
let newNoteBtn, notesList, emptyState, editor;
let noteTitle, noteContent, charCount;
let saveBtn, deleteBtn, cancelBtn;
let noteError, loginError, registerError;
let darkModeToggle, zoomIn, zoomOut, resetZoom, toggleMagnifier;
let languageSelect, readTextBtn, pauseReadBtn, stopReadBtn, ttsSettingsBtn;
let ttsModal, closeTtsModal, ttsRate, ttsPitch, ttsVolume, voiceSelect;
let testTtsBtn, saveTtsBtn;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM elements after page loads
  authContainer = document.getElementById('authContainer');
  appContainer = document.getElementById('appContainer');
  loginForm = document.getElementById('loginForm');
  registerForm = document.getElementById('registerForm');
  loginFormElement = document.getElementById('loginFormElement');
  registerFormElement = document.getElementById('registerFormElement');
  logoutBtn = document.getElementById('logoutBtn');
  currentUserDisplay = document.getElementById('currentUser');
  newNoteBtn = document.getElementById('newNoteBtn');
  notesList = document.getElementById('notesList');
  emptyState = document.getElementById('emptyState');
  editor = document.getElementById('editor');
  noteTitle = document.getElementById('noteTitle');
  noteContent = document.getElementById('noteContent');
  charCount = document.getElementById('charCounter');
  saveBtn = document.getElementById('saveBtn');
  deleteBtn = document.getElementById('deleteBtn');
  cancelBtn = document.getElementById('cancelBtn');
  noteError = document.getElementById('noteError');
  loginError = document.getElementById('loginError');
  registerError = document.getElementById('registerError');
  darkModeToggle = document.getElementById('darkModeToggle');
  // Initializae accessibility elements
zoomIn = document.getElementById('zoomIn');
zoomOut = document.getElementById('zoomOut');
resetZoom = document.getElementById('resetZoom');
toggleMagnifier = document.getElementById('toggleMagnifier');
languageSelect = document.getElementById('languageSelect');
readTextBtn = document.getElementById('readTextBtn');
pauseReadBtn = document.getElementById('pauseReadBtn');
stopReadBtn = document.getElementById('stopReadBtn');
ttsSettingsBtn = document.getElementById('ttsSettings');
ttsModal = document.getElementById('ttsModal');
closeTtsModal = document.getElementById('closeTtsModal');
ttsRate = document.getElementById('ttsRate');
ttsPitch = document.getElementById('ttsPitch');
ttsVolume = document.getElementById('ttsVolume');
voiceSelect = document.getElementById('voiceSelect');
testTtsBtn = document.getElementById('testTtsBtn');
saveTtsBtn = document.getElementById('saveTtsBtn');
// Initialize accessibility after delay
setTimeout(initializeAccessibility, 500);

// Set up accessibility event listeners
setupAccessibilityListeners();


  // Set up event listeners
  loginFormElement.addEventListener('submit', handleLogin);
  registerFormElement.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  newNoteBtn.addEventListener('click', createNewNote);
  noteContent.addEventListener('input', updateCharacterCount);
  saveBtn.addEventListener('click', saveNote);
  deleteBtn.addEventListener('click', deleteNote);
  cancelBtn.addEventListener('click', cancelEdit);

  // Rich text editor toolbar handlers
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      const value = btn.dataset.value || null;
      
      if (command === 'createLink') {
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        document.execCommand(command, false, value);
      }
      
      noteContent.focus();
    });
  });

  // Check authentication
  const token = localStorage.getItem('token');
  
  if (token) {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    showAppContainer();
    loadNotes();
  } else {
    showAuthContainer();
  }
  
  // Initialize Vosk after a short delay to ensure library is loaded
  setTimeout(initializeVosk, 500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
  if (voskHandler) {
    await voskHandler.cleanup();
  }
});

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

async function handleLogin(e) {
  e.preventDefault();
  clearError(loginError);
  
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data));
      currentUser = data.data;
      showAppContainer();
      loadNotes();
    } else {
      showError(loginError, data.message || 'Login failed');
    }
  } catch (error) {
    showError(loginError, 'Network error. Please check that the backend server is running.');
    console.error('Login error:', error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearError(registerError);
  
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data));
      currentUser = data.data;
      showAppContainer();
      loadNotes();
    } else {
      showError(registerError, data.message || data.errors?.join(', ') || 'Registration failed');
    }
  } catch (error) {
    showError(registerError, 'Network error. Please check that the backend server is running.');
    console.error('Registration error:', error);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  currentUser = null;
  notes = [];
  currentNoteId = null;
  showAuthContainer();
}

// ==========================================
// UI NAVIGATION FUNCTIONS
// ==========================================

function showAuthContainer() {
  authContainer.style.display = 'flex';
  appContainer.style.display = 'none';
}

function showAppContainer() {
  authContainer.style.display = 'none';
  appContainer.style.display = 'flex';
  currentUserDisplay.textContent = currentUser.username;
}

// Make functions globally accessible for onclick handlers
window.createNewNote = createNewNote;

// ==========================================
// NOTES FUNCTIONS
// ==========================================

async function loadNotes() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      notes = data.data;
      renderNotesList();
      
      if (notes.length === 0) {
        showEmptyState();
      } else {
        hideEmptyState();
      }
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    showError(noteError, 'Failed to load notes');
  }
}

function renderNotesList() {
  notesList.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    if (note.id === currentNoteId) {
      noteItem.classList.add('active');
    }
    
    const noteItemTitle = document.createElement('div');
    noteItemTitle.className = 'note-item-title';
    noteItemTitle.textContent = note.title;
    
    const noteItemPreview = document.createElement('div');
    noteItemPreview.className = 'note-item-preview';
    noteItemPreview.textContent = note.content ? note.content.substring(0, 50) + '...' : 'No content';
    
    noteItem.appendChild(noteItemTitle);
    noteItem.appendChild(noteItemPreview);
    
    noteItem.addEventListener('click', () => selectNote(note.id));
    
    notesList.appendChild(noteItem);
  });
}

function selectNote(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;
  
  currentNoteId = noteId;
  noteTitle.value = note.title;
  noteContent.innerHTML = note.content || '';
  charCount.textContent = (noteContent.textContent || '').length;
  
  showEditor();
  renderNotesList();
  clearError(noteError);
  
  deleteBtn.classList.remove('hidden');
}

function createNewNote() {
  currentNoteId = null;
  noteTitle.value = '';
  noteContent.innerHTML = '';
  charCount.textContent = '0';
  
  showEditor();
  renderNotesList();
  clearError(noteError);
  
  deleteBtn.classList.add('hidden');
  noteTitle.focus();
}

async function saveNote() {
  const token = localStorage.getItem('token');
  const title = noteTitle.value.trim();
  const content = noteContent.innerHTML;
  
  if (!title) {
    showError(noteError, 'Please enter a title');
    return;
  }
  
  try {
    let response;
    
    if (currentNoteId) {
      // Update existing note
      response = await fetch(`${API_BASE_URL}/notes/${currentNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
    } else {
      // Create new note
      response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
    }
    
    const data = await response.json();
    
    if (data.success) {
      await loadNotes();
      currentNoteId = data.data.id;
      renderNotesList();
      clearError(noteError);
    } else {
      showError(noteError, data.message || 'Failed to save note');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    showError(noteError, 'Network error. Please try again.');
  }
}

async function deleteNote() {
  if (!currentNoteId) return;
  
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${currentNoteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentNoteId = null;
      await loadNotes();
      hideEditor();
      
      if (notes.length === 0) {
        showEmptyState();
      }
    } else {
      showError(noteError, data.message || 'Failed to delete note');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    showError(noteError, 'Network error. Please try again.');
  }
}

function cancelEdit() {
  currentNoteId = null;
  hideEditor();
  renderNotesList();
  clearError(noteError);
  
  if (notes.length === 0) {
    showEmptyState();
  }
}

// ==========================================
// UI STATE FUNCTIONS
// ==========================================

function showEditor() {
  editor.classList.remove('hidden');
  hideEmptyState();
}

function hideEditor() {
  editor.classList.add('hidden');
}

function showEmptyState() {
  emptyState.classList.remove('hidden');
  hideEditor();
}

function hideEmptyState() {
  emptyState.classList.add('hidden');
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearError(element) {
  element.textContent = '';
  element.classList.add('hidden');
}

function updateCharacterCount() {
  const text = noteContent.textContent || noteContent.innerText || '';
  charCount.textContent = text.length;
}

// ==========================================
// VOSK SPEECH RECOGNITION SETUP
// ==========================================

function initializeVosk() {
  // Check if VoskHandler is available
  if (typeof VoskHandler === 'undefined') {
    console.warn('VoskHandler not loaded. Vosk functionality will be unavailable.');
    return;
  }
  
  // Check browser support
  const support = VoskHandler.checkSupport();
  
  const statusIndicator = document.getElementById('vosk-status-indicator');
  const statusMessage = document.getElementById('vosk-status');
  const modelSelect = document.getElementById('vosk-model-select');
  const loadModelBtn = document.getElementById('load-model-btn');
  const micBtn = document.getElementById('vosk-mic-btn');
  const partialDisplay = document.getElementById('vosk-partial');
  
  // If elements don't exist, Vosk UI hasn't been added to HTML yet
  if (!statusIndicator || !statusMessage || !modelSelect || !loadModelBtn || !micBtn || !partialDisplay) {
    console.warn('Vosk UI elements not found. Please add Vosk HTML to your index.html');
    return;
  }
  
  if (!support.supported) {
    statusIndicator.classList.add('error');
    statusMessage.textContent = `Vosk not available: ${support.errors.join(', ')}`;
    statusMessage.classList.add('error');
    return;
  }
  
  // Initialize Vosk handler
  voskHandler = new VoskHandler({
    onResult: (text) => {
      // Append final result to current note
      appendTextToNote(text + ' ');
      partialDisplay.textContent = '';
    },
    
    onPartial: (text) => {
      // Show partial results
      partialDisplay.textContent = `Recognizing: "${text}"`;
    },
    
    onError: (error) => {
      console.error('Vosk error:', error);
      statusMessage.textContent = `Error: ${error.message}`;
      statusMessage.classList.add('error');
      statusIndicator.classList.add('error');
    },
    
    onStatusChange: (status) => {
      statusMessage.textContent = status.message;
      statusMessage.classList.remove('error', 'success');
      
      statusIndicator.classList.remove('loading', 'ready', 'recording', 'error');
      statusIndicator.classList.add(status.state);
      
      if (status.state === 'ready') {
        statusMessage.classList.add('success');
        micBtn.disabled = false;
      }
      
      if (status.state === 'error') {
        statusMessage.classList.add('error');
      }
    }
  });
  
  // Populate model dropdown
  const models = voskHandler.getAvailableModels();
  modelSelect.innerHTML = '<option value="">Select a language...</option>';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.url;
    option.textContent = `${model.name}`;
    option.dataset.size = model.size;
    modelSelect.appendChild(option);
  });
  
  modelSelect.disabled = false;
  loadModelBtn.disabled = false;
  
  // Model selection and loading
  loadModelBtn.addEventListener('click', async () => {
    const selectedUrl = modelSelect.value;
    if (!selectedUrl) {
      alert('Please select a model first');
      return;
    }
    
    loadModelBtn.disabled = true;
    modelSelect.disabled = true;
    
    const success = await voskHandler.loadModel(selectedUrl);
    
    if (!success) {
      loadModelBtn.disabled = false;
      modelSelect.disabled = false;
    }
  });
  
  // Microphone recording toggle
  micBtn.addEventListener('click', async () => {
    if (!voskHandler.isListening) {
      try {
        await voskHandler.startListening();
        
        const icon = micBtn.querySelector('.btn-icon');
        const text = micBtn.querySelector('.btn-text');
        
        if (icon) icon.textContent = '⏹️';
        if (text) text.textContent = 'Stop Recording';
        micBtn.classList.add('recording');
        
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    } else {
      await voskHandler.stopListening();
      
      const icon = micBtn.querySelector('.btn-icon');
      const text = micBtn.querySelector('.btn-text');
      
      if (icon) icon.textContent = '🎤';
      if (text) text.textContent = 'Start Recording';
      micBtn.classList.remove('recording');
    }
  });
}

// Helper function to append text to current note
function appendTextToNote(text) {
  if (noteContent) {
    const currentText = noteContent.textContent || '';
    noteContent.textContent = currentText + text;
    
    // Update character count
    updateCharacterCount();
  }
}
/**
 * Accessibility Handler
 * Manages text-to-speech, zoom, magnifier, and accessibility features
 */

class AccessibilityHandler {
  constructor(config = {}) {
    this.config = {
      defaultLanguage: 'en-US',
      defaultRate: 1.0,
      defaultPitch: 1.0,
      defaultVolume: 1.0,
      onError: config.onError || ((error) => console.error('Accessibility Error:', error)),
      onStatusChange: config.onStatusChange || ((status) => console.log('Status:', status)),
      ...config
    };
    
    // Text-to-Speech
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isReading = false;
    this.isPaused = false;
    
    // Zoom/Magnification
    this.currentZoomLevel = 100;
    this.minZoom = 50;
    this.maxZoom = 300;
    
    // Magnifier
    this.magnifierActive = false;
    this.magnifierElement = null;
    this.magnifierZoom = 2;
    
    // Language settings
    this.currentLanguage = this.config.defaultLanguage;
    this.availableVoices = [];
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize accessibility features
   */
  init() {
    // Load voices
    if (this.synth) {
      this.loadVoices();
      
      // Chrome loads voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
    
    // Load saved preferences
    this.loadPreferences();
    
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  /**
   * Load available voices
   */
  loadVoices() {
    this.availableVoices = this.synth.getVoices();
    console.log(`Loaded ${this.availableVoices.length} voices`);
  }
  
  /**
   * Get voices by language
   */
  getVoicesByLanguage(languageCode) {
    return this.availableVoices.filter(voice => 
      voice.lang.startsWith(languageCode)
    );
  }
  
  /**
   * Get all supported languages with available voices
   */
  getSupportedLanguages() {
    return [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
      { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
      { code: 'zh-CN', name: 'Mandarin (Simplified)', flag: '🇨🇳' },
      { code: 'zh-TW', name: 'Mandarin (Traditional)', flag: '🇹🇼' },
      { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
      { code: 'de-DE', name: 'German', flag: '🇩🇪' },
      { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' }
    ];
  }
  
  /**
   * Text-to-Speech: Read text aloud
   */
  readText(text, options = {}) {
    if (!this.synth) {
      this.config.onError(new Error('Speech synthesis not supported'));
      return false;
    }
    
    // Stop current reading
    this.stopReading();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language
    const voices = this.getVoicesByLanguage(options.language || this.currentLanguage);
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }
    
    // Set speech parameters
    utterance.rate = options.rate || this.config.defaultRate;
    utterance.pitch = options.pitch || this.config.defaultPitch;
    utterance.volume = options.volume || this.config.defaultVolume;
    utterance.lang = options.language || this.currentLanguage;
    
    // Event handlers
    utterance.onstart = () => {
      this.isReading = true;
      this.config.onStatusChange({ state: 'reading', message: 'Reading text...' });
    };
    
    utterance.onend = () => {
      this.isReading = false;
      this.isPaused = false;
      this.config.onStatusChange({ state: 'stopped', message: 'Reading complete' });
    };
    
    utterance.onerror = (event) => {
      this.isReading = false;
      this.config.onError(new Error(`Speech error: ${event.error}`));
    };
    
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    
    return true;
  }
  
  /**
   * Pause reading
   */
  pauseReading() {
    if (this.synth && this.isReading) {
      this.synth.pause();
      this.isPaused = true;
      this.config.onStatusChange({ state: 'paused', message: 'Reading paused' });
    }
  }
  
  /**
   * Resume reading
   */
  resumeReading() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.config.onStatusChange({ state: 'reading', message: 'Reading resumed' });
    }
  }
  
  /**
   * Stop reading
   */
  stopReading() {
    if (this.synth) {
      this.synth.cancel();
      this.isReading = false;
      this.isPaused = false;
      this.config.onStatusChange({ state: 'stopped', message: 'Reading stopped' });
    }
  }
  
  /**
   * Set language
   */
  setLanguage(languageCode) {
    this.currentLanguage = languageCode;
    localStorage.setItem('accessibility_language', languageCode);
    this.config.onStatusChange({ 
      state: 'language_changed', 
      message: `Language set to ${languageCode}` 
    });
  }
  
  /**
   * Zoom functions
   */
  setZoom(level) {
    if (level < this.minZoom || level > this.maxZoom) {
      return false;
    }
    
    this.currentZoomLevel = level;
    document.documentElement.style.fontSize = `${level}%`;
    localStorage.setItem('accessibility_zoom', level);
    
    this.config.onStatusChange({ 
      state: 'zoom_changed', 
      message: `Zoom set to ${level}%` 
    });
    
    return true;
  }
  
  increaseZoom(step = 10) {
    return this.setZoom(this.currentZoomLevel + step);
  }
  
  decreaseZoom(step = 10) {
    return this.setZoom(this.currentZoomLevel - step);
  }
  
  resetZoom() {
    return this.setZoom(100);
  }
  
  /**
   * Screen Magnifier
   */
  toggleMagnifier() {
    if (this.magnifierActive) {
      this.deactivateMagnifier();
    } else {
      this.activateMagnifier();
    }
  }
  
  activateMagnifier() {
    if (this.magnifierActive) return;
    
    // Create magnifier element
    this.magnifierElement = document.createElement('div');
    this.magnifierElement.id = 'screen-magnifier';
    this.magnifierElement.style.cssText = `
      position: fixed;
      width: 200px;
      height: 200px;
      border: 3px solid #3498db;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      display: none;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;
    
    const magnifierContent = document.createElement('div');
    magnifierContent.id = 'magnifier-content';
    magnifierContent.style.cssText = `
      position: absolute;
      transform-origin: top left;
    `;
    
    this.magnifierElement.appendChild(magnifierContent);
    document.body.appendChild(this.magnifierElement);
    
    // Mouse move handler
    this.magnifierMoveHandler = (e) => {
      const magnifier = this.magnifierElement;
      const content = magnifierContent;
      
      // Position magnifier
      magnifier.style.left = (e.pageX - 100) + 'px';
      magnifier.style.top = (e.pageY - 100) + 'px';
      magnifier.style.display = 'block';
      
      // Clone and magnify content
      const x = e.pageX;
      const y = e.pageY;
      
      content.style.transform = `scale(${this.magnifierZoom})`;
      content.style.left = (-x * this.magnifierZoom + 100) + 'px';
      content.style.top = (-y * this.magnifierZoom + 100) + 'px';
      content.style.width = (document.documentElement.scrollWidth) + 'px';
      content.style.height = (document.documentElement.scrollHeight) + 'px';
      
      // Copy page content
      if (!content.hasChildNodes()) {
        const clone = document.body.cloneNode(true);
        // Remove the magnifier itself from clone
        const magnifierClone = clone.querySelector('#screen-magnifier');
        if (magnifierClone) magnifierClone.remove();
        content.appendChild(clone);
      }
    };
    
    document.addEventListener('mousemove', this.magnifierMoveHandler);
    
    this.magnifierActive = true;
    this.config.onStatusChange({ 
      state: 'magnifier_active', 
      message: 'Screen magnifier activated' 
    });
  }
  
  deactivateMagnifier() {
    if (!this.magnifierActive) return;
    
    if (this.magnifierMoveHandler) {
      document.removeEventListener('mousemove', this.magnifierMoveHandler);
    }
    
    if (this.magnifierElement) {
      this.magnifierElement.remove();
      this.magnifierElement = null;
    }
    
    this.magnifierActive = false;
    this.config.onStatusChange({ 
      state: 'magnifier_inactive', 
      message: 'Screen magnifier deactivated' 
    });
  }
  
  /**
   * Keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Alt + R: Read selected text or current note
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'r') {
        e.preventDefault();
        this.readSelectedOrNote();
      }
      
      // Ctrl/Cmd + Alt + S: Stop reading
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 's') {
        e.preventDefault();
        this.stopReading();
      }
      
      // Ctrl/Cmd + Alt + P: Pause/Resume reading
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'p') {
        e.preventDefault();
        if (this.isPaused) {
          this.resumeReading();
        } else {
          this.pauseReading();
        }
      }
      
      // Ctrl/Cmd + Plus: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this.increaseZoom();
      }
      
      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        this.decreaseZoom();
      }
      
      // Ctrl/Cmd + 0: Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        this.resetZoom();
      }
      
      // Ctrl/Cmd + Alt + M: Toggle magnifier
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'm') {
        e.preventDefault();
        this.toggleMagnifier();
      }
    });
  }
  
  /**
   * Read selected text or current note content
   */
  readSelectedOrNote() {
    const selection = window.getSelection().toString();
    
    if (selection) {
      this.readText(selection);
    } else {
      // Read current note content
      const noteContent = document.getElementById('noteContent');
      if (noteContent) {
        const text = noteContent.textContent || noteContent.innerText;
        if (text.trim()) {
          this.readText(text);
        }
      }
    }
  }
  
  /**
   * Load saved preferences
   */
  loadPreferences() {
    const savedLanguage = localStorage.getItem('accessibility_language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
    
    const savedZoom = localStorage.getItem('accessibility_zoom');
    if (savedZoom) {
      this.setZoom(parseInt(savedZoom));
    }
  }
  
  /**
   * Check browser support
   */
  static checkSupport() {
    const errors = [];
    
    if (!window.speechSynthesis) {
      errors.push('Speech synthesis not supported');
    }
    
    return {
      supported: errors.length === 0,
      errors,
      features: {
        textToSpeech: !!window.speechSynthesis,
        zoom: true,
        magnifier: true
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityHandler;
}
function initializeAccessibility() {
  if (typeof AccessibilityHandler === 'undefined') {
    console.warn('AccessibilityHandler not loaded');
    return;
  }
  
  accessibilityHandler = new AccessibilityHandler({
    onError: (error) => {
      console.error('Accessibility error:', error);
    },
    onStatusChange: (status) => {
      console.log('Accessibility status:', status);
      
      // Update UI based on status
      if (status.state === 'reading') {
        readTextBtn.disabled = true;
        pauseReadBtn.disabled = false;
        stopReadBtn.disabled = false;
      } else if (status.state === 'paused') {
        pauseReadBtn.querySelector('.btn-icon').textContent = '▶️';
      } else if (status.state === 'stopped') {
        readTextBtn.disabled = false;
        pauseReadBtn.disabled = true;
        stopReadBtn.disabled = true;
        pauseReadBtn.querySelector('.btn-icon').textContent = '⏸️';
      }
    }
  });
  
  // Load saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.classList.add('active');
    darkModeToggle.querySelector('.btn-icon').textContent = '☀️';
  }
  
  // Populate voice select
  populateVoiceSelect();
}

function setupAccessibilityListeners() {
  // Dark Mode Toggle
  darkModeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.classList.toggle('active', isDark);
    darkModeToggle.querySelector('.btn-icon').textContent = isDark ? '☀️' : '🌙';
  });
  
  // Zoom Controls
  zoomIn?.addEventListener('click', () => accessibilityHandler?.increaseZoom());
  zoomOut?.addEventListener('click', () => accessibilityHandler?.decreaseZoom());
  resetZoom?.addEventListener('click', () => accessibilityHandler?.resetZoom());
  
  // Magnifier
  toggleMagnifier?.addEventListener('click', () => {
    accessibilityHandler?.toggleMagnifier();
    toggleMagnifier.classList.toggle('active');
  });
  
  // Language Selection
  languageSelect?.addEventListener('change', (e) => {
    accessibilityHandler?.setLanguage(e.target.value);
    populateVoiceSelect();
  });
  
  // TTS Controls
  readTextBtn?.addEventListener('click', () => {
    const selection = window.getSelection().toString();
    const text = selection || noteContent?.textContent || '';
    
    if (text.trim()) {
      accessibilityHandler?.readText(text, {
        language: languageSelect.value,
        rate: ttsSettings.rate,
        pitch: ttsSettings.pitch,
        volume: ttsSettings.volume
      });
    }
  });
  
  pauseReadBtn?.addEventListener('click', () => {
    if (accessibilityHandler?.isPaused) {
      accessibilityHandler.resumeReading();
    } else {
      accessibilityHandler?.pauseReading();
    }
  });
  
  stopReadBtn?.addEventListener('click', () => {
    accessibilityHandler?.stopReading();
  });
  
  // TTS Settings Modal
  ttsSettingsBtn?.addEventListener('click', () => {
    ttsModal?.classList.remove('hidden');
  });
  
  closeTtsModal?.addEventListener('click', () => {
    ttsModal?.classList.add('hidden');
  });
  
  // Click outside modal to close
  ttsModal?.addEventListener('click', (e) => {
    if (e.target === ttsModal) {
      ttsModal.classList.add('hidden');
    }
  });
  
  // TTS Setting Ranges
  ttsRate?.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('rateValue').textContent = value.toFixed(1);
    ttsSettings.rate = value;
  });
  
  ttsPitch?.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('pitchValue').textContent = value.toFixed(1);
    ttsSettings.pitch = value;
  });
  
  ttsVolume?.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('volumeValue').textContent = Math.round(value * 100);
    ttsSettings.volume = value;
  });
  
  // Test TTS
  testTtsBtn?.addEventListener('click', () => {
    const testText = "This is a test of the text to speech feature.";
    accessibilityHandler?.readText(testText, {
      language: languageSelect.value,
      rate: ttsSettings.rate,
      pitch: ttsSettings.pitch,
      volume: ttsSettings.volume
    });
  });
  
  // Save TTS Settings
  saveTtsBtn?.addEventListener('click', () => {
    localStorage.setItem('ttsSettings', JSON.stringify(ttsSettings));
    ttsModal?.classList.add('hidden');
  });
  
  // Load saved TTS settings
  const savedSettings = localStorage.getItem('ttsSettings');
  if (savedSettings) {
    ttsSettings = JSON.parse(savedSettings);
    if (ttsRate) ttsRate.value = ttsSettings.rate;
    if (ttsPitch) ttsPitch.value = ttsSettings.pitch;
    if (ttsVolume) ttsVolume.value = ttsSettings.volume;
    
    const rateValue = document.getElementById('rateValue');
    const pitchValue = document.getElementById('pitchValue');
    const volumeValue = document.getElementById('volumeValue');
    
    if (rateValue) rateValue.textContent = ttsSettings.rate.toFixed(1);
    if (pitchValue) pitchValue.textContent = ttsSettings.pitch.toFixed(1);
    if (volumeValue) volumeValue.textContent = Math.round(ttsSettings.volume * 100);
  }
}

function populateVoiceSelect() {
  if (!accessibilityHandler || !voiceSelect) return;
  
  const voices = accessibilityHandler.getVoicesByLanguage(
    languageSelect.value.split('-')[0]
  );
  
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

