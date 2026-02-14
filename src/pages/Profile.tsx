import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Phone, Mail } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
}

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('cities').select('*').order('name').then(({ data }) => {
      if (data) setCities(data as City[]);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAddress(profile.address || '');
      setPhone(profile.phone || '');
      setSelectedCityId(profile.selected_city_id || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      selected_city_id: selectedCityId || null,
    });
    if (error) {
      toast({ title: 'Update failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="p-6 gradient-card border-border animate-fade-in flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4 glow-primary">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{profile?.display_name || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {selectedCityId && cities.length > 0 && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {cities.find(c => c.id === selectedCityId)?.name}
            </p>
          )}
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2 p-6 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-5">Edit Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Display Name
                </Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input value={user?.email || ''} disabled className="bg-secondary/50 border-border text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> City
                </Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}, {city.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Address
              </Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your full address" className="bg-secondary border-border" />
            </div>
            <Button type="submit" className="gradient-primary text-primary-foreground font-semibold" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
