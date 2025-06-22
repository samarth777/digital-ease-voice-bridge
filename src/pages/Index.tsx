
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Stop } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSession {
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  transcript: string;
  response: string;
  error: string;
}

const Index = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<VoiceSession>({
    isRecording: false,
    isProcessing: false,
    isPlaying: false,
    transcript: '',
    response: '',
    error: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setSession(prev => ({ ...prev, isRecording: true, transcript: '', response: '', error: '' }));
      
      toast({
        title: "Recording Started",
        description: "Speak your command clearly...",
      });

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setSession(prev => ({ ...prev, error: 'Failed to access microphone' }));
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setSession(prev => ({ ...prev, isRecording: false, isProcessing: true }));
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      // For now, simulate the API call since we don't have the FastAPI backend yet
      // In the real implementation, this would call your FastAPI endpoint
      await simulateProcessing();
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setSession(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: 'Failed to process audio command' 
      }));
    }
  };

  const simulateProcessing = async () => {
    // Simulate speech-to-text
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockTranscript = "Open calculator application";
    setSession(prev => ({ ...prev, transcript: mockTranscript }));

    // Simulate agent processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    const mockResponse = "I have successfully opened the calculator application for you.";
    
    setSession(prev => ({ 
      ...prev, 
      isProcessing: false, 
      response: mockResponse,
      isPlaying: true 
    }));

    // Simulate text-to-speech playback
    await new Promise(resolve => setTimeout(resolve, 4000));
    setSession(prev => ({ ...prev, isPlaying: false }));
    
    toast({
      title: "Task Completed",
      description: "Command executed successfully!",
    });
  };

  const getMainButtonProps = () => {
    if (session.isRecording) {
      return {
        onClick: stopRecording,
        className: "w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse",
        icon: <MicOff className="w-12 h-12" />,
        text: "Stop"
      };
    } else if (session.isProcessing) {
      return {
        onClick: () => {},
        className: "w-32 h-32 rounded-full bg-blue-500 text-white cursor-not-allowed",
        icon: <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />,
        text: "Processing"
      };
    } else if (session.isPlaying) {
      return {
        onClick: () => {},
        className: "w-32 h-32 rounded-full bg-green-500 text-white animate-pulse cursor-not-allowed",
        icon: <Play className="w-12 h-12" />,
        text: "Speaking"
      };
    } else {
      return {
        onClick: startRecording,
        className: "w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg",
        icon: <Mic className="w-12 h-12" />,
        text: "Start"
      };
    }
  };

  const buttonProps = getMainButtonProps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sahayak AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your digital assistant for computer tasks. Speak naturally and let AI help you navigate technology with ease.
          </p>
        </div>

        {/* Main Voice Interface */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800">
              Voice Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Main Button */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                {...buttonProps}
                disabled={session.isProcessing || session.isPlaying}
              >
                <div className="flex flex-col items-center space-y-2">
                  {buttonProps.icon}
                  <span className="text-lg font-semibold">{buttonProps.text}</span>
                </div>
              </Button>
              
              <p className="text-center text-gray-600 max-w-md">
                {session.isRecording && "🎤 Listening... Speak your command clearly"}
                {session.isProcessing && "🔄 Processing your request..."}
                {session.isPlaying && "🔊 Playing response..."}
                {!session.isRecording && !session.isProcessing && !session.isPlaying && 
                  "Click the microphone to start voice interaction"}
              </p>
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Transcript */}
              {session.transcript && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      What you said
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 text-lg italic">"{session.transcript}"</p>
                  </CardContent>
                </Card>
              )}

              {/* Response */}
              {session.response && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      AI Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 text-lg">{session.response}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Error Display */}
            {session.error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-700 text-center">{session.error}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80 transition-all duration-200">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Voice Commands</h3>
              <p className="text-sm text-gray-600">Speak naturally to control your computer and applications</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80 transition-all duration-200">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Audio Feedback</h3>
              <p className="text-sm text-gray-600">Clear spoken responses to confirm actions and provide guidance</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80 transition-all duration-200">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-6 h-6 bg-purple-600 rounded-full animate-pulse" />
              </div>
              <h3 className="font-semibold text-gray-800">Accessible Design</h3>
              <p className="text-sm text-gray-600">Large buttons and clear visual feedback for easy interaction</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
