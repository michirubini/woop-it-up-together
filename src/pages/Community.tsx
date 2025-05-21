
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { ThumbsUp, MessageSquare, Trophy, Award } from 'lucide-react';

type Idea = {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  votes: number;
  comments: number;
  isTopIdea?: boolean;
};

const Community: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect se non loggato
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Carica tutte le idee dal backend
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/woops');
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Mappa dati se necessario (adatta questa parte alla risposta reale)
        const formatted = data.map((item: any) => ({
          id: String(item.id),
          title: item.interest || item.title,
          description: item.description,
          creator: {
            id: String(item.creator?.id ?? item.user_id ?? "0"),
            firstName: item.creator?.firstName ?? "",
            lastName: item.creator?.lastName ?? "",
            profilePicture: item.creator?.profilePicture ?? "",
          },
          votes: item.votes ?? 0,      // Aggiusta se hai una colonna voti!
          comments: item.comments ?? 0, // Idem
          isTopIdea: false,             // Gestisci la logica "Top" se vuoi
        }));
        setIdeas(formatted);
      } catch (err) {
        toast.error("Errore nel caricamento delle idee");
      }
      setLoading(false);
    };
    fetchIdeas();
  }, []);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIdea(prev => ({ ...prev, [name]: value }));
  };

  // Invio idea nuova
  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      toast.error('Titolo e descrizione sono obbligatori');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/woops', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIdea.title,
          description: newIdea.description,
          userId: currentUser.id,
          preferences: {
            genderPreference: "entrambi",
            maxParticipants: 4,
            maxDistance: 10,
            timeFrame: "Oggi"
          }
        }),
      });
      if (!res.ok) throw new Error();
      const savedIdea = await res.json();
      // Mappa la risposta del backend (adatta se serve!)
      const formatted = {
        id: String(savedIdea.id),
        title: savedIdea.interest || savedIdea.title,
        description: savedIdea.description,
        creator: {
          id: String(savedIdea.creator?.id ?? savedIdea.user_id ?? "0"),
          firstName: savedIdea.creator?.firstName ?? "",
          lastName: savedIdea.creator?.lastName ?? "",
          profilePicture: savedIdea.creator?.profilePicture ?? "",
        },
        votes: savedIdea.votes ?? 0,
        comments: savedIdea.comments ?? 0,
        isTopIdea: false,
      };

      setIdeas([formatted, ...ideas]);
      setUserVotes(prev => [...prev, formatted.id]);
      setNewIdea({ title: '', description: '' });
      setShowNewIdeaForm(false);
      toast.success('Idea proposta con successo!');
    } catch {
      toast.error("Errore nel salvataggio dell'idea!");
    }
  };

  // Solo utenti reali possono proporre idee (già gestito dal context)
  if (!currentUser) return null;

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
            {loading && <div>Caricamento idee...</div>}
            {!loading && ideas.length === 0 && <div>Nessuna idea trovata.</div>}
            {!loading && ideas
              .sort((a, b) => (b.votes - a.votes))
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
                        {/* Voto disabilitato perché non gestito dal backend */}
                        <button
                          className="flex items-center space-x-1 text-gray-400"
                          disabled
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
              <div className="text-gray-400 text-sm">Classifica non disponibile nella versione demo API.</div>
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
