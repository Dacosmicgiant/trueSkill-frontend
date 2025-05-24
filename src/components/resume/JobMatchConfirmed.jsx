// src/components/resume/JobMatchConfirmation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Briefcase, 
  AlertTriangle, 
  ChevronRight 
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Alert,
  Spinner 
} from '../ui';
import { addCandidateApplication } from '../../services/candidateService';

export default function JobMatchConfirmation({ 
  candidateId, 
  jobMatch, 
  onSuccess, 
  onCancel 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!candidateId || !jobMatch?.job_id) {
      setError('Missing candidate or job information');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addCandidateApplication(candidateId, jobMatch.job_id);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.candidate);
        } else {
          // Navigate to candidate page if no success handler
          navigate(`/candidates/${candidateId}`);
        }
      } else {
        setError(result.error || 'Failed to add candidate to job');
      }
    } catch (err) {
      console.error('Job match confirmation error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobMatch) {
    return <Alert variant="error">No job match information provided</Alert>;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Confirm Job Application
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-400 mr-2 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">{jobMatch.job_title}</h3>
              <p className="text-sm text-gray-500">Match Score: <span className="font-medium text-primary-600">{jobMatch.match_score}%</span></p>
            </div>
          </div>

          {jobMatch.matching_skills && jobMatch.matching_skills.length > 0 && (
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-green-800 mb-1">Matching Skills:</h4>
              <p className="text-sm text-green-700">{jobMatch.matching_skills.join(', ')}</p>
            </div>
          )}

          {jobMatch.missing_skills && jobMatch.missing_skills.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Missing Skills:
              </h4>
              <p className="text-sm text-yellow-700">{jobMatch.missing_skills.join(', ')}</p>
            </div>
          )}

          {jobMatch.overall_recommendation && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation:</h4>
              <p className="text-sm text-gray-600">{jobMatch.overall_recommendation}</p>
            </div>
          )}

          {error && (
            <Alert variant="error" className="mt-3">
              {error}
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t flex justify-between">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          rightIcon={!isSubmitting && <ChevronRight className="h-4 w-4" />}
        >
          {isSubmitting ? 'Adding...' : 'Add to This Job'}
        </Button>
      </CardFooter>
    </Card>
  );
}