import { Router } from 'express';
import { getDocument, getChatHistory, addChatMessage, clearChatHistory } from '../db/database.js';
import { chatWithContext } from '../services/geminiService.js';

const router = Router();

// Send chat message
router.post('/:docId', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Get chat history
    const history = getChatHistory(doc.id);
    
    // Save user message
    addChatMessage(doc.id, 'user', message);

    // Generate response
    const response = await chatWithContext(doc.extracted_text, history, message);
    
    // Save assistant response
    addChatMessage(doc.id, 'assistant', response);

    res.json({ 
      role: 'assistant',
      content: response 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
router.get('/:docId', (req, res) => {
  try {
    const history = getChatHistory(req.params.docId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history
router.delete('/:docId', (req, res) => {
  try {
    clearChatHistory(req.params.docId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
