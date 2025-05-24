// src/pages/ShareableDiscussions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  PageHeader, 
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui';
import DiscussionLinkCreator from '../components/discussion/DiscussionLinkCreator';

const ShareableDiscussions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div>
      <PageHeader
        title="Create Shareable Discussion Links"
        description="Generate links that allow candidates to participate in group discussions without logging in"
        backButton={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        }
      />
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="h-5 w-5 mr-2 text-primary-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Shareable discussion links allow you to send candidates a direct link to participate in a group discussion without requiring them to create an account.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2 text-lg">1. Create Link</h3>
                  <p className="text-sm text-gray-700">
                    Set up a discussion topic, enter your Gemini API key, and generate a shareable link
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2 text-lg">2. Share with Candidate</h3>
                  <p className="text-sm text-gray-700">
                    Send the link to your candidate via email, message, or any other method
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2 text-lg">3. Review Results</h3>
                  <p className="text-sm text-gray-700">
                    When they complete the discussion, an assessment report is generated
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Links are valid for 7 days</li>
                  <li>Each discussion lasts 2 minutes</li>
                  <li>Your Gemini API key is required but never stored in our database</li>
                  <li>Assessment reports are generated but not automatically saved</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DiscussionLinkCreator 
        recruiterId={user?.id} 
        recruiterName={user?.name} 
      />
    </div>
  );
};

export default ShareableDiscussions;