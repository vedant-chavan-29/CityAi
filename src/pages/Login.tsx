import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        toast({ title: 'Name required', description: 'Please enter your display name.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await signup(email, password, displayName);
      if (error) {
        toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome to CITYAI!', description: 'Account created successfully.' });
        navigate('/');
      }
    } else {
      const { error } = await login(email, password);
      if (error) {
        toast({ title: 'Login failed', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back!', description: 'Dashboard loaded successfully.' });
        navigate('/');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 gradient-card border-border animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">CITYAI</h1>
          <p className="text-xs text-muted-foreground mt-1">Intelligent Energy Optimization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
              <Input id="name" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required minLength={6} />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </Card>
    </div>
  );
}
