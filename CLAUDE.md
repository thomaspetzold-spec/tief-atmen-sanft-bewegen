# Yoga mit Anni — Projekt-Kontext

## Was ist das?
Eine lokale Web-App zur Anmeldung für Yoga-Kurse von "Anni". Gebaut mit Lovable, jetzt lokal weiterentwickelt.

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (manuell eingebaut)
- Kein Backend — alles in `localStorage`
- Fonts: Cormorant Garamond (Display), Outfit (Body)

## Projekt starten
```bash
cd /Users/thomaspetzold/Documents/Claude/Yoga
npm run dev --cache /tmp/npm-cache
```
→ Läuft auf http://localhost:5173 (oder 5174 falls Port belegt)

## Wichtige Dateien
| Datei | Beschreibung |
|-------|-------------|
| `src/pages/Index.tsx` | Haupt-UI: Tabs, Header, Session-Liste |
| `src/components/SessionCard.tsx` | Einzelne Session: Anmelden/Abmelden |
| `src/components/AdminPanel.tsx` | Admin-Panel (PIN: 1210), Ort umschalten |
| `src/components/Leaderboard.tsx` | Rangliste nach Anzahl Teilnahmen |
| `src/lib/yogaStore.ts` | Gesamte Logik + localStorage-Zugriff |
| `src/index.css` | Custom CSS-Klassen (yoga-card, gradient-hero, etc.) |

## Datenmodell (yogaStore.ts)
```ts
YogaSession {
  id, date, time, duration,
  locationType: 'indoor' | 'outdoor',
  maxSpots: 6 (indoor) | 15 (outdoor),
  attendees: string[]
}
AttendanceRecord { name, sessions }
```

## Features
- Sessions automatisch generiert: jeden Dienstag 18:00 Uhr, 4 Wochen voraus
- Diese Woche: buchbar; Demnächst: nur Vorschau
- Anmeldung öffnet 4 Tage vor dem Termin
- Admin-PIN: `1210`

## npm Problem
Der globale npm-Cache hat ein Berechtigungsproblem. Immer mit `--cache /tmp/npm-cache` arbeiten:
```bash
npm install --legacy-peer-deps --cache /tmp/npm-cache
```

## Noch offen / mögliche nächste Schritte
- Warteliste wenn Session voll
- Anmeldung per Link teilen
- Push-Benachrichtigungen / Erinnerungen
- Supabase-Backend statt localStorage
- Design-Anpassungen
