import { useState, useEffect } from 'react';
import { Leaf, Calendar, Users, Settings } from 'lucide-react';
import { subscribeToSessions, subscribeToAttendance, YogaSession, AttendanceRecord } from '@/lib/yogaStore';
import { SessionCard } from '@/components/SessionCard';
import { Leaderboard } from '@/components/Leaderboard';
import { AdminPanel } from '@/components/AdminPanel';

const Index = () => {
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'leaderboard'>('sessions');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClosing, setAdminClosing] = useState(false);

  const loadData = () => {};

  useEffect(() => {
    const unsubSessions = subscribeToSessions(setSessions);
    const unsubAttendance = subscribeToAttendance(setAttendance);
    return () => {
      unsubSessions();
      unsubAttendance();
    };
  }, []);

  const closeAdmin = () => {
    setAdminClosing(true);
    setTimeout(() => {
      setShowAdmin(false);
      setAdminClosing(false);
    }, 350);
  };

  const upcomingSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  });

  const signupCutoff = new Date();
  signupCutoff.setDate(signupCutoff.getDate() + 7);
  signupCutoff.setHours(23, 59, 59, 999);

  const thisWeekSessions = upcomingSessions.filter(s => new Date(s.date) <= signupCutoff);
  const futureSessions = upcomingSessions.filter(s => new Date(s.date) > signupCutoff);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center relative">
        <button
          onClick={() => showAdmin ? closeAdmin() : setShowAdmin(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-card/50 hover:bg-card transition-colors"
          aria-label="Admin"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-breathe">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Tief atmen – sanft bewegen
        </h1>
      </header>

      {/* Admin Panel Overlay */}
      {showAdmin && (
        <div
          className={`fixed inset-0 z-50 flex justify-end bg-black/20 ${adminClosing ? 'animate-fade-out-backdrop' : 'animate-fade-in-backdrop'}`}
          onClick={closeAdmin}
        >
          <div
            className={`w-full max-w-sm h-full bg-background shadow-2xl overflow-y-auto p-4 ${adminClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminPanel
              sessions={upcomingSessions}
              onUpdate={loadData}
              onClose={closeAdmin}
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="px-4 mb-6">
        <div className="flex bg-card rounded-2xl p-1.5 shadow-soft max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Termine
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Rangliste
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 pb-12 max-w-md mx-auto">
        {activeTab === 'sessions' ? (
          <div key="sessions" className="space-y-4 animate-fade-in">
            {thisWeekSessions.length === 0 && futureSessions.length === 0 ? (
              <div className="yoga-card text-center py-8">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Keine anstehenden Termine</p>
              </div>
            ) : (
              <>
                {thisWeekSessions.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1 animate-fade-in">
                      Jetzt buchbar
                    </h2>
                    {thisWeekSessions.map((session, i) => (
                      <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                        <SessionCard session={session} onUpdate={loadData} />
                      </div>
                    ))}
                  </div>
                )}
                {futureSessions.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1 animate-fade-in">
                      Demnächst
                    </h2>
                    {futureSessions.map((session, i) => (
                      <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${(thisWeekSessions.length + i) * 0.08}s` }}>
                        <SessionCard session={session} onUpdate={loadData} isPlaceholder />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div key="leaderboard" className="animate-fade-in">
            <Leaderboard attendance={attendance} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 px-4">
        <p className="text-base text-muted-foreground font-display italic">
          🧘 Tief atmen, sanft bewegen
        </p>
      </footer>
    </div>
  );
};

export default Index;
