import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from 'lucide-react';

const Index: React.FC = () => {
  const { currentUser, woops, joinWoop } = useAppContext();
  const navigate = useNavigate();

  const readyWoops = woops.filter(woop => woop.status === 'ready');
const activeWoops = woops.filter(woop => 
  (woop.status === 'active' || woop.status === 'searching') &&
  woop.participants.some(p => p.id === currentUser?.id)
);

  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              <span className="text-woop-purple">Woop</span>It Up Together
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Trova persone con cui condividere le tue passioni, subito!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-woop-softPurple">
              <CardHeader>
                <CardTitle>Trova subito amici</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Cerca persone con i tuoi stessi interessi nelle vicinanze</p>
              </CardContent>
            </Card>
            
            <Card className="bg-woop-softPurple">
              <CardHeader>
                <CardTitle>Condividi passioni</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sport, hobby, eventi e tanto altro in un solo click</p>
              </CardContent>
            </Card>
            
            <Card className="bg-woop-softPurple">
              <CardHeader>
                <CardTitle>Organizza in un attimo</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Niente più gruppi WhatsApp infiniti per organizzarsi</p>
              </CardContent>
            </Card>
            
            <Card className="bg-woop-softPurple">
              <CardHeader>
                <CardTitle>Conosci nuove persone</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Espandi la tua cerchia di amici con interessi comuni</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to="/register">
              <Button size="lg">Registrati ora</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Accedi</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ciao, <span className="text-woop-purple">{currentUser.firstName}</span>!
        </h1>
        <p className="text-gray-600">Cosa ti va di fare oggi?</p>
      </div>
      
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  <Link to="/search">
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2" />
          Cerca un Woop
        </CardTitle>
        <CardDescription>
          Trova persone per fare attività insieme
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="secondary" className="w-full">Cerca</Button>
      </CardFooter>
    </Card>
  </Link>

  <Link to="/create-woop">
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2" />
          Crea un Woop
        </CardTitle>
        <CardDescription>
          Proponi una nuova attività ad altre persone
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="secondary" className="w-full">Crea</Button>
      </CardFooter>
    </Card>
  </Link>

  <Link to="/auto-match">
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2" />
          Match automatico
        </CardTitle>
        <CardDescription>
          Lascia che WoopIt trovi i partecipanti per te
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="secondary" className="w-full">Avvia</Button>
      </CardFooter>
    </Card>
  </Link>
</div>

      
      {readyWoops.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Woop pronti</h2>
          <div className="space-y-4">
            {readyWoops.map(woop => (
              <Card key={woop.id} className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-woop-purple">
                    {woop.interest}
                  </CardTitle>
                  <CardDescription>
                    {woop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Partecipanti: {woop.participants.length}/{woop.preferences.maxParticipants}</p>
                      <p className="text-sm text-gray-500">{woop.preferences.timeFrame}</p>
                    </div>
                    <div className="flex">
                      <Badge variant="outline" className="mr-2">
                        {woop.preferences.genderPreference}
                      </Badge>
                      <Badge variant="outline">
                        {woop.preferences.maxDistance} km
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      joinWoop(woop.id);
                      navigate(`/woop/${woop.id}`);
                    }}
                  >
                    Partecipa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {activeWoops.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">I tuoi Woop attivi</h2>
          <div className="space-y-4">
            {activeWoops.map(woop => (
              <Card key={woop.id}>
                <CardHeader>
                  <CardTitle className="text-woop-purple">
                    {woop.interest}
                  </CardTitle>
                  <CardDescription>
                    {woop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Partecipanti: {woop.participants.length}/{woop.preferences.maxParticipants}</p>
                      <p className="text-sm text-gray-500">{woop.preferences.timeFrame}</p>
                    </div>
                    <Badge variant={woop.status === 'active' ? "default" : "secondary"}>
                      {woop.status === 'active' ? 'Attivo' : 'Cercando...'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/woop/${woop.id}`)}
                  >
                    Visualizza
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;