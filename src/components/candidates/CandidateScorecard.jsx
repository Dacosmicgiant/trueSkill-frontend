// src/components/candidates/CandidateScorecard.jsx
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge 
} from '../ui';
import { 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2,
  Github,
  Code,
  Award,
  School,
  BookOpen
} from 'lucide-react';

export default function CandidateScorecard({ candidate }) {
  // Helper function to render score bars
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

  // Helper function to get color class based on score
  const getScoreColorClass = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-primary-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get the highest available score to display as overall
  const getOverallScore = () => {
    if (candidate.assessments?.overallScore) return candidate.assessments.overallScore;
    if (candidate.ats_score?.overall) return candidate.ats_score.overall;
    return 0;
  };

  // Early return if no candidate data
  if (!candidate) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Candidate Skills Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ATS Score Section */}
          <div>
            <h3 className="text-md font-medium mb-3 flex items-center">
              <BarChart2 className="h-5 w-5 text-primary-500 mr-2" />
              Resume Analysis
            </h3>
            
            {renderScoreBar(getOverallScore(), "Overall Score")}
            {candidate.ats_score?.keyword_match && renderScoreBar(candidate.ats_score.keyword_match, "Keyword Match")}
            {candidate.ats_score?.formatting && renderScoreBar(candidate.ats_score.formatting, "Resume Format")}
            {candidate.ats_score?.experience_match && renderScoreBar(candidate.ats_score.experience_match, "Experience Match")}
            
            {candidate.ats_score?.improvement_suggestions?.length > 0 && (
              <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Resume Improvement Tips:</h4>
                <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                  {candidate.ats_score.improvement_suggestions.slice(0, 3).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Education Section */}
            {candidate.user_details?.education && candidate.user_details.education.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <School className="h-4 w-4 text-gray-500 mr-1" />
                  Education
                </h4>
                {candidate.user_details.education.map((edu, i) => (
                  <div key={i} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                    {edu.graduation_date && <div className="text-gray-500 text-xs">{edu.graduation_date}</div>}
                  </div>
                ))}
              </div>
            )}
            
            {/* Certifications Section */}
            {candidate.user_details?.certifications && candidate.user_details.certifications.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Award className="h-4 w-4 text-gray-500 mr-1" />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.user_details.certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* GitHub Analysis Section */}
          <div>
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Github className="h-5 w-5 text-gray-700 mr-2" />
              GitHub Analysis
            </h3>
            
            {candidate.github_analysis ? (
              <>
                {candidate.github_analysis.repositories_quality && renderScoreBar(candidate.github_analysis.repositories_quality, "Repo Quality")}
                {candidate.github_analysis.code_consistency && renderScoreBar(candidate.github_analysis.code_consistency, "Code Consistency")}
                {candidate.github_analysis.project_complexity && renderScoreBar(candidate.github_analysis.project_complexity, "Project Complexity")}
                {candidate.github_analysis.documentation && renderScoreBar(candidate.github_analysis.documentation, "Documentation")}
                {candidate.github_analysis.activity_frequency && renderScoreBar(candidate.github_analysis.activity_frequency, "Activity")}
                
                {candidate.github_analysis.key_technologies?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Key Technologies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.github_analysis.key_technologies.map((tech, i) => (
                        <Badge key={i} variant="primary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {candidate.github_analysis.expertise_areas?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Expertise Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.github_analysis.expertise_areas.map((area, i) => (
                        <Badge key={i} variant="success">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md text-gray-500 text-sm italic">
                {candidate.github_username || candidate.githubProfile ? (
                  <>
                    <p>GitHub analysis not yet performed.</p>
                    <p className="mt-1">Username: {candidate.github_username || candidate.githubProfile}</p>
                  </>
                ) : (
                  <p>No GitHub profile available</p>
                )}
              </div>
            )}
          </div>
          
          {/* Skills Section */}
          <div>
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Code className="h-5 w-5 text-blue-500 mr-2" />
              Skills Overview
            </h3>
            
            {/* All Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">All Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="primary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Skills */}
            {candidate.skill_gap_analysis?.missing_critical_skills?.length > 0 && (
              <div className="mt-4 bg-red-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1">Missing Critical Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.skill_gap_analysis.missing_critical_skills.map((skill, i) => (
                    <Badge key={i} variant="danger">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggested Improvements */}
            {candidate.skill_gap_analysis?.suggested_improvements?.length > 0 && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Suggested Improvements:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {candidate.skill_gap_analysis.suggested_improvements.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Overall Assessment */}
        {candidate.overall_assessment && (
          <div className="mt-6 bg-primary-50 p-4 rounded-md border border-primary-100">
            <h3 className="text-md font-medium mb-2 text-primary-800">Overall Assessment</h3>
            <p className="text-gray-700">{candidate.overall_assessment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}