import React, { useState, useRef } from 'react';
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
import { Star, Award, Calendar, Clock, Upload, Image, X } from 'lucide-react';
import { toast } from 'sonner';

const MAX_PHOTOS = 7;
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<'info' | 'photos'>('info');
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const getInitials = (): string => {
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    if (currentUser.photos.length >= MAX_PHOTOS) {
      toast.error(`Puoi caricare massimo ${MAX_PHOTOS} foto. Elimina qualcuna prima di aggiungerne altre.`);
      return;
    }
  
    const file = files[0];
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const newPhoto = event.target.result;
        const updatedPhotos = [...(currentUser.photos || []), newPhoto];
        const updatedProfilePicture = currentUser.profilePicture || newPhoto;
  
        const updatedUser = {
          ...currentUser,
          photos: updatedPhotos,
          profilePicture: updatedProfilePicture,
        };
  
        setCurrentUser(updatedUser);
  
        try {
          await fetch(`http://localhost:3001/api/users/${currentUser.id}/photo`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profilePicture: updatedProfilePicture,
              photos: updatedPhotos,
            }),
          });
          toast.success('Foto caricata e salvata!');
        } catch (error) {
          console.error("Errore salvataggio foto:", error);
          toast.error("Errore durante il salvataggio della foto");
        }
      }
    };
  
    reader.readAsDataURL(file);
  
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  

  const handleSetProfilePicture = async (photo: string) => {
    const updatedUser = {
      ...currentUser,
      profilePicture: photo
    };
    setCurrentUser(updatedUser);

    try {
      await fetch(`${API}/api/users/${currentUser.id}/photo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profilePicture: photo,
          photos: currentUser.photos
        })
      });
      toast.success('Foto profilo aggiornata!');
    } catch (error) {
      console.error("Errore salvataggio foto:", error);
      toast.error("Errore durante il salvataggio della foto");
    }
  };

  const handleDeletePhoto = (photoToDelete: string) => {
    const newPhotos = currentUser.photos.filter(photo => photo !== photoToDelete);
    
    let newProfilePicture = currentUser.profilePicture;
    if (currentUser.profilePicture === photoToDelete) {
      newProfilePicture = newPhotos.length > 0 ? newPhotos[0] : undefined;
    }
    
    setCurrentUser({
      ...currentUser,
      photos: newPhotos,
      profilePicture: newProfilePicture
    });
    
    toast.success('Foto eliminata!');
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
          
          <div className="flex space-x-2 mt-4 justify-center sm:justify-start">
            <Button 
              variant={selectedTab === 'info' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('info')}
              className="flex items-center"
            >
              Informazioni
            </Button>
            <Button 
              variant={selectedTab === 'photos' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('photos')}
              className="flex items-center"
            >
              <Image className="mr-1" size={16} /> Foto ({currentUser.photos.length}/{MAX_PHOTOS})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {selectedTab === 'info' ? (
            // 👇 sezione "Informazioni"
            <div className="space-y-6">
              {/* Interessi */}
              <div>
                <h3 className="text-lg font-medium mb-2">Interessi</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Disponibilità */}
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

              {/* Badge */}
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
                        <Badge key={index} variant="outline" className="py-2">{badge}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // 👇 sezione "Foto"
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Le tue foto</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentUser.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Foto ${index + 1}`} 
                        className={`w-full h-32 object-cover rounded-md ${currentUser.profilePicture === photo ? 'ring-2 ring-woop-purple' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 rounded-md">
                        <div className="flex space-x-2">
                          {currentUser.profilePicture !== photo && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleSetProfilePicture(photo)}
                              className="bg-woop-purple hover:bg-woop-purple/90"
                            >
                              Imposta principale
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDeletePhoto(photo)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {currentUser.photos.length < MAX_PHOTOS && (
                    <div 
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-woop-purple transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-gray-500 mt-2">Carica foto</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-4">
                  Puoi caricare fino a {MAX_PHOTOS} foto. Le foto devono essere in formato JPG, PNG o GIF.
                </p>
              </div>
            </div>
          )}
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

