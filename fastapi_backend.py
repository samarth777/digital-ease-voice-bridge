
"""
FastAPI backend for Sahayak AI Voice Interface
This file should be run separately as a Python FastAPI server

To run:
1. Install dependencies: pip install fastapi uvicorn python-multipart requests pyaudio pygame
2. Run server: uvicorn fastapi_backend:app --reload --host 0.0.0.0 --port 8000

Note: You'll need to adapt this code to work with your existing VoiceInterface class
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
import base64
from typing import Optional, Dict, Any
import uuid

# Import your existing VoiceInterface class
# from voice_interface import VoiceInterface  # Uncomment when you have the module

app = FastAPI(title="Sahayak AI Voice API", version="1.0.0")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global voice interface instance
# voice_interface = None
active_sessions: Dict[str, Any] = {}

@app.on_event("startup")
async def startup_event():
    """Initialize the voice interface on startup"""
    global voice_interface
    # Uncomment and modify when you have your VoiceInterface class ready
    # API_KEY = "your_sarvam_api_key_here"  # Replace with your actual API key
    # voice_interface = VoiceInterface(API_KEY)
    print("🚀 Sahayak AI Voice API started!")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Sahayak AI API is running"}

@app.post("/process-voice")
async def process_voice_command(
    audio: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Process voice command from audio file
    
    Args:
        audio: Audio file (WAV format)
        session_id: Optional session ID for conversation continuity
        
    Returns:
        JSON response with transcript, agent result, and audio response
    """
    try:
        # Validate audio file
        if not audio.filename.endswith(('.wav', '.mp3', '.m4a')):
            raise HTTPException(status_code=400, detail="Invalid audio format. Please use WAV, MP3, or M4A.")
        
        # Save uploaded audio to temporary file
        temp_audio_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        content = await audio.read()
        temp_audio_file.write(content)
        temp_audio_file.close()
        
        try:
            # For now, return a mock response since we don't have the VoiceInterface integrated
            # In the real implementation, you would use:
            # result = voice_interface.process_voice_command_from_file(temp_audio_file.name, session_id)
            
            # Mock response for demonstration
            mock_result = await process_mock_voice_command(temp_audio_file.name, session_id)
            
            return JSONResponse(content=mock_result)
            
        finally:
            # Cleanup temp file
            if os.path.exists(temp_audio_file.name):
                os.unlink(temp_audio_file.name)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing voice command: {str(e)}")

async def process_mock_voice_command(audio_file_path: str, session_id: Optional[str]) -> Dict[str, Any]:
    """
    Mock function to simulate voice processing
    Replace this with your actual VoiceInterface integration
    """
    import asyncio
    
    # Generate session ID if not provided
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Simulate processing delay
    await asyncio.sleep(2)
    
    # Mock transcript (in real implementation, this would come from speech-to-text)
    mock_transcript = "Open calculator application"
    
    # Mock agent processing (in real implementation, this would use your computer_use_agent)
    await asyncio.sleep(1)
    
    # Mock response
    response_text = "I have successfully opened the calculator application for you."
    
    # Mock TTS - in real implementation, this would be base64 encoded audio
    mock_audio_base64 = "UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAA="  # Empty WAV header
    
    return {
        "status": "success",
        "transcript": mock_transcript,
        "language_code": "en-IN",
        "agent_result": {
            "status": "success",
            "message": "Calculator opened successfully",
            "session_id": session_id
        },
        "response_text": response_text,
        "audio_response": mock_audio_base64
    }

@app.post("/text-to-speech")
async def text_to_speech(
    text: str = Form(...),
    language_code: str = Form("en-IN")
):
    """
    Convert text to speech
    
    Args:
        text: Text to convert to speech
        language_code: Language code for TTS
        
    Returns:
        Base64 encoded audio
    """
    try:
        # In real implementation, use your VoiceInterface.text_to_speech method
        # audio_file = voice_interface.text_to_speech(text, language_code)
        
        # Mock response
        mock_audio_base64 = "UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAA="
        
        return {
            "status": "success",
            "audio": mock_audio_base64,
            "text": text,
            "language_code": language_code
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in text-to-speech: {str(e)}")

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    if session_id in active_sessions:
        return active_sessions[session_id]
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
        return {"message": "Session deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
