
# PDF Extraction API

A robust, production-ready PDF text extraction API built with Node.js. Designed to handle complex financial reports and documents that cause timeouts in serverless environments.

## ✨ Features

- 🚀 **Fast & Reliable** - Optimized for large, complex PDFs
- 🌐 **CORS Enabled** - Ready for browser integration
- 📱 **Platform Agnostic** - Deploy anywhere (Vercel, AWS, Google Cloud, etc.)
- 🔒 **Secure** - No data persistence, stateless processing
- 📊 **Detailed Metadata** - Returns word count, page count, processing time
- ⚡ **No Dependencies on External APIs** - Pure Node.js solution

## 🚀 Quick Start

### 1. Deploy to Vercel (30 seconds)

```bash
git clone [this-repo]
cd pdf-extraction-api
npm install
npx vercel --prod
```

### 2. Test Your API

```bash
curl -X POST https://your-app.vercel.app/extract \
  -H "Content-Type: application/json" \
  -d '{"pdfUrl": "https://example.com/document.pdf"}'
```

### 3. Integrate with Your App

```javascript
const response = await fetch('https://your-app.vercel.app/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pdfUrl: 'https://example.com/document.pdf' })
});

const result = await response.json();
console.log(result.text); // Extracted text
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Deploy to Vercel, AWS, Google Cloud
- [Integration Examples](INTEGRATION_EXAMPLES.md) - Frontend integration code

## 🔧 API Reference

### POST /extract

Extract text from a PDF URL.

**Request:**
```json
{
  "pdfUrl": "https://example.com/document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "metadata": {
    "length": 5234,
    "wordCount": 892,
    "pages": 12,
    "processingTimeMs": 1456,
    "fileSizeKB": 340
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-25T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🚫 Limits

- **File Size:** 50MB max
- **Timeout:** 60 seconds
- **Supported:** PDF files only

## 🐛 Troubleshooting

### Common Issues:

1. **"No readable text found"** - PDF might be image-based, needs OCR
2. **"PDF too large"** - File exceeds 50MB limit
3. **"Failed to download"** - URL not accessible or expired

### Performance Tips:

- Use smaller PDFs when possible
- Ensure PDFs are text-based (not scanned images)
- For production, consider using AWS Lambda with more memory

## 📊 Cost Estimation

| Platform | Monthly Cost (1000 PDFs) |
|----------|---------------------------|
| Vercel | ~$0 (free tier) |
| AWS Lambda | ~$0.10 |
| Google Cloud | ~$0.05 |
| Railway | $5 (unlimited) |

## 🤝 Contributing

This is a standalone API. To modify:

1. Edit `index.js` for core logic
2. Test with `npm test`
3. Deploy with `vercel --prod`

## 📄 License

MIT - Use freely in your projects.
