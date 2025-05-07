
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePicture?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  interests: string[];
  availability: {
    timeOfDay: ('Mattina' | 'Pomeriggio' | 'Sera')[];
    daysOfWeek: ('Weekend' | 'Feriali')[];
    flexibility?: string;
  };
  rating?: number;
  badges?: string[];
}

export interface Woop {
  id: string;
  creator: User;
  interest: string;
  description: string;
  preferences: {
    genderPreference: 'stesso' | 'misto' | 'qualsiasi';
    maxParticipants: number;
    maxDistance: number;
    timeFrame: string;
  };
  participants: User[];
  status: 'searching' | 'ready' | 'active' | 'completed';
  location?: string;
  messages?: {
    userId: string;
    text: string;
    timestamp: Date;
  }[];
}

interface AppContextType {
  currentUser: User | null;
  woops: Woop[];
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  createWoop: (woopData: Partial<Woop>) => void;
  joinWoop: (woopId: string) => void;
  sendMessage: (woopId: string, message: string) => void;
  completeWoop: (woopId: string) => void;
  rateUser: (userId: string, rating: number, comment?: string, badges?: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Marco',
    lastName: 'Rossi',
    age: 28,
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    email: 'marco@example.com',
    location: 'Milano, IT',
    bio: 'Appassionato di sport e tecnologia',
    interests: ['Calcetto', 'Padel', 'Escursionismo'],
    availability: {
      timeOfDay: ['Sera'],
      daysOfWeek: ['Weekend'],
    },
    rating: 4.8,
    badges: ['Puntuale', 'Socievole']
  },
  {
    id: '2',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    age: 25,
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
    email: 'giulia@example.com',
    location: 'Roma, IT',
    bio: 'Amante dell\'arte e della cucina',
    interests: ['Cucina', 'Museo', 'Cinema'],
    availability: {
      timeOfDay: ['Pomeriggio', 'Sera'],
      daysOfWeek: ['Weekend', 'Feriali'],
    },
    rating: 4.9,
    badges: ['Creativa', 'Socievole']
  },
  {
    id: '3',
    firstName: 'Luca',
    lastName: 'Verdi',
    age: 30,
    profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg',
    email: 'luca@example.com',
    location: 'Torino, IT',
    bio: 'Sportivo e amante delle escursioni',
    interests: ['Calcetto', 'Trekking', 'Mountain Bike'],
    availability: {
      timeOfDay: ['Mattina', 'Sera'],
      daysOfWeek: ['Weekend'],
    },
    rating: 4.5,
    badges: ['Energico', 'Avventuroso']
  },
];

