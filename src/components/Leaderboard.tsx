import { Trophy, Star, Sparkles } from 'lucide-react';
import { AttendanceRecord } from '@/lib/yogaStore';

interface LeaderboardProps {
  attendance: AttendanceRecord[];
}

export const Leaderboard = ({ attendance }: LeaderboardProps) => {
  const sorted = [...attendance]
    .filter(a => a.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions);

  if (sorted.length === 0) {
    return (
      <div className="yoga-card text-center py-8">
        <Sparkles className="w-10 h-10 text-accent mx-auto mb-3 animate-breathe" />
        <p className="text-muted-foreground">
          Noch keine Teilnahmen.<br />
          Sei der/die Erste!
        </p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Star className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Star className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="yoga-card">
      <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        Yoga Champions
      </h2>
      
      <ul className="space-y-2">
        {sorted.map((record, idx) => (
          <li 
            key={record.name}
            className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${
              idx === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-background/50'
            }`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              {getRankIcon(idx)}
              <span className={`font-medium ${idx === 0 ? 'text-primary' : ''}`}>
                {record.name}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {record.sessions} {record.sessions === 1 ? 'Termin' : 'Termine'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
