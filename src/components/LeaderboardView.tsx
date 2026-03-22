import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Diamond, UserIcon } from 'lucide-react';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  xp: number;
}

interface LeaderboardViewProps {
  leaderboardData: LeaderboardEntry[];
  currentUserUid?: string;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboardData, currentUserUid }) => {
  return (
    <div className="min-h-screen bg-bg pb-32">
      <div className="sticky top-0 z-50 w-full bg-white border-b border-ink/5 px-6 py-6 flex justify-between items-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-ink font-display tracking-tight uppercase">Leaderboard</h1>
        <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center">
          <Trophy size={24} />
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-4">
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white border-2 rounded-3xl p-4 flex items-center gap-4 shadow-sm ${
              entry.uid === currentUserUid ? 'border-brand-blue bg-brand-blue/5' : 'border-ink/5'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
              index === 0 ? 'bg-brand-orange text-white' : 
              index === 1 ? 'bg-slate-300 text-ink' :
              index === 2 ? 'bg-orange-300 text-ink' : 'text-ink-muted'
            }`}>
              {index + 1}
            </div>
            
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              {entry.photoURL ? (
                <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <UserIcon size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-black text-ink leading-none mb-1">{entry.displayName}</h3>
              {entry.uid === currentUserUid && <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">You</span>}
            </div>

            <div className="flex items-center gap-2 bg-brand-blue/10 px-4 py-2 rounded-2xl text-brand-blue">
              <Diamond fill="currentColor" size={16} />
              <span className="font-black">{entry.xp}</span>
            </div>
          </motion.div>
        ))}

        {leaderboardData.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ink-muted font-bold">Chưa có dữ liệu xếp hạng.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardView;
