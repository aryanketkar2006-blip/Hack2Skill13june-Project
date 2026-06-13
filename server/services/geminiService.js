import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FLASH_MODEL = process.env.GEMINI_MODEL_FLASH || 'gemini-1.5-flash';
const PRO_MODEL = process.env.GEMINI_MODEL_PRO || 'gemini-1.5-pro';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const isRetryable = error.message?.includes('429') || 
                           error.message?.includes('503') || 
                           error.message?.includes('RESOURCE_EXHAUSTED');
      if (!isRetryable) throw error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.log(`Retry ${i + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch { /* fall through */ }
    }
    // Try to find JSON object or array
    const objMatch = text.match(/(\{[\s\S]*\})/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[1]);
      } catch { /* fall through */ }
    }
    const arrMatch = text.match(/(\[[\s\S]*\])/);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[1]);
      } catch { /* fall through */ }
    }
    return null;
  }
}

export async function generateJSON(prompt, useProModel = false) {
  return retryWithBackoff(async () => {
    const modelName = useProModel ? PRO_MODEL : FLASH_MODEL;
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = tryParseJSON(text);
    if (!parsed) {
      throw new Error('Failed to parse JSON response from Gemini');
    }
    return parsed;
  });
}

export async function generateText(prompt, useProModel = false) {
  return retryWithBackoff(async () => {
    const modelName = useProModel ? PRO_MODEL : FLASH_MODEL;
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.7 }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export async function generateFromImage(base64Data, mimeType, prompt) {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: FLASH_MODEL });
    const imagePart = {
      inlineData: { data: base64Data, mimeType }
    };
    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();
  });
}

export async function generateJSONFromImage(base64Data, mimeType, prompt) {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: FLASH_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });
    const imagePart = {
      inlineData: { data: base64Data, mimeType }
    };
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const parsed = tryParseJSON(text);
    if (!parsed) throw new Error('Failed to parse JSON from image response');
    return parsed;
  });
}

export async function chatWithContext(documentText, chatHistory, userMessage) {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: FLASH_MODEL,
      systemInstruction: `You are an AI tutor helping the user understand the following document. Answer questions based on the document content. Be helpful, accurate, and educational.

DOCUMENT CONTENT:
${documentText.substring(0, 30000)}`,
    });

    const history = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  });
}

export async function classifyContent(text) {
  const prompt = `Classify this document into one of these categories: "research_paper", "code_repository", "medical_report", "business_report", "legal_document", "educational_material", "general_document".

Return ONLY a JSON object: {"content_type": "..."}

Document (first 3000 chars):
${text.substring(0, 3000)}`;

  return generateJSON(prompt, false);
}

export async function generateOverview(text) {
  const prompt = `Analyze this document and return a JSON object with the following structure:
{
  "title": "Document title or inferred title",
  "purpose": "A 1-2 sentence description of what this document is about",
  "key_concepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "difficulty_level": "Beginner" or "Intermediate" or "Advanced",
  "estimated_reading_time_minutes": number,
  "key_entities_count": number,
  "sentiment": "Positive" or "Neutral" or "Negative" or "Mixed",
  "concept_details": [
    {
      "name": "Concept Name",
      "description": "Brief description of this concept",
      "priority": "High Priority" or "Technical" or "Key Insight" or "Important"
    }
  ]
}

Document content:
${text.substring(0, 25000)}`;

  return generateJSON(prompt, true);
}

export async function generateExplanation(text, level) {
  const instructions = {
    beginner: "Explain this content using simple everyday language, avoid jargon, use analogies a 10-year-old could understand. Use emoji and friendly tone. Break down complex ideas into simple concepts.",
    student: "Explain this content as a teacher would to a university student — define key terms, provide context, moderate technical depth. Use clear structure with headings.",
    professional: "Explain this content concisely for a business professional — focus on implications, outcomes, and decisions. Use bullet points for key takeaways.",
    developer: "Explain this content with full technical precision, using correct domain terminology and implementation details. Include code examples where relevant."
  };

  const prompt = `${instructions[level]}

Document content:
${text.substring(0, 25000)}

Provide a comprehensive explanation following the instruction above. Use markdown formatting.`;

  return generateText(prompt, level === 'developer');
}

export async function generateMindMap(text) {
  const prompt = `Analyze this document and create a hierarchical mind map structure. Return a JSON object:
{
  "topic": "Main Topic",
  "children": [
    {
      "label": "Sub Topic 1",
      "children": [
        { "label": "Detail 1a", "children": [] },
        { "label": "Detail 1b", "children": [] }
      ]
    },
    {
      "label": "Sub Topic 2",
      "children": [
        { "label": "Detail 2a", "children": [] }
      ]
    }
  ]
}

Create 4-6 main branches with 2-4 children each. Keep labels concise (3-6 words).

Document content:
${text.substring(0, 20000)}`;

  return generateJSON(prompt, true);
}

export async function generateSummary(text, level) {
  const instructions = {
    '30s': 'Summarize in under 80 words. Be extremely concise. Highlight only the most critical point.',
    '3m': 'Summarize in approximately 250 words. Cover the main points and key conclusions.',
    '10m': 'Summarize in approximately 800 words. Cover all major sections, key findings, methodology, and conclusions in detail.'
  };

  const prompt = `${instructions[level]}

Document content:
${text.substring(0, 25000)}

Provide the summary in markdown format. Bold important terms.`;

  return generateText(prompt, false);
}

export async function generateQuiz(text) {
  const prompt = `Based on this document, generate educational assessment content. Return a JSON object:
{
  "mcqs": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct..."
    }
  ],
  "flashcards": [
    {
      "front": "Term or concept",
      "back": "Definition or explanation"
    }
  ],
  "interview_questions": ["Question 1?", "Question 2?"]
}

