import React from 'react';
import { Box, Loader2, Sparkles, Cpu } from 'lucide-react';

interface Loading3DFallbackProps {
  title?: string;
  message?: string;
}

export const Loading3DFallback: React.FC<Loading3DFallbackProps> = ({
  title = 'Cargando Simulador 3D...',
  message = 'Carga diferida (Lazy Loading) en curso. Optimizando memoria y cargando WebGL/Three.js...',
}) => {
  return (
    <div className="w-full min-h-[460px] flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-3xl border border-slate-800 text-center relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Animated Indicator */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-600/30 animate-pulse">
          <Box className="w-10 h-10 animate-bounce" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 shadow-md">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-2">
        <span>{title}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          3D WebGL
        </span>
      </h3>

      <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6 font-medium">
        {message}
      </p>

      {/* Performance & Lazy Loading Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span>Carga diferida activada: el bundle principal se mantiene ultra liviano</span>
        <Sparkles className="w-3 h-3 text-amber-400" />
      </div>
    </div>
  );
};
