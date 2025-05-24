// src/components/discussion/GroupDiscussion.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  UserCircle, 
  Brain, 
  Lightbulb, 
  Wrench, 
  FileText, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Menu, 
  X, 
  Copy,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Alert,
  Spinner
} from '../ui';
import ReportDisplay from './ReportDisplay';
// Import direct API functions from the correct path
import { 
  generateAgentPoints as directGenerateAgentPoints, 
  generateAIResponse as directGenerateAIResponse, 
  generateUserReport as directGenerateUserReport
} from "../../utils/DirectGeminiAPI";
import { saveDiscussionResults } from '../../services/gdService';

const GroupDiscussion = ({ 
  candidateId, 
  onComplete,
  initialTopic = '',
  presetApiKey = '',
  candidateName = null,
  timeLimit = 120,
  isPublicSession = false,
  onSessionComplete = null
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [isPromptingInterrupt, setIsPromptingInterrupt] = useState(false);
  const [isUserInputting, setIsUserInputting] = useState(false);
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userReport, setUserReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [userContributions, setUserContributions] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timer, setTimer] = useState(timeLimit);
  const [discussionEnded, setDiscussionEnded] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(presetApiKey);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [agentPoints, setAgentPoints] = useState({
    'AI1': [],
    'AI2': [],
    'AI3': []
  });
  const [pointIndices, setPointIndices] = useState({
    'AI1': 0,
    'AI2': 0,
    'AI3': 0
  });

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const contentContainerRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();

  // Default topics to choose from
  const defaultTopics = [
    "How can artificial intelligence improve workplace productivity?",
    "Should remote work become the standard for office jobs?",
    "What strategies can companies use to build a diverse and inclusive workplace?",
    "How can tech companies balance innovation with ethical concerns?",
    "What are the most effective ways to build team collaboration?",
    "How should companies adapt to rapidly changing market conditions?",
    "What skills will be most valuable in the workforce over the next decade?",
    "How can organizations effectively implement sustainability initiatives?"
  ];

  const participants = [
    {
      name: 'AI1 (Analytical)',
      role: 'model',
      icon: <Brain className="mr-2" size={20} />,
      color: 'bg-blue-100',
      textColor: 'text-blue-800',
      getSystemPrompt: (topic, point = '') =>
        `You are AI1, an analytical participant in a group discussion on the topic: "${topic}". Focus on data, facts, and logical reasoning. ${point ? `Base your response on this point: "${point}".` : 'Provide a general analytical perspective.'} Keep responses under 100 words and be direct.`,
    },
    {
      name: 'AI2 (Creative)',
      role: 'model',
      icon: <Lightbulb className="mr-2" size={20} />,
      color: 'bg-purple-100',
      textColor: 'text-purple-800',
      getSystemPrompt: (topic, point = '') =>
        `You are AI2, a creative participant in a group discussion on the topic: "${topic}". Think outside the box and provide innovative ideas. ${point ? `Base your response on this point: "${point}".` : 'Offer a creative perspective.'} Keep responses under 100 words and be imaginative.`,
    },
    {
      name: 'AI3 (Pragmatic)',
      role: 'model',
      icon: <Wrench className="mr-2" size={20} />,
      color: 'bg-green-100',
      textColor: 'text-green-800',
      getSystemPrompt: (topic, point = '') =>
        `You are AI3, a pragmatic participant in a group discussion on the topic: "${topic}". Focus on practical solutions and actionable steps. ${point ? `Base your response on this point: "${point}".` : 'Provide a practical perspective.'} Keep responses under 100 words and be realistic.`,
    },
    { 
      name: candidateName || (candidateId ? 'Candidate' : 'You'), 
      role: 'user',
      icon: <UserCircle className="mr-2" size={20} />,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
  ];

  useEffect(() => {
    let interval;
    if (discussionStarted && !discussionEnded && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setDiscussionEnded(true);
            setIsUserInputting(false);
            setIsPromptingInterrupt(false);
            if (userContributions > 0) {
              generateFinalReport();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [discussionStarted, discussionEnded, timer]);

  // Auto-start discussion if this is a public session with preset values
  useEffect(() => {
    if (isPublicSession && presetApiKey && initialTopic && !discussionStarted) {
      // Short delay to allow component to fully mount
      const timer = setTimeout(() => {
        startDiscussion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPublicSession, presetApiKey, initialTopic]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognitionInstance.onend = () => {
        if (isListening && !discussionEnded) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
    
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (discussionEnded) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const speak = (text, participant) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (window.speechSynthesis.getVoices().length > 0) {
      const voices = window.speechSynthesis.getVoices();
      
      if (participant.name === 'AI1 (Analytical)') {
        const voice = voices.find(v => v.name.includes('Male')) || voices[0];
        utterance.voice = voice;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      } else if (participant.name === 'AI2 (Creative)') {
        const voice = voices.find(v => v.name.includes('Female')) || voices[1] || voices[0];
        utterance.voice = voice;
        utterance.pitch = 1.2;
        utterance.rate = 0.9;
      } else if (participant.name === 'AI3 (Pragmatic)') {
        utterance.voice = voices[2] || voices[0];
        utterance.pitch = 0.9;
        utterance.rate = 1.1;
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSpeechEnabled(!speechEnabled);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleNext = async () => {
    if (discussionEnded || isLoading) return;
    
    if (participants[currentTurn].role === 'model') {
      setActiveSpeaker(currentTurn);
      const participantName = participants[currentTurn].name.split(' ')[0];
      const currentPointIndex = pointIndices[participantName];
      const point = agentPoints[participantName][currentPointIndex] || '';
      
      const systemPrompt = participants[currentTurn].getSystemPrompt(topic, point);
      
      try {
        setIsLoading(true);
        // Use direct API call
        const result = await directGenerateAIResponse(systemPrompt, messages, apiKey);
        setIsLoading(false);
        
        if (!result.success) {
          setError(result.error || 'Failed to generate AI response');
          return;
        }
        
        const aiMessage = { 
          text: result.response, 
          participant: participants[currentTurn],
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        if (speechEnabled) {
          speak(result.response, participants[currentTurn]);
        }
        
        setPointIndices(prev => ({
          ...prev,
          [participantName]: (currentPointIndex + 1) % 10
        }));
        
        setTimeout(() => setActiveSpeaker(null), 500);
        setIsPromptingInterrupt(true);
      } catch (error) {
        setError('Failed to generate AI response: ' + (error.message || ''));
        setIsLoading(false);
      }
    } else {
      setActiveSpeaker(3);
      setIsUserInputting(true);
    }
  };

  const handleSubmit = () => {
    if (input.trim() === '' || discussionEnded) return;
    
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    
    const userMessage = { 
      text: input, 
      participant: participants[3],
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setActiveSpeaker(null);
    
    setUserContributions(prev => prev + 1);
    
    setCurrentTurn((prev) => (prev + 1) % 4);
    setIsUserInputting(false);
  };

  const handleInterrupt = () => {
    if (discussionEnded) return;
    setIsPromptingInterrupt(false);
    setIsUserInputting(true);
  };

  const handleSkipInterrupt = () => {
    if (discussionEnded) return;
    setIsPromptingInterrupt(false);
    setCurrentTurn((prev) => (prev + 1) % 4);
    
    setTimeout(handleNext, 300);
  };

  const startDiscussion = async () => {
    if (topic.trim() === '') {
      setError('Please enter a discussion topic');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('Please enter a valid Gemini API key');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate points for each agent using direct API call
      const result = await directGenerateAgentPoints(topic, apiKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to generate discussion points');
        setIsLoading(false);
        return;
      }
      
      setAgentPoints(result.points);
      setPointIndices({ 'AI1': 0, 'AI2': 0, 'AI3': 0 });
      
      setDiscussionStarted(true);
      setTimer(120);
      setDiscussionEnded(false);
      setMessages([{
        text: `Let's discuss: ${topic}`,
        participant: {
          name: 'System',
          role: 'system',
          icon: <MessageCircle className="mr-2" size={20} />,
          color: 'bg-gray-100',
          textColor: 'text-gray-800',
        },
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      
      setIsLoading(false);
      handleNext();
    } catch (error) {
      setError('An unexpected error occurred: ' + (error.message || ''));
      setIsLoading(false);
    }
  };

  const resetDiscussion = () => {
    setDiscussionStarted(false);
    setDiscussionEnded(false);
    setMessages([]);
    setCurrentTurn(0);
    setActiveSpeaker(null);
    setIsPromptingInterrupt(false);
    setIsUserInputting(false);
    setUserReport(null);
    setUserContributions(0);
    setTimer(120);
    setError(null);
    setAgentPoints({ 'AI1': [], 'AI2': [], 'AI3': [] });
    setPointIndices({ 'AI1': 0, 'AI2': 0, 'AI3': 0 });
  };

  const generateFinalReport = async () => {
    if (userContributions === 0) {
      setError("No user contributions detected. Unable to generate report.");
      return;
    }
    
    setGeneratingReport(true);
    setError(null);
    
    try {
      // Use direct API call
      const result = await directGenerateUserReport(topic, messages, apiKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to generate report');
        setGeneratingReport(false);
        return;
      }
      
      setUserReport(result.report);
      
      // If this is a public session, notify the parent component
      if (isPublicSession && onSessionComplete) {
        onSessionComplete(result.report);
      }
    } catch (error) {
      setError('An unexpected error occurred while generating the report: ' + (error.message || ''));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSaveReport = async () => {
    if (!candidateId || !userReport) return;
    
    try {
      setIsLoading(true);
      
      const reportData = {
        communicationScore: userReport.communication.score,
        teamworkScore: userReport.collaboration.score,
        problemSolvingScore: userReport.adaptivity.score,
        discussionAnalysis: {
          topic,
          strengths: [
            ...userReport.communication.strengths,
            ...userReport.empathy.strengths,
            ...userReport.collaboration.strengths,
            ...userReport.adaptivity.strengths
          ],
          areasForImprovement: [
            ...userReport.communication.areasForImprovement,
            ...userReport.empathy.areasForImprovement,
            ...userReport.collaboration.areasForImprovement,
            ...userReport.adaptivity.areasForImprovement
          ],
          actionableTips: [
            userReport.communication.tip,
            userReport.empathy.tip,
            userReport.collaboration.tip,
            userReport.adaptivity.tip
          ],
          overallScore: Math.round((
            userReport.communication.score + 
            userReport.empathy.score + 
            userReport.collaboration.score + 
            userReport.adaptivity.score
          ) / 4)
        }
      };
      
      const result = await saveDiscussionResults(candidateId, reportData);
      
      if (!result.success) {
        setError(result.error || 'Failed to save results');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      
      if (onComplete) {
        onComplete(reportData);
      } else {
        navigate(`/candidates/${candidateId}`);
      }
    } catch (error) {
      setError('An unexpected error occurred while saving results');
      setIsLoading(false);
    }
  };

  const copyTranscript = () => {
    const transcript = messages.map(msg => `${msg.participant.name} (${msg.timestamp}): ${msg.text}`).join('\n\n');
    navigator.clipboard.writeText(transcript)
      .then(() => alert('Transcript copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSetSampleTopic = (sampleTopic) => {
    setTopic(sampleTopic);
  };

  if (userReport) {
    return (
      <ReportDisplay 
        report={userReport} 
        onBack={resetDiscussion}
        onSave={candidateId ? handleSaveReport : null}
      />
    );
  }

  if (!discussionStarted) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2" size={20} />
              Group Discussion Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key (Required):</label>
              <div className="flex">
                <Input
                  type={showApiKeyInput ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                  placeholder="Enter your Gemini API key"
                  rightIcon={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    >
                      {showApiKeyInput ? "Hide" : "Show"}
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary-600 hover:underline">Google AI Studio</a>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discussion Topic:</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded mb-4 min-h-24 text-gray-700"
                placeholder="Enter a discussion topic or select one below"
              />
              
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Or select a sample topic:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {defaultTopics.map((sampleTopic, index) => (
                    <button
                      key={index}
                      onClick={() => handleSetSampleTopic(sampleTopic)}
                      className="text-left p-2 text-sm border rounded hover:bg-gray-50 transition"
                    >
                      {sampleTopic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Participants:</h2>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.name} className={`p-3 rounded-lg flex items-center ${p.color}`}>
                    {p.icon}
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>This is a 2-minute simulated group discussion</li>
                <li>You'll discuss the topic with 3 AI participants</li>
                <li>Take turns and contribute meaningful responses</li>
                <li>At the end, you'll receive a detailed skills assessment</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="primary" 
              size="lg"
              className="w-full"
              onClick={startDiscussion} 
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
              {isLoading ? 'Preparing Discussion...' : 'Start 2-Minute Discussion'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col" ref={contentContainerRef}>
        <header className="bg-white shadow-sm border-b z-10">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              {isMobile && (
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-3 text-gray-600 hover:text-gray-800"
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Group Discussion</h1>
                <p className="text-sm text-gray-600">{topic}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-1" />
                <span className={`text-sm ${timer <= 10 ? 'text-red-600 font-bold' : ''}`}>
                  {formatTime(timer)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeech}
                title={speechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </Button>
              {speechSupported && (
                <Button
                  variant={isListening ? "outline" : "ghost"}
                  size="icon"
                  onClick={toggleListening}
                  className={isListening ? "animate-pulse" : ""}
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={generateFinalReport}
                disabled={generatingReport || userContributions === 0 || !discussionEnded}
                title="Generate participation report"
              >
                <FileText size={18} />
              </Button>
              {!isMobile && (
                <Button
                  variant={showTranscript ? "outline" : "ghost"}
                  size="icon"
                  onClick={() => setShowTranscript(!showTranscript)}
                  title={showTranscript ? "Hide transcript" : "Show transcript"}
                >
                  <FileText size={18} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex px-4 pb-2 overflow-x-auto">
            {participants.map((p, i) => (
              <div 
                key={p.name} 
                className={`mr-2 flex items-center p-2 rounded-lg ${activeSpeaker === i ? `${p.color} ${p.textColor} border border-blue-500` : 'bg-gray-100 text-gray-700'}`}
              >
                {p.icon}
                <span className="text-sm">{p.name}</span>
              </div>
            ))}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.participant.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.participant.color} ${msg.participant.textColor} ${msg.participant.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {msg.participant.icon}
                      <span className="font-semibold text-sm">{msg.participant.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-800">{msg.text}</p>
                  {msg.participant.role === 'model' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 p-1 h-auto"
                      onClick={() => speak(msg.text, msg.participant)}
                      title="Read aloud"
                    >
                      <Volume2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-100 rounded-bl-none">
                  <div className="flex items-center">
                    {participants[currentTurn].icon}
                    <span className="font-semibold text-sm">{participants[currentTurn].name}</span>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            {discussionEnded && (
              <Alert variant="warning">
                Discussion has ended (2-minute timer expired).
              </Alert>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-4 bg-white border-t">
          {discussionEnded ? (
            <div className="max-w-3xl mx-auto">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={resetDiscussion} 
              >
                Start New Discussion
              </Button>
            </div>
          ) : isPromptingInterrupt ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center">
                <div className="text-gray-700">
                  <p>Would you like to add your thoughts?</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInterrupt}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSkipInterrupt}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          ) : isUserInputting ? (
            <div className="max-w-3xl mx-auto flex">
              {speechSupported && (
                <Button
                  variant={isListening ? "outline" : "ghost"}
                  size="icon"
                  onClick={toggleListening}
                  className="mr-2"
                >
                  {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>
              )}
              <div className="flex-1 flex">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button 
                  variant="primary"
                  className="ml-2"
                  onClick={handleSubmit} 
                >
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={handleNext} 
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                {isLoading ? 'Loading...' : `Next: ${participants[currentTurn].name}'s Turn`}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {(showTranscript || sidebarOpen) && (
        <div className={`${isMobile ? 'absolute inset-0 z-20 bg-white' : 'border-l'} w-full md:w-80 lg:w-96 flex flex-col bg-white`}>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Transcript</h2>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyTranscript}
                title="Copy transcript"
              >
                <Copy size={18} />
              </Button>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center mb-1">
                    <span className={`font-semibold ${msg.participant.textColor}`}>{msg.participant.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDiscussion;