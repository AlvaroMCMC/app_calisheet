import React, { useState } from 'react';
import { Play, Info, CheckCircle, Check, ArrowRight, PlusCircle, Clock, Lightbulb } from 'lucide-react';
import { ExerciseSet } from '../types';

interface ActiveWorkoutViewProps {
  onFinish: () => void;
}

const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({ onFinish }) => {
  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: 1, type: 'working', weight: 10, reps: 8, rpe: 8, status: 'completed' },
    { id: 2, type: 'working', weight: 12.5, reps: 8, status: 'active' },
    { id: 3, type: 'working', weight: 12.5, reps: 8, status: 'pending' },
    { id: 4, type: 'working', weight: 12.5, reps: 8, status: 'pending' },
  ]);

  const completeSet = (id: number) => {
    setSets(prev => prev.map(s => {
      if (s.id === id) return { ...s, status: 'completed' };
      if (s.id === id + 1) return { ...s, status: 'active' };
      return s;
    }));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto text-white">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden xl:flex w-80 flex-col border-r border-border-dark bg-[#111418] p-6 gap-6 sticky top-0 h-[calc(100vh-73px)] overflow-y-auto">
         <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">Today's Routine</h3>
            <div className="text-2xl font-black leading-tight tracking-tight mb-2">Empuje Avanzado</div>
            <div className="text-sm text-text-secondary flex items-center gap-2">
               <Clock size={18} />
               <span>45 min est.</span>
            </div>
         </div>
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white">
                  <Check size={14} strokeWidth={3} />
               </div>
               <span className="text-sm font-medium text-slate-200 line-through opacity-70">Calentamiento Articular</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(19,127,236,0.15)]">
               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white animate-pulse">
                  <span className="text-xs font-bold">2</span>
               </div>
               <span className="text-sm font-bold text-primary">Dominadas con Lastre</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2127] transition-colors cursor-pointer group">
               <div className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-600 text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
                  <span className="text-xs font-bold">3</span>
               </div>
               <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Fondos en Anillas</span>
            </div>
             <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2127] transition-colors cursor-pointer group">
               <div className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-600 text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
                  <span className="text-xs font-bold">4</span>
               </div>
               <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Flexiones Pino</span>
            </div>
         </div>
      </aside>

      {/* Active Workout Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 gap-8">
         
         {/* Progress Bar */}
         <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
               <span className="text-sm font-medium text-text-secondary">Progreso de la sesión</span>
               <span className="text-sm font-bold text-primary">Ejercicio 2 de 6</span>
            </div>
            <div className="w-full h-2 bg-[#283039] rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full" style={{ width: '33%'}}></div>
            </div>
         </div>

         {/* Header */}
         <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">Fuerza</span>
                  <span className="px-2 py-1 rounded bg-[#283039] text-slate-300 text-xs font-bold uppercase tracking-wider">Espalda</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                  Dominadas con Lastre
               </h1>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-4 bg-[#1c2127] border border-border-dark p-2 rounded-xl shadow-sm">
               <div className="flex flex-col px-4 border-r border-border-dark">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Descanso</span>
                  <span className="text-xl font-bold font-mono text-white">01:30</span>
               </div>
               <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors">
                  <Play size={20} fill="currentColor" />
               </button>
            </div>
         </div>

         {/* Grid Content */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Visuals */}
            <div className="lg:col-span-4 flex flex-col gap-6">
               <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-800 relative shadow-lg group">
                  <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3GkgVd-3cz-n0DQawi3-LFPAmekgJOaYoBHhdjntYjh4zs_XyAOG7KKtZIyc25iIXuHGiKtsd_KpICBL7e8s5r3PFV-nBa-pNAkMWBx00GWCWBAfM5WLjypTy85BQ6c5z9LzEJ0v1RHa9Z0dyDSaX8tBkqIwG_E-Yk9MerZic82Cwu-dGosYbf8OiVLYaO9W58tyORQ_s4jxqR4uh-wL4T14R5hANPJOUcb7fSWHQYh6cY-bedcYGqt_OOiPSQdVX3Cy03f9ddEgl")'}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                     <button className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider hover:text-primary transition-colors">
                        <Info size={18} /> Ver Instrucciones
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1c2127] p-4 rounded-xl border border-border-dark">
                     <div className="text-xs text-text-secondary font-medium mb-1">Personal Record (1RM)</div>
                     <div className="text-2xl font-bold text-white flex items-baseline gap-1">+40<span className="text-sm font-normal text-text-secondary">kg</span></div>
                  </div>
                   <div className="bg-[#1c2127] p-4 rounded-xl border border-border-dark relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-full"></div>
                     <div className="text-xs text-text-secondary font-medium mb-1">Last Session</div>
                     <div className="text-2xl font-bold text-primary flex items-baseline gap-1">+10<span className="text-sm font-normal text-primary/70">kg</span><span className="text-lg text-slate-400 mx-1">x</span> 8</div>
                  </div>
               </div>

               <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                     <Lightbulb className="text-yellow-500 mt-0.5" size={20} />
                     <div>
                        <p className="text-sm text-yellow-200 font-medium">Tip de Ejecución</p>
                        <p className="text-sm text-yellow-300/80 mt-1">Mantén la retracción escapular al inicio del movimiento y controla la bajada en 2 segundos.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Col: Input */}
            <div className="lg:col-span-8 flex flex-col bg-[#1c2127] rounded-2xl border border-border-dark shadow-sm overflow-hidden">
               {/* Table Header */}
               <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 md:px-8 border-b border-border-dark bg-[#171b21] text-xs font-bold text-slate-500 uppercase tracking-wider items-center text-center">
                  <div className="col-span-2 md:col-span-1">Set</div>
                  <div className="col-span-3">Lastre (kg)</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-2 hidden md:block">RPE</div>
                  <div className="col-span-4 md:col-span-3">Status</div>
               </div>

               {/* Rows */}
               <div className="flex flex-col divide-y divide-border-dark">
                  {sets.map((set) => {
                     const isCompleted = set.status === 'completed';
                     const isActive = set.status === 'active';

                     return (
                        <div key={set.id} className={`grid grid-cols-12 gap-2 md:gap-4 p-4 md:p-6 md:px-8 items-center transition-all ${isCompleted ? 'bg-emerald-900/5' : isActive ? 'bg-primary/5 relative' : 'opacity-60 hover:opacity-100'}`}>
                           {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                           
                           <div className="col-span-2 md:col-span-1 flex justify-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-emerald-900/30 text-emerald-400' : isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'border-2 border-slate-600 text-slate-500'}`}>
                                 {set.id}
                              </div>
                           </div>

                           <div className="col-span-3 flex justify-center">
                              {isActive ? (
                                 <div className="relative w-full max-w-[100px]">
                                    <input type="number" defaultValue={set.weight} className="w-full bg-[#111418] border-2 border-primary rounded-lg text-center font-bold text-2xl py-3 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder-slate-600" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">KG</span>
                                 </div>
                              ) : (
                                 <div className={`text-center font-bold text-lg ${isCompleted ? 'text-slate-500 line-through decoration-2 decoration-emerald-500/50' : 'text-slate-500'}`}>
                                    {set.weight > 0 ? `+${set.weight}` : set.weight} <span className={isCompleted ? 'hidden' : 'text-sm font-medium'}>kg</span>
                                 </div>
                              )}
                           </div>

                           <div className="col-span-3 flex justify-center">
                               {isActive ? (
                                 <div className="relative w-full max-w-[100px]">
                                    <input type="number" placeholder="8" className="w-full bg-[#111418] border-2 border-border-dark focus:border-primary rounded-lg text-center font-bold text-2xl py-3 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder-slate-600" />
                                 </div>
                              ) : (
                                 <div className={`text-center font-bold text-lg ${isCompleted ? 'text-slate-500 line-through decoration-2 decoration-emerald-500/50' : 'text-slate-500'}`}>
                                    {set.reps}
                                 </div>
                              )}
                           </div>

                           <div className="col-span-2 hidden md:flex justify-center">
                              {isActive ? (
                                 <div className="relative w-full max-w-[70px]">
                                    <input type="number" placeholder="-" className="w-full bg-transparent border-b-2 border-border-dark focus:border-primary text-center font-medium text-lg py-1 text-slate-300 focus:outline-none transition-all placeholder-slate-400" />
                                 </div>
                              ) : (
                                 <div className={isCompleted ? 'text-slate-400 font-medium' : 'h-0.5 w-6 bg-slate-600'}>
                                    {isCompleted ? set.rpe?.toFixed(1) : ''}
                                 </div>
                              )}
                           </div>

                           <div className="col-span-4 md:col-span-3 flex justify-center">
                              {isCompleted ? (
                                 <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                                    <CheckCircle size={18} />
                                    <span className="hidden sm:inline">Listo</span>
                                 </button>
                              ) : isActive ? (
                                 <button onClick={() => completeSet(set.id)} className="w-full max-w-[120px] h-12 rounded-lg bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                                    <Check size={20} />
                                    <span className="hidden sm:inline">Terminar</span>
                                 </button>
                              ) : (
                                 <div className="text-sm font-medium text-slate-500 italic">Pendiente</div>
                              )}
                           </div>
                        </div>
                     )
                  })}
               </div>

               {/* Footer */}
               <div className="p-6 bg-[#171b21] border-t border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors">
                     <PlusCircle size={20} />
                     Add Extra Set
                  </button>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button className="h-12 px-6 rounded-lg border border-border-dark text-slate-300 font-bold hover:bg-[#283039] transition-colors flex-1 sm:flex-none">
                        Previous
                     </button>
                     <button onClick={onFinish} className="h-12 px-8 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-primary/25 transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        Next Exercise
                        <ArrowRight size={20} />
                     </button>
                  </div>
               </div>

            </div>
         </div>
      </div>

    </div>
  );
};

export default ActiveWorkoutView;