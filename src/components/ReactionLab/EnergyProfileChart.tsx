import React from 'react';
import { ReactionDefinition } from '../../types/reactions3d';

interface EnergyProfileChartProps {
  reaction: ReactionDefinition;
  progress: number; // 0 to 1
}

export const EnergyProfileChart: React.FC<EnergyProfileChartProps> = ({ reaction, progress }) => {
  const isExo = reaction.thermodynamics.type === 'Exotérmica';

  // SVG Coordinates setup
  const width = 360;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  // Reactants baseline (left)
  const yReactants = isExo ? height - 60 : height - 45;
  // Products baseline (right)
  const yProducts = isExo ? height - 35 : height - 85;
  // Peak (Activation complex at x = 0.5)
  const peakHeightFactor = reaction.thermodynamics.activationEnergyValue || 0.6;
  const yPeak = paddingY + (1 - peakHeightFactor) * 50;

  const x0 = paddingX;
  const xPeak = width / 2;
  const xEnd = width - paddingX;

  // Generate SVG path for energy curve using cubic bezier
  const pathD = `M ${x0} ${yReactants} 
    C ${x0 + 60} ${yReactants}, ${xPeak - 50} ${yPeak}, ${xPeak} ${yPeak} 
    C ${xPeak + 50} ${yPeak}, ${xEnd - 60} ${yProducts}, ${xEnd} ${yProducts}`;

  // Calculate current point on the curve based on progress t in [0, 1]
  // Approximate using cubic Bezier interpolation
  const getPointAtT = (t: number) => {
    // 2 segments: t from 0 to 0.5, and 0.5 to 1.0
    let x: number;
    let y: number;

    if (t <= 0.5) {
      const u = t * 2; // 0 to 1
      const p0 = { x: x0, y: yReactants };
      const p1 = { x: x0 + 60, y: yReactants };
      const p2 = { x: xPeak - 50, y: yPeak };
      const p3 = { x: xPeak, y: yPeak };

      const cx = 3 * (p1.x - p0.x);
      const bx = 3 * (p2.x - p1.x) - cx;
      const ax = p3.x - p0.x - cx - bx;

      const cy = 3 * (p1.y - p0.y);
      const by = 3 * (p2.y - p1.y) - cy;
      const ay = p3.y - p0.y - cy - by;

      x = ax * Math.pow(u, 3) + bx * Math.pow(u, 2) + cx * u + p0.x;
      y = ay * Math.pow(u, 3) + by * Math.pow(u, 2) + cy * u + p0.y;
    } else {
      const u = (t - 0.5) * 2; // 0 to 1
      const p0 = { x: xPeak, y: yPeak };
      const p1 = { x: xPeak + 50, y: yPeak };
      const p2 = { x: xEnd - 60, y: yProducts };
      const p3 = { x: xEnd, y: yProducts };

      const cx = 3 * (p1.x - p0.x);
      const bx = 3 * (p2.x - p1.x) - cx;
      const ax = p3.x - p0.x - cx - bx;

      const cy = 3 * (p1.y - p0.y);
      const by = 3 * (p2.y - p1.y) - cy;
      const ay = p3.y - p0.y - cy - by;

      x = ax * Math.pow(u, 3) + bx * Math.pow(u, 2) + cx * u + p0.x;
      y = ay * Math.pow(u, 3) + by * Math.pow(u, 2) + cy * u + p0.y;
    }

    return { x, y };
  };

  const currentPt = getPointAtT(Math.max(0, Math.min(1, progress)));

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/60 rounded-xl p-3 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Perfil de Energía Potencial
          </h4>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
            isExo
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          {reaction.thermodynamics.type} (ΔH {isExo ? '< 0' : '> 0'})
        </span>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[360px] h-auto select-none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor={isExo ? '#10B981' : '#818CF8'} />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Coordinate axes */}
          <line
            x1={paddingX - 15}
            y1={height - 20}
            x2={width - 15}
            y2={height - 20}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX - 10}
            y1={height - 15}
            x2={paddingX - 10}
            y2={paddingY - 10}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text x={paddingX - 8} y={paddingY - 10} fill="#94A3B8" fontSize="9" textAnchor="end">
            Eₚ
          </text>
          <text x={width - 20} y={height - 8} fill="#94A3B8" fontSize="9" textAnchor="end">
            Coordenada de Reacción ➔
          </text>

          {/* Ea reference line & label */}
          <line
            x1={xPeak}
            y1={yPeak}
            x2={xPeak}
            y2={yReactants}
            stroke="#F59E0B"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={xPeak + 6}
            y={(yPeak + yReactants) / 2 + 3}
            fill="#FBBF24"
            fontSize="10"
            fontWeight="bold"
          >
            Eₐ
          </text>

          {/* Delta H line */}
          <line
            x1={xEnd - 5}
            y1={yReactants}
            x2={xEnd - 5}
            y2={yProducts}
            stroke={isExo ? '#F43F5E' : '#818CF8'}
            strokeWidth="1.5"
          />
          <text
            x={xEnd - 8}
            y={(yReactants + yProducts) / 2 + 4}
            fill={isExo ? '#FB7185' : '#A5B4FC'}
            fontSize="9"
            fontWeight="bold"
            textAnchor="end"
          >
            ΔH
          </text>

          {/* The main Reaction Curve */}
          <path d={pathD} fill="none" stroke="url(#curveGradient)" strokeWidth="3" />

          {/* Stage labels along curve */}
          <text x={x0} y={yReactants - 10} fill="#E2E8F0" fontSize="10" fontWeight="bold">
            Reactivos
          </text>
          <text
            x={xPeak}
            y={yPeak - 10}
            fill="#FDE047"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            [Complejo Activado]‡
          </text>
          <text
            x={xEnd}
            y={yProducts - 10}
            fill="#E2E8F0"
            fontSize="10"
            fontWeight="bold"
            textAnchor="end"
          >
            Productos
          </text>

          {/* Active progress marker circle with glow */}
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="8"
            fill="#38BDF8"
            fillOpacity="0.3"
            className="animate-ping"
          />
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="5"
            fill="#38BDF8"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between border-t border-slate-800 pt-1.5">
        <div>
          <span className="text-slate-400">ΔH: </span>
          <span className="font-semibold text-white">{reaction.thermodynamics.deltaH}</span>
        </div>
        <div>
          <span className="text-slate-400">Barrera Eₐ: </span>
          <span className="font-semibold text-amber-300">
            {reaction.thermodynamics.activationEnergy.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
