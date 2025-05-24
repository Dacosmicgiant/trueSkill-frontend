// src/pages/Auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Button, 
  Input, 
  Alert
} from '../../components/ui';
import { Mail, Lock, User, Building, Briefcase } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await register(name, email, password, company, position);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Create an account</h2>
      
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="h-5 w-5 text-gray-400" />}
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="company"
            name="company"
            type="text"
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            leftIcon={<Building className="h-5 w-5 text-gray-400" />}
          />

          <Input
            id="position"
            name="position"
            type="text"
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            leftIcon={<Briefcase className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
        />

        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Register
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            to="/login"
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Sign in instead
          </Button>
        </div>
      </div>
    </div>
  );
}