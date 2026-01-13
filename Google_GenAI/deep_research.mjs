import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Start the Deep Research Agent
const initialInteraction =  await client.interactions.create({
    input: 'Research the history of the Google TPUs with a focus on 2025 and 2026.',
    agent: 'deep-research-pro-preview-12-2025',
    background: true
});

console.log(`Research started. Interaction ID: ${initialInteraction.id}`);

// 2. Poll for results
while (true) {
    const interaction = await client.interactions.get(initialInteraction.id);
    console.log(`Status: ${interaction.status}`);

    if (interaction.status === 'completed') {
        console.log('\nFinal Report:\n', interaction.outputs[interaction.outputs.length - 1].text);
        break;
    } else if (['failed', 'cancelled'].includes(interaction.status)) {
        console.log(`Failed with status: ${interaction.status}`);
        break;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
}