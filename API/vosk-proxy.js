const https = require('https');

// Map of available models
const VOSK_MODELS = {
  'en': 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
  'pt': 'https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip',
  'fr': 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip',
  'es': 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip',
  'zh': 'https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip'
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get language parameter
  const lang = req.query.lang || 'en';
  const modelUrl = VOSK_MODELS[lang];
  
  if (!modelUrl) {
    res.status(400).json({ 
      error: 'Invalid language', 
      supported: Object.keys(VOSK_MODELS) 
    });
    return;
  }
  
  console.log(`Proxying Vosk model: ${lang} from ${modelUrl}`);
  
  try {
    // Fetch and stream the model
    https.get(modelUrl, (proxyRes) => {
      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', proxyRes.headers['content-length']);
      res.setHeader('Content-Disposition', `attachment; filename="vosk-model-${lang}.zip"`);
      
      // Stream the model file
      proxyRes.pipe(res);
      
    }).on('error', (error) => {
      console.error('Proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch model', 
        details: error.message 
      });
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};