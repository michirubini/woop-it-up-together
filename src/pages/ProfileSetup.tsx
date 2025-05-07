
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

const placeholderImages = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/men/19.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
];

const ProfileSetup: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };
  
  const handleContinue = () => {
    if (!selectedImage) {
      toast.error('Per favore, seleziona una foto profilo');
      return;
    }
    
    setCurrentUser({
      ...currentUser,
      profilePicture: selectedImage
    });
    
    toast.success('Profilo completato! Ora puoi iniziare a Woopare');
    navigate('/');
  };
  
  const getInitials = (): string => {
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Completa il tuo profilo</CardTitle>
          <CardDescription className="text-center">Scegli una foto profilo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              {selectedImage ? (
                <AvatarImage src={selectedImage} />
              ) : (
                <AvatarFallback className="bg-woop-purple text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="mt-4 mb-6">
              <Label>Seleziona una foto profilo</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {placeholderImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer relative rounded-md overflow-hidden ${
                      selectedImage === image ? 'ring-2 ring-woop-purple' : ''
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <img src={image} alt={`Avatar ${index+1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                In una versione reale, potresti caricare una tua foto
              </p>
            </div>
            
            <Button 
              onClick={handleContinue}
              className="w-full"
              disabled={!selectedImage}
            >
              Continua
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
