import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const AutoMatch: React.FC = () => {
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [level, setLevel] = useState("intermedio");
  const [gender, setGender] = useState("entrambi");
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [radiusKm, setRadiusKm] = useState(30);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Carica le attività dal backend all'avvio
  useEffect(() => {
    const fetchActivities = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/activities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
        if (res.ok && Array.isArray(data.activities)) {
          setActivities(data.activities.map((a: any) => a.name));
        } else {
          console.error("Errore fetch attività:", data.error);
        }
      } catch (err) {
        console.error("Errore rete attività:", err);
      }
    };
    fetchActivities();
  }, []);

  // ✅ Converti la città in coordinate
  const geocodeLocation = async (location: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "WoopItApp/1.0 (support@woopit.it)",
          },
        }
      );
      const data = await response.json();
      if (data?.[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Errore durante geocoding:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠️ Non sei autenticato.");
      setLoading(false);
      return;
    }

    const coords = await geocodeLocation(location);
    if (!coords) {
      setMessage("❌ Posizione non trovata.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/matchrequests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity,
          level,
          gender,
          max_participants: maxParticipants,
          radius_km: radiusKm,
          latitude: coords.lat,
          longitude: coords.lon,
        }),
      });

      const data = await response.json();
      if (data.matched) {
        setMessage(`🎉 Match trovato! Woop ID: ${data.woopId}`);
      } else {
        setMessage("🕓 Nessun match per ora, sei in attesa...");
      }
    } catch (err) {
      console.error("Errore invio richiesta:", err);
      setMessage("❌ Errore durante la richiesta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <Card className="p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Match automatico</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Attività</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli un'attività" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Livello</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona livello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="esperto">Esperto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Genere</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona genere" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maschio">Maschio</SelectItem>
                <SelectItem value="femmina">Femmina</SelectItem>
                <SelectItem value="entrambi">Entrambi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Numero massimo partecipanti</Label>
            <Input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Raggio di ricerca (km)</Label>
            <Input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Dove ti trovi?</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Es. Bologna, Milano, Roma..."
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Caricamento..." : "Cerca Match"}
          </Button>
        </form>

        {message && <p className="text-center mt-4">{message}</p>}
      </Card>
    </div>
  );
};

export default AutoMatch;

