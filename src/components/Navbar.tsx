
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';
import { Home, User, Search, Bell, Award } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string, surname: string): string => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-woop-purple">WoopIt</span>
            </Link>
          </div>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <Link to="/" className={`text-gray-600 hover:text-woop-purple ${isActive('/') ? 'text-woop-purple' : ''}`}>
                <Home size={24} />
              </Link>
              <Link to="/search" className={`text-gray-600 hover:text-woop-purple ${isActive('/search') ? 'text-woop-purple' : ''}`}>
                <Search size={24} />
              </Link>
              <Link to="/community" className={`text-gray-600 hover:text-woop-purple ${isActive('/community') ? 'text-woop-purple' : ''}`}>
                <Award size={24} />
              </Link>
              <Link to="/notifications" className={`text-gray-600 hover:text-woop-purple ${isActive('/notifications') ? 'text-woop-purple' : ''}`}>
                <Bell size={24} />
              </Link>
              <div className="relative">
                <Link to="/profile">
                  <Avatar className={`h-10 w-10 cursor-pointer ${isActive('/profile') ? 'ring-2 ring-woop-purple' : ''}`}>
                    {currentUser.profilePicture ? (
                      <AvatarImage src={currentUser.profilePicture} alt={currentUser.firstName} />
                    ) : (
                      <AvatarFallback className="bg-woop-purple text-white">
                        {getInitials(currentUser.firstName, currentUser.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
              </div>
              <Button variant="outline" onClick={handleLogout} className="ml-2">
                Esci
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Accedi</Button>
              </Link>
              <Link to="/register">
                <Button>Registrati</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
