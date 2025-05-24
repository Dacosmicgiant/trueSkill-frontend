// src/components/candidates/SkillsSection.jsx
import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Book,
  PlusCircle
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

export default function SkillsSection({ 
  skills, 
  skillGapAnalysis = null,
  showTitle = true, 
  showAddButton = false, 
  onAddSkill = null
}) {
  // Helper to count total skills
  const countSkills = () => {
    if (!skills) return 0;
    
    if (Array.isArray(skills)) {
      return skills.length;
    }
    
    let count = 0;
    if (skills.verified) count += skills.verified.length;
    if (skills.claimed) count += skills.claimed.length;
    if (skills.technical) count += skills.technical.length;
    if (skills.soft) count += skills.soft.length;
    return count;
  };

  // Check if empty
  const isEmpty = countSkills() === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        {showTitle && (
          <CardTitle className="flex items-center justify-between">
            <span>Skills</span>
            {!isEmpty && <Badge variant="default">{countSkills()}</Badge>}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm italic">No skills information available</p>
          </div>
        ) : (
          // Render skills based on data structure
          <div className="space-y-4">
            {/* If using the new skills structure */}
            {typeof skills === 'object' && !Array.isArray(skills) ? (
              <>
                {/* Verified Skills */}
                {skills.verified && skills.verified.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      Verified Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skills.verified.map((skill, i) => (
                        <Badge key={i} variant="success">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Claimed Skills */}
                {skills.claimed && skills.claimed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                      Claimed Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skills.claimed.map((skill, i) => (
                        <Badge key={i} variant="warning">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Technical Skills */}
                {skills.technical && skills.technical.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Code className="h-4 w-4 text-blue-500 mr-1" />
                      Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skills.technical.map((skill, i) => (
                        <Badge key={i} variant="primary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Soft Skills */}
                {skills.soft && skills.soft.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Book className="h-4 w-4 text-gray-500 mr-1" />
                      Soft Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {skills.soft.map((skill, i) => (
                        <Badge key={i} variant="default">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // For legacy skills array format
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">All Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(skills) && skills.map((skill, i) => (
                    <Badge key={i} variant="primary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skill Gap Analysis */}
            {skillGapAnalysis && (
              <>
                {/* Missing Skills */}
                {skillGapAnalysis.missing_critical_skills?.length > 0 && (
                  <div className="mt-4 bg-red-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Missing Critical Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {skillGapAnalysis.missing_critical_skills.map((skill, i) => (
                        <Badge key={i} variant="danger">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Suggested Improvements */}
                {skillGapAnalysis.suggested_improvements?.length > 0 && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Suggested Improvements:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      {skillGapAnalysis.suggested_improvements.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
      
      {showAddButton && onAddSkill && (
        <CardFooter className="border-t bg-gray-50 pt-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            onClick={onAddSkill}
          >
            Add Skill
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}