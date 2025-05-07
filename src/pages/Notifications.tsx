
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
import { Bell } from 'lucide-react';

// In a real app, these would come from a backend
const mockNotifications = [
  {
    id: '1',
    title: 'Il tuo Woop è pronto!',
    message: 'Calcetto: Abbiamo trovato 3 persone che vogliono giocare con te.',
    woopId: '1',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60000)  // 30 minutes ago
  },
  {
    id: '2',
    title: 'Nuovo messaggio',
    message: 'Marco ha inviato un messaggio nel Woop "Calcetto"',
    woopId: '1', 
    read: true,
    timestamp: new Date(Date.now() - 2 * 3600000)  // 2 hours ago
  },
  {
    id: '3',
    title: 'Nuova recensione',
    message: 'Giulia ti ha lasciato una recensione a 5 stelle!',
    read: true,
    timestamp: new Date(Date.now() - 1 * 86400000)  // 1 day ago
  }
];

const Notifications: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min fa`;
    } else if (diffHours < 24) {
      return `${diffHours} ore fa`;
    } else {
      return `${diffDays} giorni fa`;
    }
  };
  
  const handleNotificationClick = (notification: typeof mockNotifications[0]) => {
    if (notification.woopId) {
      navigate(`/woop/${notification.woopId}`);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2" />
            Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockNotifications.length > 0 ? (
            <div className="space-y-4">
              {mockNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-white hover:bg-gray-50 border border-gray-200' 
                      : 'bg-woop-softPurple hover:bg-woop-softPurple/80 border border-woop-lightPurple'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Nessuna notifica</h3>
              <p className="text-gray-500">Ti avviseremo quando ci sono nuovi aggiornamenti</p>
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

export default Notifications;
