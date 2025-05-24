// src/pages/Jobs/JobDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle, 
  ExternalLink, 
  Share2, 
  Copy, 
  Edit, 
  LinkIcon,
  FileText,
  Building,
  Layers,
  DollarSign,
  Clock,
  Globe,
  Award,
  Clipboard,
  Check,
  X,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { getJobById } from '../../services/jobService';
import { 
  Button, 
  PageHeader, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Badge,
  Alert,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input
} from '../../components/ui';
import { cn } from '../../utils/cn';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [sharableLinkCopied, setSharableLinkCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  
  useEffect(() => {
    async function fetchJobDetails() {
      setLoading(true);
      setError(null);
      try {
        const result = await getJobById(id);
        if (result.success && result.job) {
          setJob(result.job);
        } else {
          setError(result.error || 'Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('An unexpected error occurred while loading the job details');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  // Generate shareable application link
  const getShareableLink = () => {
    if (!job) return '';
    const slug = job.title.toLowerCase().replace(/\s+/g, '-');
    return `${window.location.origin}/jobs/apply/${slug}-${job._id}`;
  };

  // Generate shareable message with job details
  const getShareableMessage = () => {
    if (!job) return '';
    
    const link = getShareableLink();
    const driveLink = job.googleDriveFolder ? `\nApplication materials: ${job.googleDriveFolder}` : '';
    
    return `Job Opportunity: ${job.title} at ${job.company || 'Our Company'}

We're looking for a ${job.title} to join our team${job.department ? ` in the ${job.department} department` : ''}. This is a ${job.employmentType.replace('-', ' ')} position${job.isRemote ? ' (remote)' : ` located in ${job.location}`}.

${job.description.substring(0, 300)}${job.description.length > 300 ? '...' : ''}

Key Skills: ${job.targetCandidateProfile?.keySkills?.map(skill => skill.name).join(', ') || 'Various skills required'}

${job.salaryRange?.min ? `Salary Range: ${formatSalary(job.salaryRange)}` : ''}

Apply here: ${link}${driveLink}

We look forward to your application!`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(
      () => {
        if (type === 'link') {
          setSharableLinkCopied(true);
          setTimeout(() => setSharableLinkCopied(false), 2000);
        } else if (type === 'message') {
          setMessageCopied(true);
          setTimeout(() => setMessageCopied(false), 2000);
        }
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Not specified';
    
    const { min, max, currency = 'USD', period = 'annually' } = salaryRange;
    const currencySymbol = currency === 'USD' ? '$' : currency;
    
    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()} ${period}`;
    } else if (min) {
      return `From ${currencySymbol}${min.toLocaleString()} ${period}`;
    } else if (max) {
      return `Up to ${currencySymbol}${max.toLocaleString()} ${period}`;
    }
    
    return 'Not specified';
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'paused': return 'warning';
      case 'closed': return 'destructive';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getSkillImportanceBadgeVariant = (importance) => {
    switch (importance) {
      case 'must-have': return 'destructive';
      case 'nice-to-have': return 'success';
      case 'bonus': return 'secondary';
      default: return 'default';
    }
  };

  const getExperienceLevelLabel = (level) => {
    const levels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead Level',
      'any': 'Any Experience'
    };
    return levels[level] || level;
  };

  const getEmploymentTypeLabel = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="xl" className="mb-4" />
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </Alert>
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button variant="primary" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const shareableLink = getShareableLink();
  const shareableMessage = getShareableMessage();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader
        title={job.title}
        description={
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize">
              {job.status}
            </Badge>
            {job.company && (
              <span className="flex items-center text-gray-600">
                <Building className="h-4 w-4 mr-1" />
                {job.company}
              </span>
            )}
            <span className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
              {job.isRemote && <Badge variant="outline" className="ml-1">Remote</Badge>}
            </span>
            <span className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              Posted {formatDate(job.createdAt)}
            </span>
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              className="ml-2"
              leftIcon={<Share2 className="h-4 w-4" />}
              onClick={() => copyToClipboard(shareableLink, 'link')}
            >
              {sharableLinkCopied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button asChild variant="primary" leftIcon={<Edit className="h-4 w-4" />}>
              <Link to={`/jobs/edit/${job._id}`}>Edit Job</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="whitespace-pre-line">{job.description}</div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Requirements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Building className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Company</div>
                  <div className="text-sm text-gray-600">{job.company || 'Not specified'}</div>
                </div>
              </div>
              
              {job.department && (
                <div className="flex items-start">
                  <Layers className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Department</div>
                    <div className="text-sm text-gray-600">{job.department}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Experience Level</div>
                  <div className="text-sm text-gray-600">{getExperienceLevelLabel(job.experienceLevel)}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Employment Type</div>
                  <div className="text-sm text-gray-600">{getEmploymentTypeLabel(job.employmentType)}</div>
                </div>
              </div>
              
              {(job.salaryRange?.min || job.salaryRange?.max) && (
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Salary Range</div>
                    <div className="text-sm text-gray-600">{formatSalary(job.salaryRange)}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Globe className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Location</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    {job.location}
                    {job.isRemote && <Badge variant="outline" size="sm" className="ml-2">Remote</Badge>}
                  </div>
                </div>
              </div>
              
              {job.targetCandidateProfile?.educationLevel && job.targetCandidateProfile.educationLevel !== 'any' && (
                <div className="flex items-start">
                  <Award className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Education Level</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {job.targetCandidateProfile.educationLevel.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              )}
              
              {job.googleDriveFolder && (
                <div className="flex items-start">
                  <FileText className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Application Materials</div>
                    <a 
                      href={job.googleDriveFolder} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline flex items-center"
                    >
                      Google Drive Folder
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {job.targetCandidateProfile?.keySkills && job.targetCandidateProfile.keySkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.targetCandidateProfile.keySkills
                    .filter(skill => skill.name && skill.name.trim() !== '')
                    .map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant={getSkillImportanceBadgeVariant(skill.importance)}
                        className="flex items-center py-1"
                      >
                        {skill.importance === 'must-have' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {skill.name}
                      </Badge>
                    ))}
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span>Must-have</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Nice-to-have</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                    <span>Bonus</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {job.targetCandidateProfile?.preferredCertifications && 
            job.targetCandidateProfile.preferredCertifications.length > 0 && 
            job.targetCandidateProfile.preferredCertifications.some(cert => cert.trim() !== '') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferred Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {job.targetCandidateProfile.preferredCertifications
                    .filter(cert => cert.trim() !== '')
                    .map((cert, index) => (
                      <li key={index} className="text-sm">{cert}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-primary-600" />
            Share Job Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="link">
            <TabsList className="mb-4">
              <TabsTrigger value="link">Application Link</TabsTrigger>
              <TabsTrigger value="message">Full Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="link" className="space-y-4">
              <div className="flex items-center">
                <Input
                  value={shareableLink}
                  readOnly
                  className="bg-gray-50 flex-1"
                  leftIcon={<LinkIcon className="h-4 w-4 text-gray-400" />}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(shareableLink, 'link')}
                >
                  {sharableLinkCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                This is a direct application link you can share with candidates.
              </div>
            </TabsContent>
            
            <TabsContent value="message" className="space-y-4">
              <div className="relative">
                <textarea
                  value={shareableMessage}
                  readOnly
                  rows={12}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(shareableMessage, 'message')}
                >
                  {messageCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                This pre-formatted message includes key job details and the application link.
                Perfect for sharing via email or messaging platforms.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        {job.googleDriveFolder && (
          <CardFooter className="bg-gray-50 border-t">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700 mr-2">Google Drive Folder:</span>
              <a 
                href={job.googleDriveFolder}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline flex-1 truncate"
              >
                {job.googleDriveFolder}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(job.googleDriveFolder, 'drive')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
        <Button asChild variant="primary">
          <Link to={`/jobs/edit/${job._id}`}>Edit Job</Link>
        </Button>
      </div>
    </div>
  );
}