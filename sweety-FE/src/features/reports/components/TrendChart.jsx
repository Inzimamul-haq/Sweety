import { motion } from 'framer-motion';
import { Activity, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatPretty, glucoseTone, parseISODate } from '../../../utils/date.js';

export function TrendChart({ report }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Use allReadings for the complete range dataset, fallback to readings
  const rawReadings = useMemo(
    () => (Array.isArray(report?.allReadings) ? report.allReadings : Array.isArray(report?.readings) ? report.readings : []),
    [report],
  );

  const kind = report?.kind || 'month-to-date';

  // Group readings by date across the entire range
  const dailyData = useMemo(() => {
    if (rawReadings.length === 0) return [];

    const grouped = {};
    for (const r of rawReadings) {
      if (!grouped[r.date]) {
        grouped[r.date] = [];
      }
      grouped[r.date].push(r);
    }

    // Sort by date ascending
    const sortedDates = Object.keys(grouped).sort();

    return sortedDates.map((date) => {
      const items = grouped[date];
      const values = items.map((r) => r.value);
      const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const parsed = parseISODate(date);

      return {
        date,
        day: parsed ? parsed.d : date,
        month: parsed ? parsed.mo : '',
        avg,
        min,
        max,
        count: items.length,
        items,
        tone: glucoseTone(avg),
      };
    });
  }, [rawReadings]);

  // Overall range stats for the chart header
  const chartMetrics = useMemo(() => {
    if (dailyData.length === 0) return null;
    const allValues = rawReadings.map((r) => r.value);
    const inTargetCount = allValues.filter((v) => v >= 70 && v <= 140).length;
    const inTargetPct = Math.round((inTargetCount / allValues.length) * 100);
    const mean = Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 10) / 10;

    return {
      inTargetPct,
      mean,
      totalReadings: allValues.length,
      daysCount: dailyData.length,
    };
  }, [dailyData, rawReadings]);

  if (dailyData.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-stone-50/50 p-6 text-center border border-dashed border-stone-200">
        <Activity className="h-8 w-8 text-stone-300 mb-2" />
        <p className="text-sm font-semibold text-stone-700">No data to display in chart</p>
        <p className="text-xs text-stone-400 mt-1 max-w-xs">
          Log a few readings to visualize your glucose trend curve.
        </p>
      </div>
    );
  }

  // SVG dimensions & coordinate scales
  const width = 640;
  const height = 230;
  const padding = { top: 22, right: 20, bottom: 32, left: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Y-axis range: min 40, max at least 200 or max value + 20
  const yMin = 40;
  const maxVal = Math.max(...dailyData.map((d) => d.max), 180);
  const yMax = Math.ceil((maxVal + 20) / 40) * 40;

  const getY = (val) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartHeight - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  const getX = (index) => {
    if (dailyData.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (dailyData.length - 1)) * chartWidth;
  };

  // Target Range bounds (70 - 140 mg/dl)
  const targetTopY = getY(140);
  const targetBottomY = getY(70);
  const targetHeight = targetBottomY - targetTopY;

  // Build SVG Path for average line and gradient area
  const points = dailyData.map((d, i) => ({ x: getX(i), y: getY(d.avg) }));
  
  // Smooth Bezier Curve Path generator
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    linePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Area Path (fills under the trend line)
  const bottomY = getY(yMin);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  // Min-Max range shaded envelope (area between daily min and daily max)
  let minMaxAreaPath = '';
  if (dailyData.length > 1) {
    const topPoints = dailyData.map((d, i) => `${getX(i)},${getY(d.max)}`).join(' L ');
    const bottomPoints = dailyData
      .slice()
      .reverse()
      .map((d, i) => `${getX(dailyData.length - 1 - i)},${getY(d.min)}`)
      .join(' L ');
    minMaxAreaPath = `M ${topPoints} L ${bottomPoints} Z`;
  }

  // Y-axis gridline values
  const yTicks = [70, 100, 140, 180, 220].filter((v) => v <= yMax);

  // X-axis label decimation
  const xTickInterval = dailyData.length > 20 ? 5 : dailyData.length > 10 ? 3 : 1;

  const activePoint = hoveredIndex !== null && dailyData[hoveredIndex] ? dailyData[hoveredIndex] : null;

  return (
    <div className="flex h-full flex-col justify-between">
      {/* 1. Header with Title & Quick Key Insights */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-rose-800" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Glucose Trend Overview
            </h3>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              {dailyData.length} {dailyData.length === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Overall data across <span className="font-bold text-stone-700">{chartMetrics?.totalReadings} readings</span> in {report?.range?.label}
          </p>
        </div>

        {/* Key Metrics Chips */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>{chartMetrics?.inTargetPct}% Target</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-700">
            <span className="text-[9px] uppercase text-stone-400">Mean:</span>
            <span>{chartMetrics?.mean} mg/dl</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Chart Canvas */}
      <div className="relative flex-1 py-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[220px] overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9f1239" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#9f1239" stopOpacity="0.0" />
            </linearGradient>

            {/* Target Band Pattern / Gradient */}
            <linearGradient id="targetBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Target Range Band (70 - 140 mg/dl) */}
          <rect
            x={padding.left}
            y={targetTopY}
            width={chartWidth}
            height={targetHeight}
            fill="url(#targetBandGradient)"
            rx="2"
          />
          <line
            x1={padding.left}
            y1={targetTopY}
            x2={padding.left + chartWidth}
            y2={targetTopY}
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
          />
          <line
            x1={padding.left}
            y1={targetBottomY}
            x2={padding.left + chartWidth}
            y2={targetBottomY}
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
          />
          <text
            x={padding.left + chartWidth - 4}
            y={targetTopY + 11}
            textAnchor="end"
            fontSize="9"
            fontWeight="600"
            fill="#059669"
            opacity="0.8"
          >
            Target (70–140 mg/dl)
          </text>

          {/* Horizontal Y-Gridlines & Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="600"
                  fill="#a8a29e"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Min-Max Variability Envelope */}
          {minMaxAreaPath ? (
            <path
              d={minMaxAreaPath}
              fill="#fb7185"
              fillOpacity="0.12"
            />
          ) : null}

          {/* Shaded Area Under Line */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Smooth Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#9f1239"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis Horizontal Base Line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#d6d3d1"
            strokeWidth="1"
          />

          {/* X-Axis Date Labels & Vertical Ticks */}
          {dailyData.map((d, i) => {
            const x = getX(i);
            const isLabeled = i % xTickInterval === 0 || i === dailyData.length - 1;
            const yBase = padding.top + chartHeight;

            return (
              <g key={d.date}>
                {isLabeled ? (
                  <>
                    <line x1={x} y1={yBase} x2={x} y2={yBase + 4} stroke="#a8a29e" strokeWidth="1" />
                    <text
                      x={x}
                      y={yBase + 15}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="#78716c"
                    >
                      {kind === 'weekly' ? formatPretty(d.date).slice(0, 6) : `${d.day}`}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}

          {/* Interactive Vertical Crosshair Line on Hover */}
          {hoveredIndex !== null ? (
            <line
              x1={getX(hoveredIndex)}
              y1={padding.top}
              x2={getX(hoveredIndex)}
              y2={padding.top + chartHeight}
              stroke="#9f1239"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          ) : null}

          {/* Data Points (Dots on the line) */}
          {dailyData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.avg);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible larger hover hit target */}
                <circle cx={x} cy={y} r="10" fill="transparent" />

                {/* Min-Max vertical whisker line */}
                <line
                  x1={x}
                  y1={getY(d.min)}
                  x2={x}
                  y2={getY(d.max)}
                  stroke="#fda4af"
                  strokeWidth="1.5"
                  opacity={isHovered ? '0.9' : '0.4'}
                />

                {/* Outer Glow Ring on Hover */}
                {isHovered ? (
                  <circle cx={x} cy={y} r="7" fill="#f43f5e" fillOpacity="0.25" />
                ) : null}

                {/* Data Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '4.5' : dailyData.length > 20 ? '2.5' : '3.5'}
                  fill={d.tone === 'high' ? '#be123c' : d.tone === 'low' ? '#0369a1' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xl bg-stone-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md flex items-center gap-3 z-20 ring-1 ring-white/10"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-rose-300" />
              <span>{formatPretty(activePoint.date)}</span>
            </div>

            <div className="flex items-center gap-1 border-l border-white/20 pl-2.5">
              <span className="text-[10px] text-stone-300">Avg:</span>
              <span className="font-extrabold text-white">{activePoint.avg} mg/dl</span>
            </div>

            <div className="flex items-center gap-1 border-l border-white/20 pl-2.5 text-[10px] text-stone-300">
              <span>Range:</span>
              <span className="font-semibold text-white">{activePoint.min}–{activePoint.max}</span>
              <span className="ml-1 text-stone-400">({activePoint.count}/4)</span>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* 3. Footer Legend & Medical Target Clarification */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-50/60 px-3 py-1.5 text-[11px] text-rose-900 shrink-0">
        <div className="flex items-center gap-3 font-medium">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-800" />
            <span className="text-stone-700">Daily Average Curve</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-3 rounded bg-rose-200/70" />
            <span className="text-stone-700">Min–Max Envelope</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-3 rounded bg-emerald-100 border border-emerald-300/60" />
            <span className="text-stone-700">Target Range (70–140)</span>
          </div>
        </div>

        <span className="font-semibold text-rose-800">
          Showing all {dailyData.length} recorded days
        </span>
      </div>
    </div>
  );
}

