import { useState, useEffect } from 'react';
import { Settings, Home, Trees } from 'lucide-react';
import { YogaSession, formatDate, formatTime, updateSessionLocation, getLocationLabel, LocationType, getCapacity, saveCapacity } from '@/lib/yogaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  sessions: YogaSession[];
  onUpdate: () => void;
  onClose: () => void;
}

export const AdminPanel = ({ sessions, onUpdate, onClose }: AdminPanelProps) => {
  const { toast } = useToast();
  const [indoorMax, setIndoorMax] = useState('6');
  const [outdoorMax, setOutdoorMax] = useState('15');

  useEffect(() => {
    getCapacity().then(c => {
      setIndoorMax(String(c.indoor));
      setOutdoorMax(String(c.outdoor));
    });
  }, []);

  const handleToggleLocation = async (session: YogaSession) => {
    const newType: LocationType = session.locationType === 'indoor' ? 'outdoor' : 'indoor';
    await updateSessionLocation(session.id, newType);
    onUpdate();
    toast({ title: 'Ort geändert', description: `${formatDate(session.date)} ist jetzt ${getLocationLabel(newType)}` });
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

  return (
    <div className="yoga-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Termine verwalten</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
      </div>

      {/* Capacity settings */}
      <div className="mb-4 p-3 bg-muted/50 rounded-xl space-y-2">
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
          <li key={session.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-background/50">
            <div>
              <span className="font-medium">{formatDate(session.date)}</span>
              <span className="text-sm text-muted-foreground ml-2">{formatTime(session.time)}</span>
              <div className="text-xs text-muted-foreground">{session.attendees.length}/{session.maxSpots} angemeldet</div>
            </div>
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-medium">
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
          </li>
        ))}
      </ul>
    </div>
  );
};
