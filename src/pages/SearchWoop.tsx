import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Clock, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface SearchFilters {
  interests: string[];
  maxDistance: number;
  timeFrames: string[];
}

const interestsList = [
  'Calcetto', 'Padel', 'Tennis', 'Beach Volley', 'Basket',
  'Escursionismo', 'Bici', 'Cinema', 'Aperitivo', 'Concerto',
  'Museo', 'Teatro', 'Cucina', 'Fotografia', 'Videogiochi'
];

const timeFrames = [
  'Oggi', 'Stasera', 'Domani', 'Weekend', 'Settimana prossima'
];

const SearchWoop: React.FC = () => {
  const { currentUser, woops, joinWoop } = useAppContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    interests: [],
    maxDistance: 20,
    timeFrames: []
  });

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const toggleInterest = (interest: string) => {
    setFilters(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const toggleTimeFrame = (timeFrame: string) => {
    setFilters(prev => {
      if (prev.timeFrames.includes(timeFrame)) {
        return { ...prev, timeFrames: prev.timeFrames.filter(t => t !== timeFrame) };
      } else {
        return { ...prev, timeFrames: [...prev.timeFrames, timeFrame] };
      }
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      interests: [],
      maxDistance: 20,
      timeFrames: []
    });
    setSearchTerm('');
  };

  // *** FILTRO: SOLO WOOP REALI, NO MOCK ***
  // Escludi:
  // - quelli creati dal currentUser
  // - status completato
  // - mock (eventuali con campo 'isMock' true)
  // - oppure, se vuoi, escludi per id (es: quelli con id molto basso o formato anomalo)

  const filteredWoops = woops.filter(woop => {
    // SOLO WOOP REALI: se hai un campo "isMock", oppure se mock hanno id numerico o simile
    // Se hai ancora mock, escludili qui:
    

    // Exclude woops creati da current user
    if (woop.creator.id === currentUser.id) return false;

    // Exclude completati
    if (woop.status === 'completed') return false;

    // Cerca su titolo e descrizione
    if (searchTerm && !woop.interest.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !woop.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro interessi
    if (
      filters.interests.length > 0 &&
      !filters.interests.some(filterInterest =>
        woop.interest.toLowerCase().includes(filterInterest.toLowerCase())
      )
    ) {
      return false;
    }

    // Filtro distanza
    if (woop.preferences.maxDistance > filters.maxDistance) {
      return false;
    }

    // Filtro time frame
    if (filters.timeFrames.length > 0 &&
        !filters.timeFrames.some(t => woop.preferences.timeFrame.includes(t))) {
      return false;
    }

    return true;
  });

  const handleJoinWoop = (woopId: string) => {
    joinWoop(woopId);
    navigate(`/woop/${woopId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cerca un Woop
        </h1>
        <p className="text-gray-600">Trova persone e attività vicino a te</p>
      </div>
      <div className="mb-6 flex space-x-2">
        <div className="relative flex-1">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per interesse o descrizione..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={toggleFilters}
        >
          <Filter size={18} className="mr-1" />
          Filtri
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Filtri di ricerca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Interessi</Label>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map(interest => (
                    <Badge
                      key={interest}
                      variant={filters.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="maxDistance">Distanza massima</Label>
                  <span className="text-sm font-medium">{filters.maxDistance} km</span>
                </div>
                <Slider
                  id="maxDistance"
                  min={1}
                  max={50}
                  step={1}
                  value={[filters.maxDistance]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="mb-2 block">Quando</Label>
                <div className="flex flex-wrap gap-2">
                  {timeFrames.map(timeFrame => (
                    <Badge
                      key={timeFrame}
                      variant={filters.timeFrames.includes(timeFrame) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTimeFrame(timeFrame)}
                    >
                      {timeFrame}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Resetta filtri
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredWoops.length > 0 ? (
          filteredWoops.map(woop => (
            <Card key={woop.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-woop-purple">{woop.interest}</h3>
                    <p className="text-gray-700">{woop.description}</p>
                  </div>
                  <Badge variant={woop.status === 'active' ? "default" : "secondary"}>
                    {woop.status === 'active' ? 'Attivo' : woop.status === 'ready' ? 'Pronto' : 'Cercando...'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">{woop.preferences.timeFrame}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Entro {woop.preferences.maxDistance} km</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {woop.participants.length}/{woop.preferences.maxParticipants} partecipanti
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleJoinWoop(woop.id)}
                >
                  Partecipa
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700">Nessun Woop trovato</h3>
            <p className="text-gray-500 mt-1">Prova a modificare i filtri o crea un nuovo Woop</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/create-woop')}
            >
              Crea un Woop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchWoop;

