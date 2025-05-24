// src/pages/Candidates/CandidateList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  User,
  ChevronDown,
  Plus,
  Filter,
  Upload
} from 'lucide-react';
import { 
  Button, 
  PageHeader, 
  Card, 
  CardContent, 
  Input, 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem,
  Badge,
  DataTable,
  Alert,
  Pagination,
  Checkbox
} from '../../components/ui';
import { cn } from '../../utils/cn';
import { getCandidates } from '../../services/candidateService';

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [skills, setSkills] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, [page, selectedJob, selectedStatus, searchQuery, sortBy, skills]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        jobId: selectedJob !== 'all' ? selectedJob : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        skills: skills || undefined,
        sort: getSortField(sortBy),
      };
      
      const { success, candidates: candidatesData, pagination, error } = await getCandidates(params);
      
      if (success) {
        setCandidates(candidatesData);
        if (pagination) {
          setPage(pagination.page);
          setTotalPages(pagination.pages);
        }
      } else {
        setError(error || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSortField = (sortOption) => {
    switch (sortOption) {
      case 'score':
        return '-assessments.overallScore';
      case 'atsScore':
        return '-ats_score.overall';
      case 'githubScore':
        return '-github_analysis.repositories_quality';
      case 'name':
        return 'name';
      default:
        return '-createdAt';
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleJobFilter = (value) => {
    setSelectedJob(value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setSelectedStatus(value);
    setPage(1);
  };

  const handleSort = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSkillsFilter = (e) => {
    setSkills(e.target.value);
    setPage(1);
  };

  const handleCandidateSelection = (id) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(id)) {
        return prev.filter((candidateId) => candidateId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleAllCandidates = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((candidate) => candidate._id));
    }
  };

  // Helper to get candidate score based on new model
  const getCandidateScore = (candidate, scoreType) => {
    switch(scoreType) {
      case 'overall':
        return candidate.assessments?.overallScore || candidate.ats_score?.overall || 0;
      case 'ats':
        return candidate.ats_score?.overall || 0;
      case 'github':
        return candidate.github_analysis?.repositories_quality || 0;
      case 'technical':
        return candidate.assessments?.technical?.score || 0;
      case 'softSkills':
        const { softSkills } = candidate.assessments || {};
        if (!softSkills) return 0;
        
        const scores = [
          softSkills.communicationScore || 0,
          softSkills.teamworkScore || 0,
          softSkills.problemSolvingScore || 0
        ];
        
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      default:
        return 0;
    }
  };

  const getScoreComponent = (score) => {
    const getBgColor = (score) => {
      if (score >= 90) return 'bg-green-500';
      if (score >= 80) return 'bg-primary-500';
      if (score >= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="flex items-center">
        <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full ${getBgColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span>{score}</span>
      </div>
    );
  };

  // Extract current position from experience array
  const getCurrentPosition = (candidate) => {
    if (candidate.experience && candidate.experience.length > 0) {
      return candidate.experience[0].post || 'N/A';
    }
    return 'N/A';
  };

  const columns = [
    {
      key: 'select',
      title: (
        <Checkbox
          checked={selectedCandidates.length === candidates.length && candidates.length > 0}
          onCheckedChange={toggleAllCandidates}
          disabled={candidates.length === 0}
        />
      ),
      width: '50px',
      render: (candidate) => (
        <Checkbox
          checked={selectedCandidates.includes(candidate._id)}
          onCheckedChange={() => handleCandidateSelection(candidate._id)}
        />
      )
    },
    {
      key: 'name',
      title: 'Candidate',
      render: (candidate) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <User className="h-5 w-5 text-primary-600" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-4">
            <Link to={`/candidates/${candidate._id}`} className="font-medium text-primary-600 hover:text-primary-800">
              {candidate.name}
            </Link>
            <div className="text-gray-500">{candidate.user_details?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      title: 'Position',
      render: (candidate) => (
        <div className="text-gray-700">
          {getCurrentPosition(candidate)}
        </div>
      )
    },
    {
      key: 'experience',
      title: 'Experience',
      render: (candidate) => (
        <div className="text-gray-700">
          {candidate.total_experience || 'N/A'}
        </div>
      )
    },
    {
      key: 'skills',
      title: 'Tech Stack',
      render: (candidate) => (
        <div className="flex flex-wrap gap-1">
          {candidate.skills?.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="primary">
              {tech}
            </Badge>
          ))}
          {candidate.skills?.length > 3 && (
            <Badge variant="default">
              +{candidate.skills.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (candidate) => (
        candidate.applications && candidate.applications.length > 0 ? (
          getStatusBadge(candidate.applications[0].status)
        ) : (
          <Badge variant="primary">Screening</Badge>
        )
      )
    },
    {
      key: 'score',
      title: 'Score',
      render: (candidate) => getScoreComponent(getCandidateScore(candidate, 'overall'))
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Candidates"
        actions={
          <>
            {selectedCandidates.length > 0 && (
              <Button
                to={`/candidates/compare?ids=${selectedCandidates.join(',')}`}
                variant="secondary"
                className="mr-3"
              >
                Compare Selected ({selectedCandidates.length})
              </Button>
            )}
            <Button
              to="/candidates/import"
              variant="secondary"
              leftIcon={<Upload className="h-4 w-4" />}
              className="mr-3"
            >
              Import Resume
            </Button>
            <Button
              to="/jobs/create"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create New Job
            </Button>
          </>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <Input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search candidates by name, position, or skills"
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="md:hidden"
              onClick={() => setFiltersOpen(!filtersOpen)}
              leftIcon={<Filter className="h-4 w-4" />}
              rightIcon={<ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen ? "rotate-180" : "")} />}
            >
              Filters
            </Button>
            <div className={cn("md:flex gap-3", filtersOpen ? "flex" : "hidden", "flex-col md:flex-row")}>
              <Select value={selectedJob} onValueChange={handleJobFilter}>
                <SelectTrigger className="w-full md:w-auto">
                  {selectedJob === 'all' ? 'All Positions' : selectedJob}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full md:w-auto">
                  {selectedStatus === 'all' ? 'All Statuses' : formatStatus(selectedStatus)}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="technical-assessment">Technical Assessment</SelectItem>
                  <SelectItem value="soft-skills-assessment">Soft Skills Assessment</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-full md:w-auto">
                  {getSortLabel(sortBy)}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Sort by Overall Score</SelectItem>
                  <SelectItem value="atsScore">Sort by ATS Score</SelectItem>
                  <SelectItem value="githubScore">Sort by GitHub Score</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="text"
                name="skills"
                id="skills"
                value={skills}
                onChange={handleSkillsFilter}
                placeholder="Filter by skills (comma separated)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={candidates}
        columns={columns}
        isLoading={loading}
        emptyState={
          <div className="py-10 text-center text-sm text-gray-500">
            No candidates found matching your filters.
          </div>
        }
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}

// Helper functions
function formatStatus(status) {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSortLabel(sortValue) {
  switch (sortValue) {
    case 'score': return 'Sort by Overall Score';
    case 'atsScore': return 'Sort by ATS Score';
    case 'githubScore': return 'Sort by GitHub Score';
    case 'name': return 'Sort by Name';
    default: return 'Sort by Overall Score';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'applied':
      return <Badge variant="default">Applied</Badge>;
    case 'screening':
      return <Badge variant="primary">Screening</Badge>;
    case 'technical-assessment':
      return <Badge variant="secondary">Technical</Badge>;
    case 'soft-skills-assessment':
      return <Badge variant="info">Soft Skills</Badge>;
    case 'interview':
      return <Badge variant="warning">Interview</Badge>;
    case 'offer':
      return <Badge variant="success">Offer</Badge>;
    case 'hired':
      return <Badge variant="success">Hired</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="default">Applied</Badge>;
  }
}