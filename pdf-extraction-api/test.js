
// Test script
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_PDF_URL = 'https://qpveeqvzvukolfagasne.supabase.co/storage/v1/object/sign/project-pdfs/rapport-delarsrapport-januari-mars-2025-250429.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZjAzZWViNC05ODhhLTQwMTUtOWQ4ZS1iMjY2OGU0NDdiMTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9qZWN0LXBkZnMvcmFwcG9ydC1kZWxhcnNyYXBwb3J0LWphbnVhcmktbWFycy0yMDI1LTI1MDQyOS5wZGYiLCJpYXQiOjE3NTA4NTYyOTMsImV4cCI6MTc1MTQ2MTA5M30.JTE_pzNRZTAH6iyK48PGueAEDKNMkzO52X_EFmBMkAw';

async function testExtraction() {
  console.log('Testing PDF extraction API...');
  console.log(`API URL: ${API_URL}`);
  
  try {
    const response = await fetch(`${API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdfUrl: TEST_PDF_URL
      })
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Test passed!');
      console.log(`Extracted ${result.metadata.length} characters`);
      console.log(`Processing time: ${result.metadata.processingTimeMs}ms`);
      console.log('First 200 chars:', result.text.substring(0, 200));
    } else {
      console.log('\n❌ Test failed:', result.error);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Health check test
async function testHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const result = await response.json();
    console.log('Health check:', result);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

async function runTests() {
  await testHealth();
  await testExtraction();
}

runTests();
