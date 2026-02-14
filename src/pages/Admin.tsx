import { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MetricCard from '@/components/MetricCard';
import { getSystemHealth } from '@/lib/energy';
import { Cpu, HardDrive, Clock, Brain, Upload, RefreshCw, FileText, Activity, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface UserRow {
  id: string;
  display_name: string | null;
  address: string | null;
  phone: string | null;
  selected_city_id: string | null;
  created_at: string;
  email?: string;
  role?: string;
}

export default function Admin() {
  const health = useMemo(getSystemHealth, []);
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    if (profiles) {
      const userList = profiles.map((p: any) => {
        const userRole = roles?.find((r: any) => r.user_id === p.id);
        return { ...p, role: userRole?.role || 'user' } as UserRow;
      });
      setUsers(userList);
    }
    setLoadingUsers(false);
  };

  const handleRemoveUser = async (userId: string) => {
    const { error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'delete', userId },
    });
    if (error) {
      toast({ title: 'Error', description: 'Could not remove user.', variant: 'destructive' });
    } else {
      toast({ title: 'User removed', description: 'User has been deleted.' });
      fetchUsers();
    }
  };

  const handleAction = (action: string) => {
    toast({ title: action, description: 'This feature requires backend integration.' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Invalid file', description: 'Please upload a CSV file.', variant: 'destructive' });
      return;
    }
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        if (data.length === 0) {
          toast({ title: 'Empty file', description: 'No data rows found.', variant: 'destructive' });
          return;
        }
        setCsvColumns(Object.keys(data[0]));
        setCsvData(data);
        toast({ title: 'Upload successful', description: `Loaded ${data.length} rows from ${file.name}` });
      },
      error: () => {
        toast({ title: 'Parse error', description: 'Could not parse the CSV file.', variant: 'destructive' });
      },
    });
    e.target.value = '';
  };

  const logs = [
    { time: '14:32:01', level: 'info', message: 'Prediction model served 1,240 requests' },
    { time: '14:28:45', level: 'info', message: 'Energy data batch processed (2,400 records)' },
    { time: '14:15:12', level: 'warn', message: 'Peak load threshold approaching — Zone B' },
    { time: '13:58:30', level: 'info', message: 'Model retraining completed — accuracy 94.2%' },
    { time: '13:42:18', level: 'error', message: 'Sensor timeout — Smart Meter #4821' },
    { time: '13:30:00', level: 'info', message: 'Scheduled optimization run completed' },
  ];

  const levelStyles: Record<string, string> = {
    info: 'bg-primary/10 text-primary',
    warn: 'bg-energy-yellow/10 text-energy-yellow',
    error: 'bg-destructive/10 text-destructive',
  };

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 gradient-card border-border text-center max-w-sm">
          <h2 className="text-lg font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">System health, user management & logs</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value={`${health.cpuUsage}%`} icon={<Cpu className="w-5 h-5" />} variant={health.cpuUsage > 70 ? 'warning' : 'default'} />
        <MetricCard title="Memory" value={`${health.memoryUsage}%`} icon={<HardDrive className="w-5 h-5" />} variant="default" />
        <MetricCard title="API Latency" value={`${health.apiLatency} ms`} icon={<Clock className="w-5 h-5" />} variant="primary" />
        <MetricCard title="Total Users" value={`${users.length}`} icon={<Users className="w-5 h-5" />} variant="accent" />
      </div>

      {/* User Management */}
      <Card className="p-5 gradient-card border-border animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">User Management</h3>
          <Badge variant="outline" className="text-[10px]">{users.length} users</Badge>
        </div>
        {loadingUsers ? (
          <p className="text-sm text-muted-foreground">Loading users...</p>
        ) : (
          <div className="overflow-auto max-h-80 rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs">{u.display_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{u.phone || '—'}</TableCell>
                    <TableCell className="text-xs font-mono">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {u.role !== 'admin' && (
                        <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => handleRemoveUser(u.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Actions */}
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Model Management</h3>
          <div className="space-y-3">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload Training Dataset (CSV)
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => handleAction('Retrain Model')}>
              <RefreshCw className="w-4 h-4" /> Retrain ML Model
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => handleAction('Export Report')}>
              <FileText className="w-4 h-4" /> Export Prediction Report
            </Button>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground mb-3">Resource Utilization</h4>
            <div className="space-y-3">
              {[
                { label: 'CPU', value: health.cpuUsage },
                { label: 'Memory', value: health.memoryUsage },
                { label: 'Uptime', value: health.uptime },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-mono">{typeof value === 'number' && value < 100 ? `${value}%` : `${value.toFixed(2)}%`}</span>
                  </div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Logs */}
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">System Logs</h3>
            <Badge variant="outline" className="text-[10px]">
              <Activity className="w-3 h-3 mr-1" /> Real-time
            </Badge>
          </div>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 text-xs">
                <span className="font-mono text-muted-foreground shrink-0">{log.time}</span>
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${levelStyles[log.level]}`}>
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-foreground/80">{log.message}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CSV Data Table */}
      {csvData.length > 0 && (
        <Card className="p-5 gradient-card border-border animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Uploaded Data — {fileName}</h3>
            <Badge variant="outline" className="text-[10px]">{csvData.length} rows</Badge>
          </div>
          <div className="overflow-auto max-h-96 rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvColumns.map((col) => (
                    <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 100).map((row, i) => (
                  <TableRow key={i}>
                    {csvColumns.map((col) => (
                      <TableCell key={col} className="text-xs whitespace-nowrap">{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {csvData.length > 100 && (
            <p className="text-xs text-muted-foreground mt-2">Showing first 100 of {csvData.length} rows</p>
          )}
        </Card>
      )}
    </div>
  );
}
