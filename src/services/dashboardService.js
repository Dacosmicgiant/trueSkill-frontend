// src/services/dashboardService.js
import { get } from './api';

export const getDashboardStats = async () => {
  try {
    // This would be a real API endpoint in a production app
    // For now, we'll simulate a response
    // const response = await get('/dashboard/stats');
    
    // Simulate API response
    return {
      success: true,
      stats: {
        totalCandidates: 128,
        candidatesChange: '+12%',
        activeJobs: 8,
        jobsChange: '+2',
        interviewsScheduled: 24,
        interviewsChange: '+5',
        hiredThisMonth: 5,
        hiredChange: '+2'
      }
    };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch dashboard statistics' };
  }
};

export const getRecentCandidates = async (limit = 4) => {
  try {
    // This would be a real API endpoint in a production app
    // const response = await get('/dashboard/recent-candidates', { limit });
    
    // Simulate API response
    return {
      success: true,
      candidates: [
        { id: 1, name: 'Emily Johnson', position: 'Frontend Developer', status: 'Interview', date: '2025-05-18' },
        { id: 2, name: 'Michael Chen', position: 'Backend Developer', status: 'Technical Test', date: '2025-05-18' },
        { id: 3, name: 'Sarah Williams', position: 'UI/UX Designer', status: 'Screened', date: '2025-05-17' },
        { id: 4, name: 'Alex Rodriguez', position: 'DevOps Engineer', status: 'Offer', date: '2025-05-16' }
      ]
    };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch recent candidates' };
  }
};

export const getUpcomingInterviews = async (limit = 3) => {
  try {
    // This would be a real API endpoint in a production app
    // const response = await get('/dashboard/upcoming-interviews', { limit });
    
    // Simulate API response
    return {
      success: true,
      interviews: [
        { id: 1, name: 'Emily Johnson', position: 'Frontend Developer', time: '10:30 AM', date: '2025-05-20' },
        { id: 2, name: 'Michael Chen', position: 'Backend Developer', time: '2:00 PM', date: '2025-05-21' },
        { id: 3, name: 'David Kim', position: 'Full Stack Developer', time: '11:45 AM', date: '2025-05-22' }
      ]
    };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch upcoming interviews' };
  }
};