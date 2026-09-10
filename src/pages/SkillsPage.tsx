import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Search } from 'lucide-react';
import { useSkills } from '../hooks/useSkills';
import { SKILL_LEVEL_COLORS, type SkillLevel, type SkillCategory } from '../types/skills';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: 'Technical',
  soft: 'Soft Skills',
  domain: 'Domain',
  tool: 'Tools',
  language: 'Languages',
  framework: 'Frameworks',
};

export function SkillsPage() {
  const { skills, isLoading, error, addSkill } = useSkills();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<SkillCategory | 'all'>('all');
  
  // Add Skill Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('technical');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[hsl(262,83%,58%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load skills.</div>;
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(skills.map(s => s.category))] as SkillCategory[];
  const totalConfidence = skills.length > 0 
    ? skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length 
    : 0;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      setIsSubmitting(true);
      await addSkill(newSkillName, newSkillCategory, newSkillLevel, 20);
      setIsAdding(false);
      setNewSkillName('');
      setNewSkillCategory('technical');
      setNewSkillLevel('beginner');
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
          >
            Skills
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215, 20%, 65%)' }}>
            Track and develop your career capabilities
          </p>
        </div>
        <div className="skills-actions">
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: 'hsl(172, 66%, 50%)', fontFamily: 'var(--font-heading)' }}>
              {Math.round(totalConfidence)}%
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>Avg. Confidence</p>
          </div>
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'hsl(172, 66%, 50%, 0.12)' }}
          >
            <Zap size={20} style={{ color: 'hsl(172, 66%, 50%)' }} />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? 'Cancel' : 'Add Skill'}
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-5 space-y-4"
          onSubmit={handleAddSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="skill-name" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215, 20%, 65%)' }}>Skill Name</label>
              <input 
                id="skill-name"
                type="text" 
                className="input-dark w-full" 
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                placeholder="e.g., React"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="skill-category" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215, 20%, 65%)' }}>Category</label>
              <select id="skill-category"
                className="input-dark w-full"
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value as SkillCategory)}
                disabled={isSubmitting}
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill-level" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215, 20%, 65%)' }}>Level</label>
              <select id="skill-level"
                className="input-dark w-full"
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value as SkillLevel)}
                disabled={isSubmitting}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newSkillName.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Skill'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Search + Filter */}
      <div className="skills-filters">
        <div className="skills-search">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--text-muted))' }} />
          <input
            type="text"
            aria-label="Search skills"
            placeholder="Search skills..."
            className="input-dark pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterCategory === 'all' ? '' : ''}`}
            style={{
              background: filterCategory === 'all' ? 'hsl(262, 83%, 58%, 0.15)' : 'hsl(222, 30%, 14%)',
              color: filterCategory === 'all' ? 'hsl(262, 83%, 68%)' : 'hsl(215, 20%, 65%)',
              border: filterCategory === 'all' ? '1px solid hsl(262, 83%, 58%, 0.3)' : '1px solid hsl(222, 25%, 18%)',
              fontFamily: 'var(--font-heading)',
            }}
            aria-pressed={filterCategory === 'all'}
            onClick={() => setFilterCategory('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterCategory === cat ? 'hsl(262, 83%, 58%, 0.15)' : 'hsl(222, 30%, 14%)',
                color: filterCategory === cat ? 'hsl(262, 83%, 68%)' : 'hsl(215, 20%, 65%)',
                border: filterCategory === cat ? '1px solid hsl(262, 83%, 58%, 0.3)' : '1px solid hsl(222, 25%, 18%)',
                fontFamily: 'var(--font-heading)',
              }}
              aria-pressed={filterCategory === cat}
              onClick={() => setFilterCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(210, 40%, 96%)' }}>No Skills Yet</h3>
          <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>Start building your skill profile by adding your first skill.</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass-card p-6 text-center" role="status">
          <h2 className="text-lg mb-2">No matching skills</h2>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>Try another search or clear your filters.</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}>Clear filters</button>
        </div>
      ) : (
        /* Skills Grid */
        <div className="skills-grid">
          {filteredSkills.map((skill, index) => {
            const levelColor = SKILL_LEVEL_COLORS[skill.level as SkillLevel] || SKILL_LEVEL_COLORS.beginner;

            return (
              <motion.div
                key={skill.id}
                className="glass-card glass-card-interactive p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: `color-mix(in srgb, ${levelColor} 7.06%, transparent)`,
                        color: levelColor,
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {skill.skillName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold"
                        style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                      >
                        {skill.skillName}
                      </p>
                      <p className="text-xs capitalize" style={{ color: 'hsl(var(--text-muted))' }}>
                        {CATEGORY_LABELS[skill.category]} • {skill.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>Confidence</span>
                    <span className="text-xs font-bold" style={{ color: levelColor }}>{skill.confidence}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      style={{ background: levelColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.confidence}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.04 }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} style={{ color: 'hsl(150, 70%, 45%)' }} />
                    <span className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
                      {skill.evidenceCount} evidence
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                    {skill.linkedProjects?.length || 0} projects
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

