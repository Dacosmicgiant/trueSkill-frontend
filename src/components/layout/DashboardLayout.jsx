// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Home, 
  Briefcase, 
  Users, 
  Settings, 
  BarChart2, 
  X, 
  Menu as MenuIcon, 
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to redirect
      navigate('/login');
    }
  };

  // Get the username to display
  const userName = user?.name || 'User';

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/80 lg:hidden z-40" />
          <Dialog.Content className="fixed inset-0 flex lg:hidden z-40">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Dialog.Close className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </Dialog.Close>
              </div>
              
              {/* Sidebar component for mobile */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link to="/dashboard" className="flex items-center">
                    <img className="h-8 w-auto" src="/logo.svg" alt="trueSkill" />
                    <span className="ml-2 text-xl font-bold text-primary-600">trueSkill</span>
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              className={cn(
                                isActive(item.href)
                                  ? 'bg-primary-50 text-primary-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                                'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6'
                              )}
                            >
                              <item.icon
                                className={cn(
                                  isActive(item.href)
                                    ? 'text-primary-600'
                                    : 'text-gray-400 group-hover:text-primary-600',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 py-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/dashboard" className="flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="trueSkill" />
              <span className="ml-2 text-xl font-bold text-primary-600">trueSkill</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive(item.href)
                              ? 'text-primary-600'
                              : 'text-gray-400 group-hover:text-primary-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                >
                  <LogOut
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 lg:mx-auto bg-white">
          <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 justify-end">
              {/* Profile dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {userName}
                    </span>
                  </span>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="absolute right-0 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-primary-50 outline-none cursor-pointer">
                      <Link to="/settings" className="block w-full">
                        Settings
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item 
                      className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-primary-50 outline-none cursor-pointer"
                      onSelect={handleLogout}
                    >
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}