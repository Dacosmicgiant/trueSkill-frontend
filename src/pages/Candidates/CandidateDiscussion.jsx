// src/pages/Candidates/CandidateDiscussion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Alert,
  Card,
  CardContent,
  Spinner
} from '../../components/ui';
import GroupDiscussion from '../../components/discussion/GroupDiscussion';
import { getCandidateById } from '../../services/candidateService';

const CandidateDiscussion = () => {
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentSaved, setAssessmentSaved] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const result = await getCandidateById(id);
        
        if (result.success) {
          setCandidate(result.candidate);
        } else {
          setError(result.error || 'Failed to fetch candidate details');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleAssessmentComplete = (reportData) => {
    setAssessmentSaved(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert variant="error">
          {error}
        </Alert>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (assessmentSaved) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert variant="success">
          Soft skills assessment has been saved successfully to the candidate's profile.
        </Alert>
        <div className="mt-4 flex space-x-4">
          <Button
            variant="primary"
            onClick={() => navigate(`/candidates/${id}`)}
          >
            View Candidate Profile
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAssessmentSaved(false)}
          >
            Start Another Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Soft Skills Assessment"
        description={candidate ? `Candidate: ${candidate.name}` : 'Evaluating soft skills through group discussion'}
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

      <div className="mb-6">
        <GroupDiscussion 
          candidateId={id}
          onComplete={handleAssessmentComplete}
        />
      </div>
    </div>
  );
};

export default CandidateDiscussion;