import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { forumClient, getSessionToken } from '../../forum-client.ts';
import { BellIcon, UserIcon, HomeIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ForumLayoutProps {
  children: React.ReactNode;
}

export function ForumLayout({ children }: ForumLayoutProps) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  React.useEffect(() => {
    const token = getSessionToken();
    if (token && !currentUser) {
      loadCurrentUser();
    }
  }, []);

  const loadCurrentUser = async () => {
    setIsLoading(true);
    try {
      const user = await forumClient.auth.getCurrentUser({ sessionToken: getSessionToken()! });
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await forumClient.auth.logout({ sessionToken: getSessionToken()! });
      setCurrentUser(null);
      localStorage.removeItem('forum-session');
      window.location.href = '/forum';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-primary-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/forum" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  ScooterTalk
                </h1>
                <p className="text-xs text-neutral-500">Electric scooter community</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/forum"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/forum') && !isActive('/forum/board')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <HomeIcon className="w-4 h-4 inline mr-1" />
                Home
              </Link>
              <Link
                to="/forum/create"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/forum/create')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                New Topic
              </Link>
              <Link
                to="/forum/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/forum/search')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Search
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>

              {isLoading ? (
                <div className="w-8 h-8 bg-neutral-200 animate-pulse rounded-full"></div>
              ) : currentUser ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700">{currentUser.username}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link to="/forum/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        Profile
                      </Link>
                      <Link to="/forum/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        Settings
                      </Link>
                      <hr className="my-1 border-neutral-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/forum/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/forum/register"
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-neutral-500 text-sm">
              <span>© 2024 ScooterTalk</span>
              <span>•</span>
              <span>An electric scooter community</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-neutral-500">
              <Link to="/forum/about" className="hover:text-primary-600 transition-colors">About</Link>
              <Link to="/forum/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
              <Link to="/forum/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
              <Link to="/forum/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}