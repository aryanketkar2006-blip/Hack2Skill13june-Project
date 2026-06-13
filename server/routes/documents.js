import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { insertDocument, getDocument, getAllDocuments, deleteDocument, updateDocument, setCache } from '../db/database.js';
import { parseFile } from '../services/fileParser.js';
import { extractFromURL } from '../services/urlExtractor.js';
import { fetchRepoInfo } from '../services/githubService.js';
import { generateOverview, classifyContent, analyzeImage } from '../services/geminiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const docId = uuidv4();
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    
    // Parse file
    const { text, isImage, base64, mimeType: imgMime } = await parseFile(filePath, mimeType);
    
    let extractedText = text;
    let overviewData = null;
    let contentType = 'general_document';

    if (isImage) {
      // For images, analyze with Gemini vision
      const imageAnalysis = await analyzeImage(base64, imgMime);
      extractedText = `[Image: ${imageAnalysis.classification?.description || 'Uploaded image'}]\n\n${imageAnalysis.analysis}`;
      contentType = 'image';
      
      // Store image base64 in cache for later use
      setCache(docId, 'image_base64', { base64, mimeType: imgMime });
      setCache(docId, 'visual_insight', imageAnalysis);
    }

    if (extractedText && extractedText.length > 50) {
      // Classify content type
      try {
        const classification = await classifyContent(extractedText);
        contentType = classification.content_type || contentType;
      } catch (e) {
        console.error('Classification failed:', e.message);
      }

      // Generate overview
      try {
        overviewData = await generateOverview(extractedText);
      } catch (e) {
        console.error('Overview generation failed:', e.message);
      }
    }

    // Determine file type category
    let fileType = 'document';
    if (mimeType?.startsWith('image/')) fileType = 'image';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType?.includes('word')) fileType = 'docx';
    else if (mimeType?.includes('presentation')) fileType = 'pptx';
    else if (mimeType?.includes('text/')) fileType = 'text';

    const doc = {
      id: docId,
      session_id: req.body.session_id || 'default',
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_type: fileType,
      mime_type: mimeType,
      file_size: req.file.size,
      extracted_text: extractedText,
      content_type: contentType,
      overview_json: overviewData ? JSON.stringify(overviewData) : null
    };

    insertDocument(doc);

    res.json({
      id: docId,
      original_name: doc.original_name,
      file_type: doc.file_type,
      file_size: doc.file_size,
      content_type: contentType,
      overview: overviewData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ingest from URL
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const { text, title } = await extractFromURL(url);
    const docId = uuidv4();

    let contentType = 'general_document';
    let overviewData = null;

    if (text.length > 50) {
      try {
        const classification = await classifyContent(text);
        contentType = classification.content_type || contentType;
      } catch (e) { console.error('Classification failed:', e.message); }

      try {
        overviewData = await generateOverview(text);
      } catch (e) { console.error('Overview generation failed:', e.message); }
    }

    const doc = {
      id: docId,
      session_id: req.body.session_id || 'default',
      filename: url,
      original_name: title || url,
      file_type: 'url',
      mime_type: 'text/html',
      file_size: Buffer.byteLength(text, 'utf-8'),
      extracted_text: text,
      content_type: contentType,
      overview_json: overviewData ? JSON.stringify(overviewData) : null
    };

    insertDocument(doc);

    res.json({
      id: docId,
      original_name: doc.original_name,
      file_type: 'url',
      file_size: doc.file_size,
      content_type: contentType,
      overview: overviewData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('URL ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ingest from GitHub
router.post('/github', async (req, res) => {
  try {
    const { repo_path } = req.body;
    if (!repo_path) return res.status(400).json({ error: 'Repository path required (owner/repo)' });

    const { text, title, metadata } = await fetchRepoInfo(repo_path);
    const docId = uuidv4();

    let overviewData = null;
    try {
      overviewData = await generateOverview(text);
    } catch (e) { console.error('Overview generation failed:', e.message); }

    const doc = {
      id: docId,
      session_id: req.body.session_id || 'default',
      filename: repo_path,
      original_name: title,
      file_type: 'github',
      mime_type: 'text/plain',
      file_size: Buffer.byteLength(text, 'utf-8'),
      extracted_text: text,
      content_type: 'code_repository',
      overview_json: overviewData ? JSON.stringify(overviewData) : null
    };

    insertDocument(doc);

    res.json({
      id: docId,
      original_name: doc.original_name,
      file_type: 'github',
      file_size: doc.file_size,
      content_type: 'code_repository',
      overview: overviewData,
      metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('GitHub ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all documents
router.get('/', (req, res) => {
  try {
    const docs = getAllDocuments();
    res.json(docs.map(d => ({
      ...d,
      overview_json: d.overview_json ? JSON.parse(d.overview_json) : null
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
router.get('/:id', (req, res) => {
  try {
    const doc = getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({
      ...doc,
      overview_json: doc.overview_json ? JSON.parse(doc.overview_json) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', (req, res) => {
  try {
    deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