const mockWoops: Woop[] = [
  {
    id: '1',
    creator: mockUsers[0],
    interest: 'Calcetto',
    description: 'Partita amichevole 5vs5, tutti i livelli benvenuti!',
    preferences: {
      genderPreference: 'misto',
      maxParticipants: 10,
      maxDistance: 10,
      timeFrame: 'Domani sera',
    },
    participants: [mockUsers[0], mockUsers[2]],
    status: 'searching',
  },
  {
    id: '2',
    creator: mockUsers[1],
    interest: 'Museo',
    description: 'Visita alla nuova mostra di arte contemporanea',
    preferences: {
      genderPreference: 'qualsiasi',
      maxParticipants: 5,
      maxDistance: 5,
      timeFrame: 'Questo weekend',
    },
    participants: [mockUsers[1]],
    status: 'searching',
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [woops, setWoops] = useState<Woop[]>(mockWoops);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    try {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        toast.success('Accesso effettuato con successo!');
        return true;
      }
      toast.error('Credenziali non valide');
      return false;
    } catch (error) {
      toast.error('Errore durante il login');
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    // Simulate API call
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        age: userData.age || 0,
        profilePicture: userData.profilePicture,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        bio: userData.bio || '',
        interests: userData.interests || [],
        availability: userData.availability || {
          timeOfDay: [],
          daysOfWeek: []
        }
      };
      
      // In a real app, this would save to a database
      mockUsers.push(newUser);
      setCurrentUser(newUser);
      toast.success('Registrazione completata con successo!');
      return true;
    } catch (error) {
      toast.error('Errore durante la registrazione');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info('Logout effettuato');
  };

  const createWoop = (woopData: Partial<Woop>) => {
    if (!currentUser) {
      toast.error('Devi effettuare l\'accesso per creare un Woop');
      return;
    }

    const newWoop: Woop = {
      id: `woop-${Date.now()}`,
      creator: currentUser,
      interest: woopData.interest || '',
      description: woopData.description || '',
      preferences: woopData.preferences || {
        genderPreference: 'qualsiasi',
        maxParticipants: 4,
        maxDistance: 10,
        timeFrame: 'Oggi'
      },
      participants: [currentUser],
      status: 'searching',
    };

    setWoops([...woops, newWoop]);
    toast.success('Woop creato! Stiamo cercando partecipanti...');

    // Simulate finding participants after a delay
    setTimeout(() => {
      simulateFoundParticipants(newWoop.id);
    }, 3000);
  };

  const simulateFoundParticipants = (woopId: string) => {
    setWoops(prevWoops => 
      prevWoops.map(w => {
        if (w.id === woopId) {
          // Find potential participants based on interests
          const potentialParticipants = mockUsers.filter(
            u => u.id !== currentUser?.id && u.interests.includes(w.interest)
          );
          
          // Add up to maxParticipants - 1 (creator is already included)
          const numToAdd = Math.min(
            w.preferences.maxParticipants - 1,
            potentialParticipants.length
          );
          
          const additionalParticipants = potentialParticipants.slice(0, numToAdd);
          
          return {
            ...w,
            status: 'ready',
            participants: [...w.participants, ...additionalParticipants]
          };
        }
        return w;
      })
    );

    if (currentUser) {
      toast.success('Il tuo Woop è pronto! Abbiamo trovato dei partecipanti interessati.');
    }
  };

  const joinWoop = (woopId: string) => {
    if (!currentUser) {
      toast.error('Devi effettuare l\'accesso per partecipare');
      return;
    }

    setWoops(prevWoops => 
      prevWoops.map(w => {
        if (w.id === woopId) {
          if (w.participants.some(p => p.id === currentUser.id)) {
            toast.info('Sei già iscritto a questo Woop');
            return w;
          }
          
          if (w.participants.length >= w.preferences.maxParticipants) {
            toast.error('Questo Woop ha già raggiunto il numero massimo di partecipanti');
            return w;
          }
          
          toast.success('Ti sei iscritto al Woop!');
          
          return {
            ...w,
            status: w.status === 'searching' && 
                   w.participants.length + 1 >= w.preferences.maxParticipants ? 
                   'active' : w.status,
            participants: [...w.participants, currentUser]
          };
        }
        return w;
      })
    );
  };

  const sendMessage = (woopId: string, message: string) => {
    if (!currentUser || !message.trim()) {
      return;
    }

    setWoops(prevWoops => 
      prevWoops.map(w => {
        if (w.id === woopId) {
          return {
            ...w,
            messages: [
              ...(w.messages || []),
              {
                userId: currentUser.id,
                text: message,
                timestamp: new Date()
              }
            ]
          };
        }
        return w;
      })
    );
  };

  const completeWoop = (woopId: string) => {
    setWoops(prevWoops => 
      prevWoops.map(w => {
        if (w.id === woopId) {
          toast.success('Woop completato! Ora puoi lasciare una recensione');
          return {
            ...w,
            status: 'completed'
          };
        }
        return w;
      })
    );
  };

  const rateUser = (userId: string, rating: number, comment?: string, badges?: string[]) => {
    // In a real app, this would update user ratings in the database
    toast.success('Recensione inviata con successo!');
  };

  const value = {
    currentUser,
    woops,
    setCurrentUser,
    login,
    register,
    logout,
    createWoop,
    joinWoop,
    sendMessage,
    completeWoop,
    rateUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
