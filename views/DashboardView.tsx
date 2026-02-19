import React from 'react';
import { Search, Plus, ChevronDown, MoreHorizontal, History } from 'lucide-react';
import { Routine } from '../types';

interface DashboardViewProps {
  onNavigateActive: () => void;
  onNavigateDetail: () => void;
  onNavigateHistory: () => void;
}

const routines: Routine[] = [
  {
    id: '1',
    title: 'Empuje Avanzado',
    subtitle: 'Next Session: Push Day A',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNhe6TNIB73QrnpKwG7vKBc89NNab0BlffDdiXcofVMAF9UAaeTJ7mNvOCqe7H5z4PohQYqrxRdLoVD0LTLG4_5iHXYvnTkd1m0m1pnvX8iW9IfwivcbLNdTI-1tcnyA4vezTJdBfao-P5sBCJa1fhdmwQ9lfSeyKKy-F9Q7FW_jU5Du4XBslTinNC86sFGuvWXJewuvkKsHOCPYlNmmkAsOR49Yw-Bda-U-jGopsbvF5e8eSgdI8piUT_cTw6MThVkOg8xxd1sta8',
    tags: ['Rings', 'Floor'],
    exercisesCount: 6,
    lastPerformed: 'Yesterday',
    completionRate: 75
  },
  {
    id: '2',
    title: 'Tirón con Lastre',
    subtitle: 'Heavy Day',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeDswc5_BCUZVFrPqcVQHp8wDqm7mdeTaBt5EiMgWGcktj2HMl2bv0iFMqq0dsou6uQqRXnFWZp88HQY8iaQpct-oOKpfR4Y6NvgqMMGr8UVUP1AuFwscwvMu9yYyI0hW9B_Z9WPo3IV8CKttEmw3-KoHFcwcAb7gfkbegQxzelHTEcpt8fi90CJT-vbZebglv7QHgX2NohB8cPUb2VWn6qxdDvZwB9uxFTF3oMN-xb1_L_MNHx3acA2BLHLogSYlEocwiJEsWZ2aW',
    tags: ['Bar', 'Weight Belt'],
    exercisesCount: 4,
    lastPerformed: '3 days ago',
    streak: '5 weeks'
  },
  {
    id: '3',
    title: 'Skill Work: Front Lever',
    subtitle: 'Progression Focus',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-yRlq8GvX3Nu3cAoodf-27VtOr5Z1c7VzPRTHF-Zysku0YEMt6Y1nTLr4Egq8eVYqD-jmhSrh0_ytoATiv25lE2mbffK1e671WC84gCF2OFv-oV-X0mkwaO0VLkpgddpYmSJZIexFeDAfBFkQJjjk_hCFvRlWiwB76FWciV36vaLEU2zFdhFHfRgtkVva-u9Dk3hHptNVLwMxH2BUHF_QBV5_JNCmskDssdPZKliu7vWz_hb8eT4wrfObV8MtFSkT1CQzvfjBUwzj',
    tags: ['Bar', 'Bands'],
    exercisesCount: 3,
    lastPerformed: '1 week ago',
  },
    {
    id: '4',
    title: 'Legs & Mobility',
    subtitle: 'Recovery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPk80y3oLyG9U4EDPG2vJxl05crBO81Z6zY-bzXkLma370gXkkNfyO9OWLYWFNpiGHsYG4_Yv5yuKAYsmmdrFSbYhMnQD6Ecr6ClVciYmLa4DQv-_BJJe-POUJu-F-BjfNSRW7ls7KGCuOloYFAnRYnQCZ3oHQYesGqdWBVr5CL_RptW6sw0QhH8syM62YOkGMZq3XX7jrzWfHTU2i12Lw3axZnDGVJS4TPgl5AakGo92ScaD5yFp6TG0_pAkhcpNoO-SQppKH8xNZ',
    tags: ['Bodyweight'],
    exercisesCount: 7,
    lastPerformed: 'Never',
  }
];

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateActive, onNavigateDetail }) => {
  return (
    <div className="flex flex-1 justify-center py-5 w-full bg-background-light dark:bg-background-dark">
      <div className="flex flex-col max-w-[1200px] flex-1 px-4 lg:px-8">
        
        {/* Header Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 pt-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              My Routines
            </h1>
            <p className="text-[#637588] dark:text-[#9dabb9] text-base font-normal leading-normal">
              Manage your calisthenics plans and progressions.
            </p>
          </div>
          <button 
            onClick={onNavigateDetail}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 transition-all text-white text-sm font-bold leading-normal shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span className="truncate">Create New Routine</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="flex flex-col h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                <div className="text-[#637588] dark:text-[#9dabb9] flex border-none bg-white dark:bg-[#1c2127] items-center justify-center pl-4 rounded-l-lg">
                  <Search size={20} />
                </div>
                <input 
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-[#1c2127] h-full placeholder:text-[#637588] dark:placeholder:text-[#9dabb9] px-4 rounded-l-none pl-2 text-base font-normal leading-normal" 
                  placeholder="Search routines by name or equipment..." 
                />
              </div>
            </label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
             <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white pl-4 pr-3 transition-colors shadow-md shadow-primary/10">
                <p className="text-sm font-bold leading-normal">All Equipment</p>
                <ChevronDown size={20} />
             </button>
             {['Rings', 'Bar', 'Parallettes', 'Weighted'].map(filter => (
               <button key={filter} className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1c2127] hover:bg-gray-100 dark:hover:bg-[#283039] px-4 transition-colors border border-transparent dark:border-[#283039]">
                  <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal">{filter}</p>
               </button>
             ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {routines.map((routine) => (
             <div key={routine.id} className="group flex flex-col rounded-xl bg-white dark:bg-[#1c2127] shadow-sm hover:shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-300 border border-transparent dark:border-[#283039] dark:hover:border-primary/30 overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <div 
                    className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url("${routine.image}")` }}
                  ></div>
                  <div className="absolute bottom-3 left-4 z-20">
                    <h3 className="text-white text-xl font-bold leading-tight drop-shadow-md">{routine.title}</h3>
                    <p className="text-gray-300 text-sm font-medium">{routine.subtitle}</p>
                  </div>
                  <button onClick={onNavigateDetail} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4 p-5 h-full">
                   <div className="flex items-center gap-2 flex-wrap">
                      {routine.tags.map(tag => (
                        <span key={tag} className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tag === 'Rings' || tag === 'Bar' ? 'bg-primary/10 text-primary' : 'bg-[#283039] text-[#9dabb9]'}`}>
                          {tag}
                        </span>
                      ))}
                   </div>

                   <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#637588] dark:text-[#9dabb9]">{routine.exercisesCount} Exercises</span>
                        <span className="text-[#637588] dark:text-[#9dabb9] flex items-center gap-1">
                          <History size={16} />
                          Last: {routine.lastPerformed}
                        </span>
                      </div>
                      
                      {routine.completionRate ? (
                        <>
                          <div className="h-1.5 w-full bg-[#e5e7eb] dark:bg-[#283039] rounded-full overflow-hidden mt-2">
                             <div className="h-full bg-primary rounded-full" style={{ width: `${routine.completionRate}%`}}></div>
                          </div>
                          <p className="text-xs text-[#637588] dark:text-[#9dabb9] text-right mt-1">{routine.completionRate}% Completion Rate</p>
                        </>
                      ) : routine.streak ? (
                        <>
                          <div className="h-1.5 w-full bg-[#e5e7eb] dark:bg-[#283039] rounded-full overflow-hidden mt-2">
                             <div className="h-full bg-green-500 rounded-full" style={{ width: '90%'}}></div>
                          </div>
                          <p className="text-xs text-[#637588] dark:text-[#9dabb9] text-right mt-1">Consistency Streak: {routine.streak}</p>
                        </>
                      ) : (
                         <>
                          <div className="h-1.5 w-full bg-[#e5e7eb] dark:bg-[#283039] rounded-full overflow-hidden mt-2">
                             <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%'}}></div>
                          </div>
                          <p className="text-xs text-[#637588] dark:text-[#9dabb9] text-right mt-1">Need to improve consistency</p>
                        </>
                      )}
                   </div>

                   <button 
                    onClick={onNavigateActive}
                    className={`mt-2 w-full flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors ${routine.id === '1' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-[#283039] hover:bg-[#333c46] text-white border border-transparent dark:border-[#374151]'}`}
                   >
                      {routine.id === '1' ? 'Start Workout' : 'View Details'}
                   </button>
                </div>
             </div>
          ))}

          {/* Add New Placeholder */}
          <button 
            onClick={onNavigateDetail}
            className="group flex flex-col items-center justify-center rounded-xl bg-white dark:bg-[#1c2127]/50 border-2 border-dashed border-[#283039] hover:border-primary hover:bg-[#1c2127] transition-all duration-300 min-h-[400px]"
          >
             <div className="size-16 rounded-full bg-[#283039] group-hover:bg-primary flex items-center justify-center mb-4 transition-colors">
               <Plus size={32} className="text-white" />
             </div>
             <h3 className="text-[#111418] dark:text-white text-xl font-bold mb-2">Create New Routine</h3>
             <p className="text-[#637588] dark:text-[#9dabb9] text-center px-8">Design a custom workout plan tailored to your goals.</p>
          </button>

        </div>

        <div className="flex justify-center mt-12 mb-8">
           <button className="flex items-center gap-2 text-[#637588] dark:text-[#9dabb9] hover:text-primary transition-colors font-medium">
              <span>Load More Routines</span>
              <ChevronDown size={20} />
           </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;