// src/components/layout/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import { Card, CardContent } from '../ui';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.svg"
            alt="trueSkill"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">trueSkill</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Skills-based hiring platform for modern recruiters
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardContent className="py-8 px-4 sm:px-10">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}