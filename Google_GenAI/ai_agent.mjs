import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";


// =================================================================================================
// =================================================================================================
  //  CONFIG

const MODEL_NAME = "gemini-2.5-flash";
const MAX_STEPS = 5;

// =================================================================================================
// =================================================================================================
//  INIT GEMINI

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: `
  You are an AI agent.
  
  Goal: answer the user's question.
  
  You have access to ONE tool: "search".
  
  CRITICAL RULES:
  - Use ONLY the information provided by tools.
  - Do NOT add facts from your own knowledge.
  - If information is missing, say "Information not available".
  
  TOOL RULES:
  - If you need external info, call the tool.
  - Tool calls MUST be JSON ONLY.
  - Format:
  {
    "tool": "search",
    "input": "search query"
    }
    - If no tool is needed, answer normally.
    `
  });
  
  // =================================================================================================
  // =================================================================================================
  //  TOOL
  
  async function searchTool(query) {
    console.log("TOOL CALLED:", query);
    return `
    JavaScript facts:
    - Creator: Brendan Eich
    - Year: 1995
    - First name: Mocha
    - Created at: Netscape
    `;
  }
  
  // =================================================================================================
  // =================================================================================================
  // AGENT LOOP
  
async function runAgent(userQuestion) {
  let history = [
    {
      role: "user",
      parts: [{ text: userQuestion }]
    }
  ];
  
  for (let step = 1; step <= MAX_STEPS; step++) {
    console.log(`STEP ${step}`);
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage("Continue");
    const reply = result.response.text();
    
    console.log("MODEL:", reply);
    
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.tool === "search") {
          const toolResult = await searchTool(parsed.input);
          
          history.push({
            role: "model",
            parts: [{ text: jsonMatch[0] }]
          });
          
          history.push({
            role: "user",
            parts: [{ text: `Tool result:\n${toolResult}` }]
          });
          
          continue;
        }
      } catch {
        console.log("error");
      }
    }
    
    return reply;
  }
  
  return "Agent stopped (max steps reached)";
}

// =================================================================================================
// =================================================================================================
  //  RUN

(async () => {
  const question = "Who created JavaScript and when?";

  const answer = await runAgent(question);

  console.log("FINAL ANSWER:");
  console.log(answer);
})();
