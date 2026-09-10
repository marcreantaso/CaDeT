import * as Dialog from '@radix-ui/react-dialog';
import { X, Target, Zap, FolderKanban, FlaskConical, Trophy, BookOpen, Briefcase } from 'lucide-react';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus: () => void;
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

export function QuickAddModal({ open, onClose, onCloseAutoFocus }: QuickAddModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="quick-add-dialog" onCloseAutoFocus={event => {
          event.preventDefault();
          onCloseAutoFocus();
        }}>
          <div className="dialog-heading">
            <div>
              <Dialog.Title>Quick add</Dialog.Title>
              <Dialog.Description>What would you like to add?</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="btn btn-icon btn-ghost" aria-label="Close quick add"><X size={20} /></button>
            </Dialog.Close>
          </div>
          <div className="quick-add-grid">
            {quickAddItems.map(item => (
              <button type="button" key={item.id} className="quick-add-option" onClick={onClose}>
                <span className="quick-add-icon" style={{ color: item.color, background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
