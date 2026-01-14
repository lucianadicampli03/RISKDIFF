import express from 'express';
import multer from 'multer';
import { parseDocument } from '../services/parser.js';
import { compareDocuments } from '../services/diffEngine.js';
import { generateExplanations } from '../services/explanationEngine.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
});

router.post('/', upload.fields([
  { name: 'original', maxCount: 1 },
  { name: 'amended', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.original || !files.amended) {
      return res.status(400).json({ 
        error: 'Both original and amended documents are required' 
      });
    }

    const originalFile = files.original[0];
    const amendedFile = files.amended[0];

    // Parse both documents
    console.log('📄 Parsing documents...');
    const originalDoc = await parseDocument(originalFile.path, originalFile.mimetype);
    const amendedDoc = await parseDocument(amendedFile.path, amendedFile.mimetype);

    // Compare documents
    console.log('🔍 Comparing documents...');
    const comparison = await compareDocuments(originalDoc, amendedDoc);

    // Generate explanations
    console.log('💡 Generating explanations...');
    const results = await generateExplanations(comparison);

    res.json(results);
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ 
      error: 'Failed to process documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as compareRouter };
