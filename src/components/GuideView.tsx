import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, HelpCircle, Award, Compass, AlertTriangle, BookOpen, Check, ListChecks } from 'lucide-react';
import { GuideItem, LocationMarker } from '../types';

interface GuideViewProps {
  guides: GuideItem[];
  completedLocations: string[];
  onToggleComplete: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export default function GuideView({
  guides,
  completedLocations,
  onToggleComplete,
  selectedId,
  setSelectedId
}: GuideViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Auto-select first item if none is selected
  useEffect(() => {
    if (!selectedId && guides.length > 0) {
      setSelectedId(guides[0].id);
    }
  }, [selectedId, guides, setSelectedId]);

  // Handle Search & Category Filtering
  const filteredGuidesList = useMemo(() => {
    return guides.filter(guide => {
      const matchSearch = 
        guide.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = 
        activeCategoryFilter === 'all' || 
        guide.category === activeCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [guides, searchQuery, activeCategoryFilter]);

  // Current selected Guide object
  const activeGuide = useMemo(() => {
    return guides.find(g => g.id === selectedId) || guides[0] || null;
  }, [guides, selectedId]);

  const categories = [
    { id: 'all', name: '全部攻略' },
    { id: '洞穴', name: '洞穴 C' },
    { id: '隊員死亡地點', name: '隊員 GPS D' },
    { id: '重要物品', name: '重要物品 I' },
    { id: '避難所', name: '避難所 S' }
  ];

  // Colors for each listing badge
  const catTheme = (id: string) => {
    if (id.startsWith('C')) return 'bg-rose-950/50 border-rose-800 text-rose-400';
    if (id.startsWith('D')) return 'bg-purple-950/50 border-purple-800 text-purple-400';
    if (id.startsWith('I')) return 'bg-cyan-950/50 border-cyan-800 text-cyan-400';
    return 'bg-emerald-950/50 border-emerald-800 text-emerald-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4" id="guide-page-container">
      {/* Sidebar List (Left 4 columns in grid) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="mb-2">
          <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">SEARCH MATRIX</span>
          <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">攻略資料檢索</h3>
        </div>

        {/* Search Header */}
        <div className="bg-[#15181e] border border-white/10 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            <input
              type="text"
              placeholder="搜尋編號或名稱 (如 C2, 繩索槍)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all duration-150 ${activeCategoryFilter === cat.id 
                  ? 'bg-white/5 border-white/10 text-white font-bold' 
                  : 'bg-black/40 border-white/5 text-white/40 hover:border-white/15 hover:text-white'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Guide Items selection Panel */}
        <div className="bg-[#15181e] border border-white/10 rounded-xl p-3 max-h-[580px] overflow-y-auto space-y-2 shadow-xl custom-scrollbar">
          {filteredGuidesList.length > 0 ? (
            filteredGuidesList.map(guide => {
              const isSelected = guide.id === selectedId;
              const isCompleted = completedLocations.includes(guide.id);

              return (
                <div
                  key={guide.id}
                  onClick={() => setSelectedId(guide.id)}
                  className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-all ${isSelected 
                    ? 'bg-black/40 border-white/20 shadow-md ring-1 ring-orange-500/10' 
                    : 'bg-black/10 border-white/5 hover:bg-black/20 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    {/* ID Indicator */}
                    <span className={`w-8 h-7 flex items-center justify-center rounded border font-mono text-[11px] font-bold ${catTheme(guide.id)}`}>
                      {guide.id}
                    </span>
                    <div className="truncate">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>{guide.title}</h4>
                      <p className="text-xs text-white/40 truncate mt-0.5">{guide.location}</p>
                    </div>
                  </div>

                  {/* Right Status icon */}
                  {isCompleted && (
                    <span className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400" title="已在地圖上勾選完成">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-white/30 text-xs font-mono leading-relaxed uppercase">
              No matching records found.
            </div>
          )}
        </div>
      </div>

      {/* Guide Detail Display (Right 8 columns in grid) */}
      <div className="lg:col-span-8">
        {activeGuide ? (
          <div className="bg-[#15181e] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            {/* Soft decorative background glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-5 ${activeGuide.id.startsWith('C') ? 'bg-rose-500' : (activeGuide.id.startsWith('I') ? 'bg-cyan-500' : 'bg-emerald-500')}`}></div>

            {/* Header Column */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] tracking-wide font-mono rounded border font-bold uppercase ${catTheme(activeGuide.id)}`}>
                    {activeGuide.category} • {activeGuide.id}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">DATABASE READY</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">{activeGuide.title}</h1>
              </div>

              {/* Checkbox completion */}
              <button
                onClick={() => onToggleComplete(activeGuide.id)}
                className={`px-4 py-2.5 rounded font-mono text-xs border transition-all duration-300 flex items-center gap-2 self-start cursor-pointer ${completedLocations.includes(activeGuide.id)
                  ? 'bg-green-500/10 border-green-500/35 text-green-400 font-bold'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${completedLocations.includes(activeGuide.id) ? 'bg-green-500 border-white' : 'border-white/20'}`}>
                  {completedLocations.includes(activeGuide.id) && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </div>
                {completedLocations.includes(activeGuide.id) ? '已標記此處為已完成' : '☐ 標記為已完成'}
              </button>
            </div>

            {/* Location Section */}
            <div className="bg-black/20 border border-white/15 rounded p-4 flex gap-4 items-center">
              <div className="p-3 bg-white/5 border border-white/5 text-orange-500 rounded shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase block">【島嶼精確地理坐標點】</span>
                <p className="text-sm text-white mt-0.5 leading-normal font-sans font-medium">{activeGuide.location}</p>
              </div>
            </div>

            {/* High level info columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Requirements */}
              <div className="bg-black/20 rounded p-5 border border-white/10">
                <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] block uppercase mb-2">【🔑 探索前置必備道具】</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeGuide.requirements.map((req, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2.5 py-1 rounded bg-black/40 border border-white/5 text-white/80 font-sans"
                    >
                      {req}
                    </span>
                  ))}
                  {activeGuide.requirements.length === 1 && activeGuide.requirements[0] === '無' && (
                    <span className="text-xs text-white/40 font-mono italic">無入洞前置門檻，降落後即可隨時前往</span>
                  )}
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-black/20 rounded p-5 border border-white/10">
                <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] block uppercase mb-2">【🎁 通關取得及搜刮好物】</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeGuide.rewards.map((rew, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/25 text-orange-400 font-bold font-sans"
                    >
                      {rew}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stepped walkthrough cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] font-sans flex items-center gap-2">
                <ListChecks className="w-4 h-4" /> 詳細圖說攻略步驟 (Walkthrough)
              </h3>
              
              <div className="space-y-3">
                {activeGuide.steps.map((step, idx) => (
                  <div key={idx} className="bg-black/10 hover:bg-black/20 border border-white/10 p-4 rounded flex gap-4 transition-all">
                    <span className="w-6 h-6 rounded-full bg-black border border-white/15 flex items-center justify-center text-xs font-mono text-white/60 shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings Alert Panel */}
            <div className="border shadow-lg rounded p-4 sm:p-5 relative overflow-hidden flex flex-col sm:flex-row gap-3.5 bg-black/20 border-orange-500/20">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-orange-500"></div>
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded self-start shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block">【⚠️ 野外探索注意事項】</span>
                <p className="text-xs sm:text-sm text-orange-200/90 leading-relaxed font-light font-sans">{activeGuide.notes}</p>
              </div>
            </div>

            {/* Lore/Story relation Panel */}
            <div className="border shadow-lg rounded p-4 sm:p-5 relative overflow-hidden flex flex-col sm:flex-row gap-3.5 bg-black/20 border-green-500/20">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-green-500"></div>
              <div className="p-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded self-start shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest block">【📖 相關島嶼劇情脈絡】</span>
                <p className="text-xs sm:text-sm text-green-200/95 leading-relaxed font-light font-sans italic">"{activeGuide.storyRelation}"</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="rounded-xl border border-white/10 p-8 text-center text-white/30 bg-[#15181e] text-xs uppercase font-mono">
            Please choose a guide records to inspect.
          </div>
        )}
      </div>
    </div>
  );
}
