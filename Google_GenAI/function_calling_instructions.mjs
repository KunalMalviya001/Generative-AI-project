import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Define the function declaration for the model
const weatherFunctionDeclaration = {
  name: 'get_person_detail',
  description: 'Gets person detail',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The person name, e.g. Bob',
      },
      email: {
        type: Type.STRING,
        description: 'The email id, e.g. Bob@gmail.com',
      },
      laptop: {
        type: Type.STRING,
        description: 'The Laptop name, e.g. Lenovo',
      },
    },
    required: ['name', 'email', 'laptop'],
  },
};

// Send request with function declarations
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: "My name is Raj. My email id is raj@gmail.com and I have issue in Dell Laptop.",
  config: {
    tools: [{
      functionDeclarations: [weatherFunctionDeclaration]
    }],
  },
});

// Check for function calls in the response
if (response.functionCalls && response.functionCalls.length > 0) {
  const functionCall = response.functionCalls[0]; // Assuming one function call
  console.log(`Function to call: ${functionCall.name}`);
  console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
  // In a real app, you would call your actual function here:
  // const result = await getCurrentTemperature(functionCall.args);
} else {
  console.log("No function call found in the response.");
  console.log(response.text);
}