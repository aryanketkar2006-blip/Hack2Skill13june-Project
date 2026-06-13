import { Router } from 'express';
import { getDocument, getCached, setCache } from '../db/database.js';
import { 
  generateOverview, generateExplanation, generateMindMap, 
  generateSummary, generateQuiz, generateActionableOutputs,
  compareDocuments, analyzeImage
} from '../services/geminiService.js';

const router = Router();

// Generate overview
router.post('/overview/:docId', async (req, res) => {
  try {
    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cached = getCached(doc.id, 'overview');
    if (cached) return res.json(cached);

    const overview = await generateOverview(doc.extracted_text);
    setCache(doc.id, 'overview', overview);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate explanation at specific level
router.post('/explain/:docId', async (req, res) => {
  try {
    const { level } = req.body; // beginner, student, professional, developer
    if (!['beginner', 'student', 'professional', 'developer'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cacheKey = `explain_${level}`;
    const cached = getCached(doc.id, cacheKey);
    if (cached) return res.json(cached);

    const explanation = await generateExplanation(doc.extracted_text, level);
    const result = { level, content: explanation };
    setCache(doc.id, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate mind map
router.post('/mindmap/:docId', async (req, res) => {
  try {
    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cached = getCached(doc.id, 'mindmap');
    if (cached) return res.json(cached);

    const mindmap = await generateMindMap(doc.extracted_text);
    setCache(doc.id, 'mindmap', mindmap);
    res.json(mindmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate summary at specific length
router.post('/summary/:docId', async (req, res) => {
  try {
    const { level } = req.body; // '30s', '3m', '10m'
    if (!['30s', '3m', '10m'].includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cacheKey = `summary_${level}`;
    const cached = getCached(doc.id, cacheKey);
    if (cached) return res.json(cached);

    const summary = await generateSummary(doc.extracted_text, level);
    const result = { level, content: summary };
    setCache(doc.id, cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate quiz
router.post('/quiz/:docId', async (req, res) => {
  try {
    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cached = getCached(doc.id, 'quiz');
    if (cached) return res.json(cached);

    const quiz = await generateQuiz(doc.extracted_text);
    setCache(doc.id, 'quiz', quiz);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate actionable outputs
router.post('/actionable/:docId', async (req, res) => {
  try {
    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cached = getCached(doc.id, 'actionable');
    if (cached) return res.json(cached);

    const contentType = doc.content_type || 'general_document';
    const outputs = await generateActionableOutputs(doc.extracted_text, contentType);
    const result = { content_type: contentType, outputs };
    setCache(doc.id, 'actionable', result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Visual insight for images
router.post('/visual/:docId', async (req, res) => {
  try {
    const doc = getDocument(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const cached = getCached(doc.id, 'visual_insight');
    if (cached) return res.json(cached);

    // Check if we have stored image data
    const imageData = getCached(doc.id, 'image_base64');
    if (!imageData) {
      return res.status(400).json({ error: 'No image data available for this document' });
    }

    const result = await analyzeImage(imageData.base64, imageData.mimeType);
    setCache(doc.id, 'visual_insight', result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare two documents
router.post('/compare', async (req, res) => {
  try {
    const { doc_id_1, doc_id_2, question } = req.body;
    
    const doc1 = getDocument(doc_id_1);
    const doc2 = getDocument(doc_id_2);
    
    if (!doc1 || !doc2) {
      return res.status(404).json({ error: 'One or both documents not found' });
    }

    const comparison = await compareDocuments(doc1.extracted_text, doc2.extracted_text, question);
    res.json({ 
      comparison,
      doc1: { id: doc1.id, name: doc1.original_name },
      doc2: { id: doc2.id, name: doc2.original_name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
