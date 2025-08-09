require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let mongoUri = process.env.MONGODB_URI;
if (mongoUri && !/\bssl=true\b/i.test(mongoUri)) {
  // Ensure TLS is enabled for Atlas on hosts where TLS is required
  mongoUri += mongoUri.includes('?') ? '&ssl=true' : '?ssl=true';
}
const dbName = process.env.MONGODB_DB_NAME || 'nclex';
const collectionName = process.env.MONGODB_COLLECTION || 'questions';

if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

let client;
let collection;
let isConnecting = false;

async function init() {
  const clientOptions = {
    serverApi: { version: ServerApiVersion.v1 },
  };
  // Force TLS when connecting to standard mongodb.net hosts if needed
  if (/mongodb\.net/i.test(mongoUri) && !/mongodb\+srv/i.test(mongoUri)) {
    clientOptions.tls = true;
  }
  client = new MongoClient(mongoUri, clientOptions);
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);
  console.log('Connected to MongoDB');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Returns a random question document
app.get('/questions/random', async (req, res) => {
  try {
    // support excluding recently seen ids
    const excludeParam = String(req.query.exclude || '').trim();
    const excludeIds = excludeParam
      ? excludeParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const excludeObjectIds = excludeIds
      .map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
      .filter(Boolean);

    const pipeline = [];
    if (excludeObjectIds.length > 0) {
      pipeline.push({ $match: { _id: { $nin: excludeObjectIds } } });
    }
    pipeline.push({ $sample: { size: 1 } });

    const docs = await collection.aggregate(pipeline).toArray();
    if (!docs || docs.length === 0) {
      // exhausted for this session
      return res.status(204).end();
    }
    const [doc] = docs;
    if (!doc) return res.status(404).json({ error: 'No questions found' });

    // normalize to app shape (A/B/C/D keys)
    const normalized = {
      id: String(doc._id),
      question: doc.question,
      options: doc.options, // expecting { A, B, C, D }
      correctAnswer: doc.correctAnswer,
      explanation: doc.explanation,
      category: doc.category,
      subcategory: doc.subcategory,
      difficulty: doc.difficulty,
      nclexCategory: doc.nclexCategory,
    };
    return res.json(normalized);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch question' });
  }
});

const port = process.env.PORT || 4000;
// Start server immediately; connect to DB in the background with retry
app.listen(port, () => console.log(`API listening on port ${port}`));

async function ensureConnectedWithRetry() {
  if (collection || isConnecting) return;
  isConnecting = true;
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      await init();
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`Mongo connect attempt ${attempt} failed`, err.message || err);
      // Backoff up to 60s
      const delayMs = Math.min(60000, 2000 * attempt);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

ensureConnectedWithRetry().catch(() => {});


