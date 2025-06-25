
# Integration Examples

## 🔄 Frontend Integration

### React Hook for PDF Extraction

```javascript
// hooks/usePDFExtraction.js
import { useState } from 'react';

const API_URL = 'https://your-api-url.com'; // Replace with your deployed URL

export const usePDFExtraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractText = async (pdfUrl) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsLoading(false);
      return result.text;

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return { extractText, isLoading, error };
};
```

### Update Your Existing Code

```javascript
// Replace in your useAdvancedProcessing.ts:

// OLD CODE:
const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
  body: {
    pdfUrl: publicUrl,
    projectId: projectId
  }
});

// NEW CODE:
const response = await fetch('https://your-api-url.com/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pdfUrl: publicUrl })
});

const extractionData = await response.json();
const extractionError = !response.ok ? new Error(extractionData.error) : null;

// The rest stays the same:
if (extractionError || !extractionData?.success) {
  const errorMsg = extractionError?.message || extractionData?.error || 'PDF extraction failed';
  updateTaskError('extract', errorMsg);
  throw new Error(errorMsg);
}

// Use extractionData.text instead of extractionData.content
const pdfText = extractionData.text;
```

## 🔧 Advanced Integration Options

### Option 1: Direct Replacement (Recommended)

Just change the API endpoint in your existing `useAdvancedProcessing` hook.

### Option 2: New Supabase Edge Function Proxy

If you want to keep using Supabase but with the external API:

```javascript
// Create: supabase/functions/pdf-extract-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl } = await req.json();
    
    // Call your external API
    const response = await fetch('https://your-api-url.com/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfUrl })
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

Then just change the function name in your frontend:
```javascript
// Change from 'extract-pdf-content' to 'pdf-extract-proxy'
const { data, error } = await supabase.functions.invoke('pdf-extract-proxy', {
  body: { pdfUrl: publicUrl }
});
```

## 🧪 Testing Commands

```bash
# Test health endpoint
curl https://your-api-url.com/health

# Test extraction with your PDF
curl -X POST https://your-api-url.com/extract \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://qpveeqvzvukolfagasne.supabase.co/storage/v1/object/sign/project-pdfs/rapport-delarsrapport-januari-mars-2025-250429.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZjAzZWViNC05ODhhLTQwMTUtOWQ4ZS1iMjY2OGU0NDdiMTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9qZWN0LXBkZnMvcmFwcG9ydC1kZWxhcnNyYXBwb3J0LWphbnVhcmktbWFycy0yMDI1LTI1MDQyOS5wZGYiLCJpYXQiOjE3NTA4NTYyOTMsImV4cCI6MTc1MTQ2MTA5M30.JTE_pzNRZTAH6iyK48PGueAEDKNMkzO52X_EFmBMkAw"
  }'

# Test with JavaScript
fetch('https://your-api-url.com/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pdfUrl: 'https://example.com/document.pdf'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🚨 Error Handling

Your API returns consistent error responses:

```javascript
// Success response
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

// Error response
{
  "success": false,
  "error": "Failed to download PDF: HTTP 404: Not Found"
}
```

Handle errors in your frontend:
```javascript
const result = await extractText(pdfUrl);

if (!result.success) {
  // Handle specific errors
  if (result.error.includes('too large')) {
    showToast('PDF file is too large. Please use a smaller file.');
  } else if (result.error.includes('No readable text')) {
    showToast('This PDF appears to be image-based. Try using OCR.');
  } else {
    showToast(`Extraction failed: ${result.error}`);
  }
}
```
