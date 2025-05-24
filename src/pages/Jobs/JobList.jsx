// src/pages/Jobs/JobList.jsx
// ... (imports largely remain the same, ensure your DataTable and other UI components are up-to-date)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Briefcase, User, Pencil, Trash, Link as LinkIcon, Plus, Eye, // Added Eye for viewing
  BarChart2 // For dashboard/summary if you add it
} from 'lucide-react';
// ... (rest of your imports for UI components, services)
import { 
    Button, PageHeader, Card, CardContent, Input, Select, SelectTrigger, 
    SelectContent, SelectItem, Badge, DataTable, Alert, Pagination, Spinner
  } from '../../components/ui';
import * as jobService from '../../services/jobService';


export default function JobList() {
  // ... (state variables largely remain the same)
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to active jobs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(null); // Store ID of job being deleted for specific spinner
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null); // Store ID of job whose status is being updated

  // ... (useEffect for fetching jobs remains largely the same, ensure params align with backend)
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          sort: '-createdAt',
        };
        const result = await jobService.getJobs(params);
        if (result.success) {
          setJobs(result.jobs || []);
          setTotalPages(result.pagination?.pages || 1);
          setPage(result.pagination?.page || 1);
        } else {
          setError(result.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('An unexpected error occurred fetching jobs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, statusFilter, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); 
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1); 
  };

  const handleCopyLink = (job) => {
    // Generate link (assuming frontend routing or specific job apply page)
    const slug = job.title.toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/jobs/apply/${slug}-${job._id}`; // Adjust base URL
    navigator.clipboard.writeText(link);
    alert('Application link copied to clipboard!');
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      setIsDeleting(id);
      setError(null);
      try {
        const result = await jobService.deleteJob(id);
        if (result.success) {
          setJobs(prevJobs => prevJobs.filter(job => job._id !== id));
          // Optionally, re-fetch or adjust total counts if needed for pagination
        } else {
          setError(result.error || 'Failed to delete job.');
        }
      } catch (err) {
        setError('An unexpected error occurred while deleting the job.');
        console.error(err);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdatingStatus(id);
    setError(null);
    try {
      const result = await jobService.updateJobStatus(id, newStatus);
      if (result.success && result.job) {
        setJobs(prevJobs => prevJobs.map(j => j._id === id ? { ...j, status: result.job.status } : j));
      } else {
        setError(result.error || 'Failed to update job status.');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating status.');
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default'; // Or 'info'
      case 'paused': return 'warning';
      case 'closed': return 'destructive'; // Shadcn 'destructive'
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Job Title',
      render: (job) => (
        <div>
          <Link to={`/jobs/edit/${job._id}`} className="font-medium text-primary-600 hover:underline">{job.title}</Link>
          <p className="text-sm text-gray-500 truncate max-w-xs">{job.company || 'N/A Company'}</p>
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (job) => (
        <div className="text-sm">
          {job.location}
          {job.isRemote && (<Badge variant="outline" className="ml-2 text-xs">Remote</Badge>)}
        </div>
      )
    },
    {
      key: 'applicationsCount',
      title: 'Applied',
      render: (job) => (
        <Link to={`/candidates?jobId=${job._id}`} className="text-sm flex items-center text-primary-600 hover:underline">
           {/* Placeholder icon, you can replace or remove */}
          <span>{job.applicationsCount || 0}</span>
        </Link>
      )
    },
    {
        key: 'matchedCandidatesCount', // New
        title: 'Matched',
        render: (job) => (
          <span className="text-sm">{job.matchedCandidatesCount || 0}</span>
          // Optionally link this to a filtered candidate list for this job showing matched candidates
        )
    },
    {
      key: 'status',
      title: 'Status',
      render: (job) => (
        <Select 
          value={job.status} 
          onValueChange={(value) => handleUpdateStatus(job._id, value)}
          disabled={isUpdatingStatus === job._id}
        >
          <SelectTrigger className="w-32 text-xs h-8">
            {isUpdatingStatus === job._id ? <Spinner size="xs"/> : <Badge variant={getStatusBadgeVariant(job.status)}>{formatStatus(job.status)}</Badge>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archive</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      key: 'createdAt',
      title: 'Posted',
      render: (job) => <span className="text-sm text-gray-600">{formatDate(job.createdAt)}</span>
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (job) => (
        <div className="flex items-center space-x-1">
          <Button asChild variant="ghost" size="icon" title="View Job Details">
            <Link to={`/jobs/${job._id}`}> {/* Assuming you'll have a JobDetail page */}
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleCopyLink(job)} title="Copy application link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" size="icon" title="Edit Job">
             <Link to={`/jobs/edit/${job._id}`}>
                <Pencil className="h-4 w-4 text-blue-600" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job._id)} title="Delete Job" disabled={isDeleting === job._id}>
            {isDeleting === job._id ? <Spinner size="xs"/> : <Trash className="h-4 w-4 text-red-600" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Job Postings"
        description="Manage your company's open positions."
        actions={
          <>
            {/* <Button to="/jobs/dashboard" variant="outline" leftIcon={<BarChart2 className="h-4 w-4"/>}>View Dashboard</Button> */}
            <Button asChild variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              <Link to="/jobs/create">Create New Job</Link>
            </Button>
          </>
        }
      />

      {error && (<Alert variant="destructive" className="mb-4">{error}</Alert>)}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by title, company, skill..."
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              className="md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                {statusFilter === 'all' ? 'All Statuses' : formatStatus(statusFilter)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {loading && jobs.length === 0 ? (
        <div className="flex justify-center items-center py-10"><Spinner size="lg"/> <span className="ml-2">Loading jobs...</span></div>
      ) : (
        <DataTable
            data={jobs}
            columns={columns}
            isLoading={loading && jobs.length > 0} // Show table with spinner overlay if loading more pages
            emptyState={<div className="text-center py-10">No job postings found. <Link to="/jobs/create" className="text-primary-600 hover:underline">Create one now!</Link></div>}
        />
      )}

      {totalPages > 1 && !loading && (
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

function formatStatus(status) {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1);
}