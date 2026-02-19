import React, { useState, useRef } from 'react';
import { Pencil, Trash2, Calendar, Check, Plus, Dumbbell, X } from 'lucide-react';

interface RoutineDetailViewProps {
  onBack: () => void;
}

interface ExerciseSetRow {
  id: number;
  sets: number;
  reps: number;
  weight: number;
}

interface LocalExercise {
  id: number;
  name: string;
  muscle: string;
  type: string;
  rows: ExerciseSetRow[];
}

const RoutineDetailView: React.FC<RoutineDetailViewProps> = ({ onBack }) => {
  // Routine Title State
  const [title, setTitle] = useState("Upper Body Strength A");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Schedule State
  const [schedule, setSchedule] = useState<string[]>(['Mon', 'Wed', 'Fri']);

  // Exercises State
  const [exercises, setExercises] = useState<LocalExercise[]>([]);

  // Handlers
  const toggleDay = (day: string) => {
    setSchedule(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  const handleDeleteRoutine = () => {
    if (window.confirm("Are you sure you want to delete this routine?")) {
      onBack();
    }
  };

  const addExercise = () => {
    const newExercise: LocalExercise = {
      id: Date.now(),
      name: "New Exercise",
      muscle: "Select Muscle",
      type: "Compound",
      rows: [
        { id: Date.now() + 1, sets: 3, reps: 10, weight: 0 }
      ]
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExerciseName = (id: number, name: string) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, name } : e));
  };

  const addSetRow = (exerciseId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          rows: [...ex.rows, { id: Date.now(), sets: 3, reps: 10, weight: 0 }]
        };
      }
      return ex;
    }));
  };

  const removeSetRow = (exerciseId: number, rowId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          rows: ex.rows.filter(row => row.id !== rowId)
        };
      }
      return ex;
    }));
  };

  const updateSetRow = (exerciseId: number, rowId: number, field: keyof ExerciseSetRow, value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          rows: ex.rows.map(row => row.id === rowId ? { ...row, [field]: value } : row)
        };
      }
      return ex;
    }));
  };

  return (
    <div className="flex-1 w-full max-w-[1024px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm text-text-secondary font-medium">Routine Name</label>
            <input 
              ref={titleInputRef}
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={!isEditingTitle}
              onBlur={() => setIsEditingTitle(false)}
              className={`bg-transparent text-3xl sm:text-4xl font-black text-white border-0 border-b-2 ${isEditingTitle ? 'border-primary' : 'border-border-dark'} focus:border-primary focus:ring-0 px-0 pb-2 w-full transition-colors placeholder:text-slate-600 outline-none`}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleTitleEdit}
              className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil size={24} />
            </button>
            <button 
              onClick={handleDeleteRoutine}
              className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-card-dark rounded-xl p-4 sm:p-5 shadow-sm border border-border-dark">
           <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4 flex items-center gap-2">
             <Calendar size={18} />
             Weekly Schedule
           </h3>
           <div className="grid grid-cols-7 gap-1 sm:gap-2">
             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
               const isActive = schedule.includes(day);
               return (
                <label 
                  key={day} 
                  className="cursor-pointer group select-none"
                  onClick={(e) => { e.preventDefault(); toggleDay(day); }}
                >
                  <div className={`h-10 sm:h-12 w-full rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center border border-transparent transition-all
                    ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-[#111418] text-text-secondary hover:bg-[#283039]'}`}>
                    {day}
                  </div>
                </label>
               );
             })}
           </div>
        </div>
      </section>

      {/* Exercises */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Exercises</h3>
          <span className="text-sm font-medium text-text-secondary">{exercises.length} Exercises</span>
        </div>

        <div className="flex flex-col gap-4">
          
          {exercises.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-border-dark rounded-xl bg-card-dark/30">
                <p className="text-text-secondary mb-4">No exercises added to this routine yet.</p>
                <button onClick={addExercise} className="text-primary font-bold hover:underline text-sm">
                   Add your first exercise
                </button>
            </div>
          )}
          
          {exercises.map((exercise) => (
             <div key={exercise.id} className="bg-card-dark rounded-xl border border-border-dark overflow-hidden shadow-sm transition-all hover:border-primary/50 group animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Exercise Header */}
                <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between bg-[#16202a]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <Dumbbell size={20} />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={exercise.name}
                        onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                        className="font-bold text-white bg-transparent border-none p-0 focus:ring-0 w-full placeholder-slate-500"
                        placeholder="Exercise Name"
                      />
                      <p className="text-xs text-text-secondary">{exercise.muscle} • {exercise.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeExercise(exercise.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {/* Sets & Reps Table */}
                <div className="p-5 flex flex-col gap-4">
                   
                   {exercise.rows.length > 0 && (
                     <div className="grid grid-cols-10 gap-3 text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
                        <div className="col-span-3">Sets</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-3">Weight (KG)</div>
                        <div className="col-span-1"></div>
                     </div>
                   )}

                   <div className="flex flex-col gap-3">
                      {exercise.rows.map((row) => (
                        <div key={row.id} className="grid grid-cols-10 gap-3 items-center group/row">
                           {/* Sets Input */}
                           <div className="col-span-3 relative">
                              <input 
                                type="number" 
                                value={row.sets} 
                                onChange={(e) => updateSetRow(exercise.id, row.id, 'sets', parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111418] text-white border border-border-dark rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono font-medium transition-colors outline-none text-center" 
                              />
                           </div>
                           
                           {/* Reps Input */}
                           <div className="col-span-3 relative">
                              <input 
                                type="number" 
                                value={row.reps} 
                                onChange={(e) => updateSetRow(exercise.id, row.id, 'reps', parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111418] text-white border border-border-dark rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono font-medium transition-colors outline-none text-center" 
                              />
                           </div>

                           {/* Weight Input */}
                           <div className="col-span-3 relative">
                              <input 
                                type="number" 
                                value={row.weight} 
                                onChange={(e) => updateSetRow(exercise.id, row.id, 'weight', parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111418] text-white border border-border-dark rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono font-medium transition-colors outline-none text-center" 
                              />
                           </div>

                           {/* Remove Row Action */}
                           <div className="col-span-1 flex justify-center">
                              <button 
                                onClick={() => removeSetRow(exercise.id, row.id)}
                                className="text-slate-500 hover:text-red-500 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                              >
                                <X size={16} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Add Variation Button */}
                   <button 
                     onClick={() => addSetRow(exercise.id)}
                     className="self-start text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors mt-1"
                   >
                     <Plus size={14} />
                     Add Variation / Drop Set
                   </button>
                </div>
             </div>
          ))}

          {/* Add Exercise Button */}
          <button 
             onClick={addExercise}
             className="w-full border-2 border-dashed border-border-dark rounded-xl p-4 flex items-center justify-center gap-2 text-text-secondary font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group mt-2"
          >
             <div className="bg-[#283039] rounded-full p-1 group-hover:bg-primary group-hover:text-white transition-colors">
               <Plus size={20} />
             </div>
             <span>Add Exercise</span>
          </button>

        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 pb-8 flex justify-end">
         <button onClick={onBack} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all hover:translate-y-[-1px]">
            <Check size={20} />
            <span>Save Routine</span>
         </button>
      </div>

    </div>
  );
};

export default RoutineDetailView;