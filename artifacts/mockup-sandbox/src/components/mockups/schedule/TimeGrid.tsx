import React from 'react';
import { Plus, Filter, Users, Calendar, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const START_HOUR = 8;
const END_HOUR = 18;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

type SessionType = 'TP' | 'Cours';

interface Session {
  id: string;
  day: string;
  start: string; // HH:mm
  end: string; // HH:mm
  module: string;
  type: SessionType;
  room: string;
  teacher: string;
}

const SESSIONS: Session[] = [
  { id: '1', day: 'Lundi', start: '08:30', end: '10:30', module: 'Algorithmique', type: 'TP', room: 'Salle A1', teacher: 'M. Benali' },
  { id: '2', day: 'Lundi', start: '10:30', end: '12:30', module: 'POO Java', type: 'Cours', room: 'Amphi', teacher: 'Mme. Saidi' },
  { id: '3', day: 'Lundi', start: '14:00', end: '16:00', module: 'Base de données', type: 'TP', room: 'Salle B2', teacher: 'M. Larbi' },
  
  { id: '4', day: 'Mardi', start: '08:30', end: '10:30', module: 'Développement Web', type: 'Cours', room: 'Amphi', teacher: 'Mme. Chaou' },
  { id: '5', day: 'Mardi', start: '13:00', end: '15:00', module: 'UML/Merise', type: 'Cours', room: 'Salle C1', teacher: 'M. Hamidi' },
  
  { id: '6', day: 'Mercredi', start: '08:30', end: '10:30', module: 'Algorithmique', type: 'Cours', room: 'Amphi', teacher: 'M. Benali' },
  { id: '7', day: 'Mercredi', start: '14:00', end: '16:00', module: 'Soft Skills', type: 'Cours', room: 'Salle D1', teacher: 'Mme. Amrani' },
  
  { id: '8', day: 'Jeudi', start: '09:00', end: '11:00', module: 'POO Java', type: 'TP', room: 'Salle A1', teacher: 'Mme. Saidi' },
  { id: '9', day: 'Jeudi', start: '13:00', end: '15:00', module: 'Anglais', type: 'Cours', room: 'Salle C2', teacher: 'M. Berrada' },
  
  { id: '10', day: 'Vendredi', start: '08:30', end: '10:30', module: 'Développement Web', type: 'TP', room: 'Salle B1', teacher: 'Mme. Chaou' },
];

function timeToPixels(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours - START_HOUR) * 60 + minutes;
  return totalMinutes * (60 / 60); // 60px per hour
}

export function TimeGrid() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] font-['Inter'] overflow-hidden">
      {/* Header / Filter Bar */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Emploi du temps</h1>
            <p className="text-sm text-gray-500 mt-1">Développement Informatique — 1ère année</p>
          </div>
          <button className="flex items-center gap-2 bg-[#b068b9] hover:bg-[#9a5aa2] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter une séance
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-md bg-white overflow-hidden">
              <span className="px-3 py-1.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </span>
              <select className="px-3 py-1.5 text-sm border-0 focus:ring-0 text-gray-700 bg-transparent outline-none cursor-pointer">
                <option>Développement Informatique</option>
              </select>
              <div className="w-px h-4 bg-gray-200"></div>
              <select className="px-3 py-1.5 text-sm border-0 focus:ring-0 text-gray-700 bg-transparent outline-none cursor-pointer">
                <option>1ère année</option>
              </select>
              <div className="w-px h-4 bg-gray-200"></div>
              <select className="px-3 py-1.5 text-sm border-0 focus:ring-0 text-gray-700 bg-transparent outline-none cursor-pointer">
                <option>Semaine du 14 Oct</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <Users className="w-4 h-4 text-[#b068b9]" />
              <span className="font-medium">TSDI1</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <Clock className="w-4 h-4 text-[#fecd08]" />
              <span className="font-medium">{SESSIONS.length} séances</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">5 jours actifs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-white relative">
        <div className="flex min-w-[1000px]">
          {/* Time Axis */}
          <div className="w-20 flex-none border-r border-gray-200 bg-gray-50/50 sticky left-0 z-20">
            <div className="h-12 border-b border-gray-200 bg-gray-50/50"></div> {/* Header spacer */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-3 right-3 text-xs text-gray-400 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 flex">
            {DAYS.map((day) => (
              <div key={day} className="flex-1 border-r border-gray-100 min-w-[150px] relative">
                {/* Day Header */}
                <div className="h-12 border-b border-gray-200 bg-gray-50/50 flex items-center justify-center sticky top-0 z-10">
                  <span className="text-sm font-semibold text-gray-700">{day}</span>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 top-12 pointer-events-none">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-100"></div>
                  ))}
                </div>

                {/* Sessions */}
                <div className="relative pt-12">
                  {SESSIONS.filter((s) => s.day === day).map((session) => {
                    const top = timeToPixels(session.start);
                    const height = timeToPixels(session.end) - timeToPixels(session.start);
                    const isTP = session.type === 'TP';

                    return (
                      <div
                        key={session.id}
                        className="absolute left-1 right-1 rounded-md p-2 overflow-hidden shadow-sm border transition-transform hover:scale-[1.02] hover:shadow-md hover:z-30 cursor-pointer"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: isTP ? '#fdf4fe' : '#fffdf0',
                          borderColor: isTP ? '#b068b9' : '#fecd08',
                        }}
                      >
                        <div className="flex items-start justify-between mb-1 gap-1">
                          <h3 
                            className="font-semibold text-sm leading-tight truncate"
                            style={{ color: isTP ? '#8a4d92' : '#b38e00' }}
                          >
                            {session.module}
                          </h3>
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex-none"
                            style={{ 
                              backgroundColor: isTP ? '#f5d5f8' : '#fef0b3',
                              color: isTP ? '#8a4d92' : '#b38e00'
                            }}
                          >
                            {session.type}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-0.5 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock className="w-3 h-3 opacity-70" />
                            <span>{session.start} - {session.end}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 opacity-70" />
                            <span className="truncate">{session.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User className="w-3 h-3 opacity-70" />
                            <span className="truncate">{session.teacher}</span>
                          </div>
                        </div>

                        {/* Left border accent */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: isTP ? '#b068b9' : '#fecd08' }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
