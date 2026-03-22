import React from 'react';
import { motion } from 'motion/react';
import { Settings, UserIcon, CheckCircle2, Calendar, Flame, Diamond, Trophy, BookOpen, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserStats } from '../types';

interface ProfileViewProps {
  user: User | null;
  stats: UserStats;
  logout: () => void;
  renderBottomNav: () => React.ReactNode;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, stats, logout, renderBottomNav }) => {
  return (
    <div className="min-h-screen bg-bg pb-32 flex flex-col items-center">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-ink/5 px-6 py-6 flex justify-between items-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-ink font-display tracking-tight uppercase">Profile</h1>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:bg-ink/5 transition-colors">
          <Settings size={24} />
        </button>
      </div>
      
      <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-8 mt-4">
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-ink/5 rounded-[2.5rem] p-8 shadow-sm flex items-center gap-8"
        >
          <div className="relative">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-28 h-28 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue border-4 border-white shadow-xl">
                <UserIcon size={56} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-green rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-ink font-display leading-none mb-2">{user?.displayName || 'IELTS Learner'}</h2>
            <div className="flex items-center gap-2 text-ink-muted font-bold text-sm uppercase tracking-widest">
              <Calendar size={14} />
              Joined March 2026
            </div>
          </div>
        </motion.div>

        {/* Statistics Grid */}
        <div>
          <h3 className="text-xl font-black text-ink font-display uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-brand-orange rounded-full" />
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                <Flame fill="currentColor" size={28} />
              </div>
              <div>
                <div className="text-3xl font-black text-ink font-display leading-none mb-1">{stats.streak}</div>
                <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Day Streak</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                <Diamond fill="currentColor" size={28} />
              </div>
              <div>
                <div className="text-3xl font-black text-ink font-display leading-none mb-1">{stats.xp}</div>
                <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Total XP</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple">
                <Trophy fill="currentColor" size={28} />
              </div>
              <div>
                <div className="text-3xl font-black text-ink font-display leading-none mb-1">
                  {stats.completedTopics?.length || 0}
                </div>
                <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Topics</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                <BookOpen fill="currentColor" size={28} />
              </div>
              <div>
                <div className="text-3xl font-black text-ink font-display leading-none mb-1">
                  {stats.completedWords.length}
                </div>
                <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Words</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Achievements Placeholder */}
        <div>
          <h3 className="text-xl font-black text-ink font-display uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-brand-purple rounded-full" />
            Achievements
          </h3>
          <div className="bg-white border-2 border-ink/5 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center text-ink-muted/30">
              <Trophy size={40} />
            </div>
            <div>
              <p className="text-ink font-black text-lg">No achievements yet</p>
              <p className="text-ink-muted font-bold text-sm">Keep learning to unlock special badges!</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full py-4 bg-white border-2 border-brand-red/20 text-brand-red rounded-2xl font-black uppercase tracking-widest shadow-sm active:translate-y-1 transition-all flex items-center justify-center gap-3 mt-4"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
      {renderBottomNav()}
    </div>
  );
};

export default ProfileView;
