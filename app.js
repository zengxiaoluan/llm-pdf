require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const { readFile } = require("fs/promises");
const path = require("path");
const { testDeepseek } = require("./utils");

const app = new Koa();
const router = new Router();

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Middleware
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 100 * 1024 * 1024, // 10MB limit
    },
  })
);

// PDF analysis endpoint
router.post("/analyze-pdf", async (ctx) => {
  try {
    const file = ctx.request.files?.pdf;
    if (!file) {
      ctx.status = 400;
      ctx.body = { error: "No PDF file provided" };
      return;
    }

    // Extract text from PDF
    const pdfBuffer = require("fs").readFileSync(file.filepath);
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    // Call DeepSeek API
    // const analysis = await analyzeWithDeepSeek(pdfText);

    ctx.body = {
      success: true,
      filename: file.originalFilename,
      analysis: pdfText,
    };
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// DeepSeek API call function
async function analyzeWithDeepSeek(text) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable not set");
  }

  const response = await axios.post(
    DEEPSEEK_API_URL,
    {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Please analyze the following PDF document content and provide a summary, key points, and insights:\n\n${text}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

// Health check endpoint
router.get("/health", (ctx) => {
  ctx.body = { status: "OK", service: "PDF Analyzer" };
});

router.get("/", async (ctx) => {
  ctx.type = "html";

  let data = await readFile(
    path.resolve(__dirname, "./client/index.html"),
    "utf8"
  );

  ctx.body = data;
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
