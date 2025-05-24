// src/pages/Candidates/CandidateAddToJob.jsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle,
  BarChart2,
  BookOpen,
  FileText,
  X
} from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Badge,
  Alert,
  Spinner,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Input
} from '../../components/ui';
import JobSelectionControl from '../../components/job/JobSelectionControl';
import { getCandidateById, addCandidateApplication, updateApplicationStatus } from '../../services/candidateService';
import { getJobById } from '../../services/jobService';
import { matchResumeToJobs } from '../../services/resumeService';

// Application status options
const applicationStatusOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'technical-assessment', label: 'Technical Assessment' },
  { value: 'soft-skills-assessment', label: 'Soft Skills Assessment' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' }
];

export default function CandidateAddToJob() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [jobMatch, setJobMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalculatingMatch, setIsCalculatingMatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('applied');
  const [notes, setNotes] = useState('');
  
  // Initialize with job ID from URL if provided
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, [searchParams]);
  
  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getCandidateById(id);
        
        if (result.success) {
          setCandidate(result.candidate);
        } else {
          setError(result.error || 'Failed to fetch candidate data');
        }
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidate();
  }, [id]);
  
  // Fetch job data when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) return;
    
    const fetchJobAndMatchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch job details
        const jobResult = await getJobById(selectedJobId);
        
        if (jobResult.success) {
          setJob(jobResult.job);
          
          // Check if candidate has a match for this job
          if (candidate?.job_matches) {
            const existingMatch = candidate.job_matches.find(
              match => match.job_id === selectedJobId
            );
            
            if (existingMatch) {
              setJobMatch(existingMatch);
            } else {
              // Calculate match if no existing match is found
              calculateJobMatch(selectedJobId);
            }
          } else {
            // No job matches available, calculate
            calculateJobMatch(selectedJobId);
          }
        } else {
          setError(jobResult.error || 'Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobAndMatchData();
  }, [selectedJobId, candidate]);
  
  // Calculate job match for the selected job
  const calculateJobMatch = async (jobId) => {
    if (!candidate || !jobId) return;
    
    setIsCalculatingMatch(true);
    setError(null);
    
    try {
      // Use the candidate data for matching
      const result = await matchResumeToJobs(null, candidate, [jobId]);
      
      if (result.success && result.data?.job_matches?.length > 0) {
        const matchForJob = result.data.job_matches.find(match => match.job_id === jobId);
        if (matchForJob) {
          setJobMatch(matchForJob);
        } else {
          // Create a default match if matching API doesn't return one
          setJobMatch({
            job_id: jobId,
            job_title: job?.title || 'Unknown Job',
            match_score: 0,
            matching_skills: [],
            missing_skills: [],
            overall_recommendation: 'No match data available.'
          });
        }
      } else {
        setError(result.error || 'Failed to calculate job match');
      }
    } catch (err) {
      console.error('Error calculating job match:', err);
      setError('An unexpected error occurred while calculating job match');
    } finally {
      setIsCalculatingMatch(false);
    }
  };
  
  // Handle job selection
  const handleJobSelection = (jobIds) => {
    if (jobIds.length > 0) {
      setSelectedJobId(jobIds[0]);
    } else {
      setSelectedJobId(null);
      setJob(null);
      setJobMatch(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!candidate || !selectedJobId) {
      setError('Candidate and job selection are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Add candidate to job
      const result = await addCandidateApplication(candidate._id, selectedJobId);
      
      if (result.success) {
        // If status is not 'applied', update it
        if (applicationStatus !== 'applied') {
          const applicationId = result.candidate.applications.find(
            app => app.jobId === selectedJobId
          )?._id;
          
          if (applicationId) {
            await updateApplicationStatus(candidate._id, applicationId, applicationStatus);
          }
        }
        
        setSuccess('Candidate has been successfully added to the job');
        
        // Redirect back to candidate page after a delay
        setTimeout(() => {
          navigate(`/candidates/${candidate._id}`);
        }, 2000);
      } else {
        setError(result.error || 'Failed to add candidate to job');
      }
    } catch (err) {
      console.error('Error adding candidate to job:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper functions for UI
  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-primary-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getBackgroundClass = (score) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-primary-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <Badge variant="default">Applied</Badge>;
      case 'screening':
        return <Badge variant="primary">Screening</Badge>;
      case 'technical-assessment':
        return <Badge variant="info">Technical</Badge>;
      case 'soft-skills-assessment':
        return <Badge variant="info">Soft Skills</Badge>;
      case 'interview':
        return <Badge variant="warning">Interview</Badge>;
      case 'offer':
        return <Badge variant="success">Offer</Badge>;
      case 'hired':
        return <Badge variant="success">Hired</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error && !candidate) {
    return <Alert variant="error">{error}</Alert>;
  }
  
  if (!candidate) {
    return <Alert variant="error">Candidate not found</Alert>;
  }
  
  return (
    <div>
      <PageHeader
        title={`Add ${candidate.name} to Job`}
        backButton={
          <Button
            to={`/candidates/${id}`}
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back to Candidate
          </Button>
        }
      />
      
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}
      {success && <Alert variant="success" className="mb-6">{success}</Alert>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Candidate summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary-600"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                
                {/* Location */}
                {candidate.location && (
                  <div className="flex items-center text-sm mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-400 mr-2"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="text-gray-600">{candidate.location}</span>
                  </div>
                )}
                
                {/* Experience */}
                {candidate.experience?.years && (
                  <div className="flex items-center text-sm mb-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {candidate.experience.years} years of experience
                    </span>
                  </div>
                )}
                
                {/* Current job */}
                {(candidate.experience?.currentTitle || candidate.experience?.currentCompany) && (
                  <div className="flex items-center text-sm mb-2">
                    <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {candidate.experience.currentTitle}
                      {candidate.experience.currentCompany && ` at ${candidate.experience.currentCompany}`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Skills */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="primary">
                        {skill}
                      </Badge>
                    ))
                  ) : candidate.skills?.technical && candidate.skills.technical.length > 0 ? (
                    candidate.skills.technical.map((skill, index) => (
                      <Badge key={index} variant="primary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No skills information available</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Job selection and form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Job</CardTitle>
              </CardHeader>
              <CardContent>
                <JobSelectionControl
                  onJobSelect={handleJobSelection}
                  selectedJobIds={selectedJobId ? [selectedJobId] : []}
                  maxSelections={1}
                  showInitially={!selectedJobId}
                />
                
                {isCalculatingMatch && (
                  <div className="mt-4 flex items-center text-blue-700 bg-blue-50 p-3 rounded-md">
                    <Spinner size="sm" className="mr-2 text-blue-600" />
                    <span>Calculating job match score...</span>
                  </div>
                )}
                
                {job && jobMatch && (
                  <div className={`mt-4 p-4 rounded-md ${getBackgroundClass(jobMatch.match_score)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {job.location}
                          {job.isRemote && ' (Remote)'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getScoreColorClass(jobMatch.match_score)}`}>
                          {jobMatch.match_score}%
                        </div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Matching Skills */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          Matching Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {jobMatch.matching_skills && jobMatch.matching_skills.length > 0 ? (
                            jobMatch.matching_skills.map((skill, i) => (
                              <Badge key={i} variant="success">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No matching skills found</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Missing Skills */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                          Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {jobMatch.missing_skills && jobMatch.missing_skills.length > 0 ? (
                            jobMatch.missing_skills.map((skill, i) => (
                              <Badge key={i} variant="warning">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No missing critical skills</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {jobMatch.overall_recommendation && (
                      <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-sm text-gray-700">{jobMatch.overall_recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {selectedJobId && job && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application Status
                      </label>
                      <Select
                        value={applicationStatus}
                        onValueChange={setApplicationStatus}
                      >
                        <SelectTrigger className="w-full">
                          {getStatusBadge(applicationStatus)}
                        </SelectTrigger>
                        <SelectContent>
                          {applicationStatusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Add notes about this application (optional)"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(`/candidates/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !selectedJobId}
                  >
                    {isSubmitting ? "Adding..." : "Add to Job"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}