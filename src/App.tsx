import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  Map as MapIcon, 
  BookOpen, 
  ListChecks, 
  LayoutDashboard, 
  Check, 
  ArrowRight,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

// Data imports
import locationsDataRaw from './data/locations.json';
import guidesDataRaw from './data/guides.json';
import storyProgressDataRaw from './data/storyProgress.json';

// Type imports
import { LocationMarker, GuideItem, StoryNode } from './types';

// View components
import DashboardView from './components/DashboardView';
import MapView from './components/MapView';
import GuideView from './components/GuideView';
import StoryProgressView from './components/StoryProgressView';

// Cast JSON mock data to correct types
const locations = locationsDataRaw as LocationMarker[];
const guides = guidesDataRaw as GuideItem[];
const storyProgress = storyProgressDataRaw as StoryNode[];

export default function App() {
  // Navigation tabs: 'dashboard' | 'map' | 'guide' | 'story'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  // States to persist progress in LocalStorage
  const [completedLocations, setCompletedLocations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sotf_completed_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedStory, setCompletedStory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sotf_completed_story');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Search Box state
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sotf_completed_locations', JSON.stringify(completedLocations));
  }, [completedLocations]);

  useEffect(() => {
    localStorage.setItem('sotf_completed_story', JSON.stringify(completedStory));
  }, [completedStory]);

  // Click outside search container listener to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Monitor hardware shortcut "F" or "/" key to focus search box automatically
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' || (e.key === 'f' && e.target === document.body)) {
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Toggle marker items completed state
  const handleToggleLocationComplete = (id: string) => {
    setCompletedLocations(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle story node checklist completed state
  const handleToggleStoryNodeComplete = (id: string) => {
    setCompletedStory(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );

    // Context synchronization: checking off story milestones can automatically 
    // toggle related location markers for high-comfort user experiences!
    const storyToLocMapping: Record<string, string> = {
      S3: 'C2',  // Rope gun checked -> sync Rope Gun Cave C2
      S4: 'C1',  // Rebreather checked -> sync Rebreather Cave C1
      S5: 'C3',  // Shovel checked -> sync Shovel Cave C3
      S7: 'I4',  // VIP Keycard checked -> sync Crossbow & VIP Card cabinet (I4)
      S8: 'C5',  // Golden Armor checked -> sync Golden Armor Cave C5
    };

    const targetLocId = storyToLocMapping[id];
    if (targetLocId) {
      setCompletedLocations(prev => {
        const isStoryBeingCompleted = !completedStory.includes(id);
        if (isStoryBeingCompleted && !prev.includes(targetLocId)) {
          return [...prev, targetLocId];
        } else if (!isStoryBeingCompleted && prev.includes(targetLocId)) {
          return prev.filter(l => l !== targetLocId);
        }
        return prev;
      });
    }
  };

  // Global search matching indices
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];

    const query = globalSearchQuery.toLowerCase();
    const matches: Array<{
      id: string;
      title: string;
      type: 'cave' | 'item' | 'bunker' | 'team' | 'story';
      subtitle: string;
    }> = [];

    // Search Locations & Guides
    guides.forEach(g => {
      if (
        g.id.toLowerCase().includes(query) ||
        g.title.toLowerCase().includes(query) ||
        g.location.toLowerCase().includes(query) ||
        g.notes.toLowerCase().includes(query)
      ) {
        let typeMap: 'cave' | 'item' | 'bunker' | 'team' = 'cave';
        if (g.category === '隊員死亡地點') typeMap = 'team';
        if (g.category === '重要物品') typeMap = 'item';
        if (g.category === '避難所') typeMap = 'bunker';

        matches.push({
          id: g.id,
          title: g.title,
          type: typeMap,
          subtitle: `攻略 • ${g.location}`
        });
      }
    });

    // Search Story nodes
    storyProgress.forEach(s => {
      if (s.title.toLowerCase().includes(query)) {
        matches.push({
          id: s.id,
          title: s.title,
          type: 'story',
          subtitle: '劇情節點 • 主線大綱里程碑'
        });
      }
    });

    return matches.slice(0, 7); // Limit to top 7 matches
  }, [globalSearchQuery]);

  // Navigate function from inner layouts
  const handleNavWithArg = (tab: string, arg?: string) => {
    setActiveTab(tab);
    if (tab === 'guide' && arg) {
      setSelectedGuideId(arg);
    }
    // Scroll window smoothly to content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Focus Search Bar
  const handleFocusSearchBar = () => {
    searchInputRef.current?.focus();
    setIsSearchFocused(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090b0e] font-sans text-[#e2e8f0]">
      
      {/* TOP NAVIGATION BAR - Editorial Aesthetic Design */}
      <header className="sticky top-0 z-40 bg-[#090b0e]/70 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavWithArg('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-tr from-orange-600 to-yellow-500 p-2 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(234,88,12,0.25)]">
              <Compass className="w-5.5 h-5.5 text-black font-black animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase block leading-none">Survival Guide</span>
              <span className="font-display font-bold tracking-tighter text-lg uppercase text-white block mt-0.5 leading-none">Sons of the Forest</span>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center bg-black/20 p-1 rounded-lg border border-white/10 max-w-full overflow-x-auto custom-scrollbar whitespace-nowrap">
            {[
              { id: 'dashboard', label: 'DASHBOARD 儀表板', icon: LayoutDashboard },
              { id: 'map', label: 'TACTICAL MAP 地圖', icon: MapIcon },
              { id: 'guide', label: 'GUIDE DB 攻略庫', icon: BookOpen },
              { id: 'story', label: 'STORY LOG 劇情主線', icon: ListChecks },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavWithArg(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold tracking-wide cursor-pointer transition-all duration-150 ${isSelected 
                    ? 'bg-white/5 border border-white/10 text-white shadow-sm' 
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* GLOBO AUTOMATIC SEARCH BAR with Floating Autocomplete */}
          <div ref={searchContainerRef} className="relative w-full sm:w-64 max-w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="搜尋島嶼項目 / 劇情 / 地表符號..."
                className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl py-2 pl-9 pr-7 text-xs text-zinc-100 placeholder-zinc-500 hover:border-zinc-700 focus:outline-none focus:border-emerald-500 focus:bg-zinc-950 transition-all font-mono"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-1 py-0.5 rounded pointer-events-none">F</span>
            </div>

            {/* Results Floating Dropdown List */}
            {isSearchFocused && globalSearchQuery.trim() !== '' && (
              <div className="absolute right-0 top-11 w-full sm:w-[320px] bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl p-2 z-[999] backdrop-blur-md animate-in fade-in slide-in-from-top-1.5 duration-150 max-h-[360px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-zinc-500 font-mono pr-2 pb-1.5 mb-1.5 border-b border-zinc-900 text-right">
                  找到 {searchResults.length} 項相符結果
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map(res => {
                      // Determine small classification pill
                      let pillColor = 'bg-rose-950/40 border-rose-900 text-rose-400';
                      let typeLabel = '洞穴';
                      if (res.type === 'item') {
                        pillColor = 'bg-cyan-950/40 border-cyan-800 text-cyan-400';
                        typeLabel = '重要物品';
                      } else if (res.type === 'bunker') {
                        pillColor = 'bg-emerald-950/40 border-emerald-900 text-emerald-400';
                        typeLabel = '避難所';
                      } else if (res.type === 'team') {
                        pillColor = 'bg-purple-950/40 border-purple-900 text-purple-400';
                        typeLabel = '隊員死亡';
                      } else if (res.type === 'story') {
                        pillColor = 'bg-orange-950/40 border-orange-900 text-orange-400';
                        typeLabel = '任務節點';
                      }

                      return (
                        <div
                          key={res.id}
                          onClick={() => {
                            if (res.type === 'story') {
                              handleNavWithArg('story');
                            } else {
                              handleNavWithArg('guide', res.id);
                            }
                            setGlobalSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="p-2 hover:bg-zinc-900 rounded-lg cursor-pointer flex gap-2.5 items-center justify-between text-left transition-colors border border-transparent hover:border-zinc-800"
                        >
                          <div className="truncate flex-1">
                            <span className="text-zinc-500 text-[9px] font-mono block mb-0.5">{res.subtitle}</span>
                            <h4 className="text-xs font-bold text-zinc-200 truncate">{res.title}</h4>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded shrink-0 border ${pillColor}`}>
                            {typeLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[11px] text-zinc-500 font-mono">
                    無相符資料。請搜尋「繩索槍」、「潛水器」或「C1」！
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* WARNING NOTIFICATION IF PRIVATE STORAGE IS NOT DETECTED (JUST FOR FLAVOR) */}
      <div className="bg-[#15181e] border-b border-white/5 text-center py-2 px-4 shadow-sm">
        <p className="text-[11px] font-mono text-orange-500/90 tracking-widest uppercase flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
          OFFLINE STORAGE COMPANION • 已與瀏覽器本地 LocalStorage 快取完全同步
        </p>
      </div>

      {/* CORE VIEWPORT HERO LANDING AREA */}
      <main className="flex-1 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView 
            locations={locations}
            completedLocations={completedLocations}
            storyNodes={storyProgress}
            completedStory={completedStory}
            onNavigate={handleNavWithArg}
            onSearchFocus={handleFocusSearchBar}
          />
        )}
        {activeTab === 'map' && (
          <MapView 
            locations={locations}
            completedLocations={completedLocations}
            onToggleComplete={handleToggleLocationComplete}
            onNavigateToGuide={(id) => handleNavWithArg('guide', id)}
          />
        )}
        {activeTab === 'guide' && (
          <GuideView 
            guides={guides}
            completedLocations={completedLocations}
            onToggleComplete={handleToggleLocationComplete}
            selectedId={selectedGuideId}
            setSelectedId={setSelectedGuideId}
          />
        )}
        {activeTab === 'story' && (
          <StoryProgressView 
            storyNodes={storyProgress}
            completedStory={completedStory}
            onToggleStoryNode={handleToggleStoryNodeComplete}
          />
        )}
      </main>

      {/* SYSTEM IMMERSIVE FOOTER */}
      <footer className="bg-[#15181e] border-t border-white/5 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="font-display font-bold text-md text-white tracking-wide uppercase">SOTF Companion Guide Terminal</span>
            <p className="text-[10px] text-white/40 max-w-sm leading-relaxed">
              本互動指南網站所有資料皆存儲於瀏覽器 LocalStorage。安全零隱私危害，是玩《Sons of the Forest (森林之子)》完美的高級遊戲副屏戰術對口終端。
            </p>
            <p className="text-[10px] text-orange-500 font-mono mt-2">
              地圖參考來源：<a href="https://mapgenie.io/sons-of-the-forest/maps/world" target="_blank" rel="noopener noreferrer" className="hover:underline underline font-bold tracking-wider">https://mapgenie.io/sons-of-the-forest/maps/world</a>
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex gap-4 text-xs font-mono text-white/40">
              <span className="text-white/30">版本 v1.0.4 (Release)</span>
              <span>•</span>
              <span className="text-orange-500 font-bold">LocalStorage 互鎖開啟</span>
            </div>
            <span className="text-[10.5px] text-white/20 font-mono">
              © 2026 Sons of the Forest Interactive Companion. Built for Survivors.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
