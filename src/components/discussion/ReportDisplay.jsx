// src/components/discussion/ReportDisplay.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button
} from '../ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const ReportDisplay = ({ report, onBack, onSave }) => {
  const [openSections, setOpenSections] = useState({
    communication: true,
    empathy: true,
    collaboration: true,
    adaptivity: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSectionColor = (score) => {
    if (score >= 8) return "text-green-700 bg-green-50";
    if (score >= 6) return "text-blue-700 bg-blue-50";
    if (score >= 4) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-primary-700">Soft Skills Assessment Report</CardTitle>
          <div className="flex gap-2">
            {onSave && (
              <Button
                variant="primary"
                size="sm"
                onClick={onSave}
              >
                Save to Candidate Profile
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
            >
              Back to Discussion
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {['communication', 'empathy', 'collaboration', 'adaptivity'].map((area) => (
            <div key={area} className="border rounded-lg shadow-sm transition-all duration-300">
              <button
                className={cn(
                  "w-full p-4 flex justify-between items-center text-left rounded-t-lg",
                  getSectionColor(report[area].score)
                )}
                onClick={() => toggleSection(area)}
              >
                <h3 className="text-lg font-semibold capitalize">
                  {area}: {report[area].score}/10
                </h3>
                <span>{openSections[area] ? <ChevronDown /> : <ChevronRight />}</span>
              </button>
              {openSections[area] && (
                <div className="p-4 bg-white">
                  <h4 className="font-semibold text-gray-700 mb-2">Strengths:</h4>
                  <ul className="list-disc pl-5 text-gray-600 mb-4">
                    {report[area].strengths.map((strength, i) => (
                      <li key={i} className="mb-1">{strength}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold text-gray-700 mb-2">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 text-gray-600 mb-4">
                    {report[area].areasForImprovement.map((improvement, i) => (
                      <li key={i} className="mb-1">{improvement}</li>
                    ))}
                  </ul>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-1">Actionable Tip:</h4>
                    <p className="text-gray-600">{report[area].tip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">Overall Assessment:</h4>
            <p className="text-gray-600">
              Average Score: {((
                report.communication.score + 
                report.empathy.score + 
                report.collaboration.score + 
                report.adaptivity.score
              ) / 4).toFixed(1)}/10
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDisplay;