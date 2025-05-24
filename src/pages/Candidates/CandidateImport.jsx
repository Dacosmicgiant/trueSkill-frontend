// src/pages/Candidates/CandidateImport.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Github,
  BarChart2,
  Info,
  Briefcase,
  Code,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Alert,
  Badge,
  Spinner,
} from '../../components/ui';
import ResumeUploader from '../../components/resume/ResumeUploader';
import JobComparisonView from '../../components/job/JobComparisonView';
import { createCandidate } from '../../services/candidateService';

export default function CandidateImport() {
  const [resumeData, setResumeData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null); // Keep track of file if needed for re-upload/linking, though createCandidate primarily uses parsed data
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [createdCandidateId, setCreatedCandidateId] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedJobMatch, setSelectedJobMatch] = useState(null);
  const navigate = useNavigate();

  const handleResumeParsed = (data, file) => {
    setResumeData(data);
    if (file) setResumeFile(file); // Store file if it might be needed by createCandidate or another step
    setImportError(null);
    setImportSuccess(false);
  };

  const handleImportCandidate = async () => {
    if (!resumeData) {
      setImportError('Please upload and parse a resume first');
      return;
    }
    if (!resumeData.name) {
        setImportError('Candidate name is missing in parsed resume data.');
        return;
    }
    if (!resumeData.user_details?.email) {
        setImportError('Candidate email is missing in parsed resume data.');
        return;
    }


    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      // The logic for jobId and matchData for direct application linking remains,
      // but createCandidate itself does not take these. Job association is a separate step.
      // let jobId = null;
      // let matchData = null;
      // if (selectedJobMatch) {
      //   jobId = selectedJobMatch.job_id;
      //   matchData = selectedJobMatch;
      // }

      // Extract all skills, including GitHub skills, with case-insensitive deduplication
      // This logic for collecting a flat list of skill names seems to be the established pattern for candidate.skills.
      const allSkills = new Set();

      // Add resume skills (assuming resumeData.skills is an object with arrays like verified, claimed, etc.)
      [
        ...(resumeData.skills?.verified || []),
        ...(resumeData.skills?.claimed || []),
        ...(resumeData.skills?.technical || []),
        ...(resumeData.skills?.soft || []),
      ].forEach((skill) => skill && allSkills.add(skill.toLowerCase()));

      // Add GitHub analysis skills
      resumeData.github_analysis?.key_technologies?.forEach((tech) => {
        if (tech) {
          const cleanTech = tech.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim();
          allSkills.add(cleanTech.toLowerCase());
        }
      });

      // Add skills from repository analysis
      resumeData.repos?.repositories_analyzed?.forEach((repo) => {
        repo.analysis?.tech_stack_analysis?.backend?.frameworks?.forEach((framework) => {
          if (framework) {
            const cleanFramework = framework.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim();
            allSkills.add(cleanFramework.toLowerCase());
          }
        });
        repo.analysis?.tech_stack_analysis?.frontend?.frameworks?.forEach((framework) => {
          if (framework) {
            const cleanFramework = framework.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim();
            allSkills.add(cleanFramework.toLowerCase());
          }
        });
        repo.analysis?.tech_stack_analysis?.other?.utilities?.forEach((utility) => {
          if (utility) {
            const cleanUtility = utility.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim();
            allSkills.add(cleanUtility.toLowerCase());
          }
        });
        repo.analysis?.syft_analysis?.python?.forEach((pkg) => {
          if (pkg?.name) allSkills.add(pkg.name.toLowerCase());
        });
        repo.analysis?.syft_analysis?.npm?.forEach((pkg) => {
          if (pkg?.name) {
            const cleanPkg = pkg.name.replace(/^@[^/]+\//, '').replace(/\s+\d+\.\d+\.\d+.*$/, '').trim();
            allSkills.add(cleanPkg.toLowerCase());
          }
        });
      });

      // Capitalize and sort skills for backend
      const finalSkillsArray = Array.from(allSkills)
        .filter(skill => skill) // Ensure no empty strings from cleaning
        .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
        .sort();

      const candidateData = {
        name: resumeData.name, // Required
        
        user_details: { // Required
          email: resumeData.user_details.email, // Required in user_details
          phone: resumeData.user_details.phone || '',
          location: resumeData.user_details.location || '',
          summary: resumeData.user_details.summary || '',
          certifications: resumeData.user_details.certifications || [],
          education: resumeData.user_details.education?.map(edu => ({
            degree: edu.degree || '',
            graduation_date: edu.graduation_date || '',
            institution: edu.institution || '',
          })) || [],
        },

        resumeUrl: resumeData.resumeUrl || '', // URL of the resume, possibly from parsing service
        githubProfile: resumeData.github_profile || '',
        github_username: resumeData.github_username || resumeData.repos?.github_username || '',
        linkedinProfile: resumeData.linkedin_profile || '',
        portfolioUrl: resumeData.portfolio_url || '', // Assuming resumeData might have portfolio_url

        experience: resumeData.experience?.map(exp => ({
          company: exp.company || '',
          post: exp.post || '',
          responsibilities: exp.responsibilities || [],
          technologies: exp.technologies || [],
          time_period: exp.time_period || '',
        })) || [],

        total_experience: resumeData.total_experience || '',

        skills: finalSkillsArray, // List of all processed skill names

        // New structured fields from the model
        ats_score: resumeData.ats_score ? {
          experience_match: resumeData.ats_score.experience_match || null, // Use null for numbers if 0 is meaningful
          formatting: resumeData.ats_score.formatting || null,
          improvement_suggestions: resumeData.ats_score.improvement_suggestions || [],
          keyword_match: resumeData.ats_score.keyword_match || null,
          overall: resumeData.ats_score.overall || null,
        } : undefined,

        github_analysis: resumeData.github_analysis ? {
          activity_frequency: resumeData.github_analysis.activity_frequency || null,
          code_consistency: resumeData.github_analysis.code_consistency || null,
          documentation: resumeData.github_analysis.documentation || null,
          expertise_areas: resumeData.github_analysis.expertise_areas || [],
          key_technologies: resumeData.github_analysis.key_technologies || [], // Store original values
          project_complexity: resumeData.github_analysis.project_complexity || null,
          repositories_quality: resumeData.github_analysis.repositories_quality || null,
        } : undefined,

        overall_assessment: resumeData.overall_assessment || '',

        repos: resumeData.repos ? {
          errors: resumeData.repos.errors || [],
          github_username: resumeData.repos.github_username || '', // Specific to these repos
          repositories_analyzed: resumeData.repos.repositories_analyzed?.map(repo => ({
            analysis: repo.analysis ? {
              package_findings: repo.analysis.package_findings ? {
                backend: repo.analysis.package_findings.backend || [],
                frontend: repo.analysis.package_findings.frontend || [],
                // Spread other categories if 'strict: false' in schema and data might contain them
                ...(Object.fromEntries(Object.entries(repo.analysis.package_findings).filter(([key]) => !['backend', 'frontend'].includes(key))))
              } : undefined,
              readme_abstract: repo.analysis.readme_abstract || '',
              readme_findings: repo.analysis.readme_findings ? {
                backend: repo.analysis.readme_findings.backend || [],
                frontend: repo.analysis.readme_findings.frontend || [],
                other: repo.analysis.readme_findings.other || [],
                testing: repo.analysis.readme_findings.testing || [],
                ...(Object.fromEntries(Object.entries(repo.analysis.readme_findings).filter(([key]) => !['backend', 'frontend', 'other', 'testing'].includes(key))))
              } : undefined,
              repo_name: repo.analysis.repo_name || '',
              repository: repo.analysis.repository || '',
              syft_analysis: repo.analysis.syft_analysis ? {
                npm: repo.analysis.syft_analysis.npm?.map(pkg => ({ language: pkg.language || '', name: pkg.name || '', purl: pkg.purl || '', version: pkg.version || '' })) || [],
                python: repo.analysis.syft_analysis.python?.map(pkg => ({ language: pkg.language || '', name: pkg.name || '', purl: pkg.purl || '', version: pkg.version || '' })) || [],
                 // Spread other package managers if 'strict: false'
                ...(Object.fromEntries(Object.entries(repo.analysis.syft_analysis).filter(([key]) => !['npm', 'python'].includes(key))))
              } : undefined,
              tech_stack_analysis: repo.analysis.tech_stack_analysis || {}, // mongoose.Schema.Types.Mixed
            } : undefined,
            repo_name: repo.repo_name || '',
            repo_url: repo.repo_url || '',
            status: repo.status || '',
          })) || [],
        } : undefined,

        skill_gap_analysis: resumeData.skill_gap_analysis ? {
          missing_critical_skills: resumeData.skill_gap_analysis.missing_critical_skills || [],
          suggested_improvements: resumeData.skill_gap_analysis.suggested_improvements || [],
        } : undefined,
        
        // Assessments for manual/internal scores (not directly from ATS/GitHub automated analysis)
        // The old logic hardcoded some soft skills or took overall from ATS, which is now separate.
        // Adapt this based on whether resumeData contains truly separate 'assessment' values or if they should be defaults.
        assessments: {
          technical: {
            // score, codeQuality, repositoryAnalysis previously came from github_analysis, now github_analysis is its own field.
            // So these should be from a different source if available, or defaulted.
            score: resumeData.parsed_manual_assessments?.technical?.score || null,
            codeQuality: resumeData.parsed_manual_assessments?.technical?.codeQuality || null,
            repositoryAnalysis: resumeData.parsed_manual_assessments?.technical?.repositoryAnalysis || {},
            questionResponses: resumeData.parsed_manual_assessments?.technical?.questionResponses || [],
          },
          softSkills: {
            communicationScore: resumeData.parsed_manual_assessments?.softSkills?.communicationScore || null, // Default to null instead of 70, or keep 70 if it's a desired default
            teamworkScore: resumeData.parsed_manual_assessments?.softSkills?.teamworkScore || null,
            problemSolvingScore: resumeData.parsed_manual_assessments?.softSkills?.problemSolvingScore || null,
            discussionAnalysis: resumeData.parsed_manual_assessments?.softSkills?.discussionAnalysis || {
                // If resumeData.skills (object with verified/claimed arrays) is relevant here:
                // verifiedSkills: resumeData.skills?.verified || [],
                // claimedSkills: resumeData.skills?.claimed || [],
            },
          },
          // overallScore previously came from ats_score.overall. Now ats_score is its own field.
          overallScore: resumeData.parsed_manual_assessments?.overallScore || null,
        },
      };
      
      // Pass resumeFile if createCandidate service is designed to handle file uploads
      // If resumeUrl is already in resumeData from parser, that's used above.
      // For this example, assuming createCandidate takes only JSON data.
      // If file upload is part of this step: createCandidate(candidateData, resumeFile)
      const result = await createCandidate(candidateData); 

      if (result.success) {
        setImportSuccess(true);
        setCreatedCandidateId(result.candidate._id);
        if (resumeData.job_matches?.length > 0 && !showComparison && !selectedJobMatch) {
          setShowComparison(true);
        }
      } else {
        setImportError(result.error || 'Failed to import candidate');
      }
    } catch (error) {
      console.error('Import error:', error);
      let errorMessage = 'An unexpected error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setImportError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleJobSelected = (jobId, matchData) => {
    setSelectedJobMatch(matchData);
    if (createdCandidateId) {
      navigate(`/candidates/${createdCandidateId}/jobs/add?jobId=${jobId}`);
    }
  };

  const renderScoreBar = (score, label) => (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{score ?? 'N/A'}{score !== null ? '/100' : ''}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${getScoreColorClass(score)}`}
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  );

  const getScoreColorClass = (score) => {
    if (score === null || score === undefined) return 'bg-gray-300';
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-primary-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // ... rest of the component (UI rendering) remains largely the same,
  // as it depends on `resumeData` structure which is assumed to be consistent.
  // Key paths for displaying data (e.g., resumeData.name, resumeData.user_details.email,
  // resumeData.ats_score.overall) should still be valid if resumeData reflects the new model structure.

  return (
    <div>
      <PageHeader
        title="Import Candidate from Resume"
        backButton={
          <Button
            to="/candidates"
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Candidates
          </Button>
        }
      />

      {importSuccess && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-4 w-4 mr-2" />
          Candidate successfully imported!
          {createdCandidateId && (
            <Button
              to={`/candidates/${createdCandidateId}`}
              variant="ghost"
              size="sm"
              className="ml-2"
            >
              View Candidate
            </Button>
          )}
        </Alert>
      )}

      {importError && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          {importError}
        </Alert>
      )}

      <div className="space-y-6">
        <ResumeUploader onParsed={handleResumeParsed} disableJobMatching={true} />

        {resumeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary-500" />
                Candidate Import Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Basic Information</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{resumeData.name}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{resumeData.user_details?.email || 'N/A'}</span>
                    </li>
                     <li className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{resumeData.user_details?.phone || 'N/A'}</span>
                    </li>
                     <li className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{resumeData.user_details?.location || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Total Experience:</span>
                      <span>{resumeData.total_experience || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Current Role:</span>
                      <span>{resumeData.experience?.[0]?.post || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Current Company:</span>
                      <span>{resumeData.experience?.[0]?.company || 'N/A'}</span>
                    </li>
                     <li className="flex justify-between">
                      <span className="text-gray-600">GitHub:</span>
                      <span>{resumeData.github_profile || 'N/A'}</span>
                    </li>
                     <li className="flex justify-between">
                      <span className="text-gray-600">LinkedIn:</span>
                      <span>{resumeData.linkedin_profile || 'N/A'}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-3 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-gray-400" />
                    Skills
                  </h3>
                  <div className="space-y-3">
                    {/* Verified Skills from resumeData.skills */}
                    {resumeData.skills?.verified?.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-600 mb-1">Verified Skills (Resume):</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.verified.map((skill, index) => (
                            <Badge key={`verified-${index}`} variant="success">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Claimed Skills from resumeData.skills */}
                    {resumeData.skills?.claimed?.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-600 mb-1">Claimed Skills (Resume):</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.claimed.map((skill, index) => (
                            <Badge key={`claimed-${index}`} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                     {/* Technical Skills from resumeData.skills (if exists) */}
                    {resumeData.skills?.technical?.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-600 mb-1">Technical Skills (Resume):</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.technical.map((skill, index) => (
                            <Badge key={`technical-${index}`} variant="primary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                     {/* Soft Skills from resumeData.skills (if exists) */}
                    {resumeData.skills?.soft?.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-600 mb-1">Soft Skills (Resume):</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.soft.map((skill, index) => (
                            <Badge key={`soft-${index}`} variant="default">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* GitHub Derived Skills - this logic may need fine-tuning based on how resumeData surfaces them */}
                    {(() => {
                      const githubDerivedSkills = new Set();
                      resumeData.github_analysis?.key_technologies?.forEach(tech => {
                        if (tech) githubDerivedSkills.add(tech.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim());
                      });
                      resumeData.github_analysis?.expertise_areas?.forEach(area => {
                        if (area) githubDerivedSkills.add(area);
                      });
                       resumeData.repos?.repositories_analyzed?.forEach((repo) => {
                        repo.analysis?.tech_stack_analysis?.backend?.frameworks?.forEach((fw) => fw && githubDerivedSkills.add(fw.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim()));
                        repo.analysis?.tech_stack_analysis?.frontend?.frameworks?.forEach((fw) => fw && githubDerivedSkills.add(fw.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim()));
                        repo.analysis?.tech_stack_analysis?.other?.utilities?.forEach((util) => util && githubDerivedSkills.add(util.replace(/\s+\d+\.\d+\.\d+.*$/, '').trim()));
                        repo.analysis?.syft_analysis?.npm?.forEach(pkg => pkg?.name && githubDerivedSkills.add(pkg.name.replace(/^@[^/]+\//, '').replace(/\s+\d+\.\d+\.\d+.*$/, '').trim()));
                        repo.analysis?.syft_analysis?.python?.forEach(pkg => pkg?.name && githubDerivedSkills.add(pkg.name));
                      });

                      const uniqueGithubSkills = Array.from(githubDerivedSkills)
                        .filter(s => s)
                        .map(s => s.charAt(0).toUpperCase() + s.slice(1)).sort();

                      return uniqueGithubSkills.length > 0 ? (
                        <div>
                          <h4 className="text-sm text-gray-600 mb-1">GitHub Derived Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {uniqueGithubSkills.map((skill, index) => (
                              <Badge key={`github-derived-${index}`} variant="info">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              {(resumeData.ats_score || resumeData.github_analysis) && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-md font-medium mb-3">Assessment Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resumeData.ats_score && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <BarChart2 className="h-4 w-4 mr-1 text-primary-500" />
                          ATS Score
                        </h4>
                        {renderScoreBar(resumeData.ats_score.overall, 'Overall')}
                        {renderScoreBar(resumeData.ats_score.keyword_match, 'Keyword Match')}
                        {renderScoreBar(resumeData.ats_score.experience_match, 'Experience Match')}
                        {renderScoreBar(resumeData.ats_score.formatting, 'Formatting')}
                      </div>
                    )}
                    {resumeData.github_analysis && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Github className="h-4 w-4 mr-1 text-gray-700" />
                          GitHub Analysis
                        </h4>
                        {renderScoreBar(resumeData.github_analysis.repositories_quality, 'Repo Quality')}
                        {renderScoreBar(resumeData.github_analysis.code_consistency, 'Code Consistency')}
                        {renderScoreBar(resumeData.github_analysis.project_complexity, 'Project Complexity')}
                        {renderScoreBar(resumeData.github_analysis.activity_frequency, 'Activity Frequency')}
                        {renderScoreBar(resumeData.github_analysis.documentation, 'Documentation')}
                      </div>
                    )}
                  </div>
                </div>
              )}
                 {/* Display Overall Assessment if available */}
                {resumeData.overall_assessment && (
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-md font-medium mb-2">Overall Assessment</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {resumeData.overall_assessment}
                    </p>
                </div>
                )}

                {/* Display Skill Gap Analysis if available */}
                {resumeData.skill_gap_analysis && (resumeData.skill_gap_analysis.missing_critical_skills?.length > 0 || resumeData.skill_gap_analysis.suggested_improvements?.length > 0) && (
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-md font-medium mb-2">Skill Gap Analysis</h3>
                    {resumeData.skill_gap_analysis.missing_critical_skills?.length > 0 && (
                    <>
                        <h4 className="text-sm text-gray-600 mb-1">Missing Critical Skills:</h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                        {resumeData.skill_gap_analysis.missing_critical_skills.map((skill, index) => (
                            <Badge key={`missing-${index}`} variant="destructive">{skill}</Badge>
                        ))}
                        </div>
                    </>
                    )}
                    {resumeData.skill_gap_analysis.suggested_improvements?.length > 0 && (
                    <>
                        <h4 className="text-sm text-gray-600 mb-1">Suggested Improvements:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                        {resumeData.skill_gap_analysis.suggested_improvements.map((suggestion, index) => (
                            <li key={`suggestion-${index}`}>{suggestion}</li>
                        ))}
                        </ul>
                    </>
                    )}
                </div>
                )}
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 border-t">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-gray-500">
                  Import this candidate to create a new record with all parsed data.
                </p>
                <Button
                  variant="primary"
                  onClick={handleImportCandidate}
                  disabled={isImporting || !resumeData || (importSuccess && createdCandidateId)}
                  isLoading={isImporting}
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  {isImporting ? 'Importing...' : importSuccess && createdCandidateId ? 'Imported' : 'Import Candidate'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {(importSuccess || showComparison) && resumeData?.job_matches && (
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
                  Job Matching
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {resumeData.job_matches.length === 0 ? (
                  <Alert variant="info">
                    No job matches found for this candidate. Try uploading a more complete resume or adding more job postings.
                  </Alert>
                ) : (
                  <JobComparisonView
                    candidateData={resumeData}
                    file={resumeFile} // Pass resumeFile if JobComparisonView might need it
                    onJobSelected={handleJobSelected}
                    existingMatches={resumeData.job_matches}
                    showJobSelector={true}
                  />
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <p className="text-sm text-gray-500">
                  Compare this candidate against available job postings to find the best fit.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Button to show job comparison if not yet imported and matches exist */}
        {resumeData && !importSuccess && !showComparison && resumeData.job_matches && resumeData.job_matches.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowComparison(true)}
              leftIcon={<Briefcase className="h-4 w-4" />}
            >
              Compare with Job Postings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}