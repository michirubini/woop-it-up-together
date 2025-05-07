
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { ThumbsUp, MessageSquare, Trophy, Award } from 'lucide-react';

// Mock data for community ideas
const mockCommunityIdeas = [
  {
    id: '1',
    title: 'Torneo di calcetto inter-quartiere',
    description: 'Un torneo che coinvolge squadre dai diversi quartieri della città, con finali e premiazioni!',
    creator: {
      id: '2',
      firstName: 'Giulia',
      lastName: 'B.',
      profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    votes: 24,
    comments: 7,
    isTopIdea: true,
  },
  {
    id: '2',
    title: 'Workshop di cucina etnica di gruppo',
    description: 'Ogni mese un paese diverso: ci si trova per cucinare insieme piatti tipici e poi si mangia tutti insieme!',
    creator: {
      id: '3',
      firstName: 'Luca',
      lastName: 'V.',
      profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    votes: 18,
    comments: 5,
  },
  {
    id: '3',
    title: 'Giornata di pulizia parchi cittadini',
    description: 'Formiamo squadre per ripulire i parchi della città, con pranzo al sacco e momento conviviale dopo!',
    creator: {
      id: '1',
      firstName: 'Marco',
      lastName: 'R.',
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    votes: 15,
    comments: 3,
  }
];

// Mock user rankings
const mockRankings = [
  {
    id: '2',
    firstName: 'Giulia',
    lastName: 'B.',
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
    points: 120,
    badge: 'Community Leader'
  },
  {
    id: '1',
    firstName: 'Marco',
    lastName: 'R.',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    points: 85,
    badge: 'Active Wooper'
  },
  {
    id: '3',
    firstName: 'Luca',
    lastName: 'V.',
    profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg',
    points: 70,
    badge: 'Idea Generator'
  }
];

const Community: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState(mockCommunityIdeas);
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: ''
  });
  const [userVotes, setUserVotes] = useState<string[]>([]);
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const handleVote = (ideaId: string) => {
    if (userVotes.includes(ideaId)) {
      toast.error('Hai già votato questa idea');
      return;
    }
    
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
      )
    );
    
    setUserVotes(prev => [...prev, ideaId]);
    toast.success('Voto registrato!');
  };
  
  const handleIdeaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIdea(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      toast.error('Titolo e descrizione sono obbligatori');
      return;
    }
    
    const newIdeaObject = {
      id: `idea-${Date.now()}`,
      title: newIdea.title,
      description: newIdea.description,
      creator: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName.charAt(0) + '.',
        profilePicture: currentUser.profilePicture
      },
      votes: 1,  // First vote from the creator
      comments: 0,
      isTopIdea: false
    };
    
    setIdeas([newIdeaObject, ...ideas]);
    setUserVotes(prev => [...prev, newIdeaObject.id]);
    setNewIdea({ title: '', description: '' });
    setShowNewIdeaForm(false);
    
    toast.success('Idea proposta con successo!');
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Community Woop
        </h1>
        <p className="text-gray-600">
          Proponi nuove idee, vota le migliori e partecipa agli eventi della community!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Idee dalla community</h2>
            <Button 
              variant={showNewIdeaForm ? "secondary" : "default"}
              onClick={() => setShowNewIdeaForm(!showNewIdeaForm)}
            >
              {showNewIdeaForm ? 'Annulla' : 'Proponi idea'}
            </Button>
          </div>
          
          {showNewIdeaForm && (
            <Card className="mb-6 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Proponi una nuova idea</CardTitle>
                <CardDescription>
                  Le idee più votate entreranno nelle attività ufficiali di Woop!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitIdea}>
                  <div className="space-y-4">
                    <div>
                      <Input
                        name="title"
                        value={newIdea.title}
                        onChange={handleIdeaChange}
                        placeholder="Titolo dell'idea"
                        className="mb-2"
                      />
                    </div>
                    <div>
                      <Textarea
                        name="description"
                        value={newIdea.description}
                        onChange={handleIdeaChange}
                        placeholder="Descrivi la tua idea..."
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="submit">Proponi idea</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-4">
            {ideas
              .sort((a, b) => {
                // Sort by isTopIdea first, then by votes
                if (a.isTopIdea && !b.isTopIdea) return -1;
                if (!a.isTopIdea && b.isTopIdea) return 1;
                return b.votes - a.votes;
              })
              .map(idea => (
                <Card 
                  key={idea.id} 
                  className={idea.isTopIdea ? "border-2 border-yellow-400" : ""}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3">
                          {idea.creator.profilePicture ? (
                            <AvatarImage src={idea.creator.profilePicture} alt={idea.creator.firstName} />
                          ) : (
                            <AvatarFallback>
                              {idea.creator.firstName.charAt(0)}{idea.creator.lastName.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {idea.title}
                            {idea.isTopIdea && (
                              <Badge className="ml-2 bg-yellow-400">
                                <Trophy size={12} className="mr-1" />
                                Top del mese
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Proposto da {idea.creator.firstName} {idea.creator.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 mb-4">{idea.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <button 
                          className={`flex items-center space-x-1 ${
                            userVotes.includes(idea.id) 
                              ? 'text-woop-purple' 
                              : 'text-gray-600 hover:text-woop-purple'
                          }`}
                          onClick={() => handleVote(idea.id)}
                          disabled={userVotes.includes(idea.id)}
                        >
                          <ThumbsUp size={18} />
                          <span>{idea.votes}</span>
                        </button>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <MessageSquare size={18} />
                          <span>{idea.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Award className="mr-2" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Gli utenti più attivi nella community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRankings.map((user, index) => (
                  <div key={user.id} className="flex items-center">
                    <div className="text-xl font-bold mr-3 w-5 text-center">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 mr-3">
                      {user.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt={user.firstName} />
                      ) : (
                        <AvatarFallback>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs">
                          {user.badge}
                        </Badge>
                        <span className="text-xs ml-2 text-gray-600">
                          {user.points} pt
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  I punti si guadagnano proponendo idee, ricevendo voti e partecipando agli eventi comunitari
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;
