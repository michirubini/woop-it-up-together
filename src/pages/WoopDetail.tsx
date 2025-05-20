
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Send, MapPin, Clock, Users, MessageSquare, Star, Award } from 'lucide-react';

const WoopDetail: React.FC = () => {
  const { woopId } = useParams<{ woopId: string }>();
const { currentUser, woops, sendMessage, completeWoop, rateUser, leaveWoop, setWoops } = useAppContext();



  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [showRatings, setShowRatings] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string; badges: string[] }>>({});
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const woop = woops.find(w => w.id === woopId);
  
  if (!woop) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Woop non trovato</h2>
              <p className="text-gray-600 mb-4">
                Il Woop che stai cercando non esiste o è stato rimosso
              </p>
              <Button onClick={() => navigate('/')}>
                Torna alla home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isParticipant = woop.participants.some(p => p.id === currentUser.id);
  const isCreator = woop.creator.id === currentUser.id;
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(woop.id, message);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleCompleteWoop = () => {
  completeWoop(woop.id);
  setShowRatings(true);
};

const handleDeleteWoop = async () => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/woops/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ woop_id: parseInt(woop.id.replace("woop-", "")) }),
    });

    // 🔥 Rimuovi anche dal contesto
    setWoops(prev => prev.filter(w => w.id !== woop.id));

    toast.success("Woop eliminato con successo!");
    navigate('/');
  } catch (err) {
    console.error("Errore eliminazione Woop:", err);
    toast.error("Errore durante l'eliminazione del Woop");
  }
};


  
  const handleRatingChange = (userId: string, key: 'rating' | 'comment' | 'badges', value: any) => {
    setRatings(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [key]: value
      }
    }));
  };
  
  
  const handleToggleBadge = (userId: string, badge: string) => {
    setRatings(prev => {
      const currentBadges = prev[userId]?.badges || [];
      let newBadges;
      
      if (currentBadges.includes(badge)) {
        newBadges = currentBadges.filter(b => b !== badge);
      } else {
        newBadges = [...currentBadges, badge];
      }
      
      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          badges: newBadges
        }
      };
    });
  };
  
  const handleSubmitRatings = () => {
    Object.entries(ratings).forEach(([userId, data]) => {
      if (data.rating > 0) {
        rateUser(userId, data.rating, data.comment, data.badges);
      }
    });
    
    toast.success('Recensioni inviate con successo!');
    navigate('/');
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-woop-purple">{woop.interest}</CardTitle>
              <CardDescription className="mt-1">{woop.description}</CardDescription>
            </div>
            <Badge variant={
              woop.status === 'completed' ? "outline" :
              woop.status === 'active' ? "default" :
              woop.status === 'ready' ? "secondary" : "outline"
            }>
              {woop.status === 'completed' ? 'Completato' :
               woop.status === 'active' ? 'Attivo' :
               woop.status === 'ready' ? 'Pronto' : 'Cercando...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{woop.preferences.timeFrame}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={18} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">Entro {woop.preferences.maxDistance} km</span>
            </div>
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {woop.participants.length}/{woop.preferences.maxParticipants} partecipanti
              </span>
            </div>
          </div>
          
<Separator className="my-4" />

<div className="mb-6">
  <h3 className="text-lg font-medium mb-3">Partecipanti</h3>
  <div className="flex flex-wrap gap-3">
    {woop.participants.map(participant => (
      <div key={participant.id} className="flex items-center space-x-2">
        <Avatar>
          {participant.profilePicture ? (
            <AvatarImage src={participant.profilePicture} alt={participant.firstName} />
          ) : (
            <AvatarFallback>
              {(participant.firstName?.charAt(0) || "")}
              {(participant.lastName?.charAt(0) || "")}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm font-medium">{participant.firstName}</p>
          {participant.id === woop.creator.id && (
            <Badge variant="outline" className="text-xs">Organizzatore</Badge>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

          
          {(isParticipant || isCreator) && woop.status !== 'completed' && (
            <>
              <Separator className="my-4" />
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <MessageSquare size={18} className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium">Chat del Woop</h3>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto mb-3">
                  {woop.messages && woop.messages.length > 0 ? (
                    <div className="space-y-3">
                      {woop.messages.map((msg, index) => {
                        const sender = woop.participants.find(p => p.id === msg.userId);
                        const isCurrentUser = msg.userId === currentUser.id;
                        
                        return (
                          <div 
                            key={index}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex max-w-[70%]">
                              {!isCurrentUser && (
                                <Avatar className="h-8 w-8 mr-2">
                                  {sender?.profilePicture ? (
                                    <AvatarImage src={sender.profilePicture} alt={sender.firstName} />
                                  ) : (
                                    <AvatarFallback>
                                      {sender?.firstName.charAt(0)}{sender?.lastName.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                              <div>
                                <div 
                                  className={`rounded-lg px-3 py-2 ${
                                    isCurrentUser 
                                      ? 'bg-woop-purple text-white' 
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm">{msg.text}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(msg.timestamp), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        Nessun messaggio ancora. Inizia a chattare!
                      </p>
                    )}
                  </div>
                  
                  <div className="flex">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Scrivi un messaggio..."
                      className="mr-2"
                    />
                    <Button 
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
<CardFooter>
  {woop.status !== 'completed' ? (
    <div className="w-full flex flex-col space-y-3">
      {isCreator && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Elimina Woop
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione è irreversibile. Il Woop verrà eliminato definitivamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWoop}>Elimina</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isParticipant && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            leaveWoop(woop.id);
            navigate('/');
          }}
        >
          Esci dal Woop
        </Button>
      )}

      {/* ✅ Torna indietro SEMPRE visibile */}
      <Button className="w-full" variant="outline" onClick={() => navigate(-1)}>
        Torna indietro
      </Button>
    </div>
  ) : showRatings ? (
    // ... il resto non lo tocco


<div className="w-full">
  <h3 className="text-lg font-medium mb-4">Valuta i partecipanti</h3>
  
  <div className="space-y-4">
    {woop.participants
      .filter(p => p.id !== currentUser.id)
      .map(participant => (
        <Card key={participant.id}>
          <CardContent className="pt-6">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 mr-3">
                {participant.profilePicture ? (
                  <AvatarImage src={participant.profilePicture} alt={participant.firstName} />
                ) : (
                  <AvatarFallback>
                    {(participant.firstName?.charAt(0) || "")}
                    {(participant.lastName?.charAt(0) || "")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">
                  {(participant.firstName || "")} {(participant.lastName || "")}
                </p>
              </div>
            </div>

                        
                        <div className="mb-3">
                          <div className="flex items-center mb-1">
                            <Star size={18} className="text-gray-500 mr-2" />
                            <p className="text-sm font-medium">Valutazione</p>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(participant.id, 'rating', star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  size={24}
                                  className={
                                    (ratings[participant.id]?.rating || 0) >= star
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center mb-1">
                            <Award size={18} className="text-gray-500 mr-2" />
                            <p className="text-sm font-medium">Badge</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Puntuale', 'Socievole', 'Onesto', 'King/Queen'].map(badge => (
                              <Badge
                                key={badge}
                                variant={(ratings[participant.id]?.badges || []).includes(badge) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleToggleBadge(participant.id, badge)}
                              >
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Input
                            placeholder="Commento (opzionale)"
                            value={ratings[participant.id]?.comment || ''}
                            onChange={(e) => handleRatingChange(participant.id, 'comment', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={handleSubmitRatings}
              >
                Invia recensioni
              </Button>
            </div>
          ) : (
            <div className="w-full text-center">
              <p className="mb-3">Questo Woop è stato completato!</p>
              <Button onClick={() => navigate('/')}>
                Torna alla home
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WoopDetail;
