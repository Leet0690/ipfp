import React, { useState } from 'react';
import { Plus, Users, Calendar, MapPin, User, Clock, ChevronDown, Filter } from 'lucide-react';

const SESSIONS = [
  { day: 'Lundi', date: '12 Fév', sessions: [
    { id: 1, time: '08:30–10:30', module: 'Algorithmique', type: 'TP', room: 'Salle A1', teacher: 'M. Benali' },
    { id: 2, time: '10:30–12:30', module: 'POO Java', type: 'Cours', room: 'Amphi', teacher: 'Mme. Saidi' },
    { id: 3, time: '14:00–16:00', module: 'Base de données', type: 'TP', room: 'Salle B2', teacher: 'M. Larbi' }
  ]},
  { day: 'Mardi', date: '13 Fév', sessions: [
    { id: 4, time: '08:30–10:30', module: 'Développement Web', type: 'Cours', room: 'Amphi', teacher: 'Mme. Chaou' },
    { id: 5, time: '13:00–15:00', module: 'UML/Merise', type: 'Cours', room: 'Salle C1', teacher: 'M. Hamidi' }
  ]},
  { day: 'Mercredi', date: '14 Fév', sessions: [
    { id: 6, time: '08:30–10:30', module: 'Algorithmique', type: 'Cours', room: 'Amphi', teacher: 'M. Benali' },
    { id: 7, time: '14:00–16:00', module: 'Soft Skills', type: 'Cours', room: 'Salle D1', teacher: 'Mme. Amrani' }
  ]},
  { day: 'Jeudi', date: '15 Fév', sessions: [
    { id: 8, time: '09:00–11:00', module: 'POO Java', type: 'TP', room: 'Salle A1', teacher: 'Mme. Saidi' },
    { id: 9, time: '13:00–15:00', module: 'Anglais', type: 'Cours', room: 'Salle C2', teacher: 'M. Berrada' }
  ]},
  { day: 'Vendredi', date: '16 Fév', sessions: [
    { id: 10, time: '08:30–10:30', module: 'Développement Web', type: 'TP', room: 'Salle B1', teacher: 'Mme. Chaou' }
  ]},
  { day: 'Samedi', date: '17 Fév', sessions: []}
];

export function Kanban() {
  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white tracking-tight">Emploi du Temps</h1>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/50 hover:bg-slate-700/80 transition cursor-pointer">
              <span className="text-slate-300">Filière:</span>
              <span className="font-semibold text-white">Développement Informatique</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/50 hover:bg-slate-700/80 transition cursor-pointer">
              <span className="text-slate-300">Année:</span>
              <span className="font-semibold text-white">1ère année</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700/50 hover:bg-slate-700 transition">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-lg shadow-indigo-900/20 transition-all font-medium text-sm">
            <Plus className="w-4 h-4" />
            Ajouter Session
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-6 py-3 shrink-0 flex items-center gap-4 border-b border-slate-800/40 bg-slate-900/30">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/30">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-slate-300">Groupe:</span>
          <span className="text-xs font-bold text-indigo-300">TSDI1</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/30">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">Sessions:</span>
          <span className="text-xs font-bold text-emerald-300">10 sessions</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/30">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">Jours actifs:</span>
          <span className="text-xs font-bold text-amber-300">5 jours</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-4 items-start">
        {SESSIONS.map((col, idx) => (
          <div key={idx} className="flex-shrink-0 w-80 h-full flex flex-col bg-slate-800/20 rounded-xl border border-slate-700/30 overflow-hidden backdrop-blur-sm">
            {/* Column Header */}
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-100">{col.day}</h2>
                <span className="text-xs text-slate-400">{col.date}</span>
              </div>
              <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {col.sessions.length}
              </span>
            </div>
            
            {/* Column Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {col.sessions.length > 0 ? (
                col.sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="relative bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl group flex flex-col gap-3"
                  >
                    {/* Type Indicator Border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                      session.type === 'TP' ? 'bg-purple-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm mb-2 inline-block ${
                          session.type === 'TP' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {session.type}
                        </span>
                        <h3 className="font-bold text-slate-100 leading-tight text-base mb-1">
                          {session.module}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{session.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-700/40">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate max-w-[100px]">{session.teacher}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate max-w-[100px]">{session.room}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-24 rounded-lg border-2 border-dashed border-slate-700/50 flex items-center justify-center bg-slate-800/20">
                  <span className="text-sm font-medium text-slate-500 tracking-widest">LIBRE</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
