require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const cors = require("koa-cors");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const app = new Koa();
const router = new Router();

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Middleware
app.use(cors());
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
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
    const analysis = await analyzeWithDeepSeek(pdfText);

    ctx.body = {
      success: true,
      filename: file.originalFilename,
      analysis: analysis,
    };
  } catch (error) {
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

router.get("/", (ctx) => {
  ctx.body = "Welcome to the PDF Analyzer Service!";
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  ctx.body = "Hello World";
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
