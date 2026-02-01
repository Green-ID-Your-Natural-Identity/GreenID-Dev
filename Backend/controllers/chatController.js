import { ai } from "../config/gemini.js";
import { getSystemPrompt } from "../utils/getSystemPrompts.js";
import { marked } from "marked";

export const getChatBotResponse = async (req, res) => {
  const { messages } = req.body;

  try {
    const lastUserMessage = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
    const dynamicPrompt = getSystemPrompt(lastUserMessage);

    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: dynamicPrompt }] },
        ...messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
      ],
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const pResponse = marked.parse(responseText) ;
    res.status(200).json({ response: pResponse });

  } catch (error) {
    console.error("ChatBot Error:", error);
    res.status(500).json({ error: "Error generating response", details: error.message });
  }
};
