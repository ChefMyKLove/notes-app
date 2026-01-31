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
