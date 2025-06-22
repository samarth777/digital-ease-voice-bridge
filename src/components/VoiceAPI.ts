
// Voice API service for communicating with the FastAPI backend
// This file contains the frontend API calls that would connect to your FastAPI server

export interface VoiceProcessingRequest {
  audio: Blob;
  sessionId?: string;
}

export interface VoiceProcessingResponse {
  status: 'success' | 'error';
  transcript?: string;
  languageCode?: string;
  agentResult?: {
    status: string;
    message?: string;
    errorMessage?: string;
    sessionId?: string;
  };
  responseText?: string;
  audioResponse?: string; // Base64 encoded audio
  error?: string;
}

class VoiceAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async processVoiceCommand(request: VoiceProcessingRequest): Promise<VoiceProcessingResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', request.audio, 'recording.wav');
      
      if (request.sessionId) {
        formData.append('session_id', request.sessionId);
      }

      const response = await fetch(`${this.baseUrl}/process-voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Voice API error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const voiceAPI = new VoiceAPIService();
