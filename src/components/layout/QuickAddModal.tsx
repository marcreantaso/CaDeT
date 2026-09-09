import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Target, Zap, FolderKanban, FlaskConical,
  Trophy, BookOpen, Briefcase
} from 'lucide-react';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

const quickAddItems = [
  { id: 'goal', label: 'Goal', icon: Target, color: 'hsl(262, 83%, 58%)', desc: 'Define a career ambition' },
  { id: 'skill', label: 'Skill', icon: Zap, color: 'hsl(200, 83%, 55%)', desc: 'Track a skill' },
  { id: 'project', label: 'Project', icon: FolderKanban, color: 'hsl(45, 93%, 55%)', desc: 'Add a portfolio project' },
  { id: 'experiment', label: 'Experiment', icon: FlaskConical, color: 'hsl(45, 93%, 55%)', desc: 'Start a career experiment' },
  { id: 'achievement', label: 'Achievement', icon: Trophy, color: 'hsl(150, 70%, 45%)', desc: 'Record a milestone' },
  { id: 'reflection', label: 'Reflection', icon: BookOpen, color: 'hsl(340, 80%, 55%)', desc: 'Capture a reflection' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'hsl(340, 80%, 55%)', desc: 'Log work experience' },
];

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'hsl(222, 47%, 4%, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:w-full"
          >
            <div
              className="rounded-2xl p-5 lg:p-6"
              style={{
                background: 'hsl(222, 35%, 10%)',
                border: '1px solid hsl(222, 25%, 16%)',
                boxShadow: '0 16px 48px hsl(0, 0%, 0%, 0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                  >
                    Quick Add
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 15%, 45%)' }}>
                    What would you like to add?
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: 'hsl(215, 15%, 45%)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 gap-3">
                {quickAddItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all"
                    style={{
                      background: 'hsl(222, 30%, 14%)',
                      border: '1px solid hsl(222, 25%, 18%)',
                    }}
                    onClick={onClose}
                    whileHover={{
                      borderColor: item.color,
                      boxShadow: `0 0 16px ${item.color}20`,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.color}18` }}
                    >
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'hsl(215, 15%, 45%)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
