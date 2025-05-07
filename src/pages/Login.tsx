
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Per favore, inserisci email e password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Demo login
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login('marco@example.com', 'password');
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Accedi a WoopIt</CardTitle>
          <CardDescription className="text-center">Inizia a Woopare con i tuoi amici</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </div>
          </form>
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Prova l'app (accesso demo)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Non hai un account? <a href="/register" className="text-woop-purple hover:underline">Registrati</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
