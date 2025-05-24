import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Copy as CopyIcon, ArrowLeft, Trash2 } from 'lucide-react'; // Added Trash2 for skill item delete
import { 
  createJob, 
  getJobById, 
  updateJob 
} from '../../services/jobService'; // Assuming jobService is updated for new fields
import { cn } from '../../utils/cn';
import {
  Button,
  Input,
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Checkbox,
  Alert,
  Spinner
} from '../../components/ui';

const initialTargetCandidateProfile = {
  keySkills: [{ name: '', importance: 'nice-to-have', weight: 0.5 }], // Default skill structure
  minExperienceYears: '',
  maxExperienceYears: '',
  preferredCertifications: [''],
  educationLevel: 'any',
  searchKeywords: [''],
};

const initialSalaryRange = {
  min: '',
  max: '',
  currency: 'USD',
  period: 'annually',
};

const initialJobData = {
  title: '',
  description: '',
  requirements: [''],
  // 'skills' array is now inside targetCandidateProfile
  location: '',
  isRemote: false,
  experienceLevel: 'any', // General experience level for the job posting
  employmentType: 'full-time',
  salaryRange: initialSalaryRange,
  googleDriveFolder: '',
  company: '',
  department: '', // New field
  targetCandidateProfile: initialTargetCandidateProfile,
  status: 'draft', // Default status
};

const experienceLevelOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead Level' },
  { value: 'any', label: 'Any Experience' },
];

