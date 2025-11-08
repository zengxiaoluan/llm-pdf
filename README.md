# PDF Analyzer with DeepSeek API

A Node.js application using Koa.js to analyze PDF documents with DeepSeek AI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your DeepSeek API key
```

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### POST /analyze-pdf
Upload and analyze a PDF document.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file with field name "pdf"

**Response:**
```json
{
  "success": true,
  "filename": "document.pdf",
  "analysis": "AI analysis of the PDF content..."
}
```

### GET /health
Health check endpoint.

## Usage Example

```bash
curl -X POST \
  -F "pdf=@/path/to/your/document.pdf" \
  http://localhost:3000/analyze-pdf
```