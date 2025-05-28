
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';

const interestsList = [
  'Calcetto', 'Padel', 'Tennis', 'Beach Volley', 'Basket',
  'Escursionismo', 'Bici', 'Cinema', 'Aperitivo', 'Concerto',
  'Museo', 'Teatro', 'Cucina', 'Fotografia', 'Videogiochi'
];

const Register: React.FC = () => {
  const { register } = useAppContext();
  const navigate = useNavigate();
  
 const [formData, setFormData] = useState<{
  firstName: string;
  lastName: string;
  age: string;
  gender: 'maschio' | 'femmina' | ''; // accetta anche stringa vuota iniziale
  email: string;
  password: string;
  confirmPassword: string;
  interests: string[];
  otherInterests: string;
  bio: string;
  timeOfDay: string[];
  daysOfWeek: string[];
  flexibility: string;
}>({
  firstName: '',
  lastName: '',
  age: '',
  gender: '', // inizialmente vuoto
  email: '',
  password: '',
  confirmPassword: '',
  interests: [],
  otherInterests: '',
  bio: '',
  timeOfDay: [],
  daysOfWeek: [],
  flexibility: ''
});

  
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    age: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };
  
  const handleTimeOfDayToggle = (time: string) => {
    setFormData(prev => {
      if (prev.timeOfDay.includes(time)) {
        return { ...prev, timeOfDay: prev.timeOfDay.filter(t => t !== time) };
      } else {
        return { ...prev, timeOfDay: [...prev.timeOfDay, time] };
      }
    });
  };
  
  const handleDaysOfWeekToggle = (days: string) => {
    setFormData(prev => {
      if (prev.daysOfWeek.includes(days)) {
        return { ...prev, daysOfWeek: prev.daysOfWeek.filter(d => d !== days) };
      } else {
        return { ...prev, daysOfWeek: [...prev.daysOfWeek, days] };
      }
    });
  };
  
  const validateForm = () => {
    const errors = {
      firstName: formData.firstName.trim() === '',
      lastName: formData.lastName.trim() === '',
      age: formData.age === '' || parseInt(formData.age) < 18,
      email: !formData.email.includes('@'),
      password: formData.password.length < 6,
      confirmPassword: formData.password !== formData.confirmPassword
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error('Per favore, correggi gli errori nel modulo');
    return;
  }

  // Validazione gender
  if (formData.gender !== 'maschio' && formData.gender !== 'femmina') {
    toast.error('Seleziona un genere valido.');
    return;
  }

  // Processa e normalizza interessi (rende tutto lowercase, senza spazi, niente duplicati)
  let allInterests = [...formData.interests];
  if (formData.otherInterests.trim()) {
    allInterests = [...allInterests, ...formData.otherInterests.split(',')];
  }

  const normalizedInterests = allInterests
    .map(i => i.trim().toLowerCase())
    .filter((value, index, self) => value && self.indexOf(value) === index); // rimuove vuoti e duplicati

  const success = await register({
    firstName: formData.firstName,
    lastName: formData.lastName,
    age: parseInt(formData.age),
    gender: formData.gender,
    email: formData.email,
    bio: formData.bio,
    interests: normalizedInterests,
    availability: {
      timeOfDay: formData.timeOfDay as ('Mattina' | 'Pomeriggio' | 'Sera')[],
      daysOfWeek: formData.daysOfWeek as ('Weekend' | 'Feriali')[],
      flexibility: formData.flexibility
    }
  }, formData.password);


  if (success) {
    navigate('/profile-setup');
  }
};
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registrati a WoopIt</CardTitle>
          <CardDescription className="text-center">Crea un account per iniziare a Woopare</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={formErrors.firstName ? "border-red-500" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm">Nome richiesto</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm">Cognome richiesto</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Età *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                  className={formErrors.age ? "border-red-500" : ""}
                />
                {formErrors.age && (
                  <p className="text-red-500 text-sm">Devi avere almeno 18 anni</p>
                )}
              </div>
              <div className="space-y-2">
  <Label htmlFor="gender">Genere *</Label>
  <select
    id="gender"
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    required
    className="w-full border rounded-md px-3 py-2"
  >
    <option value="">Seleziona</option>
    <option value="maschio">Maschio</option>
    <option value="femmina">Femmina</option>
  </select>
</div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">Email non valida</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm">La password deve essere di almeno 6 caratteri</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Conferma Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={formErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-sm">Le password non corrispondono</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Mini Bio (max 140 caratteri)</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={140}
                />
                <p className="text-sm text-gray-500 text-right">
                  {formData.bio.length}/140
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Interessi e Hobby</Label>
                <div className="grid grid-cols-3 gap-2">
                  {interestsList.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`interest-${interest}`} 
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <label
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Label htmlFor="otherInterests">Altri interessi (separati da virgola)</Label>
                  <Input
                    id="otherInterests"
                    name="otherInterests"
                    value={formData.otherInterests}
                    onChange={handleChange}
                    placeholder="Es: Yoga, Pittura, Pilates"
                  />
                </div>
              </div>
              
              <div>
                <Label>Disponibilità</Label>
                <div className="mt-2 space-y-4">
                  <div className="space-y-2">
                    <Label>Orari</Label>
                    <div className="flex space-x-4">
                      {['Mattina', 'Pomeriggio', 'Sera'].map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`time-${time}`} 
                            checked={formData.timeOfDay.includes(time)}
                            onCheckedChange={() => handleTimeOfDayToggle(time)}
                          />
                          <label
                            htmlFor={`time-${time}`}
                            className="text-sm font-medium leading-none"
                          >
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Giorni</Label>
                    <div className="flex space-x-4">
                      {['Weekend', 'Feriali'].map((days) => (
                        <div key={days} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`days-${days}`} 
                            checked={formData.daysOfWeek.includes(days)}
                            onCheckedChange={() => handleDaysOfWeekToggle(days)}
                          />
                          <label
                            htmlFor={`days-${days}`}
                            className="text-sm font-medium leading-none"
                          >
                            {days}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flexibility">Flessibilità (opzionale)</Label>
                    <Input
                      id="flexibility"
                      name="flexibility"
                      value={formData.flexibility}
                      onChange={handleChange}
                      placeholder="Es: Disponibile con preavviso di 1 ora"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">Registrati</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Hai già un account? <a href="/login" className="text-woop-purple hover:underline">Accedi</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
