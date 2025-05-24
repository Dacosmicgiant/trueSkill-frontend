// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Page not found</h2>
        <p className="mt-4 text-lg text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-10 flex justify-center">
          <Button
            to="/dashboard"
            variant="primary"
            size="lg"
            leftIcon={<ArrowLeft className="h-5 w-5" />}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}