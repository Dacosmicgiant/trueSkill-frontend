// src/pages/Auth/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert, Checkbox } from '../../components/ui';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Update local error state if auth context has an error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // If the user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Navigation will be handled by the effect above
      } else {
        setError(result.error || 'Failed to login. Please check your credentials.');
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
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign in to your account</h2>
      
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
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

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="remember-me"
            name="remember-me"
            label="Remember me"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />

          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            to="/register"
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Create a new account
          </Button>
        </div>
      </div>
    </div>
  );
}