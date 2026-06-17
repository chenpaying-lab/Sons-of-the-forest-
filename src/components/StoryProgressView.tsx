import { Check, Compass, Calendar, Flag, Shield, Landmark } from 'lucide-react';
import { StoryNode } from '../types';

interface StoryProgressViewProps {
  storyNodes: StoryNode[];
  completedStory: string[];
  onToggleStoryNode: (id: string) => void;
}

export default function StoryProgressView({
  storyNodes,
  completedStory,
  onToggleStoryNode
}: StoryProgressViewProps) {
  const total = storyNodes.length;
  const completedCount = completedStory.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Let's attach customized description details to make the checklist look extremely professional and immersive!
  const nodeDescriptions: Record<string, { desc: string; icon: any; colorText: string }> = {
    S1: { desc: "空難生還，背水一戰！在沙灘、雪山或荒林拾荒，救助 Kelvin 建立臨時營地。", icon: Compass, colorText: "text-zinc-400" },
    S2: { desc: "找到散落在島嶼各處的空勤特工遇險 GPS 紫色信號（D1, D2, D3），獲得初級火藥武裝。", icon: Compass, colorText: "text-zinc-400" },
    S3: { desc: "探索 C2 繩索槍洞穴，穿越變異體包圍，拿到在峭壁峽谷滑行之滑索核心工具。", icon: Compass, colorText: "text-zinc-400" },
    S4: { desc: "進入北部 C1 海岸洞穴，拿到深水下潛必備的水肺面罩與電磁警棍。", icon: Compass, colorText: "text-zinc-400" },
    S5: { desc: "用繩索槍與潛水器闖過最長大關 C3 雙瀑布洞口，在遺體取出核心挖掘工具鏟子。", icon: Compass, colorText: "text-zinc-400" },
    S6: { desc: "前往中西部平湖，用維護卡下到地底食品超市與夜總會，尋找 Virginia 裙裝與高級物資。", icon: Compass, colorText: "text-zinc-400" },
    S7: { desc: "在發光溫室育苗室（I2）或是餐館二樓吧台尋得最高權限 VIP 萬能黑色門禁卡。", icon: Compass, colorText: "text-cyan-400" },
    S8: { desc: "突破東南方巨石陣 C5 金色地漏，在地下金燦燦熔岩殿堂中拾得具有通靈作用的金色戰甲。", icon: Shield, colorText: "text-yellow-400" },
    S9: { desc: "前往群山石陣的秘密鐵門，刷 VIP 卡進入終極高管公寓。存檔，預備直面終關大戰。", icon: Landmark, colorText: "text-purple-400" },
    S10: { desc: "身著黃金護甲融化魔之鐵門。降至地心多元宇宙魔方核心。選擇登機離去，或留下探險。", icon: Flag, colorText: "text-orange-400" }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 animate-in fade-in duration-300" id="story-progress-layout">
      {/* Header and Progress Indicator */}
      <div className="bg-[#15181e] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block">TELEMETRY TRACKER</span>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">主線里程碑任務</h1>
          <p className="text-xs text-white/50 max-w-sm font-light leading-relaxed">
            記錄主線故事節點。全部 10 個核心劇情路標已整合。勾選後將立即重算首頁完成度，資料直接儲存於 LocalStorage。
          </p>
        </div>

        {/* Circular or big radial badge */}
        <div className="flex flex-col items-center shrink-0 z-10 bg-black/40 border border-white/10 p-5 rounded-lg md:w-48 text-center justify-center">
          <span className="text-3xl sm:text-4xl font-black font-mono text-orange-500 tracking-tight">
            {pct}%
          </span>
          <span className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-wider">
            完成度 ({completedCount} / {total})
          </span>
          {/* Smooth bar indicator inside circle container */}
          <div className="w-full bg-[#090b0e] h-1.5 overflow-hidden mt-3 rounded-full border border-white/5">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Checklist Timeline Stack */}
      <div className="space-y-4">
        <div className="mb-2">
          <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">STORY LOG BOOK</span>
          <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">主要故事路徑 checkpoints</h3>
        </div>
        
        {storyNodes.map((node, index) => {
          const isCompleted = completedStory.includes(node.id);
          const meta = nodeDescriptions[node.id] || { desc: '', icon: Compass, colorText: 'text-zinc-400' };
          const NodeIcon = meta.icon;

          return (
            <div
              key={node.id}
              onClick={() => onToggleStoryNode(node.id)}
              className={`w-full group/row border rounded p-5 flex items-start gap-4 transition-all duration-300 cursor-pointer ${isCompleted 
                ? 'bg-black/40 border-white/10 shadow-lg opacity-70' 
                : 'bg-black/10 border-white/5 hover:bg-black/25 hover:border-white/10'}`}
            >
              {/* Checkbox trigger box */}
              <div 
                className={`w-6 h-6 rounded border flex items-center justify-center mt-1.5 shrink-0 transition-all ${isCompleted 
                  ? 'bg-orange-500 border-orange-400 text-black shadow-[0_0_12px_rgba(249,115,22,0.3)]' 
                  : 'border-white/20 bg-black hover:border-orange-500 group-hover/row:scale-105'}`}
              >
                {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              {/* Text content details */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/40 text-[10px] font-mono tracking-widest font-bold">NODE {index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  <h3 className={`text-sm font-bold transition-colors ${isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                    {node.title}
                  </h3>
                  {isCompleted && (
                    <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-orange-500/10 text-orange-400 border border-orange-500/10">
                      RESOLVED
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed font-light ${isCompleted ? 'text-white/40' : 'text-white/60'}`}>
                  {meta.desc}
                </p>
              </div>

              {/* Decorative category badge icon */}
              <div className={`p-2.5 rounded bg-black/40 border border-white/10 shrink-0 self-center hidden sm:block ${isCompleted ? 'text-orange-500/40' : 'text-white/40 group-hover/row:text-white transition-colors'}`}>
                <NodeIcon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful reminder footnote */}
      <div className="text-center py-4 bg-black/20 rounded border border-white/10 border-dashed text-white/40 text-xs font-light max-w-sm mx-auto">
        每一項勾選皆是《森林之子》生存逃脫的主幹里程碑。如不小心多點了，再次點擊即可取消該任務節點。
      </div>
    </div>
  );
}
