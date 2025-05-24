// src/components/job/JobMatchCard.jsx
import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Briefcase,
  BarChart2, 
  UserPlus 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  Button
} from '../ui';
import { cn } from '../../utils/cn';

export default function JobMatchCard({ 
  match, 
  onAddCandidate, 
  candidateAlreadyAdded = false,
  className 
}) {
  // Get appropriate border color based on match score
  const getBorderColor = (score) => {
    if (score >= 90) return "border-l-green-500";
    if (score >= 80) return "border-l-primary-500";
    if (score >= 70) return "border-l-yellow-500";
    return "border-l-red-500";
  };

  // Get appropriate score class based on score
  const getScoreClass = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-primary-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Render score bars
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

  // Get appropriate bar color based on score
  const getBarColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-primary-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border-l-4",
        getBorderColor(match.match_score),
        className
      )}
    >
      <CardHeader className="py-3 px-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
              {match.job_title}
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">Job ID: {match.job_id}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-bold ${getScoreClass(match.match_score)}`}>
              {match.match_score}
            </div>
            <div className="text-sm text-gray-500">Match Score</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matching Skills Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Matching Skills
            </h4>
            <div className="flex flex-wrap gap-1">
              {match.matching_skills && match.matching_skills.length > 0 ? (
                match.matching_skills.map((skill, i) => (
                  <Badge key={i} variant="success">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No matching skills found</p>
              )}
            </div>
          </div>
          
          {/* Missing Skills Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
              Missing Skills
            </h4>
            <div className="flex flex-wrap gap-1">
              {match.missing_skills && match.missing_skills.length > 0 ? (
                match.missing_skills.map((skill, i) => (
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
        {(match.experience_relevance !== undefined || match.qualification_fit !== undefined) && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <BarChart2 className="h-4 w-4 text-primary-500 mr-1" />
              Score Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.experience_relevance !== undefined && (
                <div>
                  {renderScoreBar(match.experience_relevance, "Experience Relevance")}
                </div>
              )}
              
              {match.qualification_fit !== undefined && (
                <div>
                  {renderScoreBar(match.qualification_fit, "Qualification Fit")}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Recommendation */}
        {match.overall_recommendation && (
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
            <p className="text-sm text-gray-600">{match.overall_recommendation}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="py-3 px-4 bg-gray-50 border-t flex justify-end">
        <Button
          variant={candidateAlreadyAdded ? "secondary" : "primary"}
          size="sm"
          onClick={() => onAddCandidate(match.job_id)}
          disabled={candidateAlreadyAdded}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          {candidateAlreadyAdded ? "Already Added" : "Add to This Job"}
        </Button>
      </CardFooter>
    </Card>
  );
}