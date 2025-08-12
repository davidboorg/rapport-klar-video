
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Play, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Avatars', href: '/avatars' },
    { name: 'Templates', href: '/templates' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Global Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ReportFlow
                </h1>
                <span className="text-xs text-slate-400 font-medium">AI-Powered</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 shadow-sm border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-400/50 transition-all duration-200">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 bg-black/90 backdrop-blur border-white/20 shadow-2xl" align="end">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium leading-none text-white">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs leading-none text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                        <User className="mr-2 h-4 w-4 text-slate-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                        <Settings className="mr-2 h-4 w-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="flex items-center space-x-3 p-2 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="h-10 w-10 p-0 hover:bg-white/10 text-slate-300"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-black/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
