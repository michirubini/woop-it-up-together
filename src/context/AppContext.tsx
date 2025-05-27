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
  setWoops: React.Dispatch<React.SetStateAction<Woop[]>>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  createWoop: (woopData: Partial<Woop>) => void;
  joinWoop: (woopId: string) => void;
  sendMessage: (woopId: string, message: string) => void;
  completeWoop: (woopId: string) => void;
  leaveWoop: (woopId: string) => void;
  refreshParticipants: () => Promise<void>;
  rateUser: (userId: string, rating: number, comment?: string, badges?: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('woopitCurrentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [woops, setWoops] = useState<Woop[]>(() => {
    const savedWoops = localStorage.getItem('woopitWoops');
    return savedWoops ? JSON.parse(savedWoops) : [];
  });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const fetchWoops = async () => {
      try {
        const res = await fetch(`${API}/api/woops`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const woopsWithMessages = await Promise.all(
          data.woops.map(async (woop: any) => {
            try {
              const resMsg = await fetch(`${API}/api/messages/${parseInt(woop.id.replace("woop-", ""))}`, {
                headers: authHeaders()
              });
              const msgs = await resMsg.json();
              return {
                ...woop,
                messages: msgs.map((m: any) => ({
                  userId: m.user_id.toString(),
                  text: m.text,
                  timestamp: new Date(m.timestamp)
                }))
              };
            } catch (err) {
              console.error("❌ Errore fetch messaggi per woop", woop.id, err);
              return { ...woop, messages: [] };
            }
          })
        );

        setWoops(woopsWithMessages);
      } catch (error) {
        console.error("Errore fetch Woops:", error);
      }
    };

    if (currentUser) fetchWoops();
  }, [currentUser]);

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

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

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
          flexibility: ''
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
          daysOfWeek: [],
          flexibility: ''
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
    localStorage.removeItem("token");
    toast.info("Logout effettuato");
  };

  const createWoop = async (woopData: Partial<Woop>) => {
    if (!currentUser) {
      toast.error("Devi effettuare l'accesso per creare un Woop");
      return;
    }

    try {
      const response = await fetch(`${API}/api/woops/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: woopData.interest,
          description: woopData.description,
          user_id: parseInt(currentUser.id),
          preferences: woopData.preferences
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore creazione Woop");

      const newWoop: Woop = {
        id: `woop-${data.woop_id}`,
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

      setWoops(prev => [...prev, newWoop]);
      toast.success("Woop creato con successo!");
    } catch (err) {
      console.error("❌ Errore creazione Woop:", err);
      toast.error("Errore durante la creazione del Woop");
    }
  };

  const joinWoop = async (woopId: string) => {
    if (!currentUser) {
      toast.error("Devi effettuare l'accesso per partecipare");
      return;
    }

    const woopNumericId = parseInt(woopId.replace("woop-", ""));
    const userNumericId = parseInt(currentUser.id);

    try {
      await fetch(`${API}/api/participants`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          woop_id: woopNumericId,
          user_id: userNumericId,
        }),
      });

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
  const sendMessage = async (woopId: string, message: string) => {
    if (!currentUser || !message.trim()) return;

    const woopNumericId = parseInt(woopId.replace("woop-", ""));

    try {
      await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          woop_id: woopNumericId,
          user_id: parseInt(currentUser.id),
          text: message
        }),
      });

      setWoops(prev =>
        prev.map(w => {
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
    } catch (err) {
      console.error("❌ Errore invio messaggio:", err);
      toast.error("Errore invio messaggio");
    }
  };

  const leaveWoop = async (woopId: string) => {
    if (!currentUser) return;

    const woopNumericId = parseInt(woopId.replace("woop-", ""));
    const userNumericId = parseInt(currentUser.id);

    try {
      await fetch(`${API}/api/woops/leave`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          woop_id: woopNumericId,
          user_id: userNumericId,
        }),
      });

      setWoops(prev =>
        prev.map(w => {
          if (w.id === woopId) {
            const updated = w.participants.filter(p => p.id !== currentUser.id);
            return {
              ...w,
              participants: updated,
              status: updated.length === 0 ? 'searching' : w.status
            };
          }
          return w;
        })
      );

      toast.success("Sei uscito dal Woop");
    } catch (err) {
      console.error("Errore uscita Woop:", err);
      toast.error("Errore durante l'uscita dal Woop");
    }
  };

  const completeWoop = async (woopId: string) => {
    const woopNumericId = parseInt(woopId.replace("woop-", ""));
    try {
      await fetch(`${API}/api/woops/complete`, {
        method: "POST",
        headers: authHeaders(),
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

  const refreshParticipants = async () => {
    if (!currentUser) return;

    const updatedWoops = await Promise.all(
      woops.map(async (w) => {
        try {
          const res = await fetch(`${API}/api/participants/${parseInt(w.id.replace('woop-', ''))}`, {
            headers: authHeaders()
          });
          const participants = await res.json();

          return {
            ...w,
            participants,
          };
        } catch (err) {
          console.error(`Errore fetch partecipanti per woop ${w.id}`, err);
          return w;
        }
      })
    );

    setWoops(updatedWoops);
  };

  const rateUser = () => {
    toast.success("Recensione inviata con successo!");
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      woops,
      setCurrentUser,
      setWoops,
      login,
      register,
      logout,
      createWoop,
      joinWoop,
      leaveWoop,
      sendMessage,
      completeWoop,
      rateUser,
      refreshParticipants
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
