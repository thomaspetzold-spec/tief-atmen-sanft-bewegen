import { useState } from 'react';
import { Home, Trees, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { YogaSession, formatDate, formatTime, checkIn, cancelCheckIn, getLocationLabel } from '@/lib/yogaStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SessionCardProps {
  session: YogaSession;
  onUpdate: () => void;
  isPlaceholder?: boolean;
}

export const SessionCard = ({ session, onUpdate, isPlaceholder = false }: SessionCardProps) => {
  const [name, setName] = useState('');
  const [showAttendees, setShowAttendees] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const spotsLeft = session.maxSpots - session.attendees.length;
  const isFull = spotsLeft === 0;
  const isLimited = spotsLeft <= 2 && spotsLeft > 0;
  const LocationIcon = session.locationType === 'indoor' ? Home : Trees;

  const getSignupOpenDate = (dateString: string): string => {
    const eventDate = new Date(dateString);
    eventDate.setDate(eventDate.getDate() - 7);
    return eventDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  if (isPlaceholder) {
    return (
      <div className="yoga-card opacity-60">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">{formatDate(session.date)}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatTime(session.time)}</span>
              </div>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex items-center gap-1.5">
                <LocationIcon className="w-4 h-4" />
                <span className="text-sm">{getLocationLabel(session.locationType)}</span>
              </div>
            </div>
          </div>
          <span className="slot-badge bg-muted text-muted-foreground text-xs">
            Teilnahme ab {getSignupOpenDate(session.date)} möglich
          </span>
        </div>
      </div>
    );
  }

  const handleCheckIn = async () => {
    if (!name.trim()) {
      toast({ title: 'Name erforderlich', description: 'Bitte gib deinen Namen ein', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await checkIn(session.id, name);
    toast({
      title: result.success ? 'Geschafft!' : 'Ups!',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      setName('');
      onUpdate();
    }
    setIsLoading(false);
  };

  const handleCancel = async (attendeeName: string) => {
    setIsLoading(true);
    const result = await cancelCheckIn(session.id, attendeeName);
    toast({ title: result.success ? 'Abgemeldet' : 'Fehler', description: result.message });
    if (result.success) onUpdate();
    setIsLoading(false);
  };

  if (session.cancelled) {
    return (
      <div className="yoga-card opacity-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground line-through">{formatDate(session.date)}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatTime(session.time)}</span>
              </div>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex items-center gap-1.5">
                <LocationIcon className="w-4 h-4" />
                <span className="text-sm">{getLocationLabel(session.locationType)}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">nächste Woche wieder :)</p>
      </div>
    );
  }

  return (
    <div className="yoga-card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{formatDate(session.date)}</h3>
          <div className="flex items-center gap-2 text-muted-foreground mt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(session.time)}</span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <div className="flex items-center gap-1.5">
              <LocationIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{getLocationLabel(session.locationType)}</span>
            </div>
          </div>
        </div>
        <span className={`slot-badge ${isFull ? 'slot-full' : isLimited ? 'slot-limited' : 'slot-available'}`}>
          <Users className="w-3.5 h-3.5" />
          {isFull ? 'Voll' : `${spotsLeft} Plätze`}
        </span>
      </div>

      {!isFull && (
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Dein Vorname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
            className="flex-1 bg-background/50"
            disabled={isLoading}
          />
          <Button onClick={handleCheckIn} disabled={isLoading} className="px-4">
            {isLoading ? '...' : 'Teilnehmen'}
          </Button>
        </div>
      )}

      {session.attendees.length > 0 && (
        <div className="border-t border-border/50 pt-3 mt-3">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showAttendees ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {session.attendees.length} angemeldet
          </button>
          {showAttendees && (
            <ul className="mt-2 space-y-1.5 animate-fade-in">
              {session.attendees.map((attendee, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-background/50">
                  <span>{attendee}</span>
                  <button
                    onClick={() => handleCancel(attendee)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    disabled={isLoading}
                  >
                    Abmelden
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
