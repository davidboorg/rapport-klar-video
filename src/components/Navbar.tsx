
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
    <nav className="bg-black/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-brand-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-accent-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold gradient-text">ReportFlow</h1>
                <span className="text-xs text-neutral-500 font-medium">AI-Powered</span>
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
                      ? "bg-accent-900/50 text-accent-400 shadow-sm border border-accent-700/30"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-accent-500/30 transition-all duration-200">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-accent-500 to-brand-600 text-white font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 bg-neutral-900 border-neutral-700" align="end">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium leading-none text-white">
                        {email.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-neutral-400">
                        {email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800 text-neutral-300">
                      <User className="mr-2 h-4 w-4 text-neutral-500" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/avatars" className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800 text-neutral-300">
                      <User className="mr-2 h-4 w-4 text-neutral-500" />
                      <span>Mina Avatarer</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800 text-neutral-300">
                      <Settings className="mr-2 h-4 w-4 text-neutral-500" />
                      <span>Inställningar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center space-x-3 p-2 rounded-md text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
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
              className="h-10 w-10 p-0 hover:bg-neutral-800"
            >
              <Menu className="h-6 w-6 text-neutral-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-black/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.current
                    ? "bg-accent-900/50 text-accent-400"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-4 pb-3 mt-4 border-neutral-800">
              <div className="flex items-center px-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-accent-500 to-brand-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {email.split('@')[0]}
                  </div>
                  <div className="text-sm font-medium text-neutral-400">{email}</div>
                </div>
              </div>
              <div className="space-y-1 px-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Profil
                </Link>
                <Link
                  to="/avatars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Mina Avatarer
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30"
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
