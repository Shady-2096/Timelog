import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getEntries, getSettings } from '../utils/storage';
import { getTodayStr, formatMinutesToReadable, formatDateStr } from '../utils/time';
import Countdown from '../components/Countdown';

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

export default function AnalysisPage() {
  const settings = getSettings();
  const todayStr = getTodayStr();
  const [range, setRange] = useState('today');
  const [customDate, setCustomDate] = useState(todayStr);
  // Re-read from localStorage on every render so data is always fresh
  const allEntries = getEntries();

  const entries = useMemo(() => {
    if (range === 'today') return allEntries.filter((e) => e.date === todayStr);
    if (range === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = formatDateStr(cutoff);
      return allEntries.filter((e) => e.date >= cutoffStr);
    }
    if (range === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = formatDateStr(cutoff);
      return allEntries.filter((e) => e.date >= cutoffStr);
    }
    if (range === 'custom') return allEntries.filter((e) => e.date === customDate);
    return allEntries;
  }, [allEntries, range, customDate, todayStr]);

  const aggregated = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const key = e.label.toLowerCase();
      if (!map[key]) map[key] = { name: e.label, minutes: 0 };
      map[key].minutes += e.durationMinutes;
    });
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [entries]);

  const totalMinutes = aggregated.reduce((s, a) => s + a.minutes, 0);

  return (
    <div className="page analysis-page">
      <header className="timer-header">
        <div className="header-left">
          <h1 className="app-title">Analysis</h1>
        </div>
        <Countdown dateStr={todayStr} dayStartTime={settings.dayStartTime} />
      </header>

      <div className="analysis-filters">
        {['today', '7days', '30days', 'all'].map((r) => (
          <button
            key={r}
            className={`filter-btn ${range === r ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r === 'today' ? 'Today' : r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : 'All'}
          </button>
        ))}
        <button
          className={`filter-btn ${range === 'custom' ? 'active' : ''}`}
          onClick={() => setRange('custom')}
        >
          Pick Date
        </button>
      </div>

      {range === 'custom' && (
        <input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="date-picker"
        />
      )}

      {entries.length === 0 ? (
        <div className="analysis-empty">
          <p>No data for this period.</p>
        </div>
      ) : (
        <>
          <div className="analysis-summary">
            <div className="summary-card">
              <span className="summary-value">{formatMinutesToReadable(totalMinutes)}</span>
              <span className="summary-label">Total Logged</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{entries.length}</span>
              <span className="summary-label">Entries</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{aggregated.length}</span>
              <span className="summary-label">Activities</span>
            </div>
          </div>

          <div className="chart-section">
            <h3>Time Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={aggregated}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {aggregated.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatMinutesToReadable(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>Time by Activity</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, aggregated.length * 50)}>
              <BarChart data={aggregated} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => formatMinutesToReadable(v)} />
                <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(value) => formatMinutesToReadable(value)} />
                <Bar dataKey="minutes" radius={[0, 6, 6, 0]}>
                  {aggregated.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>Breakdown</h3>
            <div className="breakdown-list">
              {aggregated.map((item, i) => (
                <div key={item.name} className="breakdown-row">
                  <div
                    className="breakdown-color"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="breakdown-name">{item.name}</span>
                  <span className="breakdown-time">{formatMinutesToReadable(item.minutes)}</span>
                  <span className="breakdown-pct">
                    {((item.minutes / totalMinutes) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
