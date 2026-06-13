import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'store.json');

function loadStore() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch { /* fresh start */ }
  return { documents: {}, cache: {}, chatHistory: {} };
}

function saveStore(store) {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

let store = loadStore();

export function insertDocument(doc) {
  store.documents[doc.id] = { ...doc, created_at: new Date().toISOString() };
  saveStore(store);
}

export function getDocument(id) {
  return store.documents[id] || null;
}

export function getAllDocuments() {
  return Object.values(store.documents)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(({ extracted_text, ...rest }) => rest);
}

export function deleteDocument(id) {
  delete store.documents[id];
  delete store.cache[id];
  delete store.chatHistory[id];
  saveStore(store);
}

export function updateDocument(id, fields) {
  if (store.documents[id]) {
    Object.assign(store.documents[id], fields);
    saveStore(store);
  }
}

export function getCached(docId, cacheKey) {
  return store.cache[docId]?.[cacheKey] || null;
}

export function setCache(docId, cacheKey, data) {
  if (!store.cache[docId]) store.cache[docId] = {};
  store.cache[docId][cacheKey] = data;
  saveStore(store);
}

export function getChatHistory(docId) {
  return store.chatHistory[docId] || [];
}

export function addChatMessage(docId, role, content) {
  if (!store.chatHistory[docId]) store.chatHistory[docId] = [];
  store.chatHistory[docId].push({ role, content, created_at: new Date().toISOString() });
  saveStore(store);
}

export function clearChatHistory(docId) {
  store.chatHistory[docId] = [];
  saveStore(store);
}
