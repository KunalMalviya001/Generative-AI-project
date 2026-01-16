import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    // const pdfResp = await fetch('Resume-Sample-1-Software-Engineer.pdf')
    //     .then((response) => response.arrayBuffer());

    const pdfResp = fs.readFileSync('Demo_PDF.pdf')

    const contents = [
        { text: "What is ATS score of file in one line"},
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(pdfResp).toString("base64")
            }
        }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents
    });
    console.log("\n\n" + response.text + "\n\n");
}

main();