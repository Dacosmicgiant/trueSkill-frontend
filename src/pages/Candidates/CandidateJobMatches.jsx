// src/pages/Candidates/CandidateJobMatches.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Briefcase, 
  Search, 
  SlidersHorizontal, 
  X,
  SortAsc, 
  SortDesc 
} from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Alert,
  Spinner
} from '../../components/ui';
import JobMatchDetails from '../../components/job/JobMatchDetails';
import { getCandidateById } from '../../services/candidateService';
import { matchResumeToJobs } from '../../services/resumeService';

export default function CandidateJobMatches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalculatingMatches, setIsCalculatingMatches] = useState(false);
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterThreshold, setFilterThreshold] = useState(0);

  useEffect(() => {
    // Fetch candidate data
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getCandidateById(id);
        
        if (result.success) {
          setCandidate(result.candidate);
          
          // Check if candidate has job matches
          if (result.candidate.job_matches && result.candidate.job_matches.length > 0) {
            setJobMatches(result.candidate.job_matches);
          } else {
            // No job matches - might want to calculate them
            setJobMatches([]);
          }
        } else {
          setError(result.error || 'Failed to fetch candidate data');
        }
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Calculate job matches for this candidate
  const calculateJobMatches = async () => {
    if (!candidate) return;
    
    setIsCalculatingMatches(true);
    setError(null);
    
    try {
      // Use the candidate data for matching (no file upload)
      const result = await matchResumeToJobs(null, candidate);
      
      if (result.success && result.data?.job_matches) {
        setJobMatches(result.data.job_matches);
      } else {
        setError(result.error || 'Failed to calculate job matches');
      }
    } catch (err) {
      console.error('Error calculating job matches:', err);
      setError('An unexpected error occurred while calculating job matches');
    } finally {
      setIsCalculatingMatches(false);
    }
  };

  // Filter and sort job matches
  const filteredMatches = jobMatches
    .filter(match => 
      // Filter by search query
      (match.job_title && match.job_title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Filter by threshold
      match.match_score >= filterThreshold
    )
    .sort((a, b) => {
      // Sort by specified field
      if (sortBy === 'score') {
        return sortDirection === 'desc' 
          ? b.match_score - a.match_score 
          : a.match_score - b.match_score;
      } else if (sortBy === 'title') {
        return sortDirection === 'desc'
          ? b.job_title.localeCompare(a.job_title)
          : a.job_title.localeCompare(b.job_title);
      }
      return 0;
    });

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Handle adding candidate to job
  const handleAddToJob = (jobId, matchData) => {
    navigate(`/candidates/${id}/jobs/add?jobId=${jobId}`);
  };

  // Handle viewing job details
  const handleViewJob = (jobId) => {
    navigate(`/jobs/edit/${jobId}`);
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

  if (!candidate) {
    return <Alert variant="error">Candidate not found</Alert>;
  }

  return (
    <div>
      <PageHeader
        title={`Job Matches for ${candidate.name}`}
        description="Find the best job fit for this candidate"
        backButton={
          <Button
            to={`/candidates/${id}`}
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back to Candidate
          </Button>
        }
        actions={
          <Button
            variant={isCalculatingMatches ? "secondary" : "primary"}
            size="md"
            onClick={calculateJobMatches}
            disabled={isCalculatingMatches}
            leftIcon={<Briefcase className="h-4 w-4" />}
            isLoading={isCalculatingMatches}
          >
            {isCalculatingMatches ? 'Calculating...' : 'Refresh Job Matches'}
          </Button>
        }
      />

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                rightIcon={searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="focus:outline-none"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {sortBy === 'score' ? 'Sort by Score' : 'Sort by Title'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Sort by Score</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSortDirection}
                aria-label={sortDirection === 'desc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sortDirection === 'desc' 
                  ? <SortDesc className="h-4 w-4" /> 
                  : <SortAsc className="h-4 w-4" />}
              </Button>
            </div>
            
            <div>
              <Select 
                value={filterThreshold.toString()} 
                onValueChange={(value) => setFilterThreshold(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {filterThreshold > 0 
                    ? `Score ≥ ${filterThreshold}%` 
                    : 'All Matches'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Matches</SelectItem>
                  <SelectItem value="70">Good Matches (≥70%)</SelectItem>
                  <SelectItem value="80">Strong Matches (≥80%)</SelectItem>
                  <SelectItem value="90">Excellent Matches (≥90%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Matches */}
      <div className="space-y-4">
        {isCalculatingMatches && (
          <div className="bg-blue-50 p-4 rounded-md flex items-center text-blue-800 mb-4">
            <Spinner size="sm" className="mr-3 text-blue-600" />
            <div>
              <p className="font-medium">Calculating job matches...</p>
              <p className="text-sm">This may take a moment to analyze against all available jobs.</p>
            </div>
          </div>
        )}
        
        {filteredMatches.length === 0 ? (
          <Alert variant={jobMatches.length > 0 ? "info" : "warning"}>
            {jobMatches.length > 0 
              ? 'No job matches found matching your filters.' 
              : 'No job matches available for this candidate. Click "Refresh Job Matches" to calculate them.'}
          </Alert>
        ) : (
          filteredMatches.map((match, index) => (
            <JobMatchDetails
              key={match.job_id || index}
              match={match}
              onAddToJob={handleAddToJob}
              onViewJob={handleViewJob}
              expanded={index === 0} // Expand the first one by default
            />
          ))
        )}
      </div>
    </div>
  );
}