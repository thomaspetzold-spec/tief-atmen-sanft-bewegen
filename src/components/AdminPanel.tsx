import { useState, useEffect } from 'react';
import { Settings, Home, Trees, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { YogaSession, AttendanceRecord, formatDate, formatTime, updateSessionLocation, updateSessionTime, toggleSessionCancelled, getLocationLabel, LocationType, getCapacity, saveCapacity, resetAttendance, removeAttendee, getAttendance, cancelCheckIn } from '@/lib/yogaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'schafi';

interface AdminPanelProps {
  sessions: YogaSession[];
  onUpdate: () => void;
  onClose: () => void;
}

export const AdminPanel = ({ sessions, onUpdate, onClose }: AdminPanelProps) => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'teilnehmer' | 'rangliste'>('teilnehmer');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [indoorMax, setIndoorMax] = useState('6');
  const [outdoorMax, setOutdoorMax] = useState('15');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const loadAdminData = () => {
    getCapacity().then(c => {
      setIndoorMax(String(c.indoor));
      setOutdoorMax(String(c.outdoor));
    });
    getAttendance().then(setAttendance);
  };

  useEffect(() => {
    if (authenticated) loadAdminData();
  }, [authenticated]);

  const handleToggleLocation = async (session: YogaSession) => {
    const newType: LocationType = session.locationType === 'indoor' ? 'outdoor' : 'indoor';
    await updateSessionLocation(session.id, newType);
    onUpdate();
    toast({ title: 'Ort geändert', description: `${formatDate(session.date)} ist jetzt ${getLocationLabel(newType)}` });
  };

  const handleResetLeaderboard = async () => {
    if (!confirm('Rangliste wirklich zurücksetzen? Das kann nicht rückgängig gemacht werden.')) return;
    await resetAttendance();
    setAttendance([]);
    onUpdate();
    toast({ title: 'Rangliste zurückgesetzt', description: 'Alle Teilnahmen wurden gelöscht' });
  };

  const toggleSession = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleCancelled = async (session: YogaSession) => {
    const nowCancelled = await toggleSessionCancelled(session.id);
    onUpdate();
    toast({ title: nowCancelled ? 'Termin abgesagt' : 'Termin wieder aktiv' });
  };

  const handleUpdateTime = async (sessionId: string, time: string) => {
    await updateSessionTime(sessionId, time);
    onUpdate();
    toast({ title: 'Uhrzeit gespeichert' });
  };

  const handleRemoveFromSession = async (sessionId: string, name: string) => {
    await cancelCheckIn(sessionId, name);
    onUpdate();
    toast({ title: `${name} aus Session entfernt` });
  };

  const handleRemoveAttendee = async (name: string) => {
    await removeAttendee(name);
    setAttendance(prev => prev.filter(a => a.name !== name));
    onUpdate();
    toast({ title: `${name} entfernt` });
  };

  const handleSaveCapacity = async () => {
    const indoor = Math.max(1, parseInt(indoorMax) || 6);
    const outdoor = Math.max(1, parseInt(outdoorMax) || 15);
    await saveCapacity(indoor, outdoor);
    setIndoorMax(String(indoor));
    setOutdoorMax(String(outdoor));
    onUpdate();
    toast({ title: 'Gespeichert', description: 'Maximale Teilnehmerzahl aktualisiert' });
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      toast({ title: 'Falsches Passwort', variant: 'destructive' });
      setPassword('');
    }
  };

  if (!authenticated) {
    return (
      <div className="yoga-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Admin-Bereich</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
        </div>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="flex-1"
          />
          <Button onClick={handleLogin}>Anmelden</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="yoga-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Termine verwalten</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-4">
        {(['teilnehmer', 'rangliste'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'teilnehmer' ? 'Teilnehmer' : 'Rangliste'}
          </button>
        ))}
      </div>

      {activeTab === 'teilnehmer' && (<>
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Max. Teilnehmer</p>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm w-16">Drinnen</span>
            <Input type="number" min={1} value={indoorMax} onChange={(e) => setIndoorMax(e.target.value)} className="w-20 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Trees className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm w-16">Draußen</span>
            <Input type="number" min={1} value={outdoorMax} onChange={(e) => setOutdoorMax(e.target.value)} className="w-20 h-8 text-sm" />
          </div>
          <Button size="sm" onClick={handleSaveCapacity} className="w-full mt-1">Speichern</Button>
        </div>

        {/* Session list */}
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-xl bg-background/50 overflow-hidden">
              <div className="flex items-center justify-between py-2.5 px-3">
                <button
                  onClick={() => toggleSession(session.id)}
                  className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                >
                  {expandedSessions.has(session.id) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  <div>
                    <span className="font-medium">{formatDate(session.date)}</span>
                    <span className="text-sm text-muted-foreground ml-2">{formatTime(session.time)}</span>
                    <div className="text-xs text-muted-foreground">{session.attendees.length}/{session.maxSpots} angemeldet</div>
                  </div>
                </button>
                <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-medium ml-2 shrink-0">
                  <button
                    onClick={() => session.locationType !== 'indoor' && handleToggleLocation(session)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all ${
                      session.locationType === 'indoor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    Drinnen
                  </button>
                  <button
                    onClick={() => session.locationType !== 'outdoor' && handleToggleLocation(session)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all ${
                      session.locationType === 'outdoor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Trees className="w-3.5 h-3.5" />
                    Draußen
                  </button>
                </div>
              </div>
              {expandedSessions.has(session.id) && (
                <div className="border-t border-border/50 px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Uhrzeit</span>
                    <Input
                      type="time"
                      defaultValue={session.time}
                      onBlur={(e) => e.target.value !== session.time && handleUpdateTime(session.id, e.target.value)}
                      className="h-8 text-sm w-32"
                    />
                  </div>
                  <Button
                    variant={session.cancelled ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => handleToggleCancelled(session)}
                    className="w-full"
                  >
                    {session.cancelled ? 'Termin wieder aktivieren' : 'Kein Yoga diese Woche'}
                  </Button>
                  {session.attendees.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1">Keine Anmeldungen</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {session.attendees.map((name) => (
                        <li key={name} className="flex items-center justify-between text-sm py-1 px-2 rounded-lg bg-muted/50">
                          <span>{name}</span>
                          <button
                            onClick={() => handleRemoveFromSession(session.id, name)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Entfernen
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </>)}

      {activeTab === 'rangliste' && (
        <div className="mb-4 space-y-2">
          {attendance.filter(a => a.sessions > 0).sort((a, b) => b.sessions - a.sessions).map(record => (
            <div key={record.name} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-background/50">
              <span>{record.name} <span className="text-muted-foreground text-xs">({record.sessions}x)</span></span>
              <button
                onClick={() => handleRemoveAttendee(record.name)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Entfernen
              </button>
            </div>
          ))}
          {attendance.filter(a => a.sessions > 0).length === 0 && (
            <p className="text-xs text-muted-foreground">Keine Einträge</p>
          )}
          <Button variant="destructive" size="sm" onClick={handleResetLeaderboard} className="w-full mt-2">
            Alle zurücksetzen
          </Button>
        </div>
      )}

    </div>
  );
};
