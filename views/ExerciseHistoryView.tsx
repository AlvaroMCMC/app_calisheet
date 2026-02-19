import React from 'react';
import { 
  Dumbbell, 
  Edit, 
  Plus, 
  TrendingUp, 
  Scale, 
  History, 
  LineChart, 
  ChevronRight, 
  Filter, 
  MoreVertical 
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ExerciseHistoryViewProps {
  onBack: () => void;
}

const data = [
  { month: 'May', volume: 500, label: '500kg' },
  { month: 'Jun', volume: 800, label: '800kg' },
  { month: 'Jul', volume: 1100, label: '1100kg' },
  { month: 'Aug', volume: 1300, label: '1300kg' },
  { month: 'Sep', volume: 1600, label: '1600kg' },
  { month: 'Oct', volume: 1850, label: '1850kg' },
];

const ExerciseHistoryView: React.FC<ExerciseHistoryViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar List */}
      <aside className="w-80 bg-card-dark border-r border-border-dark flex flex-col shrink-0 hidden md:flex">
         <div className="p-4 border-b border-border-dark">
            <input 
              className="block w-full p-2.5 text-sm text-white bg-[#111418] border border-border-dark rounded-lg focus:ring-primary focus:border-primary placeholder-text-secondary outline-none" 
              placeholder="Search exercises..." 
              type="text" 
            />
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pulling Movements</div>
            <button className="w-full flex items-center justify-between p-3 text-left bg-primary/20 border border-primary/50 text-white rounded-lg group">
              <span className="font-medium">Muscle-up</span>
              <ChevronRight size={18} className="text-primary" />
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left text-text-secondary hover:bg-[#283039] hover:text-white rounded-lg transition-colors">
              <span className="font-medium">Weighted Pull-up</span>
            </button>
            <div className="px-2 py-1.5 mt-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pushing Movements</div>
            <button className="w-full flex items-center justify-between p-3 text-left text-text-secondary hover:bg-[#283039] hover:text-white rounded-lg transition-colors">
              <span className="font-medium">Ring Dips</span>
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#111418]">
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Muscle-up</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wide border border-primary/20">Pull</span>
                </div>
                <p className="text-text-secondary max-w-2xl">
                  An advanced strength move that transitions from a pull-up to a dip. Primary focus on explosive pulling power and transition technique.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="bg-[#1c2127] hover:bg-[#283039] text-white border border-border-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Edit size={18} /> Edit
                </button>
                <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-2">
                  <Plus size={18} /> Log Set
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-1">
                 <span className="text-text-secondary text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                   <Dumbbell size={16} /> Max Reps
                 </span>
                 <div className="text-2xl font-bold text-white">12 <span className="text-sm font-normal text-text-secondary">reps</span></div>
                 <span className="text-xs text-green-500 flex items-center mt-1">
                   <TrendingUp size={14} className="mr-1" /> +2 this month
                 </span>
               </div>
               <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-1">
                 <span className="text-text-secondary text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                   <Scale size={16} /> Max Weight
                 </span>
                 <div className="text-2xl font-bold text-white">+15 <span className="text-sm font-normal text-text-secondary">kg</span></div>
                 <span className="text-xs text-text-secondary mt-1">Since Jan 2023</span>
               </div>
               <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-1">
                 <span className="text-text-secondary text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                   <History size={16} /> Total Sessions
                 </span>
                 <div className="text-2xl font-bold text-white">48</div>
                 <span className="text-xs text-text-secondary mt-1">Last: 2 days ago</span>
               </div>
               <div className="bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-1">
                 <span className="text-text-secondary text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                   <LineChart size={16} /> Est. 1RM
                 </span>
                 <div className="text-2xl font-bold text-white">--</div>
                 <span className="text-xs text-text-secondary mt-1">Not enough data</span>
               </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-card-dark border border-border-dark rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-white text-lg font-bold">Volume Progression</h3>
              <div className="flex bg-[#111418] rounded-lg p-1 border border-border-dark self-start sm:self-auto">
                <button className="px-3 py-1.5 rounded text-xs font-medium bg-[#283039] text-white shadow-sm">Volume</button>
                <button className="px-3 py-1.5 rounded text-xs font-medium text-text-secondary hover:text-white transition-colors">Max Reps</button>
                <button className="px-3 py-1.5 rounded text-xs font-medium text-text-secondary hover:text-white transition-colors">Weight</button>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#137fec" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#637588" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', color: '#111418' }}
                    itemStyle={{ color: '#111418', fontWeight: 'bold' }}
                    cursor={{ stroke: '#283039', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Table */}
          <div className="flex flex-col gap-4 pb-10">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl font-bold">History</h3>
              <div className="flex items-center gap-2">
                <button className="text-text-secondary hover:text-white transition-colors">
                  <Filter size={20} />
                </button>
                <select className="bg-card-dark text-white text-sm border border-border-dark rounded-lg focus:ring-primary focus:border-primary p-2 outline-none">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Heaviest Weight</option>
                </select>
              </div>
            </div>

            <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-text-secondary">
                   <thead className="text-xs text-text-secondary uppercase bg-[#232930] border-b border-border-dark">
                     <tr>
                       <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                       <th scope="col" className="px-6 py-4 font-semibold">Routine</th>
                       <th scope="col" className="px-6 py-4 font-semibold">Sets & Reps</th>
                       <th scope="col" className="px-6 py-4 font-semibold">Lastre (Kg)</th>
                       <th scope="col" className="px-6 py-4 font-semibold">Equipment</th>
                       <th scope="col" className="px-6 py-4 font-semibold">Notes</th>
                       <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border-dark">
                      {[
                        { date: 'Oct 24, 2023', routine: 'Upper Body Power', sets: [5,5,4], weight: '+15 kg', equip: 'Straight Bar', notes: 'Felt strong.' },
                        { date: 'Oct 20, 2023', routine: 'Skill Day', sets: [3,3,3,3], weight: '+10 kg', equip: 'Rings', notes: '-' },
                        { date: 'Oct 16, 2023', routine: 'Upper Body Power', sets: [6,5,5], weight: 'Bodyweight', equip: 'High Bar', notes: 'Form breakdown.' }
                      ].map((row, idx) => (
                        <tr key={idx} className="bg-card-dark hover:bg-[#232930] transition-colors group">
                           <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{row.date}</td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200">{row.routine}</span>
                           </td>
                           <td className="px-6 py-4 text-white">
                             <div className="flex gap-2">
                                {row.sets.map((s, i) => (
                                   <span key={i} className="bg-[#283039] px-2 py-0.5 rounded text-xs font-mono">{s}</span>
                                ))}
                             </div>
                           </td>
                           <td className="px-6 py-4 text-white font-bold">{row.weight}</td>
                           <td className="px-6 py-4">{row.equip}</td>
                           <td className="px-6 py-4 truncate max-w-[150px]">{row.notes}</td>
                           <td className="px-6 py-4 text-right">
                             <button className="text-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreVertical size={18} />
                             </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ExerciseHistoryView;