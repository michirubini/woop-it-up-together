import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  genderPreference: 'maschio' | 'femmina' | 'entrambi';
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
    leaveWoop: (woopId: string) => void;
  rateUser: (userId: string, rating: number, comment?: string, badges?: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('woopitCurrentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [woops, setWoops] = useState<Woop[]>(() => {
    const savedWoops = localStorage.getItem('woopitWoops');
    return savedWoops ? JSON.parse(savedWoops) : [];
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/api/users`);
        const data = await res.json();
        if (res.ok) {
          setMockUsers(data.users);
        } else {
          console.error("Errore nel caricamento utenti:", data.error);
        }
      } catch (error) {
        console.error("Errore fetch utenti:", error);
      }
    };
    fetchUsers();
  }, []);

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
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.error(data.error || "Errore di login");
        return false;
      }
  
      // ✅ Salva token nel localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
  
      // ✅ Salva utente come prima
      setCurrentUser({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        age: data.user.age || 0,
        email: data.user.email,
        profilePicture: data.user.profilePicture || undefined,
        photos: data.user.photos || [],
        interests: data.user.interests || [],
        availability: data.user.availability || {
          timeOfDay: [],
          daysOfWeek: [],
          flexibility: '',
        },
        rating: data.user.rating,
        badges: data.user.badges || [],
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
      const res = await fetch(`${API}/api/register`, {
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
  genderPreference: 'entrambi',
  maxParticipants: 4,
  maxDistance: 10,
  timeFrame: 'Oggi'
},

      participants: [currentUser],
      status: 'searching'
    };
    setWoops([...woops, newWoop]);
    toast.success("Woop creato! Stiamo cercando partecipanti...");
    setTimeout(() => {
      simulateFoundParticipants(newWoop.id);
    }, 3000);
  };

  const simulateFoundParticipants = (woopId: string) => {
    setWoops(prevWoops =>
      prevWoops.map(w => {
        if (w.id === woopId) {
          const potentialParticipants = mockUsers.filter(
            u => u.id !== currentUser?.id && u.interests.includes(w.interest)
          );
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

  const joinWoop = async (woopId: string) => {
    if (!currentUser) {
      toast.error("Devi effettuare l'accesso per partecipare");
      return;
    }
  const leaveWoop = async (woopId: string) => {
  if (!currentUser) return;

  const woopNumericId = parseInt(woopId.replace("woop-", ""));
  const userNumericId = parseInt(currentUser.id);

  try {
    await fetch(`${API}/api/woops/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        woop_id: woopNumericId,
        user_id: userNumericId,
      }),
    });

    setWoops(prev => prev.filter(w => w.id !== woopId));
    toast.success("Sei uscito dal Woop!");
  } catch (error) {
    console.error("Errore durante l'uscita dal Woop:", error);
    toast.error("Errore nell'uscita dal Woop");
  }
};

    const woopNumericId = parseInt(woopId.replace("woop-", "")); // converte in ID numerico se serve
    const userNumericId = parseInt(currentUser.id); // assumi che l'id utente sia un numero nel DB
  
    try {
      // Salva nel backend
      await fetch(`${API}/api/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          woop_id: woopNumericId,
          user_id: userNumericId,
        }),
      });
  
      // Aggiorna localmente
      setWoops(prevWoops =>
        prevWoops.map(w => {
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
        })
      );
    } catch (error) {
      console.error("Errore durante la partecipazione al Woop:", error);
      toast.error("Errore durante la partecipazione");
    }
  };
  
  const sendMessage = (woopId: string, message: string) => {
    if (!currentUser || !message.trim()) return;
    setWoops(prevWoops =>
      prevWoops.map(w => {
        if (w.id === woopId) {
          return {
            ...w,
            messages: [...(w.messages || []), {
              userId: currentUser.id,
              text: message,
              timestamp: new Date()
            }]
          };
        }
        return w;
      })
    );
  };

  const leaveWoop = async (woopId: string) => {
  if (!currentUser) return;

  const woopNumericId = parseInt(woopId.replace("woop-", ""));
  const userNumericId = parseInt(currentUser.id);

  try {
    await fetch(`${API}/api/woops/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ woop_id: woopNumericId, user_id: userNumericId })
    });

    setWoops(prev =>
      prev.filter(w => 
        w.id !== woopId || !w.participants.some(p => p.id === currentUser.id)
      )
    );
    toast.success("Sei uscito dal Woop");
  } catch (err) {
    console.error("Errore uscita woop:", err);
    toast.error("Errore durante l'uscita dal Woop");
  }
};


  const completeWoop = async (woopId: string) => {
    const woopNumericId = parseInt(woopId.replace("woop-", ""));
    try {
      await fetch(`${API}/api/woops/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ woop_id: woopNumericId }),
      });
  
      setWoops(prevWoops =>
        prevWoops.map(w =>
          w.id === woopId ? { ...w, status: 'completed' } : w
        )
      );
  
      toast.success("Woop completato! Ora puoi lasciare una recensione");
    } catch (error) {
      console.error("Errore durante il completamento del Woop:", error);
      toast.error("Errore nel completamento");
    }
  };
  

  const rateUser = () => toast.success("Recensione inviata con successo!");

  return (
    <AppContext.Provider value={{
      currentUser,
      woops,
      setCurrentUser,
      login,
      register,
      logout,
      createWoop,
      joinWoop,
      leaveWoop,
      sendMessage,
      completeWoop,
      rateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
