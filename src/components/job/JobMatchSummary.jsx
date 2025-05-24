// src/components/job/JobMatchSummary.jsx
import React from 'react';
import { Briefcase, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  Button
} from '../ui';
import { Link } from 'react-router-dom';

export default function JobMatchSummary({ matches, candidateId, limit = 3 }) {
  // Only show top matches, sorted by score
  const topMatches = [...matches]
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

  // Get appropriate color for match score
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-primary-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
          Top Job Matches
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No job matches available for this candidate.
          </p>
        ) : (
          <div className="space-y-3">
            {topMatches.map((match, index) => (
              <div 
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-3 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{match.job_title}</h3>
                    <div className="flex mt-1 items-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span>{match.matching_skills?.length || 0} skills match</span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{match.missing_skills?.length || 0} skills missing</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(match.match_score)}`}>
                    {match.match_score}%
                  </div>
                </div>
                
                {match.overall_recommendation && (
                  <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-100">
                    {match.overall_recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {matches.length > limit && (
        <CardFooter className="flex justify-center border-t">
          <Link to={`/candidates/${candidateId}/job-matches`}>
            <Button 
              variant="ghost" 
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              View All {matches.length} Job Matches
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}