const employmentTypeOptions = [
  // ... same as before
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

const skillImportanceOptions = [
    { value: 'must-have', label: 'Must-Have' },
    { value: 'nice-to-have', label: 'Nice-to-Have' },
    { value: 'bonus', label: 'Bonus' },
];

const educationLevelOptions = [
    { value: 'any', label: 'Any' },
    { value: 'high-school', label: 'High School Diploma/GED' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate (PhD, EdD, etc.)' },
];

const salaryPeriods = [
    {value: 'hourly', label: 'Hourly'},
    {value: 'monthly', label: 'Monthly'},
    {value: 'annually', label: 'Annually'},
];


export default function JobCreation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(JSON.parse(JSON.stringify(initialJobData))); // Deep copy
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareableLink, setShareableLink] = useState(''); // Assuming this still comes from backend or is generated
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchJob(id);
    } else {
      // Ensure a deep copy of initialJobData is used to avoid shared object references
      setJobData(JSON.parse(JSON.stringify(initialJobData)));
      setShareableLink('');
    }
  }, [isEditing, id]);

  const fetchJob = async (jobId) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getJobById(jobId);
      if (result.success && result.job) {
        const fetchedJob = result.job;
        // Ensure all nested structures have defaults if not present in fetched data
        const formattedJob = {
          ...initialJobData, // Start with full structure
          ...fetchedJob,
          requirements: fetchedJob.requirements?.length ? fetchedJob.requirements : [''],
          targetCandidateProfile: {
            ...initialTargetCandidateProfile,
            ...(fetchedJob.targetCandidateProfile || {}),
            keySkills: fetchedJob.targetCandidateProfile?.keySkills?.length 
                ? fetchedJob.targetCandidateProfile.keySkills 
                : [{ name: '', importance: 'nice-to-have', weight: 0.5 }],
            preferredCertifications: fetchedJob.targetCandidateProfile?.preferredCertifications?.length 
                ? fetchedJob.targetCandidateProfile.preferredCertifications 
                : [''],
            searchKeywords: fetchedJob.targetCandidateProfile?.searchKeywords?.length
                ? fetchedJob.targetCandidateProfile.searchKeywords
                : [''],
          },
          salaryRange: {
            ...initialSalaryRange,
            ...(fetchedJob.salaryRange || {}),
          },
        };
        setJobData(formattedJob);

        // Handle shareableLink generation or retrieval
        if (fetchedJob._id) { // Assuming _id means it's a saved job
          const slug = fetchedJob.title.toLowerCase().replace(/\s+/g, '-');
          setShareableLink(`https://yourapp.com/jobs/apply/${slug}-${fetchedJob._id}`); // Update domain
        }

      } else {
        setError(result.error || 'Failed to fetch job data');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (eOrValue) => {
    let name, value, type, checked;
    if (eOrValue && eOrValue.target) { // Standard event
      ({ name, value, type, checked } = eOrValue.target);
    } else if (typeof eOrValue === 'object' && eOrValue !== null && 'name' in eOrValue) { // Custom object for Selects etc.
      ({ name, value, type } = eOrValue); // checked might not be relevant here
    } else {
      return; // Invalid input
    }
  
    // Handle nested properties like salaryRange.min or targetCandidateProfile.minExperienceYears
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setJobData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value),
        },
      }));
    } else {
      setJobData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value),
      }));
    }
  };
  
  // For arrays like requirements, targetCandidateProfile.preferredCertifications, targetCandidateProfile.searchKeywords
  const handleArrayInputChange = (path, index, value) => {
    const keys = path.split('.');
    setJobData(prev => {
      const newData = { ...prev };
      let currentLevel = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel = currentLevel[keys[i]];
      }
      const arrayField = keys[keys.length - 1];
      const newArray = [...(currentLevel[arrayField] || [])];
      newArray[index] = value;
      currentLevel[arrayField] = newArray;
      return newData;
    });
  };
  
  const addArrayItem = (path, newItem = '') => {
    const keys = path.split('.');
    setJobData(prev => {
      const newData = { ...prev };
      let currentLevel = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel = currentLevel[keys[i]];
      }
      const arrayField = keys[keys.length - 1];
      currentLevel[arrayField] = [...(currentLevel[arrayField] || []), newItem];
      return newData;
    });
  };
  
  const removeArrayItem = (path, index) => {
    const keys = path.split('.');
    setJobData(prev => {
      const newData = { ...prev };
      let currentLevel = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel = currentLevel[keys[i]];
      }
      const arrayField = keys[keys.length - 1];
      const oldArray = currentLevel[arrayField] || [];
      if (oldArray.length > 1) {
        const newArray = oldArray.filter((_, i) => i !== index);
        currentLevel[arrayField] = newArray;
      } else if (oldArray.length === 1) {
        // If it's an array of objects (like keySkills), reset the object. If strings, set to empty string.
        currentLevel[arrayField] = [typeof oldArray[0] === 'object' ? { name: '', importance: 'nice-to-have', weight: 0.5 } : ''];
      }
      return newData;
    });
  };

  // Specific handlers for keySkills array (array of objects)
  const handleKeySkillChange = (index, fieldName, value) => {
    setJobData(prev => {
        const newKeySkills = [...prev.targetCandidateProfile.keySkills];
        newKeySkills[index] = { ...newKeySkills[index], [fieldName]: value };
        return {
            ...prev,
            targetCandidateProfile: {
                ...prev.targetCandidateProfile,
                keySkills: newKeySkills,
            }
        };
    });
  };

  const addKeySkill = () => {
    addArrayItem('targetCandidateProfile.keySkills', { name: '', importance: 'nice-to-have', weight: 0.5 });
  };

  const removeKeySkill = (index) => {
    removeArrayItem('targetCandidateProfile.keySkills', index);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      // Deep clone and filter/format data before sending
      const payload = JSON.parse(JSON.stringify(jobData));

      payload.requirements = payload.requirements.filter(r => r.trim() !== '');
      
      if (payload.targetCandidateProfile) {
        payload.targetCandidateProfile.keySkills = payload.targetCandidateProfile.keySkills
            .filter(s => s.name && s.name.trim() !== '')
            .map(s => ({...s, weight: s.importance === 'must-have' ? 1.0 : (s.importance === 'nice-to-have' ? 0.5 : 0.2) })); // Example weight logic

        payload.targetCandidateProfile.preferredCertifications = payload.targetCandidateProfile.preferredCertifications
            .filter(c => c.trim() !== '');
        payload.targetCandidateProfile.searchKeywords = payload.targetCandidateProfile.searchKeywords
            .filter(k => k.trim() !== '');
        
        // Convert year fields to numbers or null
        payload.targetCandidateProfile.minExperienceYears = payload.targetCandidateProfile.minExperienceYears === '' ? null : Number(payload.targetCandidateProfile.minExperienceYears);
        payload.targetCandidateProfile.maxExperienceYears = payload.targetCandidateProfile.maxExperienceYears === '' ? null : Number(payload.targetCandidateProfile.maxExperienceYears);
      }
      if (payload.salaryRange) {
        payload.salaryRange.min = payload.salaryRange.min === '' ? null : Number(payload.salaryRange.min);
        payload.salaryRange.max = payload.salaryRange.max === '' ? null : Number(payload.salaryRange.max);
      }

      let result;
      if (isEditing) {
        result = await updateJob(id, payload);
      } else {
        result = await createJob(payload);
      }
      
      if (result.success) {
        setSuccess(isEditing ? 'Job updated successfully!' : 'Job created successfully!');
        const resultingJob = result.job;
        if (resultingJob && resultingJob._id) {
          const slug = resultingJob.title.toLowerCase().replace(/\s+/g, '-');
          setShareableLink(`https://yourapp.com/jobs/apply/${slug}-${resultingJob._id}`); // Update domain
          if (!isEditing) {
             setTimeout(() => {
               navigate(`/jobs/edit/${resultingJob._id}`); // Navigate to edit page after creation
             }, 1500);
          }
        }
      } else {
        setError(result.error || 'Failed to save job. Please check the form for errors.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) { // Only show full page loader when fetching existing job
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" /> <span className="ml-2">Loading job details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
        // ... back button ...
      />
      {/* ... error/success alerts ... */}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Job Info Card */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* ... title, description, requirements (keep as is), location, isRemote, experienceLevel, employmentType, company, department ... */}
            <Input id="title" name="title" label="Job Title*" required value={jobData.title} onChange={handleInputChange} />
            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Job Description*</label>
              <textarea id="description" name="description" rows={5} required value={jobData.description} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
             {/* Requirements (Array of strings) */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">General Requirements</label>
                {jobData.requirements.map((req, index) => (
                    <div key={`req-${index}`} className="flex items-center space-x-2">
                        <Input type="text" value={req} onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)} placeholder={`Requirement ${index + 1}`} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem('requirements', index)} disabled={jobData.requirements.length <= 1 && !jobData.requirements[0]?.trim()}><X size={16} /></Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('requirements')} leftIcon={<Plus size={16}/>}>Add Requirement</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="location" name="location" label="Location*" required value={jobData.location} onChange={handleInputChange} />
                <Input id="company" name="company" label="Company Name" value={jobData.company} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="department" name="department" label="Department (Optional)" value={jobData.department} onChange={handleInputChange} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <Select value={jobData.employmentType} onValueChange={(value) => handleInputChange({ name: 'employmentType', value })}>
                        <SelectTrigger>{employmentTypeOptions.find(o => o.value === jobData.employmentType)?.label}</SelectTrigger>
                        <SelectContent>{employmentTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level (Job)</label>
                    <Select value={jobData.experienceLevel} onValueChange={(value) => handleInputChange({ name: 'experienceLevel', value })}>
                        <SelectTrigger>{experienceLevelOptions.find(o => o.value === jobData.experienceLevel)?.label}</SelectTrigger>
                        <SelectContent>{experienceLevelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="flex items-center">
                    <Checkbox id="isRemote" name="isRemote" checked={jobData.isRemote} onCheckedChange={(checked) => handleInputChange({ name: 'isRemote', value: checked, type: 'checkbox' })} />
                    <label htmlFor="isRemote" className="ml-2 text-sm font-medium text-gray-700">This job is fully remote</label>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Candidate Profile Card */}
        <Card>
          <CardHeader><CardTitle>Target Candidate Profile</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Key Skills (Array of objects: name, importance) */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Key Skills</label>
              {jobData.targetCandidateProfile.keySkills.map((skill, index) => (
                <div key={`skill-${index}`} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2 items-center">
                  <Input type="text" value={skill.name} onChange={(e) => handleKeySkillChange(index, 'name', e.target.value)} placeholder="e.g. React, Node.js" required={index === 0 && !skill.name?.trim()}/>
                  <Select value={skill.importance} onValueChange={(value) => handleKeySkillChange(index, 'importance', value)}>
                    <SelectTrigger>{skillImportanceOptions.find(o => o.value === skill.importance)?.label}</SelectTrigger>
                    <SelectContent>{skillImportanceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeKeySkill(index)} disabled={jobData.targetCandidateProfile.keySkills.length <= 1 && !skill.name?.trim()}><Trash2 size={16} className="text-red-500"/></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addKeySkill} leftIcon={<Plus size={16}/>}>Add Key Skill</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="targetCandidateProfile.minExperienceYears" name="targetCandidateProfile.minExperienceYears" type="number" label="Min Experience (Years)" value={jobData.targetCandidateProfile.minExperienceYears} onChange={handleInputChange} placeholder="e.g. 3"/>
              <Input id="targetCandidateProfile.maxExperienceYears" name="targetCandidateProfile.maxExperienceYears" type="number" label="Max Experience (Years)" value={jobData.targetCandidateProfile.maxExperienceYears} onChange={handleInputChange} placeholder="e.g. 7"/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Education Level</label>
                <Select value={jobData.targetCandidateProfile.educationLevel} onValueChange={(value) => handleInputChange({ name: 'targetCandidateProfile.educationLevel', value })}>
                    <SelectTrigger>{educationLevelOptions.find(o => o.value === jobData.targetCandidateProfile.educationLevel)?.label}</SelectTrigger>
                    <SelectContent>{educationLevelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            {/* Preferred Certifications (Array of strings) */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Preferred Certifications (Optional)</label>
                {jobData.targetCandidateProfile.preferredCertifications.map((cert, index) => (
                    <div key={`cert-${index}`} className="flex items-center space-x-2">
                        <Input type="text" value={cert} onChange={(e) => handleArrayInputChange('targetCandidateProfile.preferredCertifications', index, e.target.value)} placeholder={`Certification ${index + 1}`} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem('targetCandidateProfile.preferredCertifications', index)} disabled={jobData.targetCandidateProfile.preferredCertifications.length <= 1 && !cert?.trim()}><X size={16} /></Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('targetCandidateProfile.preferredCertifications')} leftIcon={<Plus size={16}/>}>Add Certification</Button>
            </div>

            {/* Search Keywords (Array of strings) */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Additional Search Keywords (Optional)</label>
                {jobData.targetCandidateProfile.searchKeywords.map((keyword, index) => (
                    <div key={`keyword-${index}`} className="flex items-center space-x-2">
                        <Input type="text" value={keyword} onChange={(e) => handleArrayInputChange('targetCandidateProfile.searchKeywords', index, e.target.value)} placeholder={`Keyword ${index + 1}`} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem('targetCandidateProfile.searchKeywords', index)} disabled={jobData.targetCandidateProfile.searchKeywords.length <= 1 && !keyword?.trim()}><X size={16} /></Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('targetCandidateProfile.searchKeywords')} leftIcon={<Plus size={16}/>}>Add Keyword</Button>
            </div>
          </CardContent>
        </Card>

        {/* Salary & Logistics Card */}
        <Card>
            <CardHeader><CardTitle>Salary & Logistics</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
                    <Input id="salaryRange.min" name="salaryRange.min" type="number" label="Min Salary (Optional)" value={jobData.salaryRange.min} onChange={handleInputChange} placeholder="e.g. 70000"/>
                    <Input id="salaryRange.max" name="salaryRange.max" type="number" label="Max Salary (Optional)" value={jobData.salaryRange.max} onChange={handleInputChange} placeholder="e.g. 100000"/>
                    <div>
                         <label htmlFor="salaryRange.currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                         <Input id="salaryRange.currency" name="salaryRange.currency" value={jobData.salaryRange.currency} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-3">
                        <label htmlFor="salaryRange.period" className="block text-sm font-medium text-gray-700 mb-1">Salary Period</label>
                        <Select id="salaryRange.period" value={jobData.salaryRange.period} onValueChange={(value) => handleInputChange({ name: 'salaryRange.period', value })}>
                            <SelectTrigger>{salaryPeriods.find(o => o.value === jobData.salaryRange.period)?.label}</SelectTrigger>
                            <SelectContent>{salaryPeriods.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <Input id="googleDriveFolder" name="googleDriveFolder" type="url" label="Google Drive Folder URL (Optional)" value={jobData.googleDriveFolder} onChange={handleInputChange} placeholder="Link to folder for CVs"/>
            </CardContent>
        </Card>
        
        {/* ... Shareable Link Card (if isEditing or job is created) ... */}
        {/* ... Action Buttons (Submit, Cancel) ... */}
         <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="secondary" onClick={() => navigate('/jobs')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving || (isLoading && !isEditing)}>
            {isSaving ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Job Posting')}
          </Button>
        </div>
      </form>
    </div>
  );
}