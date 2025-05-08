import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePicture?: string;
  photos: string[];
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

const initialMockUsers: User[] = [];
const initialMockWoops: Woop[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mockUsers, setMockUsers] = useState<User[]>(initialMockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('woopitCurrentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [woops, setWoops] = useState<Woop[]>(() => {
    const savedWoops = localStorage.getItem('woopitWoops');
    return savedWoops ? JSON.parse(savedWoops) : initialMockWoops;
  });

  useEffect(() => {
    localStorage.setItem('woopitWoops', JSON.stringify(woops));
  }, [woops]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('woopitCurrentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('woopitCurrentUser');
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore di login");
        return false;
      }
      setCurrentUser({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        age: data.user.age || 0,
        email: data.user.email,
        photos: [],
        interests: data.user.interests || [],
        availability: data.user.availability || {
          timeOfDay: [],
          daysOfWeek: []
        }
      });
      toast.success("Login effettuato con successo!");
      return true;
    } catch (error) {
      console.error("Errore login:", error);
      toast.error("Errore durante il login");
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore durante la registrazione");
        return false;
      }
      setCurrentUser({
        id: data.user?.id || "temp-id",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        age: userData.age || 0,
        email: userData.email,
        photos: [],
        interests: userData.interests || [],
        availability: userData.availability || {
          timeOfDay: [],
          daysOfWeek: []
        }
      });
      toast.success("Registrazione completata con successo!");
      return true;
    } catch (error) {
      console.error("Errore registrazione:", error);
      toast.error("Errore durante la registrazione");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info("Logout effettuato");
  };

  const createWoop = (woopData: Partial<Woop>) => {
    if (!currentUser) {
      toast.error("Devi effettuare l'accesso per creare un Woop");
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
      status: 'searching'
    };
    setWoops([...woops, newWoop]);
    toast.success("Woop creato! Stiamo cercando partecipanti...");
  };

  const joinWoop = (woopId: string) => {
    if (!currentUser) {
      toast.error("Devi effettuare l'accesso per partecipare");
      return;
    }
    setWoops(prevWoops => prevWoops.map(w => {
      if (w.id === woopId && !w.participants.some(p => p.id === currentUser.id)) {
        if (w.participants.length >= w.preferences.maxParticipants) {
          toast.error("Questo Woop ha già raggiunto il numero massimo di partecipanti");
          return w;
        }
        toast.success("Ti sei iscritto al Woop!");
        return {
          ...w,
          status: w.participants.length + 1 >= w.preferences.maxParticipants ? 'active' : w.status,
          participants: [...w.participants, currentUser]
        };
      }
      return w;
    }));
  };

  const sendMessage = (woopId: string, message: string) => {
    if (!currentUser || !message.trim()) return;
    setWoops(prevWoops => prevWoops.map(w => {
      if (w.id === woopId) {
        return {
          ...w,
          messages: [...(w.messages || []), { userId: currentUser.id, text: message, timestamp: new Date() }]
        };
      }
      return w;
    }));
  };

  const completeWoop = (woopId: string) => {
    setWoops(prevWoops => prevWoops.map(w => w.id === woopId ? { ...w, status: 'completed' } : w));
    toast.success("Woop completato! Ora puoi lasciare una recensione");
  };

  const rateUser = () => toast.success("Recensione inviata con successo!");

  return (
    <AppContext.Provider value={{ currentUser, woops, setCurrentUser, login, register, logout, createWoop, joinWoop, sendMessage, completeWoop, rateUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
