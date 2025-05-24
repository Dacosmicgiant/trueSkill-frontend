import { useState, useEffect, useRef } from 'react';
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
  Clock
} from 'lucide-react';

// ReportDisplay component (unchanged)
const ReportDisplay = ({ report, onBack }) => {
  const [openSections, setOpenSections] = useState({
    communication: true,
    empathy: true,
    collaboration: true,
    adaptivity: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-700">User Participation Report</h2>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Back to Discussion
          </button>
        </div>
        <div className="space-y-4">
          {['communication', 'empathy', 'collaboration', 'adaptivity'].map((area) => (
            <div key={area} className="border rounded-lg shadow-sm bg-gray-50 transition-all duration-300">
              <button
                className="w-full p-4 flex justify-between items-center text-left bg-blue-50 hover:bg-blue-100 rounded-t-lg"
                onClick={() => toggleSection(area)}
              >
                <h3 className="text-lg font-semibold capitalize text-blue-800">{area}: {report[area].score}/10</h3>
                <span>{openSections[area] ? '▼' : '▶'}</span>
              </button>
              {openSections[area] && (
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700">Strengths:</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {report[area].strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold text-gray-700 mt-4">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {report[area].areasForImprovement.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold text-gray-700 mt-4">Actionable Tip:</h4>
                  <p className="text-gray-600">{report[area].tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GD = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [isPromptingInterrupt, setIsPromptingInterrupt] = useState(false);
  const [isUserInputting, setIsUserInputting] = useState(false);
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [userReport, setUserReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [userContributions, setUserContributions] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timer, setTimer] = useState(120);
  const [discussionEnded, setDiscussionEnded] = useState(false);
  const [error, setError] = useState(null);
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
      name: 'User', 
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
              generateUserReport();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [discussionStarted, discussionEnded, timer]);

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

  // Modified callGeminiAPI to ensure contents is always specified
  const callGeminiAPI = async (prompt, chatHistory = null) => {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }
    setIsLoading(true);
    setError(null);

    try {
      if (!apiKey) {
        throw new Error('API key is required. Please enter a valid Gemini API key.');
      }

      // Initialize contents with the prompt as a user message
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      // Append chat history if provided
      if (chatHistory && chatHistory.length > 0) {
        const formattedMessages = chatHistory.map(msg => ({
          role: msg.participant.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || '' }]
        }));
        requestBody.contents.push(...formattedMessages);
      }

      console.log('Sending Gemini API request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'API call failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText?.trim()) {
        throw new Error('Received empty or invalid response from Gemini API');
      }
      console.log('Gemini API response:', responseText);
      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Modified generateAgentPoints with retry logic and validation
  const generateAgentPoints = async (topic) => {
    const newAgentPoints = { 'AI1': [], 'AI2': [], 'AI3': [] };
    const maxRetries = 3;

    for (const participant of participants.filter(p => p.role === 'model')) {
      const prompt = `
        You are ${participant.name} in a group discussion on the topic: "${topic}". 
        Generate exactly 10 concise points (each under 50 words) to discuss, focusing on your role:
        - AI1 (Analytical): Use data, facts, and logical reasoning.
        - AI2 (Creative): Provide innovative, out-of-the-box ideas.
        - AI3 (Pragmatic): Offer practical, actionable solutions.
        Return the points as a JSON array of strings, e.g., ["Point 1", "Point 2", ...].
      `;

      let attempts = 0;
      let success = false;
      let points = [];

      while (attempts < maxRetries && !success) {
        try {
          console.log(`Generating points for ${participant.name}, attempt ${attempts + 1}`);
          const responseText = await callGeminiAPI(prompt);
          points = JSON.parse(responseText);
          if (!Array.isArray(points) || points.length !== 10 || points.some(p => !p.trim())) {
            throw new Error(`Invalid points format: Expected 10 non-empty strings, got ${JSON.stringify(points)}`);
          }
          success = true;
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed for ${participant.name}:`, error.message);
          attempts++;
          if (attempts === maxRetries) {
            setError(`Failed to generate points for ${participant.name} after ${maxRetries} attempts: ${error.message}`);
            return null;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (success) {
        newAgentPoints[participant.name.split(' ')[0]] = points;
        console.log(`Points generated for ${participant.name}:`, points);
      }
    }

    return newAgentPoints;
  };

  const handleNext = async () => {
    if (discussionEnded || isLoading) return;
    
    if (participants[currentTurn].role === 'model') {
      setActiveSpeaker(currentTurn);
      const participantName = participants[currentTurn].name.split(' ')[0];
      const currentPointIndex = pointIndices[participantName];
      const point = agentPoints[participantName][currentPointIndex] || '';
      
      console.log(`Using point ${currentPointIndex} for ${participantName}: "${point}"`);
      
      const systemPrompt = participants[currentTurn].getSystemPrompt(topic, point);
      
      try {
        const response = await callGeminiAPI(systemPrompt, messages);
        
        const aiMessage = { 
          text: response, 
          participant: participants[currentTurn],
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        if (speechEnabled) {
          speak(response, participants[currentTurn]);
        }
        
        setPointIndices(prev => ({
          ...prev,
          [participantName]: (currentPointIndex + 1) % 10
        }));
        
        setTimeout(() => setActiveSpeaker(null), 500);
        setIsPromptingInterrupt(true);
      } catch (error) {
        // Error handled in callGeminiAPI
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
      alert('Please enter a discussion topic');
      return;
    }
    if (!apiKey.trim()) {
      alert('Please enter a valid Gemini API key');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    // Generate 10 points for each agent
    const points = await generateAgentPoints(topic);
    if (!points) {
      setIsLoading(false);
      alert('Failed to generate discussion points. Please check your API key and try again.');
      return;
    }
    
    setAgentPoints(points);
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

  const generateUserReport = async () => {
    if (userContributions === 0) {
      alert("You haven't contributed to the discussion yet. Please participate before generating a report.");
      return;
    }
    
    setGeneratingReport(true);
    setError(null);
    
    try {
      const userMessages = messages.filter(msg => msg.participant.role === 'user');
      if (userMessages.length === 0) {
        throw new Error('No user contributions found for report generation');
      }
      const discussionContext = messages.map(msg => `${msg.participant.name}: ${msg.text}`).join('\n\n');
      if (!discussionContext.trim()) {
        throw new Error('Discussion context is empty');
      }
      
      const reportPrompt = `
You are an expert communication coach analyzing a group discussion. Based on the following discussion, generate a report evaluating the user's performance in these areas:

1. Communication: Clarity of expression, articulation of ideas, active listening
2. Empathy: Understanding others' perspectives, showing emotional intelligence
3. Collaboration: Building on others' ideas, constructive feedback, teamwork
4. Adaptivity: Flexibility in thinking, responsiveness to new ideas

For each area, provide:
- A score from 1-10
- Key strengths (2-3 bullet points)
- Areas for improvement (1-2 bullet points)
- One actionable tip

Context:
Topic: ${topic}

Discussion:
${discussionContext}

Return the response as a JSON object with the following structure:
{
  "communication": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "empathy": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "collaboration": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "adaptivity": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  }
}
`;

      console.log('Generating report with prompt:', reportPrompt);
      const responseText = await callGeminiAPI(reportPrompt);
      const reportJson = JSON.parse(responseText);
      
      setUserReport(reportJson);
    } catch (error) {
      console.error('Report generation error:', error.message);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setGeneratingReport(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {!discussionStarted ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Group Discussion App</h1>
            
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-gray-700">Gemini API Key (Required):</label>
              <div className="flex">
                <input
                  type={showApiKeyInput ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 p-3 border rounded-l text-gray-700"
                  placeholder="Enter your Gemini API key"
                />
                <button 
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="p-3 bg-gray-200 border-t border-r border-b rounded-r"
                >
                  {showApiKeyInput ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A valid API key is required to use Gemini for responses and scoring.
              </p>
            </div>
          
            <label className="block text-lg font-semibold mb-2 text-gray-700">Discussion Topic:</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 border rounded mb-4 min-h-24 text-gray-700"
              placeholder="Enter any discussion topic"
            />
            <div className="mb-6">
              <h2 className="font-semibold mb-2 text-gray-700">Participants:</h2>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.name} className={`p-3 rounded-lg flex items-center ${p.color}`}>
                    {p.icon}
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <button 
              onClick={startDiscussion} 
              disabled={isLoading}
              className={`w-full p-3 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition`}
            >
              {isLoading ? 'Loading...' : 'Start Discussion (2-Minute Timer)'}
            </button>
          </div>
        </div>
      ) : userReport ? (
        <ReportDisplay 
          report={userReport} 
          onBack={resetDiscussion}
        />
      ) : (
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
                  <button 
                    onClick={toggleSpeech}
                    className={`p-2 rounded-full ${speechEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}
                    title={speechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                  >
                    {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  {speechSupported && (
                    <button 
                      onClick={toggleListening}
                      className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 text-gray-600'}`}
                      title={isListening ? "Stop listening" : "Start listening"}
                    >
                      {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                  )}
                  <button 
                    onClick={generateUserReport}
                    disabled={generatingReport || userContributions === 0 || !discussionEnded} 
                    className={`p-2 rounded-full ${userContributions > 0 && discussionEnded ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-200 text-gray-400'}`}
                    title="Generate participation report"
                  >
                    <FileText size={18} />
                  </button>
                  {!isMobile && (
                    <button 
                      onClick={() => setShowTranscript(!showTranscript)}
                      className={`p-2 rounded-full ${showTranscript ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}
                      title={showTranscript ? "Hide transcript" : "Show transcript"}
                    >
                      <FileText size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex px-4 pb-2 overflow-x-auto">
                {participants.map((p, i) => (
                  <div 
                    key={p.name} 
                    className={`mr-2 flex items-center p-2 rounded-lg ${activeSpeaker === i ? `${p.color} ${p.textColor} border border-2 border-blue-500` : 'bg-gray-100 text-gray-700'}`}
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
                  <div className="text-center text-red-600 font-semibold">
                    {error}
                  </div>
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
                        <button 
                          onClick={() => speak(msg.text, msg.participant)}
                          className="mt-1 p-1 text-xs rounded hover:bg-white hover:bg-opacity-50 text-gray-600"
                          title="Read aloud"
                        >
                          <Volume2 size={14} />
                        </button>
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
                  <div className="text-center text-red-600 font-semibold">
                    Discussion has ended (2-minute timer expired).
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t">
              {discussionEnded ? (
                <div className="max-w-3xl mx-auto">
                  <button 
                    onClick={resetDiscussion} 
                    className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Start New Discussion
                  </button>
                </div>
              ) : isPromptingInterrupt ? (
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-700">
                      <p>Would you like to add your thoughts?</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleInterrupt}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={handleSkipInterrupt}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              ) : isUserInputting ? (
                <div className="max-w-3xl mx-auto flex">
                  <div className="flex items-center justify-center">
                    {speechSupported && (
                      <button 
                        onClick={toggleListening}
                        className={`p-2 mr-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 p-3 border rounded-l"
                      placeholder={isListening ? "Listening..." : "Type your message..."}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button 
                      onClick={handleSubmit} 
                      className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <button 
                    onClick={handleNext} 
                    disabled={isLoading}
                    className={`w-full p-3 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition`}
                  >
                    {isLoading ? 'Loading...' : `Next: ${participants[currentTurn].name}'s Turn`}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {(showTranscript || sidebarOpen) && (
            <div className={`${isMobile ? 'absolute inset-0 z-20 bg-white' : 'border-l'} w-full md:w-80 lg:w-96 flex flex-col bg-white`}>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Transcript</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyTranscript}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Copy transcript"
                  >
                    <Copy size={18} />
                  </button>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <X size={18} />
                    </button>
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
      )}
    </div>
  );
};

export default GD;