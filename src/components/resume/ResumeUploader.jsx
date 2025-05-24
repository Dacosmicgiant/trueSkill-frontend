// src/components/resume/ResumeUploader.jsx
import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  Check,
  Github,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Code,
  Award,
  Book,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Briefcase as BriefcaseIcon,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Alert,
  Badge,
  Spinner,
} from '../ui';
import JobSelectionControl from '../job/JobSelectionControl';
import { cn } from '../../utils/cn';
import { parseResume, analyzeGitHubRepositories, matchResumeToJobs } from '../../services/resumeService';

export default function ResumeUploader({ onParsed, onAddToJob, disableJobMatching = false }) {
  // File upload states
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  // GitHub analysis states
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [githubError, setGithubError] = useState(null);
  const [expandedRepo, setExpandedRepo] = useState(null);

  // Job matching states
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isMatchingJobs, setIsMatchingJobs] = useState(false);
  const [jobMatches, setJobMatches] = useState([]);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadError(null);
      setResumeData(null);
      setGithubData(null);
      setGithubError(null);
      setJobMatches([]);
    }
  };

  const handleJobSelection = (jobIds) => {
    setSelectedJobs(jobIds);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setJobMatches([]);

    try {
      const jobIds = selectedJobs.length > 0 ? selectedJobs : null;
      const result = await parseResume(file, jobIds);
      if (result.success && result.data) {
        const parsedData = result.data;
        setResumeData(parsedData);
        if (parsedData.job_matches && parsedData.job_matches.length > 0) {
          setJobMatches(parsedData.job_matches);
        }
        if (parsedData.github_username) {
          await analyzeGithub(parsedData.github_username);
        }
        if (onParsed) {
          onParsed(parsedData);
        }
      } else {
        setUploadError(result.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMatchJobs = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsMatchingJobs(true);
    setUploadError(null);

    try {
      const jobIds = selectedJobs.length > 0 ? selectedJobs : null;
      const result = await matchResumeToJobs(file, null, jobIds);
      if (result.success && result.data) {
        if (result.data.job_matches && result.data.job_matches.length > 0) {
          setJobMatches(result.data.job_matches);
        } else {
          setJobMatches([]);
          setUploadError('No job matches found. Try selecting different jobs or updating the resume.');
        }
      } else {
        setUploadError(result.error || 'Failed to match resume to jobs');
      }
    } catch (error) {
      console.error('Job matching error:', error);
      setUploadError('An unexpected error occurred during job matching. Please try again.');
    } finally {
      setIsMatchingJobs(false);
    }
  };

  const analyzeGithub = async (username) => {
    if (!username) {
      setGithubError('GitHub username is required');
      return;
    }

    setIsAnalyzingGithub(true);
    setGithubError(null);

    try {
      const result = await analyzeGitHubRepositories(username);
      if (result.success) {
        setGithubData(result.data);
        if (resumeData && result.data.github_analysis) {
          setResumeData((prev) => ({
            ...prev,
            github_analysis: { ...prev.github_analysis, ...result.data.github_analysis },
            repos: result.data.repositories_analyzed,
          }));
          if (onParsed) {
            onParsed({
              ...resumeData,
              github_analysis: { ...resumeData.github_analysis, ...result.data.github_analysis },
              repos: result.data.repositories_analyzed,
            });
          }
        }
      } else {
        setGithubError(result.error || 'Failed to analyze GitHub repositories');
      }
    } catch (error) {
      console.error('GitHub analysis error:', error);
      setGithubError('An unexpected error occurred while analyzing GitHub repositories');
    } finally {
      setIsAnalyzingGithub(false);
    }
  };

  const toggleRepository = (repoId) => {
    setExpandedRepo(expandedRepo === repoId ? null : repoId);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const renderScoreBar = (score, label, maxWidth = 'w-full') => (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{score}/100</span>
      </div>
      <div className={`h-2 ${maxWidth} rounded-full bg-gray-200`}>
        <div
          className={`h-2 rounded-full ${getScoreColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleAddToJob = (jobId) => {
    if (!onAddToJob || !resumeData) return;
    const selectedMatch = jobMatches.find((match) => match.job_id === jobId);
    if (selectedMatch) {
      onAddToJob(resumeData, jobId);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            {!disableJobMatching && (
              <JobSelectionControl
                onJobSelect={handleJobSelection}
                selectedJobIds={selectedJobs}
                label="Match against job postings"
              />
            )}

            {uploadError && (
              <Alert variant="error" className="mt-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                {uploadError}
              </Alert>
            )}

            <div className="flex justify-end space-x-3">
              {selectedJobs.length > 0 && resumeData && (
                <Button
                  onClick={handleMatchJobs}
                  variant="secondary"
                  disabled={isMatchingJobs || !file}
                  isLoading={isMatchingJobs}
                >
                  {isMatchingJobs ? 'Matching...' : 'Match Selected Jobs'}
                </Button>
              )}
              <Button
                onClick={handleUpload}
                variant="primary"
                disabled={isUploading || !file}
                isLoading={isUploading}
              >
                {isUploading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Resume Info Preview */}
          {resumeData && !isUploading && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">{resumeData.name}</h3>
                  <p className="text-sm text-gray-500">
                    Resume uploaded successfully
                    <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {resumeData.user_details?.email && (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {resumeData.user_details.email}
                    </div>
                  )}
                  {resumeData.user_details?.phone && (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {resumeData.user_details.phone}
                    </div>
                  )}
                  {resumeData.user_details?.location && (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {resumeData.user_details.location}
                    </div>
                  )}
                </div>
                <div>
                  {resumeData.github_username && (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Github className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={`https://github.com/${resumeData.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {resumeData.github_username}
                      </a>
                      {!isAnalyzingGithub && !githubData && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => analyzeGithub(resumeData.github_username)}
                          className="ml-2"
                        >
                          Analyze
                        </Button>
                      )}
                      {isAnalyzingGithub && <Spinner size="xs" className="ml-2" />}
                    </div>
                  )}
                  {resumeData.total_experience && (
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      Experience: {resumeData.total_experience}
                    </div>
                  )}
                  {resumeData.ats_score?.overall !== undefined && (
                    <div className="flex items-center text-sm text-gray-700">
                      <BarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                      ATS Score: {resumeData.ats_score.overall}/100
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              {resumeData.user_details?.education?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Book className="h-5 w-5 mr-2 text-gray-400" />
                    Education
                  </h4>
                  <div className="space-y-2">
                    {resumeData.user_details.education.map((edu, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        <p className="font-medium">{edu.degree}</p>
                        <p>{edu.institution}</p>
                        <p className="text-gray-500">{formatDate(edu.graduation_date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Section */}
              {resumeData.user_details?.certifications?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gray-400" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.user_details.certifications.map((cert, index) => (
                      <Badge key={index} variant="success">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      {resumeData?.experience?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-md font-medium text-gray-900">{exp.post}</h4>
                  <p className="text-sm text-gray-700">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.time_period}</p>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700">Responsibilities:</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700">Technologies:</h5>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Matches Section */}
      {jobMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-500" />
              Job Match Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobMatches.sort((a, b) => b.match_score - a.match_score).map((match, index) => (
                <Card
                  key={index}
                  className={cn(
                    'overflow-hidden border-l-4',
                    match.match_score >= 90 ? 'border-l-green-500' :
                    match.match_score >= 80 ? 'border-l-blue-500' :
                    match.match_score >= 70 ? 'border-l-yellow-500' :
                    'border-l-red-500'
                  )}
                >
                  <CardHeader className="py-3 px-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{match.job_title}</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">Job ID: {match.job_id}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold mr-2">{match.match_score}</div>
                        <div className="text-sm text-gray-500">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Matching Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.matching_skills && match.matching_skills.length > 0 ? (
                            match.matching_skills.map((skill, i) => (
                              <Badge key={i} variant="success">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No matching skills found</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.missing_skills && match.missing_skills.length > 0 ? (
                            match.missing_skills.map((skill, i) => (
                              <Badge key={i} variant="danger">
                                <AlertTriangle className="h-3 w-3 mr-1" /> {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No missing critical skills</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {match.experience_relevance !== undefined && (
                        <div>{renderScoreBar(match.experience_relevance, 'Experience Relevance')}</div>
                      )}
                      {match.qualification_fit !== undefined && (
                        <div>{renderScoreBar(match.qualification_fit, 'Qualification Fit')}</div>
                      )}
                    </div>
                    {match.overall_recommendation && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                        <p className="text-sm text-gray-600">{match.overall_recommendation}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="py-2 px-4 bg-gray-50 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddToJob(match.job_id)}
                    >
                      Add to This Job
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ATS Score Analysis */}
      {resumeData && (
        <Card>
          <CardHeader>
            <CardTitle>ATS Score Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-medium text-gray-900">Overall ATS Score</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {resumeData.ats_score?.overall || 0}/100
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 mb-4">
                  <div
                    className={`h-3 rounded-full ${getScoreColorClass(resumeData.ats_score?.overall || 0)}`}
                    style={{ width: `${resumeData.ats_score?.overall || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium mb-3">Score Breakdown</h4>
                {renderScoreBar(resumeData.ats_score?.keyword_match || 0, 'Keyword Match')}
                {renderScoreBar(resumeData.ats_score?.formatting || 0, 'Resume Format')}
                {renderScoreBar(resumeData.ats_score?.experience_match || 0, 'Experience Match')}
              </div>
              <div>
                <h4 className="text-md font-medium mb-3">Improvement Suggestions</h4>
                {resumeData.ats_score?.improvement_suggestions?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {resumeData.ats_score.improvement_suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No improvement suggestions</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gap Analysis */}
      {resumeData?.skill_gap_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium mb-3">Missing Critical Skills</h4>
                {resumeData.skill_gap_analysis.missing_critical_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skill_gap_analysis.missing_critical_skills.map((skill, index) => (
                      <Badge key={index} variant="danger">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No missing critical skills</p>
                )}
              </div>
              <div>
                <h4 className="text-md font-medium mb-3">Suggested Improvements</h4>
                {resumeData.skill_gap_analysis.suggested_improvements?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {resumeData.skill_gap_analysis.suggested_improvements.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No improvement suggestions</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Repository Analysis */}
      {resumeData?.github_username && (githubData || resumeData.repos) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Github className="h-5 w-5 mr-2" />
              GitHub Repository Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {githubError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4 mr-2" />
                {githubError}
              </Alert>
            )}
            {isAnalyzingGithub && (
              <div className="flex flex-col items-center justify-center py-10">
                <Spinner size="lg" />
                <p className="mt-4 text-sm text-gray-600">Analyzing GitHub repositories...</p>
                <p className="text-xs text-gray-500">This may take a few minutes</p>
              </div>
            )}
            {(githubData?.github_analysis || resumeData.github_analysis) && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-md font-medium">Username:</h3>
                  <a
                    href={`https://github.com/${resumeData.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {resumeData.github_username}
                    <svg
                      className="h-4 w-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-md font-medium mb-3">GitHub Analysis Scores</h3>
                  </div>
                  <div>
                    {renderScoreBar(
                      resumeData.github_analysis?.repositories_quality || 0,
                      'Repository Quality'
                    )}
                    {renderScoreBar(resumeData.github_analysis?.code_consistency || 0, 'Code Consistency')}
                    {renderScoreBar(resumeData.github_analysis?.project_complexity || 0, 'Project Complexity')}
                  </div>
                  <div>
                    {renderScoreBar(resumeData.github_analysis?.documentation || 0, 'Documentation')}
                    {renderScoreBar(resumeData.github_analysis?.activity_frequency || 0, 'Activity Frequency')}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {resumeData.github_analysis?.key_technologies?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.github_analysis.key_technologies.map((tech, index) => (
                          <Badge key={index} variant="primary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.github_analysis?.expertise_areas?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.github_analysis.expertise_areas.map((area, index) => (
                          <Badge key={index} variant="success">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {resumeData.repos?.repositories_analyzed?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-3">Repositories</h3>
                    <div className="space-y-2">
                      {resumeData.repos.repositories_analyzed.map((repo, index) => (
                        <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                          <div
                            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleRepository(index)}
                          >
                            <div className="flex items-center">
                              <div className="mr-2">
                                {expandedRepo === index ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <span className="font-medium text-gray-800">{repo.repo_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">{repo.analysis?.tech_stack_analysis?.backend?.languages?.[0] || 'Unknown'}</Badge>
                            </div>
                          </div>
                          {expandedRepo === index && (
                            <div className="p-3 border-t border-gray-200">
                              {repo.analysis?.readme_abstract && (
                                <div className="mb-3">
                                  <h5 className="text-xs font-medium text-gray-600 mb-1">Description:</h5>
                                  <p className="text-sm text-gray-700">{repo.analysis.readme_abstract}</p>
                                </div>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {repo.analysis?.tech_stack_analysis && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-600 mb-1">Tech Stack:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        ...(repo.analysis.tech_stack_analysis.backend?.frameworks || []),
                                        ...(repo.analysis.tech_stack_analysis.frontend?.frameworks || []),
                                        ...(repo.analysis.tech_stack_analysis.other?.utilities || []),
                                      ].map((tech, idx) => (
                                        <Badge key={idx} variant="secondary">{tech}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {repo.analysis?.syft_analysis && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-600 mb-1">Packages:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        ...(repo.analysis.syft_analysis.python || []),
                                        ...(repo.analysis.syft_analysis.npm || []),
                                      ].map((pkg, idx) => (
                                        <Badge key={idx} variant="outline">{pkg.name} ({pkg.version})</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 pt-2 border-t border-gray-100">
                                <a
                                  href={repo.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center"
                                >
                                  View on GitHub
                                  <svg
                                    className="h-3 w-3 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    ></path>
                                  </svg>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}