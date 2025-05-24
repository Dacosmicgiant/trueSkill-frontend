// src/components/job/JobMatchList.jsx
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Button,
  Alert
} from '../ui';
import JobMatchCard from './JobMatchCard';

export default function JobMatchList({ 
  matches, 
  onAddCandidate,
  candidateAddedJobs = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterThreshold, setFilterThreshold] = useState(0);
  
  // Filter and sort matches
  const filteredMatches = matches
    .filter(match => 
      // Filter by search query
      match.job_title.toLowerCase().includes(searchQuery.toLowerCase()) &&
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Match Results</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters and Controls */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
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
                <Filter className="h-4 w-4 mr-2" />
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
        
        {/* Match Results */}
        {filteredMatches.length === 0 ? (
          <Alert variant="info">
            No job matches found matching your filters.
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => (
              <JobMatchCard
                key={match.job_id || index}
                match={match}
                onAddCandidate={onAddCandidate}
                candidateAlreadyAdded={candidateAddedJobs.includes(match.job_id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}