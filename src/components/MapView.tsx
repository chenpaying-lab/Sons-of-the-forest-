import { useState, useRef, MouseEvent, WheelEvent, useEffect } from 'react';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Shield, Check, Info, Skull, CircleAlert } from 'lucide-react';
import { LocationMarker } from '../types';

interface MapViewProps {
  locations: LocationMarker[];
  completedLocations: string[];
  onToggleComplete: (id: string) => void;
  onNavigateToGuide: (id: string) => void;
}

export default function MapView({
  locations,
  completedLocations,
  onToggleComplete,
  onNavigateToGuide
}: MapViewProps) {
  // Map State for Dragging, Panning & Zooming
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState<LocationMarker | null>(null);

  // Filter categories
  const [activeFilters, setActiveFilters] = useState<string[]>(['cave', 'team', 'item', 'bunker']);

  // Track hover coordinate
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load default map state or selected marker
  useEffect(() => {
    // If there is a selected marker, center on it on initial load
    if (selectedMarker) {
      // Move pan to center the marker (approximate)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const targetX = rect.width / 2 - (selectedMarker.x / 100) * 800 * zoom;
        const targetY = rect.height / 2 - (selectedMarker.y / 100) * 800 * zoom;
        setPan({ x: targetX, y: targetY });
      }
    }
  }, []);

  // Filter handlers
  const toggleFilter = (category: string) => {
    if (activeFilters.includes(category)) {
      if (activeFilters.length > 1) {
        setActiveFilters(activeFilters.filter(f => f !== category));
      }
    } else {
      setActiveFilters([...activeFilters, category]);
    }
  };

  const selectAllFilters = () => {
    setActiveFilters(['cave', 'team', 'item', 'bunker']);
  };

  const selectNoneFilters = () => {
    setActiveFilters([]);
  };

  // Drag handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Update hover coordinates labels in tactical terminal
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Relative x/y percentage on the 800px coordinate frame
      const mapX = Math.round(((e.clientX - rect.left - pan.x) / (800 * zoom)) * 100);
      const mapY = Math.round(((e.clientY - rect.top - pan.y) / (800 * zoom)) * 100);
      if (mapX >= 0 && mapX <= 100 && mapY >= 0 && mapY <= 100) {
        setHoverCoords({ x: mapX, y: mapY });
      }
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom handler
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(Math.max(zoom + direction * zoomFactor, 0.7), 4);
    
    // Zoom centered on mouse
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Current coordinates inside map boundary
      const mapX = (mouseX - pan.x) / zoom;
      const mapY = (mouseY - pan.y) / zoom;

      const nextPanX = mouseX - mapX * newZoom;
      const nextPanY = mouseY - mapY * newZoom;

      setZoom(newZoom);
      setPan({ x: nextPanX, y: nextPanY });
    }
  };

  // Button Zoom Handlers
  const zoomIn = () => {
    const newZoom = Math.min(zoom + 0.3, 4);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.3, 0.7);
    setZoom(newZoom);
  };

  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedMarker(null);
  };

  // Filter marker logic
  const filteredLocations = locations.filter(loc => activeFilters.includes(loc.category));

  // Category UI elements
  const categoryMeta: Record<string, { label: string; bg: string; text: string; ring: string; bullet: string }> = {
    cave: { label: '洞穴 (Caves)', bg: 'bg-rose-500', text: 'text-rose-400', ring: 'ring-rose-500/40', bullet: 'bg-rose-500' },
    team: { label: '隊員死亡地點 (Team)', bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/40', bullet: 'bg-purple-500' },
    item: { label: '重要物品 (Key Items)', bg: 'bg-cyan-500', text: 'text-cyan-400', ring: 'ring-cyan-500/40', bullet: 'bg-cyan-500' },
    bunker: { label: '避難所 (Bunkers)', bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/40', bullet: 'bg-emerald-500' },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-4" id="map-page-layout animate-in fade-in duration-300">
      {/* Sidebar Controls and Filters */}
      <div className="xl:col-span-1 space-y-6">
        <div className="mb-2">
          <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase">RADAR CHANNELS</span>
          <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white border-b border-white/10 pb-2">地圖導航 & 篩選</h3>
        </div>

        {/* Filter Card */}
        <div className="bg-[#15181e] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-white">雷達圖層</span>
            <div className="flex gap-2 text-xs font-mono">
              <button onClick={selectAllFilters} className="text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider">多選</button>
              <span className="text-white/20">|</span>
              <button onClick={selectNoneFilters} className="text-white/40 hover:text-white uppercase tracking-wider">清空</button>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(categoryMeta).map(catKey => {
              const meta = categoryMeta[catKey];
              const isActive = activeFilters.includes(catKey);
              const count = locations.filter(l => l.category === catKey).length;
              const finished = locations.filter(l => l.category === catKey && completedLocations.includes(l.id)).length;

              return (
                <button
                  key={catKey}
                  onClick={() => toggleFilter(catKey)}
                  className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-200 ${isActive ? 'bg-black/40 border-white/10' : 'bg-black/10 border-white/5 opacity-40'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.bullet} shrink-0`}></span>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-white/40'}`}>{meta.label}</span>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">進度 {finished}/{count}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border ${isActive ? 'bg-orange-500/10 border-orange-500/30' : 'border-white/10'} flex items-center justify-center`}>
                    {isActive && <Check className="w-3 h-3 text-orange-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* GPS Coordinate HUD */}
        <div className="bg-[#15181e] border border-white/10 rounded-xl p-4 font-mono space-y-2">
          <div className="flex justify-between text-[10px] text-white/40 border-b border-white/10 pb-1.5 uppercase tracking-wider">
            <span>GPS LOG TERMINAL</span>
            <span className="text-orange-500 animate-pulse">● CONNECTED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center py-1">
            <div className="bg-black/40 rounded p-2 border border-white/5">
              <span className="text-[9px] text-white/40 block uppercase tracking-widest font-bold">緯度 LAT</span>
              <span className="text-sm font-bold text-orange-500">{hoverCoords.x}.0%</span>
            </div>
            <div className="bg-black/40 rounded p-2 border border-white/5">
              <span className="text-[9px] text-white/40 block uppercase tracking-widest font-bold font-mono">經度 LNG</span>
              <span className="text-sm font-bold text-orange-500">{hoverCoords.y}.0%</span>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-1 leading-normal text-center bg-black/20 p-2 rounded border border-white/5 italic">
            滾輪可縮放地圖，按住滑鼠左鍵可拖拽地圖
          </p>
        </div>

        {/* Map Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={zoomIn}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-wider text-white transition-all"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" /> 放大 +
          </button>
          <button
            onClick={zoomOut}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-wider text-white transition-all"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" /> 縮小 -
          </button>
          <button
            onClick={resetMap}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white transition-all"
            title="重置"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* MapGenie External Map Reference */}
        <div className="bg-[#15181e] border border-white/10 rounded-xl p-4 space-y-2.5">
          <span className="text-[10px] font-black tracking-widest text-orange-500 uppercase block">EXTERNAL RADAR LINK</span>
          <p className="text-xs text-white/60 leading-relaxed font-light">
            本互動地圖以輔助生存與重要地下洞穴劇情道具追蹤為主。需要最精細之全地圖資源、露營點或原版詳細分佈，地圖請參考以下網址支援：
          </p>
          <a
            href="https://mapgenie.io/sons-of-the-forest/maps/world"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500/10 border border-orange-500/25 hover:bg-orange-500 hover:text-black text-orange-500 hover:font-bold text-xs uppercase tracking-widest rounded transition-all duration-300"
          >
            MapGenie 互動地圖 ↗
          </a>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="xl:col-span-3 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div>
            <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase block leading-none">TACTICAL SURVEY CHART</span>
            <h2 className="text-xl font-bold tracking-tighter uppercase italic text-white block mt-0.5 leading-none">
              Sons of the Forest 戰術地形圖
            </h2>
          </div>
          <span className="text-xs text-white/40 font-mono">
            顯示 {filteredLocations.length} / {locations.length} 個標記點
          </span>
        </div>

        {/* Map Viewer Sandbox */}
        <div 
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-[600px] bg-[#7fc7f5] rounded-xl border border-white/10 overflow-hidden cursor-grab active:cursor-grabbing shadow-inner"
          id="map-container"
          style={{ userSelect: 'none' }}
        >
          {/* Floating Key Legend Card, directly matching the user's provided map legend! */}
          <div className="absolute left-4 top-4 z-30 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-xl p-3.5 w-64 pointer-events-none select-none shadow-2xl hidden md:block">
            <h4 className="text-[11px] font-bold tracking-widest text-orange-500 uppercase mb-2 flex items-center gap-1.5 border-b border-white/10 pb-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              【 GPS 雷達系統標識說明 】
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-pink-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">8</span>
                <span className="font-medium text-zinc-300">B 隊成員 (GPS 衛星定位)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-blue-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">⚔</span>
                <span className="font-medium text-zinc-300">生存士兵 (戰術定位員)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-orange-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">⚒</span>
                <span className="font-medium text-zinc-300">工程工人 (基建安全組)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-white">★</span>
                </div>
                <span className="font-medium text-zinc-300">地圖無標識點 (特殊補給)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-5 h-5 rounded-full bg-zinc-800 border-2 border-slate-400 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-zinc-300">門</span>
                </div>
                <span className="font-medium text-zinc-300">可探索洞穴 (掩體/地下室)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-5 h-5 rounded-full bg-[#ef4444] border border-white/20 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-[10px] text-white">💻</span>
                </div>
                <span className="font-medium text-rose-400 font-bold">電腦晶片卡解鎖門檻</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/50">
              <span>通道 A-H / 1-8 網格</span>
              <span>GPS v1.42</span>
            </div>
          </div>

          {/* Zoomable / Pannable Workspace */}
          <div 
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '800px',
              height: '800px',
            }}
            className="absolute transition-transform duration-75 ease-out select-none"
          >
            {/* SVG STYLISH VECTOR MAP */}
            <svg 
              viewBox="0 0 1000 1000" 
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: '#55a5e3' }}
            >
              <defs>
                {/* 3D drop shadow effect filter */}
                <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.4" />
                </filter>
                <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c5e3f6" />
                  <stop offset="50%" stopColor="#7fc7f5" />
                  <stop offset="100%" stopColor="#55a5e3" />
                </radialGradient>
                {/* Island Forest Shading Gradient */}
                <radialGradient id="islandGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="40%" stopColor="#4ade80" />
                  <stop offset="85%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </radialGradient>
                {/* Central snow peak gradient */}
                <radialGradient id="snowPeak" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#f8fafc" stopOpacity="0.8" />
                  <stop offset="65%" stopColor="#cbd5e1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Water Background */}
              <rect width="1000" height="1000" fill="url(#oceanGrad)" />

              {/* Tactical Surveying Grid Lines */}
              <g stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" strokeDasharray="3,3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 125} y1="0" x2={i * 125} y2="1000" />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 125} x2="1000" y2={i * 125} />
                ))}
              </g>

              {/* Grid cell labels */}
              <g fill="rgba(255, 255, 255, 0.75)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((char, i) => (
                  <text key={`lbl-v-${char}`} x={i * 125 + 10} y="20">{char}</text>
                ))}
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((num, i) => (
                  <text key={`lbl-h-${num}`} x="10" y={i * 125 + 115}>{num}</text>
                ))}
              </g>

              {/* Main SOTF-styled Island Landmass Shading & Outline with rich beach contour */}
              <path 
                d="M 250,225 
                   C 320,195 420,175 500,175 
                   C 580,175 680,195 750,225 
                   C 820,245 860,315 870,395 
                   C 880,475 860,595 840,675 
                   C 820,755 770,815 720,830 
                   C 670,845 610,815 530,825 
                   C 450,835 370,855 310,835 
                   C 250,815 190,755 170,675 
                   C 150,595 140,485 150,405 
                   C 160,325 180,255 250,225 Z" 
                fill="url(#islandGrad)" 
                stroke="#ebd7b6" 
                strokeWidth="5"
                filter="url(#map-shadow)"
              />

              {/* Bottom-right Small Islets - matching reference image */}
              <path 
                d="M 740,820 C 750,815 755,820 752,828 C 746,832 740,828 740,820 Z" 
                fill="url(#islandGrad)" 
                stroke="#ebd7b6" 
                strokeWidth="1.5"
              />
              <path 
                d="M 770,840 C 780,835 785,842 782,848 C 774,852 768,846 770,840 Z" 
                fill="url(#islandGrad)" 
                stroke="#ebd7b6" 
                strokeWidth="1.5"
              />
              <path 
                d="M 760,860 C 766,856 770,861 768,866 C 764,869 758,864 760,860 Z" 
                fill="url(#islandGrad)" 
                stroke="#ebd7b6" 
                strokeWidth="1.2"
              />

              {/* Island Secondary concentric Contour Lines */}
              <path 
                d="M 280,255 C 370,205 620,185 710,255 C 800,325 810,615 770,715 C 730,815 610,785 510,805 C 410,825 250,775 210,655 C 170,535 200,305 280,255 Z" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.2)" 
                strokeWidth="1"
              />
              <path 
                d="M 330,315 C 400,275 580,255 650,315 C 720,375 730,595 690,675 C 650,755 570,735 490,750 C 410,765 280,725 250,625 C 220,525 250,355 330,315 Z" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.15)" 
                strokeWidth="1"
              />

              {/* Central Snowy Mountain Peak with detailed ridges like reference */}
              <circle cx="500" cy="500" r="190" fill="url(#snowPeak)" />
              <path 
                d="M 500,500 
                   L 440,420 L 455,410 L 490,460 
                   L 520,380 L 535,385 L 510,460 
                   L 580,430 L 585,445 L 520,480 
                   L 600,530 L 590,545 L 515,510 
                   L 540,590 L 525,595 L 500,520 
                   L 440,580 L 430,565 L 485,505 
                   L 390,490 L 390,475 L 475,480 Z" 
                fill="#ffffff" 
                stroke="#cbd5e1"
                strokeWidth="1.2"
                opacity="0.95" 
                filter="url(#map-shadow)"
              />
              <path 
                d="M 460,475 L 485,450 L 500,415 L 515,450 L 540,475 L 515,495 L 500,525 L 485,495 Z" 
                fill="#f8fafc" 
                opacity="0.9"
              />
              <text x="500" y="555" fill="#334155" fontSize="13" fontFamily="monospace" textAnchor="middle" letterSpacing="2.5" fontWeight="black">
                MT. SNOWPEAK (雪山峰)
              </text>

              {/* Rivers (Ripples of freshwater radiating outwards to the ocean) */}
              {/* River North */}
              <path d="M 480,430 Q 450,290 450,135" fill="none" stroke="#0284c7" strokeWidth="4" opacity="0.85" />
              {/* River West joining lake */}
              <path d="M 430,480 Q 380,470 380,460" fill="none" stroke="#0284c7" strokeWidth="3" opacity="0.85" />
              {/* West shoreline river */}
              <path d="M 380,460 Q 250,450 148,460" fill="none" stroke="#0284c7" strokeWidth="4" opacity="0.85" />
              {/* River Southeast */}
              <path d="M 570,520 Q 680,680 838,790" fill="none" stroke="#0284c7" strokeWidth="3.5" opacity="0.85" />

              {/* Lakes */}
              {/* Lake S2 (West-Central Lake) */}
              <ellipse cx="380" cy="460" rx="20" ry="15" fill="#0284c7" stroke="#bae6fd" strokeWidth="2.5" opacity="0.9" />
              {/* Lake Maintenance A (North-western small pond) */}
              <circle cx="340" cy="250" r="10" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" opacity="0.9" />

              {/* Map Compass Rose */}
              <g transform="translate(850, 150)">
                <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                <path d="M 0,-35 L 5,-5 L 35,0 L 5,5 L 0,35 L -5,5 L -35,0 L -5,-5 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
                <path d="M 0,-35 L 5,-5 L 0,0 Z" fill="#ef4444" />
                <text x="0" y="-42" fill="rgba(255, 255, 255, 0.85)" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">N</text>
              </g>
            </svg>

            {/* DOM Overlay of Markers plotted relative to the container */}
            {filteredLocations.map(loc => {
              const meta = categoryMeta[loc.category];
              const isCompleted = completedLocations.includes(loc.id);
              const isSelected = selectedMarker?.id === loc.id;

              // Convert percentage x and y coordinates from locations.json to pixels
              // locations coordinate x and y are scaled from 0-100 indicating percentage coverage over the 800x800 container.
              const pixelX = (loc.x / 100) * 800;
              const pixelY = (loc.y / 100) * 800;

              return (
                <div 
                  key={loc.id}
                  style={{
                    position: 'absolute',
                    left: `${pixelX}px`,
                    top: `${pixelY}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 50 : 20
                  }}
                  className="cursor-pointer group/marker"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop general map drag trigger
                    setSelectedMarker(loc);
                  }}
                >
                  {/* Glowing pulses */}
                  <div className={`absolute -inset-3 rounded-full transition-all duration-300 opacity-60 ${isCompleted ? 'bg-emerald-500/0' : `${meta.bg}/25 animate-ping`}`}></div>
                  
                  {/* Circle Pin Marker */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${isCompleted ? 'bg-zinc-800 border-emerald-500 text-emerald-400' : `${meta.bg} border-white/80 text-white hover:scale-115`} ${isSelected ? 'ring-4 ring-orange-500/80 scale-120' : ''}`}>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-bold font-mono">{loc.id}</span>
                    )}
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-zinc-950/95 border border-zinc-700/80 text-[11px] px-2.5 py-1.5 rounded-lg text-white whitespace-nowrap shadow-2xl scale-0 group-hover/marker:scale-100 transition-all origin-top duration-150 font-sans z-50 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${meta.bullet}`}></span>
                      <span className="font-bold">{loc.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Marker Detail Info HUD Window */}
        {selectedMarker ? (
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Top Close x Accent */}
            <button 
              onClick={() => setSelectedMarker(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors text-sm font-mono p-1 bg-zinc-950 border border-zinc-900 rounded"
            >
              鍏抽枆 ×
            </button>

            {/* Glowing background hue based on category */}
            <div className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-10 ${categoryMeta[selectedMarker.category].bg}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                {/* Category Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 text-[11px] rounded-lg font-mono tracking-wider text-white ${categoryMeta[selectedMarker.category].bg}`}>
                    {categoryMeta[selectedMarker.category].label}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">ID: {selectedMarker.id} • 座標: X {selectedMarker.x} / Y {selectedMarker.y}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{selectedMarker.title}</h3>
                
                {/* Short Desc */}
                <p className="text-sm text-zinc-300 font-light leading-relaxed">{selectedMarker.shortDescription}</p>

                {/* Danger Ratings */}
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <span className="font-mono">危險程度:</span>
                  <div className="flex gap-0.5 text-orange-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skull 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < selectedMarker.danger ? 'fill-orange-500 text-orange-500' : 'text-zinc-800'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500 ml-1">({selectedMarker.danger}/5)</span>
                </div>

                {/* Requirements / Rewards Table grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900">
                    <span className="text-[11px] font-mono text-zinc-500 block mb-1">【入洞/搜刮必備道具】</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMarker.requirements.map((req, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">{req}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900">
                    <span className="text-[11px] font-mono text-zinc-500 block mb-1">【核心通關/防禦獎勵】</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMarker.rewards.map((rew, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-bold">{rew}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brief Walkthrough Snippet */}
                <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/30 p-3 rounded-lg border border-zinc-900/50">
                  <span className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-emerald-500" /> 地區環境提示
                  </span>
                  {selectedMarker.detailGuide}
                </div>
              </div>

              {/* Checking progress buttons at Right Column */}
              <div className="md:w-52 flex flex-col gap-3 py-1 shrink-0">
                <button
                  onClick={() => onToggleComplete(selectedMarker.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border transition-all duration-300 cursor-pointer ${completedLocations.includes(selectedMarker.id) 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400 hover:bg-zinc-900 hover:border-zinc-700 hover:text-zinc-400' 
                    : 'bg-zinc-900 hover:bg-emerald-500 hover:text-white border-zinc-800 text-zinc-300'}`}
                >
                  <Check className={`w-4 h-4 transition-transform duration-200 ${completedLocations.includes(selectedMarker.id) ? 'scale-110' : 'scale-0'}`} />
                  {completedLocations.includes(selectedMarker.id) ? '評定為：已完成' : '☐ 標記為已完成'}
                </button>

                <button
                  onClick={() => onNavigateToGuide(selectedMarker.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono border border-zinc-900 tracking-wider transition-all text-center"
                >
                  開啟步步詳細攻略
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 bg-zinc-900/5 text-sm">
            點擊地圖上的任何一個標記標點 (洞穴 C, 隊員死亡 D, 重要物品 I, 避難所 S)，以喚醒雷達系統、查看位置詳情與切換完成狀態。
          </div>
        )}
      </div>
    </div>
  );
}
