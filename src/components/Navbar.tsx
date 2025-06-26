
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Play, Settings, User, LogOut, Menu, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", current: location.pathname === "/dashboard" },
    { name: "Projekt", href: "/projects", current: location.pathname === "/projects" },
    { name: "Avatarer", href: "/avatars", current: location.pathname.startsWith("/avatars") },
    { name: "Mallar", href: "/templates", current: location.pathname === "/templates" },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const email = user?.email || "";
  const userInitials = email ? email.substring(0, 2).toUpperCase() : "U";

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ReportFlow
                </h1>
                <span className="text-xs text-slate-400 font-medium">AI-Powered</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 shadow-sm border border-blue-500/30 backdrop-blur"
                      : "text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
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
                        {email.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-slate-400">
                        {email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/avatars" className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      <span>Mina Avatarer</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                      <Settings className="mr-2 h-4 w-4 text-slate-400" />
                      <span>Inställningar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center space-x-3 p-2 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logga ut</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 p-0 hover:bg-white/10 text-slate-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
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
                  item.current
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-4 pb-3 mt-4 border-white/20">
              <div className="flex items-center px-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {email.split('@')[0]}
                  </div>
                  <div className="text-sm font-medium text-slate-400">{email}</div>
                </div>
              </div>
              <div className="space-y-1 px-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Profil
                </Link>
                <Link
                  to="/avatars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Mina Avatarer
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  Logga ut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
