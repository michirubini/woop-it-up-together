import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';

const timeFrameOptions = [
  'Oggi', 'Stasera', 'Domani mattina', 'Domani pomeriggio',
  'Domani sera', 'Questo weekend', 'Settimana prossima'
];

const CreateWoop: React.FC = () => {
  const { currentUser, createWoop } = useAppContext();
  const navigate = useNavigate();

  const [interestsList, setInterestsList] = useState<string[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/activities`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          const names = data.activities.map((a: { name: string }) => a.name);
          setInterestsList(names);
        } else {
          console.error("Errore API attività:", data.error);
        }
      } catch (err) {
        console.error("Errore fetch attività:", err);
      }
    };

    fetchActivities();
  }, []);

  const [formData, setFormData] = useState({
    interest: '',
    description: '',
    genderPreference: 'entrambi',
    maxParticipants: 4,
    maxDistance: 10,
    timeFrame: 'Oggi'
  });

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.interest) {
      toast.error('Seleziona un interesse');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Aggiungi una descrizione');
      return;
    }

    createWoop({
      interest: formData.interest,
      description: formData.description,
      preferences: {
        genderPreference: formData.genderPreference as 'maschio' | 'femmina' | 'entrambi',
        maxParticipants: formData.maxParticipants,
        maxDistance: formData.maxDistance,
        timeFrame: formData.timeFrame
      }
    });

    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crea un nuovo Woop</CardTitle>
          <CardDescription>
            Dicci cosa vuoi fare e ti aiuteremo a trovare persone interessate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="interest">Cosa ti va di fare?</Label>
              <Select value={formData.interest} onValueChange={(value) => setFormData(prev => ({ ...prev, interest: value }))}>
                <SelectTrigger id="interest">
                  <SelectValue placeholder="Seleziona un interesse" />
                </SelectTrigger>
                <SelectContent>
                  {interestsList.map(interest => (
                    <SelectItem key={interest} value={interest}>
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                placeholder="Descrivi il tuo Woop (es: livello, dettagli, richieste particolari)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genderPreference">Preferenza partecipanti</Label>
              <Select value={formData.genderPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, genderPreference: value }))}>
                <SelectTrigger id="genderPreference">
                  <SelectValue placeholder="Seleziona un genere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maschio">Maschio</SelectItem>
                  <SelectItem value="femmina">Femmina</SelectItem>
                  <SelectItem value="entrambi">Entrambi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="maxParticipants">Numero massimo di partecipanti</Label>
                <span className="text-sm font-medium">{formData.maxParticipants}</span>
              </div>
              <Slider
                id="maxParticipants"
                min={2}
                max={20}
                step={1}
                value={[formData.maxParticipants]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, maxParticipants: value[0] }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="maxDistance">Distanza massima (km)</Label>
                <span className="text-sm font-medium">{formData.maxDistance} km</span>
              </div>
              <Slider
                id="maxDistance"
                min={1}
                max={50}
                step={1}
                value={[formData.maxDistance]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, maxDistance: value[0] }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFrame">Quando?</Label>
              <Select value={formData.timeFrame} onValueChange={(value) => setFormData(prev => ({ ...prev, timeFrame: value }))}>
                <SelectTrigger id="timeFrame">
                  <SelectValue placeholder="Seleziona quando" />
                </SelectTrigger>
                <SelectContent>
                  {timeFrameOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-6">
              Crea Woop
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWoop;


