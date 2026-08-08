'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  Users, 
  AlertCircle, 
  Activity, 
  Settings, 
  FileText, 
  LogOut, 
  RefreshCw, 
  Search, 
  Globe, 
  Key, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';

interface LogEntry {
  id: string;
  timestamp: string;
  url: string;
  ipAddress: string;
  status: string;
  errorMsg: string | null;
}

interface StatsData {
  totalDownloads: number;
  activeUsersToday: number;
  failedRequests: number;
  successRate: number;
}

interface SystemSettings {
  rapidapi_key: string;
  hasKey: boolean;
  rapidapi_host: string;
  mock_mode: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs' | 'settings'>('analytics');
  
  // States for stats & logs
  const [stats, setStats] = useState<StatsData | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('NOT_CONFIGURED');
  const [chartData, setChartData] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for Settings
  const [settings, setSettings] = useState<SystemSettings>({
    rapidapi_key: '',
    hasKey: false,
    rapidapi_host: '',
    mock_mode: true,
  });

  // Action/Loading/Notification states
  const [loadingData, setLoadingData] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch all stats, logs, and config settings
  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) {
        if (statsRes.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch statistics');
      }
      const statsData = await statsRes.json();
      setStats(statsData.stats);
      setApiStatus(statsData.apiStatus);
      setChartData(statsData.chartData);
      setLogs(statsData.recentLogs);

      // Fetch config settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings({
          rapidapi_key: settingsData.rapidapi_key,
          hasKey: settingsData.hasKey,
          rapidapi_host: settingsData.rapidapi_host,
          mock_mode: settingsData.mock_mode,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rapidapi_key: settings.rapidapi_key,
          rapidapi_host: settings.rapidapi_host,
          mock_mode: settings.mock_mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSettingsMessage({ type: 'success', text: 'Configuration saved successfully!' });
      
      // Refresh statistics (mock mode changes could impact API status indicators)
      fetchData();
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.refresh();
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filter logs based on search string
  const filteredLogs = logs.filter(
    (log) =>
      log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.errorMsg && log.errorMsg.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loadingData && !stats) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Loading control panel analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 md:py-6">
      
      {/* Dashboard Heading Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-850 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2.5">
            Admin Control Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            System Status: 
            <span className={`ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
              apiStatus === 'ACTIVE' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : apiStatus === 'MOCK_FALLBACK'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {apiStatus === 'ACTIVE' ? 'API Scraper Active' : apiStatus === 'MOCK_FALLBACK' ? 'Mock Mode Enabled' : 'Scraper Offline (Mock)'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh statistics"
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-rose-950/25 hover:border-rose-900/35 text-zinc-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          <div className="glass-panel p-5 rounded-2xl border-zinc-850 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Downloads</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-zinc-100">{stats.totalDownloads}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Successful requests</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-850 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-zinc-100">{stats.activeUsersToday}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Unique visitor IPs (24h)</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-850 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Failed Requests</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-zinc-100">{stats.failedRequests}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Blocked or invalid attempts</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-850 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-zinc-100">{stats.successRate}%</p>
            <p className="text-[10px] text-zinc-500 mt-1">Successful vs failed attempts</p>
          </div>

        </div>
      )}

      {/* Tab Navigation Menu */}
      <div className="border-b border-zinc-900 flex gap-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Analytics Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Activity Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>System Settings</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        
        {/* Tab 1: Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Widget */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-zinc-850 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-200">Download Volume History</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Success and Failure volumes for the last 7 days</p>
                </div>
              </div>
              <DashboardCharts data={chartData} />
            </div>

            {/* Scraper Status Panel */}
            <div className="glass-panel p-6 rounded-2xl border-zinc-850 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200">Scraping Engine Health</h3>
                
                <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Scraper Core:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold ${
                      apiStatus === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'ACTIVE' ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'}`}></span>
                      {apiStatus === 'ACTIVE' ? 'RapidAPI' : 'Mock/Sandbox'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Scraping API Host:</span>
                    <span className="text-zinc-300 font-mono text-[10px] truncate max-w-[150px]">{settings.rapidapi_host || 'None'}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Authentication Key:</span>
                    <span className="text-zinc-300 font-semibold">{settings.hasKey ? 'Configured ✅' : 'Missing ❌'}</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 space-y-2 leading-relaxed">
                  <p className="font-semibold text-zinc-400">Sandbox Mode Behavior:</p>
                  <p>When RapidAPI is not configured or sandbox mode is toggled on, the application intercepts scraping queries and yields instant offline test downloads, bypassing Instagram&apos;s crawler blocking mechanisms.</p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:text-white text-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="h-4 w-4" />
                <span>Configure Scraper API</span>
              </button>
            </div>

            {/* Mini Log Table (Last 5 Logs) */}
            <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border-zinc-850 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-zinc-200">Recent Download Activity</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Quick overview of the latest requests</p>
                </div>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  View All Logs &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-400 pb-2">
                      <th className="py-2.5 font-bold uppercase">Time</th>
                      <th className="py-2.5 font-bold uppercase">Pasted URL</th>
                      <th className="py-2.5 font-bold uppercase">IP Address</th>
                      <th className="py-2.5 font-bold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-zinc-900/60 hover:bg-zinc-950/20 text-zinc-300">
                        <td className="py-3 font-mono text-[10px] text-zinc-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 font-mono truncate max-w-xs pr-4 text-zinc-400" title={log.url}>
                          {log.url}
                        </td>
                        <td className="py-3 font-mono text-zinc-400">{log.ipAddress}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-500">
                          No download attempts logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Activity Logs */}
        {activeTab === 'logs' && (
          <div className="glass-panel p-6 rounded-2xl border-zinc-850 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-zinc-200">System Activity Logs</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Showing the last 100 media download requests</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by IP, URL, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-850 focus:border-rose-500/60 rounded-xl text-zinc-200 placeholder-zinc-500 outline-none text-xs focus:ring-1 focus:ring-rose-500/10 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-3 font-bold uppercase">Timestamp</th>
                    <th className="py-3 font-bold uppercase">Target Instagram URL</th>
                    <th className="py-3 font-bold uppercase">Client IP Address</th>
                    <th className="py-3 font-bold uppercase">Request Status</th>
                    <th className="py-3 font-bold uppercase">Details / Error</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-900 hover:bg-zinc-950/30 text-zinc-300">
                      <td className="py-3.5 font-mono text-[10px] text-zinc-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 font-mono truncate max-w-sm pr-6 text-zinc-400" title={log.url}>
                        {log.url}
                      </td>
                      <td className="py-3.5 font-mono text-zinc-400">{log.ipAddress}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-500 max-w-xs truncate" title={log.errorMsg || 'No errors reported'}>
                        {log.errorMsg || <span className="text-emerald-500/60">Healthy</span>}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        No matching activity log entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Settings Panel */}
        {activeTab === 'settings' && (
          <div className="glass-panel p-6 md:p-8 rounded-2xl border-zinc-850 shadow-lg max-w-2xl mx-auto">
            <div className="space-y-2 mb-6">
              <h3 className="text-base font-bold text-zinc-200">Scraper System Settings</h3>
              <p className="text-[11px] text-zinc-400">Configure connection endpoints and keys used to parse media streams.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {settingsMessage && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                  settingsMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                }`}>
                  {settingsMessage.type === 'success' ? (
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  )}
                  <span>{settingsMessage.text}</span>
                </div>
              )}

              {/* RapidAPI Key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-350 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-zinc-500" />
                  RapidAPI Key
                </label>
                <input
                  type="password"
                  placeholder={settings.hasKey ? '••••••••••••••••••••••••' : 'Enter your RapidAPI Key'}
                  value={settings.rapidapi_key}
                  onChange={(e) => setSettings({ ...settings, rapidapi_key: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-850 focus:border-rose-500/60 rounded-xl text-zinc-200 placeholder-zinc-650 outline-none text-xs focus:ring-1 focus:ring-rose-500/10 transition-all font-mono"
                />
                <p className="text-[10px] text-zinc-500">
                  Required to scraper real videos. Create an account on RapidAPI and look up &quot;Instagram Video Downloader API&quot;.
                </p>
              </div>

              {/* RapidAPI Host */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-355 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-zinc-500" />
                  RapidAPI Host
                </label>
                <input
                  type="text"
                  value={settings.rapidapi_host}
                  onChange={(e) => setSettings({ ...settings, rapidapi_host: e.target.value })}
                  placeholder="instagram-downloader-download-instagram-videos-post-reel-stories.p.rapidapi.com"
                  className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-850 focus:border-rose-500/60 rounded-xl text-zinc-200 placeholder-zinc-600 outline-none text-xs focus:ring-1 focus:ring-rose-500/10 transition-all font-mono"
                />
              </div>

              {/* Sandbox Toggle */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-300">Enable Sandbox/Mock Mode</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-sm">
                    Forces the downloader to immediately output fake success video streams without hitting any scraper APIs. Good for development and testing.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, mock_mode: !settings.mock_mode })}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {settings.mock_mode ? (
                    <ToggleRight className="h-10 w-10 text-rose-500" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-zinc-600" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all duration-150 flex items-center justify-center gap-2"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
