
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Award, Calendar, Clock } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const getAvailabilityText = () => {
    const { timeOfDay, daysOfWeek } = currentUser.availability;
    
    let timeText = '';
    if (timeOfDay.length === 3) {
      timeText = 'Tutto il giorno';
    } else if (timeOfDay.length > 0) {
      timeText = timeOfDay.join(', ');
    }
    
    let daysText = '';
    if (daysOfWeek.length === 2) {
      daysText = 'Tutti i giorni';
    } else if (daysOfWeek.length > 0) {
      daysText = daysOfWeek.join(', ');
    }
    
    if (timeText && daysText) {
      return `${timeText}, ${daysText}`;
    } else {
      return timeText || daysText || 'Non specificata';
    }
  };
  
  const getInitials = (): string => {
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <Avatar className="h-24 w-24 mb-4 sm:mb-0 sm:mr-6">
              {currentUser.profilePicture ? (
                <AvatarImage src={currentUser.profilePicture} alt={currentUser.firstName} />
              ) : (
                <AvatarFallback className="bg-woop-purple text-white text-3xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">
                {currentUser.firstName} {currentUser.lastName}
              </CardTitle>
              <p className="text-gray-600">{currentUser.age} anni</p>
              {currentUser.location && <p className="text-gray-600">{currentUser.location}</p>}
              {currentUser.email && <p className="text-gray-600">{currentUser.email}</p>}
              {currentUser.bio && <p className="mt-2">{currentUser.bio}</p>}
              
              {currentUser.rating && (
                <div className="flex items-center mt-2">
                  <Star className="fill-yellow-400 text-yellow-400 mr-1" size={16} />
                  <span>{currentUser.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Interessi</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Disponibilità</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar size={18} className="text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Giorni</p>
                    <p className="text-gray-600">
                      {currentUser.availability.daysOfWeek.length > 0
                        ? currentUser.availability.daysOfWeek.join(', ')
                        : 'Non specificati'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={18} className="text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Orari</p>
                    <p className="text-gray-600">
                      {currentUser.availability.timeOfDay.length > 0
                        ? currentUser.availability.timeOfDay.join(', ')
                        : 'Non specificati'}
                    </p>
                  </div>
                </div>
              </div>
              
              {currentUser.availability.flexibility && (
                <p className="mt-2 text-gray-600">
                  <span className="font-medium">Flessibilità:</span> {currentUser.availability.flexibility}
                </p>
              )}
            </div>
            
            {currentUser.badges && currentUser.badges.length > 0 && (
              <>
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Award size={18} className="text-gray-500 mr-2" />
                    Badge
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="py-2">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Torna alla Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
