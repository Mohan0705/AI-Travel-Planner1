import React from "react";
import { 
  ShieldAlert, 
  Trash2, 
  Database, 
  Activity, 
  Clock, 
  RefreshCw,
  Users,
  Compass,
  CheckCircle2,
  ListRestart
} from "lucide-react";
import { AdminLog, Trip } from "../types";

interface AdminPanelProps {
  logs: AdminLog[];
  onClearLogs: () => void;
  tripsCount: number;
}

export default function AdminPanel({ logs, onClearLogs, tripsCount }: AdminPanelProps) {
  const [dbSize, setDbSize] = React.useState("12.4 KB");
  const [latency, setLatency] = React.useState("24ms");

  const handleSimulateOptimize = () => {
    setLatency("12ms");
    setDbSize(prev => {
      const parsed = parseFloat(prev);
      return `${(parsed * 0.9).toFixed(1)} KB`;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-bg text-earth-text">
      
      {/* Title */}
      <div>
        <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">System Administrative Deck</h1>
        <p className="text-xs text-earth-text/50 mt-1">Real-time system statistics, diagnostic telemetry feeds, and audit logs.</p>
      </div>

      {/* Grid: System Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#4A4A3A] font-semibold">DATABASE PLATFORM</span>
            <Database className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <p className="text-2xl font-serif italic text-[#4A4A3A] font-light">LocalStorage</p>
            <p className="text-xs text-earth-text/50 mt-1">Active Persistence Engine</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#4A4A3A] font-semibold">MEMORY RESERVES</span>
            <Activity className="w-4 h-4 text-earth-sage" />
          </div>
          <div>
            <p className="text-2xl font-serif italic text-[#4A4A3A] font-light">{dbSize}</p>
            <p className="text-xs text-earth-text/50 mt-1">Allocated browser memory</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#4A4A3A] font-semibold">QUERY LATENCY INDEX</span>
            <Clock className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <p className="text-2xl font-serif italic text-[#4A4A3A] font-light">{latency}</p>
            <p className="text-xs text-earth-text/50 mt-1">Average server-proxy speed</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#4A4A3A] font-semibold">PERSISTED TRIP RECORDS</span>
            <Compass className="w-4 h-4 text-earth-dark" />
          </div>
          <div>
            <p className="text-2xl font-serif italic text-[#4A4A3A] font-light">{tripsCount} Records</p>
            <p className="text-xs text-earth-text/50 mt-1">Aggregated trip profiles</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Audit Log (Left) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-earth-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-earth-border pb-3">
            <div>
              <h3 className="font-serif italic font-light text-earth-text text-lg">Security Audit Logs</h3>
              <p className="text-[10px] text-earth-text/50">Tracking user operations and telemetry</p>
            </div>
            
            <button 
              id="clear-logs-btn"
              onClick={onClearLogs}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all text-xs flex items-center gap-1.5 font-sans font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-earth-light-sage/20 border border-earth-border/40 text-xs flex flex-col md:flex-row justify-between md:items-center gap-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-earth-text/40">[{log.time ? log.time.slice(11, 19) : ""}]</span>
                    <span className="text-earth-text">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-earth-text/50">User: {log.user}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-earth-text/50 font-mono">
                No system logs currently compiled.
              </div>
            )}
          </div>
        </div>

        {/* Admin actions & tuning console (Right) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-earth-border space-y-6 shadow-sm">
          <h3 className="font-serif italic font-light text-earth-text text-lg">Tuning Deck</h3>
          
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-earth-light-sage/35 border border-earth-border/40 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-earth-accent shrink-0 mt-0.5" />
              <p className="text-[#4A4A3A] leading-relaxed font-light font-serif italic">As an administrator, you possess full privilege access to diagnostic telemetry. Swapping roles in the sidebar updates permissions instantly.</p>
            </div>

            <button
              id="admin-optimize-btn"
              onClick={handleSimulateOptimize}
              className="w-full py-3 rounded-full bg-white hover:bg-earth-light-sage/20 text-earth-text border border-earth-border transition-all flex items-center justify-center gap-2 font-semibold font-sans shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-earth-accent" />
              <span>Compress DB Index</span>
            </button>

            <button
              id="admin-reset-defaults-btn"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 rounded-full border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 font-semibold font-sans shadow-sm"
            >
              <ListRestart className="w-4 h-4" />
              <span>Full System Reset</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
