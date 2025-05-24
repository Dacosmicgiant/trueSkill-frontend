import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  Button, 
  Input,
  Card,
  CardContent,
  Checkbox,
  Spinner
} from '../ui';
import { fetchJobs } from '../../services/resumeService';

export default function JobSelectionControl({ 
  onJobSelect, 
  selectedJobIds = [],
  maxSelections = null, // If null, unlimited selections
  label = "Select Jobs",
  showInitially = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(showInitially);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(selectedJobIds || []);

  useEffect(() => {
    if (isOpen && jobs.length === 0) {
      fetchJobsData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Update selected when selectedJobIds prop changes
    if (selectedJobIds && JSON.stringify(selectedJobIds) !== JSON.stringify(selected)) {
      setSelected(selectedJobIds);
    }
  }, [selectedJobIds]);

  const fetchJobsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const jobsData = await fetchJobs();
      setJobs(jobsData || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && jobs.length === 0) {
      fetchJobsData();
    }
  };

  const handleCheckboxChange = (jobId) => {
    setSelected(prev => {
      // If already selected, remove it
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } 
      // If not selected and we're at max selections, don't add
      else if (maxSelections !== null && prev.length >= maxSelections) {
        return prev;
      } 
      // Otherwise add it
      else {
        return [...prev, jobId];
      }
    });
  };

  const handleSelectionConfirmed = () => {
    if (onJobSelect) {
      onJobSelect(selected);
    }
    setIsOpen(false); // Close dropdown after confirming selection
  };

  const handleClearSelection = () => {
    setSelected([]);
    if (onJobSelect) {
      onJobSelect([]);
    }
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get job titles for selected jobs to display
  const selectedJobTitles = selected.map(id => {
    const job = jobs.find(j => j.job_id === id);
    return job ? job.title : `Job #${id}`;
  });

  return (
    <div className={className}>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleToggle}
        className="w-full justify-between"
        rightIcon={isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      >
        <span className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2" />
          {selected.length > 0 
            ? `${selected.length} job${selected.length > 1 ? 's' : ''} selected` 
            : label}
        </span>
      </Button>
      
      {isOpen && (
        <Card className="mt-2 shadow-md overflow-hidden">
          <CardContent className="p-3">
            <div className="mb-2">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
                rightIcon={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="focus:outline-none"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  ) : null
                }
              />
            </div>
            
            {isLoading ? (
              <div className="py-4 flex justify-center">
                <Spinner size="sm" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                {error}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-4 text-center text-gray-500 text-sm">
                No jobs found matching your search
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto pr-1 border rounded-md">
                  {filteredJobs.map(job => (
                    <div 
                      key={job.job_id} 
                      className="flex items-center py-2 hover:bg-gray-100 px-2 border-b last:border-0"
                    >
                      <Checkbox
                        checked={selected.includes(job.job_id)}
                        onCheckedChange={() => handleCheckboxChange(job.job_id)}
                        id={`job-${job.job_id}`}
                        className="mr-2"
                        disabled={maxSelections !== null && selected.length >= maxSelections && !selected.includes(job.job_id)}
                      />
                      <label 
                        htmlFor={`job-${job.job_id}`}
                        className="text-sm cursor-pointer flex-1 truncate"
                      >
                        {job.title}
                        {selected.includes(job.job_id) && (
                          <span className="ml-2 text-xs text-primary-600">✓ Selected</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                
                {selected.length > 0 && (
                  <div className="mt-3 pt-2 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="text-xs text-gray-600">
                      <div className="font-medium mb-1">Selected Jobs:</div>
                      <div className="max-w-lg">
                        {selectedJobTitles.join(', ')}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleClearSelection}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={handleSelectionConfirmed}
                      >
                        Confirm Selection
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}