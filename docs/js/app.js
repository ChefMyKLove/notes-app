// ==========================================
// CONFIGURATION
// ==========================================

// Auto-detect environment (production vs local)
// For local: uses http://localhost:5000/api
// For production on Vercel: uses /api (relative to same domain)
// For other production: uses the BACKEND_URL environment variable if available
const API_BASE_URL = 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'    // Local development
    : '/api';  // Production (Vercel or same domain)

console.log('API Base URL:', API_BASE_URL);
console.log('Hostname:', window.location.hostname);
console.log('Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');

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

// ==========================================
// STATE MANAGEMENT
// ==========================================

let currentUser = null;
let currentNoteId = null;
let notes = [];
let voskHandler = null;
let accessibilityHandler = null;

// TTS Settings
let ttsSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  selectedVoice: null
};

// ==========================================
// DOM ELEMENTS - MUST BE DECLARED AFTER DOM LOADS
// ==========================================

let authContainer, appContainer, loginForm, registerForm;
let loginFormElement, registerFormElement, logoutBtn, currentUserDisplay;
let newNoteBtn, notesList, emptyState, editor;
let noteTitle, noteContent, charCount;
let saveBtn, deleteBtn, cancelBtn;
let noteError, loginError, registerError;

// Accessibility elements
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
  
  // Initialize accessibility elements
  darkModeToggle = document.getElementById('darkModeToggle');
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
  
  // Initialize accessibility after delay
  setTimeout(initializeAccessibility, 600);
  
  // Set up accessibility event listeners
  setupAccessibilityListeners();
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

// ==========================================
// ACCESSIBILITY INITIALIZATION
// ==========================================

function initializeAccessibility() {
  if (typeof AccessibilityHandler === 'undefined') {
    console.warn('AccessibilityHandler not loaded');
    return;
  }
  
  accessibilityHandler = new AccessibilityHandler({
  onStatusChange: (status) => {
    console.log('Accessibility status:', status);
    
    // Update UI based on status
    if (status.state === 'reading') {
      if (readTextBtn) readTextBtn.disabled = true;
      if (pauseReadBtn) pauseReadBtn.disabled = false;
      if (stopReadBtn) stopReadBtn.disabled = false;
    } else if (status.state === 'paused') {
      const icon = pauseReadBtn?.querySelector('.btn-icon');
      if (icon) icon.textContent = '▶️';
    } else if (status.state === 'stopped') {
      if (readTextBtn) readTextBtn.disabled = false;
      if (pauseReadBtn) pauseReadBtn.disabled = true;
      if (stopReadBtn) stopReadBtn.disabled = true;
      const icon = pauseReadBtn?.querySelector('.btn-icon');
      if (icon) icon.textContent = '⏸️';
    }
  }
});
  // Load saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.classList.add('active');
      const icon = darkModeToggle.querySelector('.btn-icon');
      if (icon) icon.textContent = '☀️';
    }
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
    const icon = darkModeToggle.querySelector('.btn-icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  });
  
  // Zoom Controls
zoomIn?.addEventListener('click', () => accessibilityHandler?.zoomIn());
zoomOut?.addEventListener('click', () => accessibilityHandler?.zoomOut());
resetZoom?.addEventListener('click', () => accessibilityHandler?.resetZoom());
  
  // Magnifier
  toggleMagnifier?.addEventListener('click', () => {
    accessibilityHandler?.toggleMagnifier();
    toggleMagnifier.classList.toggle('active');
  });

  // Dyslexia Font Toggle
  document.getElementById('dyslexia-font-btn')?.addEventListener('click', () => {
    accessibilityHandler?.toggleDyslexiaFont();
  });

  // Word Spacing Controls
  document.getElementById('spacing-decrease-btn')?.addEventListener('click', () => {
    accessibilityHandler?.adjustWordSpacing(-1);
  });
  
  document.getElementById('spacing-increase-btn')?.addEventListener('click', () => {
    accessibilityHandler?.adjustWordSpacing(1);
  });

  // Reading Guide Toggle
  document.getElementById('reading-guide-btn')?.addEventListener('click', () => {
    accessibilityHandler?.toggleReadingGuide();
  });

  // Distraction-Free Mode Toggle
  document.getElementById('distraction-free-btn')?.addEventListener('click', () => {
    accessibilityHandler?.toggleDistractionFree();
  });
  
  // Language Selection
 languageSelect?.addEventListener('change', (e) => {
  populateVoiceSelect();
});

  
  // TTS Controls
 readTextBtn?.addEventListener('click', () => {
  const selection = window.getSelection().toString();
  const text = selection || noteContent?.textContent || '';
  if (text.trim()) {
    accessibilityHandler?.speak(text, languageSelect?.value);
  }
});
  

  
stopReadBtn?.addEventListener('click', () => {
  accessibilityHandler?.stopSpeaking();
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
    const rateValue = document.getElementById('rateValue');
    if (rateValue) rateValue.textContent = value.toFixed(1);
    ttsSettings.rate = value;
  });
  
  ttsPitch?.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    const pitchValue = document.getElementById('pitchValue');
    if (pitchValue) pitchValue.textContent = value.toFixed(1);
    ttsSettings.pitch = value;
  });
  
  ttsVolume?.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) volumeValue.textContent = Math.round(value * 100);
    ttsSettings.volume = value;
  });
  
  // Test TTS
  testTtsBtn?.addEventListener('click', () => {
    const testText = "This is a test of the text to speech feature.";
    accessibilityHandler?.readText(testText, {
      language: languageSelect?.value,
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
  // AccessibilityHandler.loadVoices() already populates #tts-voice-select
  // Handler manages voice loading internally - no custom logic needed
  if (accessibilityHandler && accessibilityHandler.loadVoices) {
    accessibilityHandler.loadVoices();
  }
}
