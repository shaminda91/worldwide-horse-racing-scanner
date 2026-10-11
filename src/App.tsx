import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RaceCard } from './components/RaceCard';
import { CameraScanner } from './components/CameraScanner';
import { ScanResultModal } from './components/ScanResultModal';
import { TracksView } from './components/TracksView';
import { SavedSlipsView } from './components/SavedSlipsView';
import { WORLDWIDE_RACES } from './data/racingFixtures';
import { Language, RaceFixture, RaceRegion, ScanDetectionResult } from './types/racing';
import { getTranslation } from './locales/translations';
import { Search, Camera, Trophy, Calendar } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nelson_saved_slips_v1';
const LOCAL_STORAGE_LANG = 'nelson_lang_v1';

export default function App() {
  // Language State - defaults to Sinhala ('si') with English toggle
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_LANG);
      if (stored === 'en' || stored === 'si') return stored;
    }
    return 'si';
  });

  const t = getTranslation(currentLang);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('results');

  // Filter State
  const [regionFilter, setRegionFilter] = useState<RaceRegion>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('today');

  // Scanner & Modal State
  const [activeScanResult, setActiveScanResult] = useState<ScanDetectionResult | null>(null);
  const [presetShortcutId, setPresetShortcutId] = useState<string | null>(null);

  // Saved Slips in LocalStorage
  const [savedSlips, setSavedSlips] = useState<ScanDetectionResult[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  const toggleLanguage = () => {
    const next = currentLang === 'si' ? 'en' : 'si';
    setCurrentLang(next);
    localStorage.setItem(LOCAL_STORAGE_LANG, next);
  };

  const handleSaveSlip = (slip: ScanDetectionResult) => {
    const alreadySaved = savedSlips.some(
      (s) => s.detectedHorseName === slip.detectedHorseName && s.detectedTrack === slip.detectedTrack
    );
    if (!alreadySaved) {
      const updated = [slip, ...savedSlips];
      setSavedSlips(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleClearHistory = () => {
    setSavedSlips([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleScanRaceShortcut = (race: RaceFixture) => {
    if (race.id.includes('ascot')) setPresetShortcutId('sample-ascot');
    else if (race.id.includes('nuwara')) setPresetShortcutId('sample-nuwara-eliya');
    else if (race.id.includes('melbourne')) setPresetShortcutId('sample-melbourne');
    else if (race.id.includes('derby')) setPresetShortcutId('sample-derby');
    else if (race.id.includes('dubai')) setPresetShortcutId('sample-dubai');
    else if (race.id.includes('hong-kong') || race.id.includes('shatin')) setPresetShortcutId('sample-hksar');
    else setPresetShortcutId(null);

    setActiveTab('scanner');
  };

  // Filter Races
  const filteredRaces = WORLDWIDE_RACES.filter((race) => {
    if (regionFilter !== 'all' && race.region !== regionFilter) return false;
    if (statusFilter !== 'ALL' && race.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrack = race.track.toLowerCase().includes(q) || race.trackSi.toLowerCase().includes(q);
      const matchRace = race.name.toLowerCase().includes(q) || race.nameSi.toLowerCase().includes(q);
      const matchHorse = race.runners.some(
        (r) => r.horseName.toLowerCase().includes(q) || r.horseNameSi.toLowerCase().includes(q)
      );
      const matchJockey = race.runners.some((r) => r.jockey.toLowerCase().includes(q));
      if (!matchTrack && !matchRace && !matchHorse && !matchJockey) return false;
    }

    return true;
  });

  const regions: { id: RaceRegion; labelEn: string; labelSi: string; flag: string }[] = [
    { id: 'all', labelEn: 'All Tracks', labelSi: 'සියලු පථ', flag: '🌍' },
    { id: 'south_asia', labelEn: 'Sri Lanka (RTC)', labelSi: 'ශ්‍රී ලංකාව (RTC)', flag: '🇱🇰' },
    { id: 'uk_ire', labelEn: 'UK & Ireland', labelSi: 'එක්සත් රාජධානිය', flag: '🇬🇧' },
    { id: 'usa', labelEn: 'USA (Derby)', labelSi: 'ඇමරිකාව', flag: '🇺🇸' },
    { id: 'aus_nz', labelEn: 'Australia (Cup)', labelSi: 'ඕස්ට්‍රේලියාව', flag: '🇦🇺' },
    { id: 'dubai', labelEn: 'Dubai (Meydan)', labelSi: 'ඩුබායි', flag: '🇦🇪' },
    { id: 'hk_japan', labelEn: 'Hong Kong & Japan', labelSi: 'හොංකොං & ජපානය', flag: '🇭🇰' },
  ];

  return (
    <div className="min-h-screen bg-[#08140e] text-slate-100 flex flex-col selection:bg-[#0e6245] selection:text-white">
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto pb-24 md:pb-12 pt-3">
        {/* TAB 1: RESULTS & LIVE RACING */}
        {activeTab === 'results' && (
          <div className="space-y-4 px-4">
            {/* Native Mobile Date Bar (Styled like SaddlePro in Image 2) */}
            <div className="bg-[#0b1c14] border border-[#163828] rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setSelectedDate('today')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedDate === 'today'
                      ? 'bg-[#0e6245] text-white shadow-sm border border-[#1b8863]'
                      : 'bg-[#0e241b] text-slate-300 hover:bg-[#143326]'
                  }`}
                >
                  {currentLang === 'si' ? 'අද (TODAY)' : 'TODAY'}
                </button>
                <button
                  onClick={() => setSelectedDate('yesterday')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDate === 'yesterday'
                      ? 'bg-[#0e6245] text-white shadow-sm border border-[#1b8863]'
                      : 'bg-[#0e241b] text-slate-300 hover:bg-[#143326]'
                  }`}
                >
                  {currentLang === 'si' ? 'ඊයේ (RESULTS)' : 'YESTERDAY'}
                </button>
                <button
                  onClick={() => setSelectedDate('tomorrow')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDate === 'tomorrow'
                      ? 'bg-[#0e6245] text-white shadow-sm border border-[#1b8863]'
                      : 'bg-[#0e241b] text-slate-300 hover:bg-[#143326]'
                  }`}
                >
                  {currentLang === 'si' ? 'ඉදිරි (CARDS)' : 'TOMORROW'}
                </button>
              </div>

              {/* Quick Camera Snapshot Button on Date Bar */}
              <button
                onClick={() => setActiveTab('scanner')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {currentLang === 'si' ? 'ටිකට් ස්කෑන්' : 'Scan Slip'}
                </span>
              </button>
            </div>

            {/* Simple Sports App Live Info Strip (Clean & Non-AI) */}
            <div className="bg-[#0b1c14] border border-[#163828] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#34d399] mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Nelson Sporting Star · Worldwide Results</span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-white">
                  {currentLang === 'si'
                    ? 'ලෝක අශ්ව රේස් සජීවී ප්‍රතිඵල සහ ටිකට්පත් ස්කෑනරය'
                    : 'Global Live Horse Racing Results & Instant Ticket Verification'}
                </h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('scanner');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0e6245] hover:bg-[#117553] text-white font-bold text-xs flex items-center gap-2 transition-colors border border-[#1b8863] cursor-pointer shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.modeGallery} (Scan Photos)</span>
                </button>
              </div>
            </div>

            {/* Live Search Bar (Simple & Clean) */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#0b1c14] border border-[#163828] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#0e6245] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Region Filter Bar (Clean solid buttons) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setRegionFilter(reg.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 min-h-[36px] ${
                    regionFilter === reg.id
                      ? 'bg-[#0e6245] text-white font-bold border border-[#1b8863]'
                      : 'bg-[#0b1c14] hover:bg-[#102b1f] text-slate-300 border border-[#163828]'
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{currentLang === 'si' ? reg.labelSi : reg.labelEn}</span>
                </button>
              ))}
            </div>

            {/* Status Tabs (All / Official Results / Live) */}
            <div className="flex items-center justify-between gap-2 border-b border-[#163828] pb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-[#0e6245] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {currentLang === 'si' ? 'සියල්ල' : 'All'}
                </button>
                <button
                  onClick={() => setStatusFilter('FINISHED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'FINISHED'
                      ? 'bg-[#0e6245] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.statusFinished}
                </button>
                <button
                  onClick={() => setStatusFilter('LIVE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'LIVE'
                      ? 'bg-[#1d4ed8] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.statusLive}
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {filteredRaces.length} {currentLang === 'si' ? 'තරඟ' : 'Courses'}
              </span>
            </div>

            {/* Races List (Clean sports card layout) */}
            {filteredRaces.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-[#0b1c14] rounded-2xl border border-[#163828] p-6">
                <Trophy className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs sm:text-sm">
                  {currentLang === 'si'
                    ? 'මෙම සෙවුමට ගැලපෙන තරඟ හමු නොවීය.'
                    : 'No racing fixtures matched your filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRaces.map((race) => (
                  <RaceCard
                    key={race.id}
                    race={race}
                    currentLang={currentLang}
                    onScanRaceShortcut={handleScanRaceShortcut}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAMERA SCANNER */}
        {activeTab === 'scanner' && (
          <div className="py-1">
            <CameraScanner
              currentLang={currentLang}
              onScanComplete={(result) => setActiveScanResult(result)}
              presetSampleId={presetShortcutId}
            />
          </div>
        )}

        {/* TAB 3: TRACKS EXPLORER */}
        {activeTab === 'tracks' && (
          <TracksView
            currentLang={currentLang}
            onSelectTrack={(trackName) => {
              setSearchQuery(trackName);
              setActiveTab('results');
            }}
          />
        )}

        {/* TAB 4: SAVED SLIPS */}
        {activeTab === 'saved' && (
          <SavedSlipsView
            currentLang={currentLang}
            savedSlips={savedSlips}
            onOpenDetail={(slip) => setActiveScanResult(slip)}
            onClearHistory={handleClearHistory}
            onGoToScanner={() => setActiveTab('scanner')}
          />
        )}
      </main>

      {/* Verified Scan Outcome Modal */}
      {activeScanResult && (
        <ScanResultModal
          result={activeScanResult}
          currentLang={currentLang}
          onClose={() => setActiveScanResult(null)}
          onSave={handleSaveSlip}
          isSaved={savedSlips.some(
            (s) =>
              s.detectedHorseName === activeScanResult.detectedHorseName &&
              s.detectedTrack === activeScanResult.detectedTrack
          )}
        />
      )}

      {/* Mobile Ergonomic Bottom Navigation */}
      <BottomNav
        currentLang={currentLang}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setPresetShortcutId(null);
          setActiveTab(tab);
        }}
        savedCount={savedSlips.length}
      />
    </div>
  );
}
