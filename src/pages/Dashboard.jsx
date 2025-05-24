// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  CheckCircle,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  MessageCircle,
  Link2,
  FileText
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge, 
  PageHeader, 
  Spinner,
  Alert,
  DataTable,
  Button
} from '../components/ui';
import { getDashboardStats, getRecentCandidates, getUpcomingInterviews } from '../services/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data in parallel
        const [statsRes, candidatesRes, interviewsRes] = await Promise.all([
          getDashboardStats(),
          getRecentCandidates(),
          getUpcomingInterviews()
        ]);
        
        // Check for any errors
        if (!statsRes.success) {
          setError(statsRes.error || 'Failed to fetch dashboard statistics');
          return;
        }
        
        if (!candidatesRes.success) {
          setError(candidatesRes.error || 'Failed to fetch recent candidates');
          return;
        }
        
        if (!interviewsRes.success) {
          setError(interviewsRes.error || 'Failed to fetch upcoming interviews');
          return;
        }
        
        // Format stats for UI
        const formattedStats = [
          { 
            id: 1, 
            name: 'Total Candidates', 
            value: statsRes.stats.totalCandidates, 
            icon: Users, 
            change: statsRes.stats.candidatesChange, 
            changeType: 'increase' 
          },
          { 
            id: 2, 
            name: 'Active Jobs', 
            value: statsRes.stats.activeJobs, 
            icon: Briefcase, 
            change: statsRes.stats.jobsChange, 
            changeType: 'increase' 
          },
          { 
            id: 3, 
            name: 'Interviews Scheduled', 
            value: statsRes.stats.interviewsScheduled, 
            icon: Calendar, 
            change: statsRes.stats.interviewsChange, 
            changeType: 'increase' 
          },
          { 
            id: 4, 
            name: 'Hired This Month', 
            value: statsRes.stats.hiredThisMonth, 
            icon: CheckCircle, 
            change: statsRes.stats.hiredChange, 
            changeType: 'increase' 
          },
        ];
        
        // Update state
        setStats(formattedStats);
        setRecentCandidates(candidatesRes.candidates);
        setUpcomingInterviews(interviewsRes.interviews);
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  const statusBadgeMap = {
    'Interview': <Badge variant="warning">Interview</Badge>,
    'Technical Test': <Badge variant="primary">Technical Test</Badge>,
    'Screened': <Badge variant="default">Screened</Badge>,
    'Offer': <Badge variant="success">Offer</Badge>
  };

  // Table columns for recent candidates
  const candidateColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (candidate) => (
        <div className="font-medium text-gray-900">{candidate.name}</div>
      )
    },
    {
      key: 'position',
      title: 'Position',
      render: (candidate) => (
        <div className="text-gray-500">{candidate.position}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (candidate) => statusBadgeMap[candidate.status] || candidate.status
    },
    {
      key: 'date',
      title: 'Date',
      render: (candidate) => (
        <div className="text-gray-500">{formatDate(candidate.date)}</div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link to="/shareable-discussions" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shareable Discussions</h3>
              <p className="text-sm text-gray-500 flex-grow">
                Create shareable links for candidate soft skill assessments - no login required
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Generate Links
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/group-discussion" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Group Discussion</h3>
              <p className="text-sm text-gray-500 flex-grow">
                Test the discussion simulator with AI agents to evaluate collaboration skills
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Try It Out
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/candidates/import" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Candidates</h3>
              <p className="text-sm text-gray-500 flex-grow">
                Upload resumes and CVs to automatically analyze and match with job openings
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-green-300 text-green-700 hover:bg-green-50"
              >
                Import Now
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-full bg-primary-100">
                  <stat.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>{' '}
                <span className="text-gray-500">from last month</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Candidates */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
              <CardTitle>Recent Candidates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentCandidates.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No recent candidates found.
              </div>
            ) : (
              <DataTable
                data={recentCandidates}
                columns={candidateColumns}
                onRowClick={(candidate) => console.log('Clicked candidate:', candidate)}
                emptyState={
                  <div className="p-6 text-center text-sm text-gray-500">
                    No recent candidates found.
                  </div>
                }
              />
            )}
          </CardContent>
          <CardFooter>
            <Link
              to="/candidates"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
            >
              View all candidates
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary-500 mr-2" />
              <CardTitle>Upcoming Interviews</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <div className="text-center text-sm text-gray-500">
                No upcoming interviews scheduled.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingInterviews.map((interview) => (
                  <li key={interview.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                          {interview.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{interview.name}</p>
                        <p className="text-sm text-gray-500 truncate">{interview.position}</p>
                      </div>
                      <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                        <p className="font-medium text-primary-600">{interview.time}</p>
                        <p>{formatDate(interview.date)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter>
            <Link
              to="/calendar"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
            >
              View calendar
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}