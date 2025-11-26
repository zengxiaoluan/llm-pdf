// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function chatWithDeepseek(content) {
  let modelA = "deepseek-reasoner";
  let modelB = "deepseek-chat";

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content }],
    model: modelB,
  });

  return completion.choices[0].message.content;
}
