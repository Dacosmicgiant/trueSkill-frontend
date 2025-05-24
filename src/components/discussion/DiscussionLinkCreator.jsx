// src/components/discussion/DiscussionLinkCreator.jsx
import React, { useState } from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Button, 
  Input, 
  Alert 
} from '../ui';
import { createShareableLink } from '../../utils/discussionLinkGenerator';

const DiscussionLinkCreator = ({ recruiterId, recruiterName }) => {
  const [topic, setTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  const handleGenerateLink = () => {
    if (!topic.trim()) {
      setError('Please enter a discussion topic');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    try {
      const discussionConfig = {
        topic,
        apiKey,
        candidateName: candidateName.trim() || 'Candidate',
        createdBy: {
          id: recruiterId,
          name: recruiterName
        },
        timeLimit: 120 // 2 minutes
      };
      
      const link = createShareableLink(discussionConfig);
      setGeneratedLink(link);
      setError('');
    } catch (error) {
      setError('Failed to generate link: ' + error.message);
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        setError('Failed to copy link: ' + err.message);
      });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'trueSkill Group Discussion',
          text: `Join a group discussion on "${topic}"`,
          url: generatedLink
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('Failed to share link: ' + error.message);
        }
      }
    } else {
      handleCopyLink();
    }
  };
  
  // Sample topics for quick selection
  const sampleTopics = [
    "How can artificial intelligence improve workplace productivity?",
    "What strategies can companies use to build a diverse and inclusive workplace?",
    "How can tech companies balance innovation with ethical concerns?",
    "What are the most effective ways to build team collaboration?",
    "How should companies adapt to rapidly changing market conditions?"
  ];
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Shareable Discussion Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="error">{error}</Alert>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discussion Topic:</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 border rounded mb-2 min-h-20 text-gray-700"
            placeholder="Enter a discussion topic"
          />
          
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Or select a sample topic:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleTopics.map((sampleTopic, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(sampleTopic)}
                  className="text-left p-2 text-xs border rounded hover:bg-gray-50 transition"
                >
                  {sampleTopic}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name (Optional):</label>
          <Input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Enter candidate's name"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be displayed in the discussion interface
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key:</label>
          <div className="flex">
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
            />
            <Button
              variant="ghost"
              className="ml-2"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? "Hide" : "Show"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary-600 hover:underline">Google AI Studio</a>
          </p>
        </div>
        
        {generatedLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Shareable Link:</h3>
            <div className="flex">
              <Input
                value={generatedLink}
                readOnly
                className="pr-20"
              />
              <Button
                variant="ghost"
                className="ml-2"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                {copied ? " Copied" : " Copy"}
              </Button>
            </div>
            <div className="mt-3 flex justify-end">
              <Button 
                variant="primary"
                size="sm"
                leftIcon={<Share2 size={16} />}
                onClick={handleShare}
              >
                Share Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!generatedLink ? (
          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleGenerateLink}
          >
            Generate Shareable Link
          </Button>
        ) : (
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setGeneratedLink('')}
          >
            Create Another Link
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DiscussionLinkCreator;