// src/pages/Candidates/CandidateComparison.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  UserCircle,
  Code2,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Briefcase,
  BarChart2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Spinner
} from '../../components/ui';
import JobSelectionControl from '../../components/job/JobSelectionControl';
import { getJobById } from '../../services/jobService';
import { getCandidateById } from '../../services/candidateService'; // Import for real API data

export default function CandidateComparison() {
  const location = useLocation();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(['overview', 'technical', 'softSkills', 'projects']);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobError, setJobError] = useState(null);
  const [jobMatchScores, setJobMatchScores] = useState({});

  useEffect(() => {
    // Extract candidate IDs and jobId from URL query params
    const searchParams = new URLSearchParams(location.search);
    // Don't convert to Number - keep as strings for MongoDB IDs
    const candidateIds = searchParams.get('ids')?.split(',') || [];
    const jobIdFromUrl = searchParams.get('jobId');

    if (candidateIds.length === 0) {
      navigate('/candidates');
      return;
    }

    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
    }

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch all candidates in parallel
        const candidatePromises = candidateIds.map(id => getCandidateById(id));
        const candidateResults = await Promise.all(candidatePromises);
        
        // Filter out any failed requests and extract the candidate data
        const fetchedCandidates = candidateResults
          .filter(result => result.success)
          .map(result => result.candidate);

        if (fetchedCandidates.length === 0) {
          setError('No candidates found with the provided IDs');
          return;
        }
        
        // If we have a job ID, calculate job match scores for each candidate
        if (jobIdFromUrl) {
          // In a real app, you would fetch this from your API
          // For now we'll create some mock data
          const scores = {};
          fetchedCandidates.forEach(candidate => {
            // Get candidate skills for comparison
            const skills = candidate.skills || [];
            const skillsSize = skills.length;
            const requiredSkillsMatch = Math.floor(Math.random() * (skillsSize + 1));
            const matchScore = Math.min(99, Math.round((requiredSkillsMatch / (skillsSize || 1)) * 100) + Math.floor(Math.random() * 30));
            
            scores[candidate._id] = {
              overall: matchScore,
              skillsMatch: requiredSkillsMatch,
              missingSkills: Math.max(0, skillsSize - requiredSkillsMatch),
              experienceRelevance: Math.min(99, 65 + Math.floor(Math.random() * 35)),
              communicationFit: Math.min(99, 60 + Math.floor(Math.random() * 40))
            };
          });
          setJobMatchScores(scores);
        }
        
        setCandidates(fetchedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError('Failed to fetch candidate data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [location.search, navigate]);

  // Effect to fetch job details when selectedJobId changes
  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetails(selectedJobId);
    } else {
      setJobData(null); // Clear job data if no job is selected
    }
  }, [selectedJobId]);

  // Function to fetch job details
  const fetchJobDetails = async (jobId) => {
    setIsLoadingJob(true);
    setJobError(null);
    try {
      const result = await getJobById(jobId);
      if (result.success) {
        setJobData(result.job);
        
        // Update job match scores for this specific job (simulation)
        const scores = {};
        candidates.forEach(candidate => {
          const skills = candidate.skills || [];
          const skillsSize = skills.length;
          const requiredSkillsMatch = Math.floor(Math.random() * (skillsSize + 1));
          const matchScore = Math.min(99, Math.round((requiredSkillsMatch / (skillsSize || 1)) * 100) + Math.floor(Math.random() * 30));
          
          scores[candidate._id] = {
            overall: matchScore,
            skillsMatch: requiredSkillsMatch,
            missingSkills: Math.max(0, skillsSize - requiredSkillsMatch),
            experienceRelevance: Math.min(99, 65 + Math.floor(Math.random() * 35)),
            communicationFit: Math.min(99, 60 + Math.floor(Math.random() * 40))
          };
        });
        setJobMatchScores(scores);
      } else {
        setJobError(result.error || 'Failed to fetch job details');
        setJobData(null);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setJobError('An unexpected error occurred while fetching job details');
      setJobData(null);
    } finally {
      setIsLoadingJob(false);
    }
  };

  // Handler for job selection
  const handleJobSelection = (jobIds) => {
    const newSelectedJobId = jobIds.length > 0 ? jobIds[0] : null;
    setSelectedJobId(newSelectedJobId);

    // Update URL
    const searchParams = new URLSearchParams(location.search);
    if (newSelectedJobId) {
      searchParams.set('jobId', newSelectedJobId);
    } else {
      searchParams.delete('jobId');
    }
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-primary-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper function to get candidate skills
  const getCandidateSkills = (candidate) => {
    if (!candidate) return [];
    
    // Get skills from different possible locations in the candidate model
    let allSkills = [];
    
    // Direct skills array
    if (candidate.skills && Array.isArray(candidate.skills)) {
      allSkills = [...allSkills, ...candidate.skills];
    }
    
    // From GitHub analysis
    if (candidate.github_analysis?.key_technologies) {
      allSkills = [...allSkills, ...candidate.github_analysis.key_technologies];
    }
    
    // From experience
    if (candidate.experience && Array.isArray(candidate.experience)) {
      candidate.experience.forEach(exp => {
        if (exp.technologies && Array.isArray(exp.technologies)) {
          allSkills = [...allSkills, ...exp.technologies];
        }
      });
    }
    
    // Remove duplicates
    return [...new Set(allSkills)];
  };

  // Helper to get current position
  const getCurrentPosition = (candidate) => {
    if (!candidate) return 'N/A';
    
    if (candidate.experience && candidate.experience.length > 0) {
      return candidate.experience[0].post || 'N/A';
    }
    
    return candidate.position || 'N/A'; // Fallback to position field if available
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (candidates.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No candidates selected for comparison</h3>
        <p className="mt-2 text-sm text-gray-500">Please select candidates from the candidates list to compare.</p>
        <div className="mt-6">
          <Button
            onClick={() => navigate('/candidates')}
            variant="primary"
          >
            Go to Candidates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Candidate Comparison"
        backButton={
          <Button
            onClick={() => navigate('/candidates')}
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back to Candidates
          </Button>
        }
      />

      {/* Job Selection Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-primary-600" />
                Compare For Job Position
              </h3>
              <p className="text-sm text-gray-600">Select a job to compare these candidates against specific requirements.</p>
            </div>
            <div className="w-full md:w-auto flex-1 md:max-w-sm">
              <JobSelectionControl
                onJobSelect={handleJobSelection}
                selectedJobIds={selectedJobId ? [selectedJobId] : []}
                maxSelections={1}
                label="Select a job"
                variant="compact"
              />
            </div>
          </div>

          {isLoadingJob && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Spinner size="sm" className="mr-2" />
              Loading job details...
            </div>
          )}

          {jobError && !isLoadingJob && (
            <Alert variant="error" className="mt-4">{jobError}</Alert>
          )}

          {jobData && !isLoadingJob && !jobError && (
            <div className="mt-4 p-3 bg-primary-50 rounded-md border border-primary-100">
              <h4 className="font-medium text-gray-800">{jobData.title}</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Required Skills:</h5>
                  {jobData.skills && jobData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {jobData.skills.map((skill, index) => (
                        <Badge key={index} variant="primary">{skill}</Badge>
                      ))}
                    </div>
                  ) : jobData.targetCandidateProfile?.keySkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {jobData.targetCandidateProfile.keySkills.map((skillObj, index) => (
                        <Badge key={index} variant="primary">{skillObj.name}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No specific skills listed.</p>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Experience Level:</h5>
                  <span className="text-sm text-gray-700">{jobData.experienceLevel || 'Any'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Comparison Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleCategory('overview')}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                selectedCategories.includes('overview')
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              <UserCircle
                className={cn(
                  '-ml-0.5 mr-1.5 h-4 w-4',
                  selectedCategories.includes('overview') ? 'text-primary-500' : 'text-gray-400'
                )}
              />
              Overview
            </button>
            <button
              onClick={() => toggleCategory('technical')}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                selectedCategories.includes('technical')
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              <Code2
                className={cn(
                  '-ml-0.5 mr-1.5 h-4 w-4',
                  selectedCategories.includes('technical') ? 'text-blue-400' : 'text-gray-400'
                )}
              />
              Technical Skills
            </button>
            <button
              onClick={() => toggleCategory('softSkills')}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                selectedCategories.includes('softSkills')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              <MessageSquare
                className={cn(
                  '-ml-0.5 mr-1.5 h-4 w-4',
                  selectedCategories.includes('softSkills') ? 'text-green-400' : 'text-gray-400'
                )}
              />
              Soft Skills
            </button>
            <button
              onClick={() => toggleCategory('projects')}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                selectedCategories.includes('projects')
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              <Star
                className={cn(
                  '-ml-0.5 mr-1.5 h-4 w-4',
                  selectedCategories.includes('projects') ? 'text-purple-400' : 'text-gray-400'
                )}
              />
              Project Quality
            </button>
            {selectedJobId && (
              <button
                onClick={() => toggleCategory('jobMatch')}
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                  selectedCategories.includes('jobMatch')
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                )}
              >
                <Briefcase
                  className={cn(
                    '-ml-0.5 mr-1.5 h-4 w-4',
                    selectedCategories.includes('jobMatch') ? 'text-amber-400' : 'text-gray-400'
                  )}
                />
                Job Match
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <Card className="mb-6">
          <div className="min-w-full divide-y divide-gray-200">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10">
                    Criteria
                  </th>
                  {candidates.map((candidate) => (
                    <th key={candidate._id} scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 flex-shrink-0 mb-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                            <UserCircle className="h-8 w-8 text-primary-600" aria-hidden="true" />
                          </div>
                        </div>
                        <Link to={`/candidates/${candidate._id}`} className="text-primary-600 hover:text-primary-800">
                          {candidate.name}
                        </Link>
                        <div className="text-gray-500 text-xs mt-1">{getCurrentPosition(candidate)}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Job Match Section - shown when a job is selected */}
                {selectedJobId && selectedCategories.includes('jobMatch') && (
                  <>
                    <tr className="bg-amber-50">
                      <th
                        colSpan={candidates.length + 1}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-amber-50 z-10"
                      >
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-amber-600 mr-2" />
                          Job Match Analysis
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Overall Job Match
                      </td>
                      {candidates.map((candidate) => (
                        <td key={`${candidate._id}-job-match`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-semibold">
                              {jobMatchScores[candidate._id]?.overall || "N/A"}
                            </span>
                            <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full ${getScoreColorClass(jobMatchScores[candidate._id]?.overall || 0)}`}
                                style={{ width: `${jobMatchScores[candidate._id]?.overall || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Skills Match
                      </td>
                      {candidates.map((candidate) => {
                        const skillsMatch = jobMatchScores[candidate._id]?.skillsMatch || 0;
                        const missingSkills = jobMatchScores[candidate._id]?.missingSkills || 0;
                        const totalSkills = skillsMatch + missingSkills;
                        
                        return (
                          <td key={`${candidate._id}-skills-match`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="success" className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {skillsMatch}
                                </Badge>
                                <Badge variant="danger" className="flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {missingSkills}
                                </Badge>
                              </div>
                              <div className="w-full flex h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(skillsMatch / Math.max(totalSkills, 1)) * 100}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${(missingSkills / Math.max(totalSkills, 1)) * 100}%` }}></div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Experience Relevance
                      </td>
                      {candidates.map((candidate) => (
                        <td key={`${candidate._id}-exp-relevance`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold">
                              {jobMatchScores[candidate._id]?.experienceRelevance || "N/A"}
                            </span>
                            <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full ${getScoreColorClass(jobMatchScores[candidate._id]?.experienceRelevance || 0)}`}
                                style={{ width: `${jobMatchScores[candidate._id]?.experienceRelevance || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Communication Fit
                      </td>
                      {candidates.map((candidate) => (
                        <td key={`${candidate._id}-comm-fit`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold">
                              {jobMatchScores[candidate._id]?.communicationFit || "N/A"}
                            </span>
                            <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full ${getScoreColorClass(jobMatchScores[candidate._id]?.communicationFit || 0)}`}
                                style={{ width: `${jobMatchScores[candidate._id]?.communicationFit || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* Overview Section */}
                {selectedCategories.includes('overview') && (
                  <>
                    <tr className="bg-gray-50">
                      <th
                        colSpan={candidates.length + 1}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10"
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-5 w-5 text-primary-500 mr-2" />
                          Overview
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Overall Score
                      </td>
                      {candidates.map((candidate) => {
                        // Get score from either assessments or ats_score
                        const score = candidate.assessments?.overallScore || 
                                     candidate.ats_score?.overall || 
                                     80; // Fallback score
                        
                        return (
                          <td key={`${candidate._id}-overall`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-semibold">{score}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${getScoreColorClass(score)}`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Location
                      </td>
                      {candidates.map((candidate) => (
                        <td key={`${candidate._id}-location`} className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {candidate.user_details?.location || candidate.location || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Experience
                      </td>
                      {candidates.map((candidate) => (
                        <td key={`${candidate._id}-experience`} className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {candidate.total_experience || candidate.experience || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        GitHub
                      </td>
                      {candidates.map((candidate) => {
                        const githubUsername = candidate.github_username || 
                                              candidate.githubProfile || 
                                              candidate.github;
                        
                        return (
                          <td key={`${candidate._id}-github`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            {githubUsername ? (
                              <a
                                href={`https://github.com/${githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-800"
                              >
                                {githubUsername}
                              </a>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* Technical Skills Section */}
                {selectedCategories.includes('technical') && (
                  <>
                    <tr className="bg-gray-50">
                      <th
                        colSpan={candidates.length + 1}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10"
                      >
                        <div className="flex items-center">
                          <Code2 className="h-5 w-5 text-blue-400 mr-2" />
                          Technical Skills
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Technical Score
                      </td>
                      {candidates.map((candidate) => {
                        // Get technical score from assessments or from github_analysis
                        const score = candidate.assessments?.technical?.score || 
                                     candidate.github_analysis?.repositories_quality || 
                                     80; // Fallback
                        
                        return (
                          <td key={`${candidate._id}-tech-score`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-semibold">{score}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10 align-top">
                        Tech Stack
                      </td>
                      {candidates.map((candidate) => {
                        // Get skills from helper function
                        const skills = getCandidateSkills(candidate);
                        
                        return (
                          <td key={`${candidate._id}-tech-stack`} className="px-3 py-4 text-sm text-center">
                            <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
                              {skills.length > 0 ? (
                                skills.map((tech, index) => (
                                  <Badge key={index} variant="primary">
                                    {tech}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500">No skills data available</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* If job is selected, highlight matching skills */}
                    {selectedJobId && jobData && (
                      <tr>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10 align-top">
                          Job Skill Match
                        </td>
                        {candidates.map((candidate) => {
                          // Get required skills from job data
                          const requiredSkills = jobData.skills || 
                                               (jobData.targetCandidateProfile?.keySkills?.map(s => s.name)) || 
                                               [];
                          
                          const candidateSkills = getCandidateSkills(candidate).map(s => s.toLowerCase());
                          
                          // Determine matches and gaps
                          const matchingSkills = requiredSkills.filter(skill => 
                            candidateSkills.includes(skill.toLowerCase())
                          );
                          const missingSkills = requiredSkills.filter(skill => 
                            !candidateSkills.includes(skill.toLowerCase())
                          );
                          
                          return (
                            <td key={`${candidate._id}-job-skills`} className="px-3 py-4 text-sm">
                              {requiredSkills.length > 0 ? (
                                <div className="space-y-2">
                                  {matchingSkills.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-green-700 mb-1 flex items-center justify-center">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Matching Skills
                                      </h5>
                                      <div className="flex flex-wrap justify-center gap-1">
                                        {matchingSkills.map((skill, i) => (
                                          <Badge key={i} variant="success">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {missingSkills.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-red-700 mb-1 flex items-center justify-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Missing Skills
                                      </h5>
                                      <div className="flex flex-wrap justify-center gap-1">
                                        {missingSkills.map((skill, i) => (
                                          <Badge key={i} variant="danger">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">No required skills specified</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </>
                )}

                {/* Soft Skills Section */}
                {selectedCategories.includes('softSkills') && (
                  <>
                    <tr className="bg-gray-50">
                      <th
                        colSpan={candidates.length + 1}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10"
                      >
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-green-400 mr-2" />
                          Soft Skills
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Soft Skills Score
                      </td>
                      {candidates.map((candidate) => {
                        // Calculate or get soft skills score
                        let softSkillsScore = 0;
                        
                        if (candidate.assessments?.softSkills) {
                          const scores = [
                            candidate.assessments.softSkills.communicationScore || 0,
                            candidate.assessments.softSkills.teamworkScore || 0,
                            candidate.assessments.softSkills.problemSolvingScore || 0
                          ].filter(score => score > 0);
                          
                          if (scores.length > 0) {
                            softSkillsScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                          }
                        }
                        
                        // Fallback score
                        if (softSkillsScore === 0) {
                          softSkillsScore = 75;
                        }
                        
                        return (
                          <td key={`${candidate._id}-soft-score`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-semibold">{softSkillsScore}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-green-500"
                                  style={{ width: `${softSkillsScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10 align-top">
                        Soft Skills
                      </td>
                      {candidates.map((candidate) => {
                        // Get soft skills from candidate model
                        let softSkills = [];
                        
                        // Try to get from skills.soft array
                        if (candidate.skills?.soft && Array.isArray(candidate.skills.soft)) {
                          softSkills = [...candidate.skills.soft];
                        }
                        
                        // If none found, add some default soft skills for display
                        if (softSkills.length === 0) {
                          softSkills = ['Communication', 'Teamwork', 'Problem Solving'];
                        }
                        
                        return (
                          <td key={`${candidate._id}-soft-skills`} className="px-3 py-4 text-sm text-center">
                             <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
                              {softSkills.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="success"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Communication Score
                      </td>
                      {candidates.map((candidate) => {
                        // Get communication score or use fallback
                        const communicationScore = candidate.assessments?.softSkills?.communicationScore || 75;
                        
                        return (
                          <td key={`${candidate._id}-communication`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-semibold">{communicationScore}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-yellow-500"
                                  style={{ width: `${communicationScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* Project Quality Section */}
                {selectedCategories.includes('projects') && (
                  <>
                    <tr className="bg-gray-50">
                      <th
                        colSpan={candidates.length + 1}
                        scope="colgroup"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10"
                      >
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-purple-400 mr-2" />
                          Project Quality
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Project Quality Score
                      </td>
                      {candidates.map((candidate) => {
                        // Get or calculate project quality score
                        let projectScore = 0;
                        
                        // Try to get from GitHub analysis
                        if (candidate.github_analysis) {
                          const scores = [
                            candidate.github_analysis.repositories_quality || 0,
                            candidate.github_analysis.code_consistency || 0,
                            candidate.github_analysis.project_complexity || 0
                          ].filter(score => score > 0);
                          
                          if (scores.length > 0) {
                            projectScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                          }
                        }
                        
                        // Use fallback if no score available
                        if (projectScore === 0) {
                          projectScore = 85;
                        }
                        
                        return (
                          <td key={`${candidate._id}-project-score`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-semibold">{projectScore}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-purple-500"
                                  style={{ width: `${projectScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Code Quality
                      </td>
                      {candidates.map((candidate) => {
                        // Get or calculate code quality score
                        const codeQuality = candidate.github_analysis?.code_consistency || 
                                          candidate.projectMetrics?.codeQuality || 
                                          80; // Fallback
                        
                        return (
                          <td key={`${candidate._id}-code-quality`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-semibold">{codeQuality}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${getScoreColorClass(codeQuality)}`}
                                  style={{ width: `${codeQuality}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                        Documentation
                      </td>
                      {candidates.map((candidate) => {
                        // Get documentation score
                        const documentation = candidate.github_analysis?.documentation || 
                                           candidate.projectMetrics?.documentation || 
                                           75; // Fallback
                        
                        return (
                          <td key={`${candidate._id}-documentation`} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-semibold">{documentation}</span>
                              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${getScoreColorClass(documentation)}`}
                                  style={{ width: `${documentation}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* Summary Section */}
                <tr className="bg-gray-50">
                  <th
                    colSpan={candidates.length + 1}
                    scope="colgroup"
                    className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky left-0 bg-gray-50 z-10"
                  >
                    Summary
                  </th>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                    Recommendation
                  </td>
                  {candidates.map((candidate) => {
                    // If a job is selected, use job match score for recommendation
                    // Otherwise use overall score
                    const scoreToUse = selectedJobId ? 
                      (jobMatchScores[candidate._id]?.overall || 0) : 
                      (candidate.assessments?.overallScore || candidate.ats_score?.overall || 80);
                    
                    return (
                      <td key={`${candidate._id}-recommendation`} className="px-3 py-4 text-sm text-center">
                        {scoreToUse >= 85 ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs sm:text-sm font-medium text-green-700">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-green-400" />
                            {selectedJobId ? "Excellent Match" : "Highly Recommended"}
                          </span>
                        ) : scoreToUse >= 75 ? (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs sm:text-sm font-medium text-yellow-700">
                            {selectedJobId ? "Good Match" : "Consider"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs sm:text-sm font-medium text-red-700">
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-red-400" />
                            {selectedJobId ? "Poor Match" : "Not Recommended"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Add candidate to job action if job is selected */}
                {selectedJobId && (
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 sticky left-0 bg-white z-10">
                      Actions
                    </td>
                    {candidates.map((candidate) => (
                      <td key={`${candidate._id}-actions`} className="px-3 py-4 text-sm text-center">
                        <Button
                          variant="primary"
                          size="sm"
                          to={`/candidates/${candidate._id}/jobs/add?jobId=${selectedJobId}`}
                        >
                          Add to Job
                        </Button>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}