// src/components/job/JobComparisonView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  BarChart2, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  Button,
  Alert,
  Spinner 
} from '../ui';
import JobSelectionControl from './JobSelectionControl';
import { getJobById } from '../../services/jobService';
import { matchResumeToJobs } from '../../services/resumeService';
import { cn } from '../../utils/cn';

export default function JobComparisonView({ 
  candidateData, 
  file = null,
  onJobSelected = null,
  existingMatches = [],
  showJobSelector = true,
}) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatchingJob, setIsMatchingJob] = useState(false);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('details'); // 'details' or 'summary'

  // Initialize with existing matches if available
  useEffect(() => {
    if (existingMatches && existingMatches.length > 0) {
      // Find the best match if no job is selected
      if (!selectedJobId) {
        const bestMatch = existingMatches.reduce((best, current) => 
          (current.match_score > best.match_score) ? current : best, existingMatches[0]);
        
        setMatchData(bestMatch);
        setSelectedJobId(bestMatch.job_id);
      } else {
        // Set match data for selected job if exists
        const matchForSelectedJob = existingMatches.find(match => match.job_id === selectedJobId);
        if (matchForSelectedJob) {
          setMatchData(matchForSelectedJob);
        }
      }
    }
  }, [existingMatches, selectedJobId]);

  // When a job is selected from the dropdown
  useEffect(() => {
    if (selectedJobs.length > 0 && selectedJobs[0] !== selectedJobId) {
      setSelectedJobId(selectedJobs[0]);
      fetchJobDetails(selectedJobs[0]);
    }
  }, [selectedJobs]);

  // When selectedJobId changes, fetch job details
  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetails(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobDetails = async (jobId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getJobById(jobId);
      
      if (result.success) {
        setJobData(result.job);
        
        // Check if we already have match data for this job
        const existingMatch = existingMatches.find(match => match.job_id === jobId);
        if (existingMatch) {
          setMatchData(existingMatch);
        } else {
          // If no match data, we need to calculate it
          await calculateJobMatch(jobId);
        }
      } else {
        setError(result.error || 'Failed to fetch job details');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('An unexpected error occurred while fetching job details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateJobMatch = async (jobId) => {
    if (!candidateData && !file) {
      setError('Candidate data or resume file is required for job matching');
      return;
    }
    
    setIsMatchingJob(true);
    setError(null);
    
    try {
      // Use the candidate resume text or uploaded file
      let result;
      
      if (file) {
        // If we have a file, use it for matching
        result = await matchResumeToJobs(file, null, [jobId]);
      } else {
        // If we have candidate data but no file, use the resume data for matching
        // This would usually require a different API endpoint that takes resume data directly
        result = await matchResumeToJobs(null, candidateData, [jobId]);
      }
      
      if (result.success && result.data?.job_matches?.length > 0) {
        const matchForJob = result.data.job_matches.find(match => match.job_id === jobId);
        if (matchForJob) {
          setMatchData(matchForJob);
        } else {
          setError('No match data found for the selected job');
        }
      } else {
        setError(result.error || 'Failed to match resume with job');
      }
    } catch (err) {
      console.error('Error matching job:', err);
      setError('An unexpected error occurred while matching the job');
    } finally {
      setIsMatchingJob(false);
    }
  };

  const handleJobSelection = (jobIds) => {
    if (jobIds.length > 0) {
      setSelectedJobs(jobIds);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-primary-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBorderColorClass = (score) => {
    if (score >= 90) return 'border-l-green-500';
    if (score >= 80) return 'border-l-primary-500';
    if (score >= 70) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  const getBackgroundColorClass = (score) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-primary-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const renderScoreBar = (score, label) => (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  const getBarColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-primary-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Handle job selection button
  const handleSelectJob = () => {
    if (onJobSelected && selectedJobId && matchData) {
      onJobSelected(selectedJobId, matchData);
    }
  };

  if (!showJobSelector && !selectedJobId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Job Selected</h3>
          <p className="text-gray-500">Select a job to view the comparison details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Job Selection Control */}
      {showJobSelector && (
        <div className="mb-4">
          <JobSelectionControl
            onJobSelect={handleJobSelection}
            selectedJobIds={selectedJobs}
            maxSelections={1}
            label="Select a job to compare"
          />
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isMatchingJob) && (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" className="mr-3" />
              <div>
                <p className="font-medium text-gray-700">
                  {isLoading ? 'Loading job details...' : 'Calculating job match...'}
                </p>
                <p className="text-sm text-gray-500">This may take a moment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Comparison Result */}
      {!isLoading && !isMatchingJob && matchData && jobData && (
        <Card className={cn("overflow-hidden border-l-4 mb-4", getBorderColorClass(matchData.match_score))}>
          <CardHeader className={cn("py-3 px-4", getBackgroundColorClass(matchData.match_score))}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
                  {jobData.title}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Job ID: {jobData._id || jobData.job_id}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-2xl font-bold ${getScoreColorClass(matchData.match_score)}`}>
                  {matchData.match_score}
                </div>
                <div className="text-sm text-gray-500">Match Score</div>
              </div>
            </div>
            
            {/* Toggle between summary and detailed view */}
            <div className="flex mt-2 border-t pt-2">
              <button
                onClick={() => setComparisonMode('summary')}
                className={cn(
                  "text-sm px-3 py-1 rounded-l-md",
                  comparisonMode === 'summary' 
                    ? 'bg-white text-gray-800 font-medium'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                Summary
              </button>
              <button
                onClick={() => setComparisonMode('details')}
                className={cn(
                  "text-sm px-3 py-1 rounded-r-md",
                  comparisonMode === 'details' 
                    ? 'bg-white text-gray-800 font-medium'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                Details
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            {comparisonMode === 'summary' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <div className="font-medium">Overall Match</div>
                  <div className={`font-bold ${getScoreColorClass(matchData.match_score)}`}>
                    {matchData.match_score}%
                  </div>
                </div>
                
                {matchData.experience_relevance && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div className="font-medium">Experience Relevance</div>
                    <div className={`font-bold ${getScoreColorClass(matchData.experience_relevance)}`}>
                      {matchData.experience_relevance}%
                    </div>
                  </div>
                )}
                
                {matchData.qualification_fit && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div className="font-medium">Qualification Fit</div>
                    <div className={`font-bold ${getScoreColorClass(matchData.qualification_fit)}`}>
                      {matchData.qualification_fit}%
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <div className="font-medium">Skills Match</div>
                  <div>
                    <span className="font-bold text-green-600">{matchData.matching_skills?.length || 0}</span>
                    <span className="text-gray-500 mx-1">matching,</span>
                    <span className="font-bold text-red-600">{matchData.missing_skills?.length || 0}</span>
                    <span className="text-gray-500">missing</span>
                  </div>
                </div>
                
                {matchData.overall_recommendation && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                    <p className="text-sm text-gray-600">{matchData.overall_recommendation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {matchData.matching_skills && matchData.matching_skills.length > 0 ? (
                        matchData.matching_skills.map((skill, i) => (
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
                      {matchData.missing_skills && matchData.missing_skills.length > 0 ? (
                        matchData.missing_skills.map((skill, i) => (
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
                
                {/* Score Breakdown */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <BarChart2 className="h-4 w-4 text-primary-500 mr-1" />
                    Score Breakdown
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchData.experience_relevance !== undefined && (
                      <div>
                        {renderScoreBar(matchData.experience_relevance, "Experience Relevance")}
                      </div>
                    )}
                    
                    {matchData.qualification_fit !== undefined && (
                      <div>
                        {renderScoreBar(matchData.qualification_fit, "Qualification Fit")}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Job Requirements */}
                {jobData.requirements && jobData.requirements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Job Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {jobData.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Recommendation */}
                {matchData.overall_recommendation && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                    <p className="text-sm text-gray-600">{matchData.overall_recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          {onJobSelected && (
            <CardFooter className="py-3 px-4 bg-gray-50 border-t flex justify-end">
              <Button 
                variant="primary"
                size="sm"
                onClick={handleSelectJob}
                leftIcon={<ArrowRight className="h-4 w-4" />}
              >
                Select This Job
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}