import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const policy = `
### Gaming Instructions (Demo)

1. Start the game by pressing the **Play** button on the main screen.
2. Use the controller, keyboard, or touch controls to move your character.
3. Follow on-screen objectives to complete each level.
4. Avoid obstacles and enemies to prevent losing health or points.
5. Collect items, rewards, or power-ups to increase your score.
6. Complete the level objectives to advance to the next stage.
7. The game ends when all lives are lost or the final level is completed.
8. You can pause, restart, or exit the game at any time from the menu.

---

### Short Version (One-Paragraph Demo)

Start the game by selecting **Play**. Control your character using the available controls, complete objectives, avoid obstacles, and collect rewards. Progress through levels to win, and use the menu to pause or exit the game.

If you want:

* **Instructions for a specific game type** (mobile, PC, shooting, racing, kids game)
* **Very basic kid-friendly instructions**
* **More detailed controls**
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: "What kind of help can you give to a player?" }],
      },
    ],
    config: {
      systemInstruction: policy,
    },
  });
  console.log(response.text);
}

main();
