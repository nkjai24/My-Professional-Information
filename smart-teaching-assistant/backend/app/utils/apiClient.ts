// src/utils/apiClient.ts

// Fix for TypeScript - cast import.meta as any or use interface
const BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8002';

const api = {
  processPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}/process_pdf`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`PDF processing failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  askQuestion: async (payload: { question: string; chunks: any[]; context_chunk_index?: number }) => {
    const response = await fetch(`${BASE_URL}/ask_question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Question failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  askQuestionVoice: async (payload: { question: string; chunks: any[]; context_chunk_index?: number }) => {
    console.log('🚀 Sending voice request:', payload.question);
    
    const response = await fetch(`${BASE_URL}/ask_question_voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error('❌ Voice API failed:', response.status, response.statusText);
      throw new Error(`Voice API failed: ${response.statusText}`);
    }
    
    console.log('✅ Voice API response received');
    
    // Get the audio blob
    const blob = await response.blob();
    console.log('🎵 Audio blob size:', blob.size, 'bytes');
    
    // Create object URL for the audio
    const url = URL.createObjectURL(blob);
    console.log('🔗 Audio URL created:', url);
    
    return { blob, url };
  }
};

export default api;