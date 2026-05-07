/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Terminal,
  Database,
  Mail,
  RefreshCcw,
  Settings,
  ShieldCheck,
  FileText,
  AlertCircle,
  LayoutDashboard,
  Cpu,
  History,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface LogEntry {
  timestamp: string;
  level: "INFO" | "ERROR" | "WARNING";
  message: string;
}

// --- Dashboard Component ---
export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [contacts, setContacts] = useState("");
  const [reminders, setReminders] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchInitialData = async () => {
    try {
      const cRes = await fetch("/api/data/contacts");
      const rRes = await fetch("/api/data/reminders");
      const lRes = await fetch("/api/logs");
      
      const c = await cRes.json();
      const r = await rRes.json();
      const l = await lRes.json();

      setContacts(c.content || "");
      setReminders(r.content || "");
      setLogs(l.content ? l.content.split("\n").filter(Boolean) : []);
    } catch (e) {
      console.error("Data fetch failed", e);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setLogs(prev => [...prev, `[${new Date().toISOString()}] - INFO - USER_INITIATED_EXECUTION: Starting...`]);
    
    try {
      const res = await fetch("/api/execute", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        // Refresh logs after a small delay to simulate processing
        setTimeout(async () => {
          const lRes = await fetch("/api/logs");
          const l = await lRes.json();
          setLogs(l.content.split("\n").filter(Boolean));
          setLastRun(new Date().toLocaleTimeString());
          setIsExecuting(false);
        }, 2000);
      }
    } catch (e) {
      setIsExecuting(false);
    }
  };

  const saveFile = async (name: string, content: string) => {
    await fetch(`/api/data/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-mono selection:bg-neutral-800">
      {/* Sidebar Nav (Aesthetic Grid style) */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-8 gap-8 z-50">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-900/40">
          <Cpu size={24} />
        </div>
        <div className="flex flex-col gap-6 text-neutral-600">
          <LayoutDashboard size={20} className="text-neutral-200" />
          <Database size={20} className="hover:text-neutral-200 transition-colors cursor-pointer" />
          <Mail size={20} className="hover:text-neutral-200 transition-colors cursor-pointer" />
          <History size={20} className="hover:text-neutral-200 transition-colors cursor-pointer" />
          <Settings size={20} className="hover:text-neutral-200 transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pl-16 min-h-screen flex flex-col">
        {/* Header Bar */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-widest uppercase text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={16} /> EMA-V1 Automation Node
            </h1>
            <div className="h-4 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">System Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {lastRun && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Last Trigger</span>
                <span className="text-xs text-neutral-300">{lastRun}</span>
              </div>
            )}
            <button 
              onClick={handleExecute}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all ${
                isExecuting 
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 active:scale-95'
              }`}
            >
               {isExecuting ? <RefreshCcw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
               {isExecuting ? "EXECUTING..." : "TRIGGER AUTOMATION"}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-grow p-8 grid grid-cols-12 gap-8 custom-scrollbar overflow-y-auto">
          
          {/* Status Metrics */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            {[
              { label: "Active Contacts", val: "248", sub: "+12 this Week", icon: Database },
              { label: "Emails Sent", val: "4,129", sub: "98.2% Success", icon: Mail },
              { label: "Failed Events", val: "12", sub: "All Retried", icon: AlertCircle, color: "text-red-500" },
              { label: "Efficiency", val: "94%", sub: "Automated Loop", icon: RefreshCcw }
            ].map((stat, i) => (
              <div key={i} className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800/50 hover:border-neutral-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <stat.icon className={stat.color || "text-blue-500"} size={20} />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-neutral-100 mb-1">{stat.val}</div>
                <div className="text-[10px] text-neutral-500 font-bold">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Configuration Area */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* Contacts Table Simulation */}
            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-neutral-800/50 border-b border-neutral-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Data Management / contacts.csv</span>
                <button 
                  onClick={() => saveFile('contacts', contacts)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                >
                  SAVE CHANGES
                </button>
              </div>
              <textarea 
                value={contacts} 
                onChange={(e) => setContacts(e.target.value)}
                spellCheck={false}
                className="p-6 bg-transparent h-48 focus:outline-none resize-none text-[13px] leading-relaxed text-neutral-400 custom-scrollbar font-mono"
              />
            </div>

             {/* Reminders Table Simulation */}
             <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-neutral-800/50 border-b border-neutral-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Data Management / reminders.csv</span>
                <button 
                  onClick={() => saveFile('reminders', reminders)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                >
                  SAVE CHANGES
                </button>
              </div>
              <textarea 
                value={reminders} 
                onChange={(e) => setReminders(e.target.value)}
                spellCheck={false}
                className="p-6 bg-transparent h-48 focus:outline-none resize-none text-[13px] leading-relaxed text-neutral-400 custom-scrollbar font-mono"
              />
            </div>
          </div>

          {/* Log Viewer Side Panel */}
          <div className="col-span-12 lg:col-span-4 bg-neutral-900 rounded-3xl border border-neutral-800 flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-neutral-800/50 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-neutral-500" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Console Logs</span>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto font-mono text-[11px] leading-relaxed custom-scrollbar bg-black/30">
               {logs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-neutral-700 opacity-30 gap-4">
                    <Clock size={48} strokeWidth={1} />
                    <span className="tracking-[0.3em] uppercase">No Logs Recorded</span>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {logs.map((log, i) => {
                      const isError = log.includes('ERROR');
                      const isSuccess = log.includes('SUCCESS');
                      return (
                        <div key={i} className={`pb-2 border-b border-neutral-800/30 ${isError ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-neutral-500'}`}>
                          {log}
                        </div>
                      )
                    })}
                    <div ref={logEndRef} />
                 </div>
               )}
            </div>
          </div>

        </div>

        {/* Footer Status */}
        <footer className="h-10 border-t border-neutral-800 flex items-center px-8 bg-neutral-900/20">
          <div className="flex items-center gap-6 text-[9px] font-black text-neutral-600 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full" /> CPU LOAD: 12%
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full" /> MEMORY: 1.2GB
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> TLS ACTIVE
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
