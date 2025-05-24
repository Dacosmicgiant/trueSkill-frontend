// src/pages/PublicDiscussion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Info, AlertTriangle } from 'lucide-react';
import { Alert, Button, Card, CardContent, Spinner } from '../components/ui';
import GroupDiscussion from '../components/discussion/GroupDiscussion';
import { parseDiscussionConfig } from '../utils/discussionLinkGenerator';

const PublicDiscussion = () => {
  const { configId } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionReport, setSessionReport] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const discussionConfig = parseDiscussionConfig(configId);
      
      if (!discussionConfig) {
        throw new Error('Invalid discussion link');
      }
      
      // Check if the link has expired (links valid for 7 days)
      const createdAt = new Date(discussionConfig.createdAt);
      const now = new Date();
      const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      
      if (diffDays > 7) {
        throw new Error('This discussion link has expired');
      }
      
      setConfig(discussionConfig);
    } catch (error) {
      setError(error.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [configId]);
  
  const handleSessionComplete = (report) => {
    setSessionReport(report);
    setSessionEnded(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6">
        <Alert variant="error" className="mb-6">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </Alert>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
        >
          Go to Homepage
        </Button>
      </div>
    );
  }
  
  if (sessionEnded) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Discussion Complete</h1>
              <p className="text-gray-600">
                Thank you for participating in the group discussion. Your session has been completed.
              </p>
            </div>
            
            {sessionReport && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Your Assessment Report</h2>
                <p className="text-green-700">
                  Your participation has been evaluated and a report has been generated. The recruiter will receive your assessment results.
                </p>
              </div>
            )}
            
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <div className="mb-6">
        <Alert variant="info" className="mb-4">
          <Info className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Welcome to the trueSkill Group Discussion</p>
            <p className="text-sm">
              You'll participate in a 2-minute conversation with AI agents on the topic: 
              <span className="font-medium italic ml-1">{config.topic}</span>
            </p>
          </div>
        </Alert>
      </div>
      
      <GroupDiscussion 
        initialTopic={config.topic}
        presetApiKey={config.apiKey}
        candidateName={config.candidateName}
        timeLimit={config.timeLimit}
        onSessionComplete={handleSessionComplete}
        isPublicSession={true}
      />
    </div>
  );
};

export default PublicDiscussion;