import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const base64Image = fs.readFileSync('demo.png', { encoding: 'base64' });

const interaction = await client.interactions.create({
    model: 'gemini-3-flash-preview',
    input: [
        { type: 'text', text: 'Describe the image.' },
        { type: 'image', data: base64Image, mime_type: 'image/png' }
    ]
});

console.log(interaction.outputs[interaction.outputs.length - 1].text);