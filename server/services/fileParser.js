import fs from 'fs';
import path from 'path';

export async function parsePDF(buffer) {
  // Dynamic import for pdf-parse (CommonJS module)
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDOCX(buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parsePPTX(filePath) {
  const officeParser = await import('officeparser');
  const text = await officeParser.parseOfficeAsync(filePath);
  return text;
}

export async function parseTXT(buffer) {
  return buffer.toString('utf-8');
}

export function getBase64FromBuffer(buffer) {
  return buffer.toString('base64');
}

export async function parseFile(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);
  
  if (mimeType === 'application/pdf') {
    return { text: await parsePDF(buffer), isImage: false };
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return { text: await parseDOCX(buffer), isImage: false };
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return { text: await parsePPTX(filePath), isImage: false };
  }
  
  if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'text/markdown') {
    return { text: await parseTXT(buffer), isImage: false };
  }
  
  if (mimeType?.startsWith('image/')) {
    const base64 = getBase64FromBuffer(buffer);
    return { text: '', isImage: true, base64, mimeType };
  }
  
  // Fallback: try as text
  try {
    return { text: buffer.toString('utf-8'), isImage: false };
  } catch {
    return { text: '', isImage: false };
  }
}
