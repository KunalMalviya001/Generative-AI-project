import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const client = new QdrantClient({
  url: process.env.VECTOR_URL,
  apiKey: process.env.VECTOR_DB_API_KEY,
});

try {
  // Create a collection name "items" in vector dataBase

  // const ans = await client.createCollection("demo", {
  //   vectors: { size: 3072, distance: "Cosine" },
  // });
  // console.log(ans);

  // =================================================================================================
  // =================================================================================================

  // List The Collection in vector Database

  const result = await client.getCollections();
  console.log("List of collections:", result.collections);

  // =================================================================================================
  // =================================================================================================

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // const texts = [
  //   "What is the meaning of life?",
  //   "What is the purpose of existence?",
  //   "How do I bake a cake?",
  // ];

  // const response = await ai.models.embedContent({
  //   model: "gemini-embedding-001",
  //   contents: texts,
  //   taskType: "SEMANTIC_SIMILARITY",
  //   // outputDimensionality: 384,
  // });

  // //   const embeddings = response.embeddings.map((e) => e.values);

  // const points = [];
  // let idx = 0;
  // const embeddings = response.embeddings.map((e) => e.values);
  // console.log(embeddings);
  // console.log("Vector length:", embeddings[0].length);

  // for await (const embedding of embeddings) {
  //   points.push({
  //     id: idx,
  //     vector: embedding,
  //     payload: {
  //       item_text: texts[idx],
  //     },
  //   });
  //   idx++;
  // }
  // console.log(points);

  // await client.upsert("demo", { points });

  // =================================================================================================
  // =================================================================================================

  // generate query embedding
  const queryText = "How do I bake a cake?";
  const queryEmbedding = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: queryText,
  }).then((e) => {
    // console.log(e.embeddings.values())
    return e.embeddings.values().next().value.values;
  });
console.log(queryEmbedding);
  // search for similar items
  const results = await client.query("demo", {
    query: queryEmbedding,
    with_payload: true,
    limit: 2,
  });

  // print results
  for (const result of results.points) {
    console.log(`Item: ${result.payload?.item_text || "N/A"}`);
  }
} catch (err) {
  console.error("Could not get collections:", err);
}
