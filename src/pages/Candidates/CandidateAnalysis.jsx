import CandidateScorecard from '../../components/candidates/CandidateScorecard';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import {
  User, Code2, Terminal, MessageSquare, Star, ChevronLeft, ExternalLink, Github, Linkedin,
  MapPin, Briefcase, CheckCircle, Mail, Phone, AlertCircle, Layers, BookOpen, Box, MessageCircle, 
  BarChartHorizontal, Link as LinkIcon
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JobMatchSummary from '../../components/job/JobMatchSummary';
import { cn } from '../../utils/cn';
import {
  Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, PageHeader, Alert, Spinner
} from '../../components/ui';
import { get, post as apiPost } from '../../services/api';

export default function CandidateAnalysis() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [error, setError] = useState(null);
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false);
  const [githubAnalysisTriggerData, setGithubAnalysisTriggerData] = useState(null);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!id) {
        setError("Candidate ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching candidate with ID: ${id}`);
        const data = await get(`/candidates/${id}`);
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError(err.message || 'Failed to load candidate data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [id]);

  const handleAnalyzeGitHub = async () => {
    if (!candidate?._id) {
      setError('Candidate data not loaded or missing ID for GitHub analysis.');
      return;
    }

    setIsAnalyzingGithub(true);
    setError(null);
    setGithubAnalysisTriggerData(null);
    try {
      const analysisResponse = await apiPost(`/candidates/${candidate._id}/analyze-github`);
      setGithubAnalysisTriggerData(analysisResponse);
    } catch (err) {
      console.error('GitHub analysis error:', err);
      setError(err.message || 'Failed to trigger GitHub repositories analysis.');
    } finally {
      setIsAnalyzingGithub(false);
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-300';
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-primary-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderScoreBar = (score, label, maxScore = 100) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{score ?? 'N/A'}{score !== null && score !== undefined ? `/${maxScore}` : ''}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${score !== null && score !== undefined ? (score / maxScore * 100) : 0}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
        <p className="ml-4 text-lg">Loading candidate details...</p>
      </div>
    );
  }

  if (error && !candidate) {
    return <Alert variant="error" className="m-4">{error}</Alert>;
  }

  if (!candidate) {
    return <Alert variant="info" className="m-4">Candidate not found or ID is invalid.</Alert>;
  }

  const currentPosition = candidate.experience?.[0]?.post || candidate.overall_assessment?.split('\n')[0] || 'N/A';

  return (
    <div>
      <PageHeader
        title={candidate.name || 'Candidate Details'}
        description={currentPosition !== 'N/A' ? `Role: ${currentPosition}` : 'Analysis Page'}
        backButton={
          <Button variant="ghost" size="sm" to="/candidates">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Candidates
          </Button>
        }
        actions={
          <div className="flex space-x-2">
            <Button variant="secondary" size="md" to={`/candidates/compare?ids=${candidate._id}`}>
              Compare
            </Button>
            <Button
              variant="outline"
              size="sm"
              to="/shareable-discussions"
              leftIcon={<LinkIcon className="h-4 w-4" />}
            >
              Create Shareable Link
            </Button>
            <Button
              variant="primary"
              size="sm"
              to={`/candidates/${id}/discussion`}
              leftIcon={<MessageCircle className="h-4 w-4" />}
            >
              Start Group Discussion
            </Button>
            <Button variant="primary" size="md" onClick={() => console.log("Move to Interview action for:", candidate._id)}>
              Move to Interview
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error" className="mb-6 mx-4">{error}</Alert>}

      {candidate && <div className="mx-4 my-6"><CandidateScorecard candidate={candidate} /></div>}

      {candidate.applications && candidate.applications.length > 0 && (
        <div className="mt-6 mx-4">
          <JobMatchSummary applications={candidate.applications} candidateId={candidate._id} />
        </div>
      )}

      {isAnalyzingGithub && (
        <Alert variant="info" className="my-6 mx-4">
          <Spinner size="sm" className="mr-2" />
          Analyzing GitHub repositories...
        </Alert>
      )}

      {githubAnalysisTriggerData && !isAnalyzingGithub && (
        <Alert
          variant={githubAnalysisTriggerData.success ? "success" : "error"}
          className="my-6 mx-4"
        >
          {githubAnalysisTriggerData.success ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {githubAnalysisTriggerData.message}
        </Alert>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 px-4 pb-8">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <CardTitle>{candidate.name}</CardTitle>
                  <p className="text-sm text-gray-500">{currentPosition}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {renderScoreBar(candidate.assessments?.overallScore ?? candidate.ats_score?.overall, "Overall Score")}

                {candidate.user_details?.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm text-gray-700">{candidate.user_details.email}</span>
                  </div>
                )}
                {candidate.user_details?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm text-gray-700">{candidate.user_details.phone}</span>
                  </div>
                )}
                {candidate.user_details?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm text-gray-700">{candidate.user_details.location}</span>
                  </div>
                )}
                {candidate.total_experience && (
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm text-gray-700">{candidate.total_experience} total</span>
                  </div>
                )}
                {candidate.githubProfile && (
                  <div className="flex items-center">
                    <Github className="h-5 w-5 text-gray-400" />
                    <a
                      href={candidate.githubProfile.startsWith('http') ? candidate.githubProfile : `https://github.com/${candidate.githubProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      {candidate.github_username || candidate.githubProfile.split('/').pop()}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    {(candidate.github_username || candidate.githubProfile) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={handleAnalyzeGitHub}
                        disabled={isAnalyzingGithub}
                      >
                        {isAnalyzingGithub ? <Spinner size="xs" className="mr-1" /> : null}
                        Analyze GitHub
                      </Button>
                    )}
                  </div>
                )}
                {candidate.linkedinProfile && (
                  <div className="flex items-center">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                    <a
                      href={candidate.linkedinProfile.startsWith('http') ? candidate.linkedinProfile : `https://linkedin.com/in/${candidate.linkedinProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      {candidate.linkedinProfile.split('/').pop()}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={`${skill}-${index}`} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">No skills listed.</p>}
            </CardContent>
          </Card>

          {(candidate.ats_score || candidate.assessments) && (
            <Card>
              <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {candidate.ats_score?.overall !== undefined && renderScoreBar(candidate.ats_score.overall, "ATS Overall")}
                {candidate.ats_score?.keyword_match !== undefined && renderScoreBar(candidate.ats_score.keyword_match, "ATS Keyword Match")}
                {candidate.ats_score?.experience_match !== undefined && renderScoreBar(candidate.ats_score.experience_match, "ATS Experience Match")}
                {candidate.assessments?.technical?.score !== undefined && renderScoreBar(candidate.assessments.technical.score, "Technical Assessment")}
                {candidate.assessments?.softSkills?.communicationScore !== undefined && renderScoreBar(candidate.assessments.softSkills.communicationScore, "Communication (Soft Skills)")}
                {candidate.assessments?.softSkills?.teamworkScore !== undefined && renderScoreBar(candidate.assessments.softSkills.teamworkScore, "Teamwork (Soft Skills)")}
                {candidate.assessments?.softSkills?.problemSolvingScore !== undefined && renderScoreBar(candidate.assessments.softSkills.problemSolvingScore, "Problem Solving (Soft Skills)")}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content with Tabs */}
        <div className="lg:col-span-2">
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <Card>
              <CardHeader className="pb-0 border-b">
                <Tabs.List className="flex space-x-1">
                  <Tabs.Trigger value="code" className={cn('flex items-center px-3 py-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'code' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
                    <Code2 className="h-5 w-5 mr-2" /> GitHub & Repos
                  </Tabs.Trigger>
                  <Tabs.Trigger value="experience" className={cn('flex items-center px-3 py-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'experience' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
                    <Briefcase className="h-5 w-5 mr-2" /> Experience & Education
                  </Tabs.Trigger>
                  <Tabs.Trigger value="assessments" className={cn('flex items-center px-3 py-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'assessments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
                    <Terminal className="h-5 w-5 mr-2" /> Assessments
                  </Tabs.Trigger>
                </Tabs.List>
              </CardHeader>

              <CardContent className="pt-0">
                {/* GitHub Analysis & Repos Panel */}
                <Tabs.Content value="code" className="p-6 outline-none focus:ring-0">
                  {candidate.github_analysis && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Github className="h-5 w-5 mr-2"/> Overall GitHub Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderScoreBar(candidate.github_analysis.repositories_quality, "Repositories Quality")}
                        {renderScoreBar(candidate.github_analysis.code_consistency, "Code Consistency")}
                        {renderScoreBar(candidate.github_analysis.project_complexity, "Project Complexity")}
                        {renderScoreBar(candidate.github_analysis.activity_frequency, "Activity Frequency")}
                        {renderScoreBar(candidate.github_analysis.documentation, "Documentation")}
                        {candidate.github_analysis.expertise_areas?.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Expertise Areas:</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.github_analysis.expertise_areas.map(area => <Badge key={area} variant="outline">{area}</Badge>)}
                            </div>
                          </div>
                        )}
                        {candidate.github_analysis.key_technologies?.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Key Technologies:</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.github_analysis.key_technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analyzed Repositories</h3>
                  {candidate.repos?.repositories_analyzed && candidate.repos.repositories_analyzed.length > 0 ? (
                    <div className="space-y-6">
                      {candidate.repos.repositories_analyzed.map((repo, index) => (
                        <Card key={repo.repo_name || index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle>{repo.repo_name || 'Unnamed Repository'}</CardTitle>
                            {repo.analysis?.readme_abstract && <p className="text-sm text-gray-500 mt-1 truncate">{repo.analysis.readme_abstract}</p>}
                            <p className="text-xs text-gray-400">Status: {repo.status || 'N/A'}</p>
                          </CardHeader>
                          <CardContent>
                            {repo.analysis?.tech_stack_analysis && Object.keys(repo.analysis.tech_stack_analysis).length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center"><Layers className="h-4 w-4 mr-1" /> Tech Stack</h5>
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(repo.analysis.tech_stack_analysis, null, 2)}
                                </pre>
                              </div>
                            )}
                            {repo.analysis?.syft_analysis && (Object.values(repo.analysis.syft_analysis).some(arr => arr.length > 0)) && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center"><Box className="h-4 w-4 mr-1" /> Packages</h5>
                                {Object.entries(repo.analysis.syft_analysis).map(([pkgManager, pkgs]) => (
                                  pkgs.length > 0 && (
                                    <div key={pkgManager} className="mb-1">
                                      <strong className="capitalize text-xs">{pkgManager}:</strong>
                                      <span className="text-xs text-gray-600 ml-1">
                                        {pkgs.map(p => `${p.name}${p.version ? '@'+p.version : ''}`).join(', ')}
                                      </span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            {repo.analysis?.readme_findings && (Object.values(repo.analysis.readme_findings).some(arr => arr.length > 0)) && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center"><BookOpen className="h-4 w-4 mr-1" /> Readme Findings</h5>
                                {Object.entries(repo.analysis.readme_findings).map(([category, items]) => (
                                  items.length > 0 && (
                                    <div key={category} className="mb-1">
                                      <strong className="capitalize text-xs">{category}:</strong>
                                      <span className="text-xs text-gray-600 ml-1">{items.join(', ')}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </CardContent>
                          {repo.repo_url && (
                            <CardFooter className="border-t bg-gray-50">
                              <a href={repo.repo_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center">
                                View Repository <ExternalLink className="h-4 w-4 ml-1" />
                              </a>
                            </CardFooter>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No repositories analyzed or data available.</p>
                  )}
                </Tabs.Content>

                {/* Experience & Education Panel */}
                <Tabs.Content value="experience" className="p-6 outline-none focus:ring-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Work Experience</h3>
                  {candidate.experience && candidate.experience.length > 0 ? (
                    <div className="space-y-6">
                      {candidate.experience.map((exp, index) => (
                        <Card key={`exp-${index}`}>
                          <CardHeader>
                            <CardTitle className="text-md">{exp.post} @ {exp.company}</CardTitle>
                            <p className="text-sm text-gray-500">{exp.time_period}</p>
                          </CardHeader>
                          <CardContent>
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                              <>
                                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Responsibilities:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {exp.responsibilities.map((resp, rIndex) => <li key={rIndex}>{resp}</li>)}
                                </ul>
                              </>
                            )}
                            {exp.technologies && exp.technologies.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Technologies:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {exp.technologies.map((tech, tIndex) => <Badge key={tIndex} variant="outline">{tech}</Badge>)}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No work experience listed.</p>}

                  <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Education</h3>
                  {candidate.user_details?.education && candidate.user_details.education.length > 0 ? (
                    <div className="space-y-4">
                      {candidate.user_details.education.map((edu, index) => (
                        <Card key={`edu-${index}`}>
                          <CardHeader>
                            <CardTitle className="text-md">{edu.degree}</CardTitle>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            {edu.graduation_date && <p className="text-xs text-gray-400">Graduated: {edu.graduation_date}</p>}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No education details listed.</p>}

                  {candidate.user_details?.certifications && candidate.user_details.certifications.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.user_details.certifications.map((cert, index) => (
                          <Badge key={`cert-${index}`} variant="success">{cert}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </Tabs.Content>

                {/* Assessments Panel */}
                <Tabs.Content value="assessments" className="p-6 outline-none focus:ring-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Assessment Responses</h3>
                  {candidate.assessments?.technical?.questionResponses && candidate.assessments.technical.questionResponses.length > 0 ? (
                    <div className="space-y-6">
                      {candidate.assessments.technical.questionResponses.map((item, index) => (
                        <Card key={index}>
                          <CardHeader><CardTitle className="text-md">{item.question}</CardTitle></CardHeader>
                          <CardContent><p className="text-gray-600">{item.answer || 'No answer provided.'}</p></CardContent>
                          {item.score !== undefined && (
                            <CardFooter className="border-t bg-gray-50 flex justify-between items-center">
                              <span className="text-sm text-gray-500">Score</span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700 mr-2">{item.score}/100</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.round(item.score / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </CardFooter>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No technical assessment questions or responses available.</p>
                  )}
                  {candidate.overall_assessment && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Parsed Assessment</h3>
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-blue-700 whitespace-pre-wrap">{candidate.overall_assessment}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {candidate.skill_gap_analysis && (candidate.skill_gap_analysis.missing_critical_skills?.length > 0 || candidate.skill_gap_analysis.suggested_improvements?.length > 0) && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Skill Gap Analysis</h3>
                      <Card>
                        <CardContent className="p-4">
                          {candidate.skill_gap_analysis.missing_critical_skills?.length > 0 && (
                            <>
                              <h4 className="text-sm font-semibold text-destructive mb-1">Missing Critical Skills:</h4>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {candidate.skill_gap_analysis.missing_critical_skills.map((skill, idx) => <Badge key={`miss-${idx}`} variant="destructive">{skill}</Badge>)}
                              </div>
                            </>
                          )}
                          {candidate.skill_gap_analysis.suggested_improvements?.length > 0 && (
                            <>
                              <h4 className="text-sm font-semibold text-yellow-700 mb-1">Suggested Improvements:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {candidate.skill_gap_analysis.suggested_improvements.map((sugg, idx) => <li key={`sugg-${idx}`}>{sugg}</li>)}
                              </ul>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Tabs.Content>
              </CardContent>
            </Card>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}