Generate exactly 5 MCQs, 5 flashcards, and 3 interview questions.

Document content:
${text.substring(0, 25000)}`;

  return generateJSON(prompt, true);
}

export async function generateActionableOutputs(text, contentType) {
  const prompts = {
    research_paper: `Analyze this research paper and return JSON:
{
  "key_findings": ["finding1", "finding2", "finding3"],
  "methodology": "Brief methodology description",
  "limitations": ["limitation1", "limitation2"],
  "future_work": ["suggestion1", "suggestion2"],
  "citation_suggestion": "Suggested citation format"
}`,
    code_repository: `Analyze this code/repository and return JSON:
{
  "architecture_summary": "Brief architecture overview",
  "technologies": ["tech1", "tech2"],
  "setup_guide": ["step1", "step2", "step3"],
  "key_files": ["file1", "file2"],
  "contributor_roadmap": ["task1", "task2"]
}`,
    medical_report: `Analyze this medical report and return JSON:
{
  "simplified_explanation": "Plain language explanation",
  "abnormal_values": [
    {"test_name": "Test", "value": "Value", "normal_range": "Range", "explanation": "What this means"}
  ],
  "recommendations": ["rec1", "rec2"]
}`,
    business_report: `Analyze this business report and return JSON:
{
  "executive_summary": "Brief executive summary",
  "kpis": [{"metric": "KPI name", "value": "Value", "trend": "up/down/stable"}],
  "risks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"],
  "action_items": ["action1", "action2"]
}`,
    legal_document: `Analyze this legal document and return JSON:
{
  "document_type": "Type of legal document",
  "key_parties": ["party1", "party2"],
  "key_terms": [{"term": "Term", "description": "Description"}],
  "obligations": ["obligation1", "obligation2"],
  "important_dates": ["date1", "date2"],
  "risks": ["risk1", "risk2"]
}`,
    educational_material: `Analyze this educational material and return JSON:
{
  "learning_objectives": ["obj1", "obj2"],
  "prerequisites": ["prereq1", "prereq2"],
  "key_topics": [{"topic": "Topic", "importance": "High/Medium/Low"}],
  "study_tips": ["tip1", "tip2"],
  "further_reading": ["resource1", "resource2"]
}`,
    general_document: `Analyze this document and return JSON:
{
  "main_purpose": "Document purpose",
  "key_points": ["point1", "point2", "point3"],
  "target_audience": "Who this is for",
  "action_items": ["action1", "action2"],
  "related_topics": ["topic1", "topic2"]
}`
  };

  const prompt = `${prompts[contentType] || prompts.general_document}

Document content:
${text.substring(0, 25000)}`;

  return generateJSON(prompt, true);
}

export async function compareDocuments(text1, text2, question = null) {
  const prompt = question 
    ? `Compare these two documents and answer this specific question: "${question}"

DOCUMENT A:
${text1.substring(0, 12000)}

DOCUMENT B:
${text2.substring(0, 12000)}

Provide a detailed comparison in markdown format.`
    : `Compare these two documents. Identify:
1. Key similarities
2. Key differences  
3. Contradictions (if any)
4. Which document is more comprehensive

DOCUMENT A:
${text1.substring(0, 12000)}

DOCUMENT B:
${text2.substring(0, 12000)}

Provide a detailed comparison in markdown format with clear sections.`;

  return generateText(prompt, true);
}

export async function analyzeImage(base64Data, mimeType) {
  const classifyPrompt = "Classify this image. Is it a: chart, graph, diagram, table, photo, screenshot, or other? Return JSON: {\"type\": \"...\", \"description\": \"brief description\"}";
  
  const classification = await generateJSONFromImage(base64Data, mimeType, classifyPrompt);
  
  const analysisPrompt = `Analyze this ${classification.type || 'image'} in detail. Describe:
1. What it shows
2. Key data points or elements
3. Trends or patterns visible
4. Key takeaways

Be specific with numbers, labels, and values visible in the image. Format in markdown.`;

  const analysis = await generateFromImage(base64Data, mimeType, analysisPrompt);
  
  return { classification, analysis };
}
