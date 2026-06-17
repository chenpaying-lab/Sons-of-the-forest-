import { MapPin, CheckSquare, Award, Star, Compass, ArrowRight, Shield, Zap, Search } from 'lucide-react';
import { LocationMarker, StoryNode } from '../types';

interface DashboardViewProps {
  locations: LocationMarker[];
  completedLocations: string[];
  storyNodes: StoryNode[];
  completedStory: string[];
  onNavigate: (tab: string, arg?: string) => void;
  onSearchFocus: () => void;
}

export default function DashboardView({
  locations,
  completedLocations,
  storyNodes,
  completedStory,
  onNavigate,
  onSearchFocus
}: DashboardViewProps) {
  // Compute Stats
  const totalLocations = locations.length;
  const completedLocCount = completedLocations.length;
  const mapPct = totalLocations > 0 ? Math.round((completedLocCount / totalLocations) * 100) : 0;

  const totalStory = storyNodes.length;
  const completedStoryCount = completedStory.length;
  const storyPct = totalStory > 0 ? Math.round((completedStoryCount / totalStory) * 100) : 0;

  const totalGoals = totalLocations + totalStory;
  const completedGoalsCount = completedLocCount + completedStoryCount;
  // Completed goals
  const goalsText = `${completedGoalsCount}/${totalGoals}`;

  // Key items (category = 'item')
  const itemMarkers = locations.filter(loc => loc.category === 'item');
  const totalKeyItems = itemMarkers.length;
  const completedKeyItemsCount = itemMarkers.filter(loc => completedLocations.includes(loc.id)).length;

  // Let's analyze completed items to generate Smart Advice
  const hasRopeGun = completedLocations.includes('C2') || completedStory.includes('S3');
  const hasRebreather = completedLocations.includes('C1') || completedStory.includes('S4');
  const hasShovel = completedLocations.includes('C3') || completedStory.includes('S5');
  const hasVIPCard = completedLocations.includes('I4') || completedLocations.includes('S2') || completedStory.includes('S7');
  const hasGoldenArmor = completedLocations.includes('C5') || completedStory.includes('S8');
  const hasCompletedEnding = completedStory.includes('S10');

  let activeAdviceTitle = "當前建議：登陸荒島";
  let activeAdviceDesc = "你剛剛降落在這片充滿危險的島嶼。首先點擊「劇情進度」，標記你的「抵達島嶼」事件。隨後去獲取基本的求生裝備！";
  let activeAdviceTarget = "C1"; // Tab target C1 guide

  if (hasCompletedEnding) {
    activeAdviceTitle = "恭喜你！已成功通關";
    activeAdviceDesc = "你已抵達多元宇宙時空魔方，逃離了這座可怕的野人荒島，或者選擇留下開啟無盡生存模式！";
    activeAdviceTarget = "S4";
  } else if (hasGoldenArmor && hasVIPCard) {
    activeAdviceTitle = "終極主線：開啟黃金之門";
    activeAdviceDesc = "你已取得「VIP門禁卡」與「黃金護甲」。現在是時候前往島嶼最東南方的「S4 豪華最終地堡」，穿上神祕護甲，與黃金之門共鳴，走向遊戲的最終章。";
    activeAdviceTarget = "S4";
  } else if (hasShovel && !hasVIPCard) {
    activeAdviceTitle = "探索地堡：搜集鑰匙卡";
    activeAdviceDesc = "擁有鏟子可以刨開泥地。建議前往「C4 消防斧與維護艙A」挖掘維護卡，隨後前往「I4 十字弩與溫室地堡」或「S2 食品餐飲地堡」尋找萬能「VIP 門禁卡」。";
    activeAdviceTarget = "I4";
  } else if (hasRopeGun && hasRebreather && !hasShovel) {
    activeAdviceTitle = "前進首個高難大關：取得鏟子";
    activeAdviceDesc = "你成功拿到了「繩索槍」與「潛水器」！現在你具備了踏進「C3 鏟子洞穴」的完整門檻。帶足食品與子彈，前往雪山西側山腳，去拔取最關鍵裝備——「鏟子」！";
    activeAdviceTarget = "C3";
  } else if (!hasRopeGun || !hasRebreather) {
    activeAdviceTitle = "早期目標：獲取探索工具";
    activeAdviceDesc = "要獲取鏟子，你必須先取得「潛水器」與「繩索槍」。建議前往北部沙灘海岸的「C1 潛水器洞穴」或中西部的「C2 繩索槍洞穴」開拓你的荒島步伐。";
    activeAdviceTarget = !hasRebreather ? "C1" : "C2";
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2 animate-in fade-in duration-300" id="dashboard-view">
      {/* Hero Section - Editorial Aesthetic Layout */}
      <div className="relative overflow-hidden rounded-2xl bg-[#15181e] p-8 sm:p-12 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
           <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-orange-500"><path d="M50 0 L100 100 L0 100 Z"/></svg>
        </div>
        <div className="relative z-10">
          <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase mb-1 block">TACTICAL HUBSYSTEM v1.0.4</span>
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white mb-2 uppercase select-none">
            DASHBOARD
          </h2>
          <p className="text-white/60 max-w-lg mb-8 leading-relaxed italic text-sm">
            Your central companion terminal for survival tracking on Site 2. Live exploration updates, key milestones, and GPS inventory management.
          </p>
          
          {/* Quick Metrics from design HTML */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 p-4 rounded border border-white/5">
              <div className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-1">Exploration</div>
              <div className="text-3xl font-mono text-white font-bold">{mapPct}%</div>
              <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${mapPct}%` }}></div>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/5">
              <div className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">Story Completed</div>
              <div className="text-3xl font-mono text-white font-bold">{storyPct}%</div>
              <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${storyPct}%` }}></div>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/5">
              <div className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-1">Objectives</div>
              <div className="text-3xl font-mono text-white font-bold">
                {completedGoalsCount}<span className="text-sm text-white/40">/{totalGoals}</span>
              </div>
              <div className="mt-3 text-[9px] text-white/40 uppercase tracking-widest">Goals Resolved</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/5">
              <div className="text-purple-500 text-[10px] font-bold uppercase tracking-widest mb-1">Key Items</div>
              <div className="text-3xl font-mono text-white font-bold">
                {completedKeyItemsCount}<span className="text-sm text-white/40">/{totalKeyItems}</span>
              </div>
              <div className="mt-3 text-[9px] text-white/40 uppercase tracking-widest">Item Checklist</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Statistics & Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">STATUS REPORT</span>
            <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">探索進度細節</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stat 1: Map Checkpoints */}
            <div className="bg-[#15181e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">地圖探索點 EXPLORATION</p>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">已點亮地標 {mapPct}%</h3>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 text-orange-500 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-white/40 mb-1.5 font-mono uppercase tracking-wider">
                  <span>已標記攻略</span>
                  <span>{completedLocCount} / {totalLocations} 處</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 overflow-hidden rounded-full border border-white/5">
                  <div 
                    className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${mapPct}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stat 2: Story Progress */}
            <div className="bg-[#15181e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">劇情任務節點 STORY LINE</p>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">主線完成度 {storyPct}%</h3>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 text-green-500 rounded-lg">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-white/40 mb-1.5 font-mono uppercase tracking-wider">
                  <span>重要里程碑</span>
                  <span>{completedStoryCount} / {totalStory} 項</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 overflow-hidden rounded-full border border-white/5">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${storyPct}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stat 3: Objectives */}
            <div className="bg-[#15181e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">目標綜合比率 TOTAL</p>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">
                    總計目標 {totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0}%
                  </h3>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 text-blue-500 rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-white/40 mb-1.5 font-mono uppercase tracking-wider">
                  <span>已達成任務</span>
                  <span>{goalsText} 個項目</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 overflow-hidden rounded-full border border-white/5">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${totalGoals > 0 ? (completedGoalsCount / totalGoals) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stat 4: Essential Items */}
            <div className="bg-[#15181e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">核心收集品 GEARS</p>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">
                    神裝搜集 {totalKeyItems > 0 ? Math.round((completedKeyItemsCount / totalKeyItems) * 100) : 0}%
                  </h3>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 text-purple-500 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-white/40 mb-1.5 font-mono uppercase tracking-wider">
                  <span>重要收藏</span>
                  <span>{completedKeyItemsCount} / {totalKeyItems} 件</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 overflow-hidden rounded-full border border-white/5">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${totalKeyItems > 0 ? (completedKeyItemsCount / totalKeyItems) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Survival Advice */}
        <div className="space-y-6">
          <div className="mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">SURVIVAL INTEL</span>
            <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">生存指令中樞</h3>
          </div>
          <div className="bg-[#15181e] rounded-2xl border border-white/10 p-6 flex flex-col justify-between h-[286px] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">當前動態求生指引</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">{activeAdviceTitle}</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light mt-2 line-clamp-4 italic">
                "{activeAdviceDesc}"
              </p>
            </div>
            <button
              onClick={() => onNavigate('guide', activeAdviceTarget)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300"
            >
              查看對應攻略指南 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Checklist / Fast Travel Index */}
      <div className="space-y-4 pt-4">
        <div className="mb-2">
          <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">RAPID GEARS INDEX</span>
          <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">核心道具快速獲取指南</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: 'C1', name: '潛水器', icon: Zap, color: 'text-cyan-400' },
            { id: 'C2', name: '繩索槍', icon: Zap, color: 'text-cyan-400' },
            { id: 'C3', name: '鏟子', icon: Zap, color: 'text-rose-400' },
            { id: 'C4', name: '維護卡 & 消防斧', icon: Shield, color: 'text-emerald-400' },
            { id: 'C5', name: '黃金護甲', icon: Shield, color: 'text-yellow-400' },
            { id: 'S4', name: 'VIP最終地堡', icon: Compass, color: 'text-purple-400' },
          ].map(item => {
            const isCompleted = completedLocations.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => onNavigate('guide', item.id)}
                className={`p-4 rounded border border-white/10 bg-[#15181e] hover:bg-white/5 hover:border-white/20 transition-all duration-200 cursor-pointer flex justify-between items-center ${isCompleted ? 'opacity-65' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-black/40 border border-white/5 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{item.name}</h4>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5 block">{item.id} NODE</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded font-bold tracking-wider uppercase font-mono ${isCompleted ? 'bg-green-500/10 border border-green-500/25 text-green-400' : 'bg-black/40 border border-white/5 text-white/40'}`}>
                  {isCompleted ? '✓ 取得' : '未獲取'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Overview Instructions / Footnote */}
      <div className="rounded-2xl border border-white/10 bg-[#15181e] p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-xl">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">正在尋找進特定地點的步步細節？</h4>
          <p className="text-xs text-white/50 leading-relaxed max-w-2xl font-light">
            本攻略專為喜愛《森林之子》生存逃脫卻時常迷失在深不見底的洞穴網與泥土迷宮點的玩家打造。首頁儀表板整合所有 LocalStorage 進度。歡迎隨時利用上方全站搜尋框直接打入名稱、代號快速檢索。
          </p>
        </div>
        <button 
          onClick={onSearchFocus}
          className="px-5 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Search className="w-3.5 h-3.5" /> 全站快速檢索 [F]
        </button>
      </div>
    </div>
  );
}
