// src/pages/GroupDiscussionDemo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../components/ui';
import GroupDiscussion from '../components/discussion/GroupDiscussion';

const GroupDiscussionDemo = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Group Discussion Simulator"
        description="Practice and evaluate soft skills through an AI-facilitated group discussion"
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

      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2" size={20} />
              About This Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This group discussion simulator helps evaluate and practice soft skills in a safe environment. 
              You'll join a virtual discussion with three AI participants, each with distinct personalities 
              and approaches to the conversation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium text-blue-800 mb-2">AI1 (Analytical)</h3>
                <p className="text-sm text-gray-700">Focuses on data, facts, and logical reasoning</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="font-medium text-purple-800 mb-2">AI2 (Creative)</h3>
                <p className="text-sm text-gray-700">Provides innovative, out-of-the-box ideas</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-medium text-green-800 mb-2">AI3 (Pragmatic)</h3>
                <p className="text-sm text-gray-700">Offers practical, actionable solutions</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">How It Works:</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                <li>Each discussion lasts for 2 minutes</li>
                <li>Take turns contributing to the conversation</li>
                <li>After the discussion, you'll receive a detailed assessment of your participation</li>
                <li>The assessment evaluates communication, empathy, collaboration, and adaptivity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <GroupDiscussion />
    </div>
  );
};

export default GroupDiscussionDemo;