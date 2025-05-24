import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, SkipForward, RotateCcw, CheckCircle, AlertCircle, Loader2, Volume2, VolumeX } from 'lucide-react';

const RepoQuestions = () => {
  const [repoName, setRepoName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRepoInput, setShowRepoInput] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize speech services
  useEffect(() => {
    // Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text) => {
    if (!synthesis || !speechEnabled) return;
    
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    
    setCurrentUtterance(utterance);
    synthesis.speak(utterance);
  }, [synthesis, speechEnabled]);

  const stopSpeaking = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  }, [synthesis]);

  // Speak current question
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length && speechEnabled) {
      const currentQuestion = questions[currentQuestionIndex];
      const textToSpeak = `Question ${currentQuestionIndex + 1} from ${currentQuestion.source}: ${currentQuestion.question}`;
      setTimeout(() => speak(textToSpeak), 500);
    }
    
    return () => stopSpeaking();
  }, [currentQuestionIndex, questions, speak, stopSpeaking, speechEnabled]);

  // Update progress
  useEffect(() => {
    if (questions.length > 0) {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleFetchQuestions = async () => {
    if (!repoName || !repoName.includes('/')) {
      setError('Please enter a valid repository name (e.g., username/repo).');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setResults(null);
    setShowResults(false);

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/questions/${repoName}`);
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions || []);
        setSuccessMessage(data.message || 'Questions loaded successfully! Let\'s begin.');
        setShowRepoInput(false);
      } else {
        setError(data.error || 'Failed to fetch questions.');
      }
    } catch (err) {
      setError('Error connecting to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    if (currentQuestionIndex >= questions.length) return;

    const question = questions[currentQuestionIndex];
    setError('');
    setLoading(true);
    stopListening();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, answer: answer.trim() }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Answer submitted successfully!');
        setAnswer('');
        
        if (currentQuestionIndex + 1 < questions.length) {
          setTimeout(() => {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSuccessMessage('');
          }, 1000);
        } else {
          setSuccessMessage('All questions completed! Calculating results...');
          setTimeout(async () => {
            await fetchResults();
            setShowResults(true);
          }, 1500);
        }
      } else {
        setError(data.error || 'Failed to submit answer.');
      }
    } catch (err) {
      setError('Error submitting answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/results');
      const data = await response.json();
      console.log('Results:', data);
      if (response.ok) {
        setResults(data);
        setSuccessMessage('Results fetched successfully!');
        console.log('Results:', data);
      } else {
        setError(data.error || 'Failed to fetch results.');
        setResults(null);
      }
    } catch (err) {
      setError('Error fetching results. Please try again.');
      setResults(null);
    }
  };

  const startListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) return;
    
    setError('');
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setError('');
      setSuccessMessage('');
      stopListening();
    }
  };

  const toggleAnswerDetails = (index) => {
    setExpandedAnswer(expandedAnswer === index ? null : index);
  };

  const restartInterview = () => {
    setShowRepoInput(true);
    setShowResults(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setResults(null);
    setError('');
    setSuccessMessage('');
    setProgress(0);
    stopListening();
    stopSpeaking();
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadgeColor = (rating) => {
    if (rating >= 8) return 'bg-green-100 text-green-800';
    if (rating >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Repository Input */}
      <div className={`transition-all duration-500 transform ${showRepoInput ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Repository Interview
            </h1>
            <p className="text-gray-600">Test your knowledge of any GitHub repository</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="repoName" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository
              </label>
              <input
                type="text"
                id="repoName"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g., facebook/react"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleFetchQuestions()}
              />
            </div>
            
            <button
              onClick={handleFetchQuestions}
              disabled={loading}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 flex items-center justify-center space-x-2 ${loading ? 'cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Interview</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions Interface */}
      {!showRepoInput && !showResults && questions.length > 0 && currentQuestionIndex < questions.length && (
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-gray-200 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-2 rounded-lg transition-colors ${speechEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                  title={speechEnabled ? 'Disable speech' : 'Enable speech'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Stop speaking"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-6">
            {/* Question */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase flex-shrink-0">
                    {questions[currentQuestionIndex].source}
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {questions[currentQuestionIndex].question}
                  </p>
                </div>
              </div>
            </div>

            {/* Code Display */}
            {questions[currentQuestionIndex].file_content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Code Reference:</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    Code Snippet
                  </div>
                  <pre className="p-4 text-sm text-gray-100 overflow-auto max-h-80">
                    <code>{questions[currentQuestionIndex].file_content}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Your Answer:</h3>
                <div className="flex items-center space-x-2">
                  {recognition && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Record</span>
                        </>
                      )}
                    </button>
                  )}
                  {isListening && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Recording...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use the record button to speak..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="6"
                disabled={loading || isListening}
              />
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || isListening || !answer.trim()}
                  className={`flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
                
                {currentQuestionIndex + 1 < questions.length && (
                  <button
                    onClick={handleNextQuestion}
                    disabled={loading || isListening}
                    className={`flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {(error || successMessage) && (
            <div className="border-t border-gray-200 p-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {showResults && results && (
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-blue-100">Here's how you performed</p>
          </div>
          
          <div className="p-6">
            {/* Score Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-blue-600 stroke-current"
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${(results.num_answered / results.questions_count) * 251.2} 251.2`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">
                      {Math.round((results.num_answered / results.questions_count) * 100)}%
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">Completion Rate</h3>
                <p className="text-gray-600">{results.num_questions_answered} of {results.total_questions_generated} questions</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{results.average_rating}</span>
                  <span className="text-lg text-green-100">/10</span>
                </div>
                <h3 className="font-semibold text-gray-800">Average Score</h3>
                <p className="text-gray-600">Overall performance rating</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Details</h3>
              {results.answers.map((ans, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleAnswerDetails(index)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase">
                          {ans.source}
                        </span>
                        <span className="font-medium text-gray-800">{ans.question}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingBadgeColor(ans.rating)}`}>
                          {ans.rating}/10
                        </span>
                        <span className={`transform transition-transform ${expandedAnswer === index ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </button>
                  {expandedAnswer === index && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Your Answer:</h4>
                          <p className="text-gray-600 bg-white p-3 rounded border">{ans.answer}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">Rating:</span>
                          <span className={`font-bold ${getRatingColor(ans.rating)}`}>
                            {ans.rating}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={restartInterview}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Start New Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoQuestions;