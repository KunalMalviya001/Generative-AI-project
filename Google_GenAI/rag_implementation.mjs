import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// ======================================================================================================
// ======================================================================================================
// Gemini 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
});

const llm = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});

// ======================================================================================================
// ======================================================================================================
// Qdrant 
const client = new QdrantClient({
    url: process.env.VECTOR_URL,
    apiKey: process.env.VECTOR_DB_API_KEY,
});

const COLLECTION = "rag_demo";

// ======================================================================================================
// ======================================================================================================
// Check collection exists
try {
    await client.getCollection(COLLECTION);
    console.log("Collection exists");
} catch {
    console.log("Collection not found, creating...");
    await client.createCollection(COLLECTION, {
        vectors: { size: 768, distance: "Cosine" },
    });
    console.log("Collection created");
}

// ======================================================================================================
// ======================================================================================================
// Documents 
const documents = [
    "Acme Corp was founded in 2010 and specializes in cloud-based data analytics tools.",
    "Acme Corp's flagship product is DataVision, which helps businesses visualize large datasets.",
    "DataVision supports CSV, JSON, and SQL database inputs.",
    "Acme Corp offers customer support via email and live chat from Monday to Friday."
];

// ======================================================================================================
// ======================================================================================================
// Embed + Upsert 
async function embed(text) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

async function ingest() {
    const points = [];
    for (const doc of documents) {
        const vector = await embed(doc);
        points.push({ id: uuidv4(), vector, payload: { text: doc } });
    }
    await client.upsert(COLLECTION, { points, wait: true });
    console.log("Documents ingested");
}

// ======================================================================================================
// ======================================================================================================
// Retrieve 
async function retrieve(query, topK = 3) {
    const queryVector = await embed(query);
    const results = await client.search(COLLECTION, {
        vector: queryVector,
        limit: topK,
        with_payload: true,
    });
    return results; // array of points
}

// ======================================================================================================
// ======================================================================================================
// Generate 
async function answer(question) {
    const contextDocs = await retrieve(question);
    const context = contextDocs.map(d => d.payload.text).join("\n");
    
    const prompt = `
    You are a helpful assistant.
    Answer the question using ONLY the context below.
    If the answer is not in the context, say "I don't know".
    
    Context:
    ${context}
    
    Question:
    ${question}
    `;
    
    const response = await llm.generateContent(prompt);
    return response.response.text();
}

// ======================================================================================================
// ======================================================================================================
// Main 
(async () => {
    await ingest();
    
    const question = "what does company offer?";
    const result = await answer(question);
    
    console.log("\nAnswer 1 :-\n", result);
})();
(async () => {
    await ingest();
    
    const question = "where does company exists?";
    const result = await answer(question);
    
    console.log("\nAnswer 2 :-\n", result);
})();
