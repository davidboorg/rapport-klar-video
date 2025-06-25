
# PDF Extraction API - Deployment Guide

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd pdf-extraction-api
vercel --prod
```

**Vercel URL example:** `https://pdf-extraction-api.vercel.app`

### 2. AWS Lambda

```bash
# Install AWS CLI and configure credentials
npm install -g serverless

# Create serverless.yml:
cat > serverless.yml << EOF
service: pdf-extraction-api
provider:
  name: aws
  runtime: nodejs18.x
  timeout: 60
functions:
  extract:
    handler: aws-lambda.handler
    events:
      - http:
          path: extract
          method: post
          cors: true
EOF

# Deploy
serverless deploy
```

### 3. Google Cloud Functions

```bash
# Install Google Cloud SDK
gcloud functions deploy extractPdf \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source . \
  --entry-point extractPdf \
  --timeout 60s \
  --memory 512MB
```

### 4. Railway (Simple hosting)

```bash
# Connect to GitHub repo and deploy automatically
# URL: https://railway.app
```

### 5. Local Development

```bash
cd pdf-extraction-api
npm install
npm run dev

# Test locally
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"pdfUrl": "https://example.com/document.pdf"}'
```

## 📋 Environment Variables

No environment variables required! The API works out of the box.

Optional configuration:
- `PORT` - Server port (default: 3000)
- `MAX_PDF_SIZE` - Max file size in bytes
- `DOWNLOAD_TIMEOUT` - Download timeout in ms

## 🧪 Testing Your Deployed API

```bash
# Test with your deployed URL
export API_URL="https://your-api-url.com"
npm run test

# Or manually:
curl -X POST $API_URL/extract \
  -H "Content-Type: application/json" \
  -d '{"pdfUrl": "https://example.com/sample.pdf"}'
```

## 📊 Performance Tips

### For Large PDFs:
- **Vercel**: 60s timeout, good for most PDFs
- **AWS Lambda**: Increase timeout to 60s, use 1GB+ memory
- **Google Cloud**: Use 512MB+ memory, 60s timeout
- **Railway**: No specific limits, scales automatically

### Optimization:
```javascript
// In your deployment, you can add these optimizations:
const pdfOptions = {
  max: 0, // No page limit
  version: 'v1.10.100', // Specific pdf-parse version
  normalizeWhitespace: true,
  disableCombineTextItems: false
};
```

## 🔄 Integration with Your Frontend

### Replace Supabase Edge Function Call:

```javascript
// OLD (Supabase Edge Function)
const { data, error } = await supabase.functions.invoke('extract-pdf-content', {
  body: { pdfUrl, projectId }
});

// NEW (External API)
const response = await fetch('https://your-api-url.com/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pdfUrl })
});
const data = await response.json();

if (data.success) {
  console.log('Extracted text:', data.text);
} else {
  console.error('Error:', data.error);
}
```

## 💡 Cost Comparison

| Platform | Free Tier | Cost (per 1M requests) |
|----------|-----------|------------------------|
| Vercel | 100GB bandwidth | ~$20 |
| AWS Lambda | 1M requests/month | ~$0.20 |
| Google Cloud | 2M requests/month | ~$0.40 |
| Railway | $5/month | Unlimited |

**Recommendation:** Start with Vercel for simplicity, move to AWS Lambda for scale.
