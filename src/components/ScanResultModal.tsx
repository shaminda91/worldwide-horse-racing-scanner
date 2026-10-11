import React, { useState } from 'react';
import { Trophy, X, Check, Bookmark, ArrowRight, Calculator } from 'lucide-react';
import { Language, ScanDetectionResult } from '../types/racing';
import { getTranslation } from '../locales/translations';

interface ScanResultModalProps {
  result: ScanDetectionResult;
  currentLang: Language;
  onClose: () => void;
  onSave: (result: ScanDetectionResult) => void;
  isSaved: boolean;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  result,
  currentLang,
  onClose,
  onSave,
  isSaved,
}) => {
  const t = getTranslation(currentLang);
  const isWinner = result.finishPosition === 1 || result.finishStatus === 'WIN';
  const isPlace = result.finishPosition === 2 || result.finishPosition === 3 || result.finishStatus === 'PLACE';

  // Interactive Bet Stake Calculator
  const [customStake, setCustomStake] = useState<number>(20);
  const decimalOdds = parseFloat(result.odds?.replace(/[^0-9.]/g, '') || '3.5') || 3.5;
  const calculatedReturn = (customStake * decimalOdds).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b1c14] border border-[#163828] rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-[#163828] flex items-center justify-between bg-[#08150f]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.scanResultHeading}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="w-8 h-8 rounded-full bg-[#0e2a1e] hover:bg-[#143929] text-slate-300 flex items-center justify-center cursor-pointer transition-colors border border-[#1b5035]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Winner Banner / Status Card (Solid sports color, no AI gradients) */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isWinner
                ? 'bg-[#0e6245] border-[#1b8863] text-white'
                : isPlace
                ? 'bg-[#1e3a8a] border-[#2563eb] text-white'
                : 'bg-[#0f172a] border-[#1e293b] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isWinner
                    ? 'bg-white text-[#0e6245]'
                    : isPlace
                    ? 'bg-white text-[#1e3a8a]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Trophy className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  {isWinner ? t.wonBadge : isPlace ? t.placedBadge : t.lostBadge}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentLang === 'si' && result.detectedHorseNameSi
                    ? result.detectedHorseNameSi
                    : result.detectedHorseName}
                </h4>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black font-mono tabular-nums text-white">
                {result.finishPosition === 1
                  ? '1st'
                  : result.finishPosition === 2
                  ? '2nd'
                  : result.finishPosition === 3
                  ? '3rd'
                  : result.finishPosition
                  ? `${result.finishPosition}th`
                  : 'N/A'}
              </span>
              <div className="text-[10px] text-emerald-100">
                {t.finishPosition}
              </div>
            </div>
          </div>

          {/* Race Metadata Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#07150e] p-3 rounded-xl border border-[#163828]">
              <div className="text-[10px] text-slate-400 mb-0.5">{t.detectedTrack}</div>
              <div className="text-xs font-bold text-white truncate">
                {currentLang === 'si' && result.detectedTrackSi ? result.detectedTrackSi : result.detectedTrack}
              </div>
            </div>
            <div className="bg-[#07150e] p-3 rounded-xl border border-[#163828]">
              <div className="text-[10px] text-slate-400 mb-0.5">{t.odds}</div>
              <div className="text-xs font-bold font-mono text-[#38bdf8]">
                {result.odds || '3.50'}
              </div>
            </div>
            <div className="bg-[#07150e] p-3 rounded-xl border border-[#163828]">
              <div className="text-[10px] text-slate-400 mb-0.5">{t.margin}</div>
              <div className="text-xs font-bold text-[#34d399]">
                {result.margin || 'Official'}
              </div>
            </div>
            <div className="bg-[#07150e] p-3 rounded-xl border border-[#163828]">
              <div className="text-[10px] text-slate-400 mb-0.5">{t.jockey}</div>
              <div className="text-xs font-bold text-white truncate">
                {result.jockey || 'Ryan Moore'}
              </div>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="bg-[#07150e] p-3.5 rounded-xl border border-[#163828]">
            <div className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <span>{t.explanationTitle}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {currentLang === 'si' ? result.sinhalaExplanation : result.englishExplanation}
            </p>
            {result.extractedRawText && (
              <div className="mt-2 pt-2 border-t border-[#163828] text-[10px] text-slate-400 font-mono">
                <span className="text-[#34d399]">Text: </span>
                {result.extractedRawText}
              </div>
            )}
          </div>

          {/* Interactive Bet Stake / Return Calculator */}
          <div className="bg-[#07150e] p-3.5 rounded-xl border border-[#163828]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Calculator className="w-3.5 h-3.5 text-[#34d399]" />
                <span>{t.dividendCalc}</span>
              </div>
              <span className="text-xs font-mono text-slate-300">
                Odds: {result.odds}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2.5">
              {[10, 20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCustomStake(amt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                    customStake === amt
                      ? 'bg-[#0e6245] text-white border border-[#1b8863]'
                      : 'bg-[#0d2218] text-slate-300 hover:bg-[#123022]'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#163828]">
              <span className="text-xs text-slate-400">
                {currentLang === 'si' ? 'ගණනය කළ මුළු ගෙවීම' : 'Total Estimated Return'}:
              </span>
              <span className="text-base font-bold font-mono text-[#34d399] tabular-nums">
                ${calculatedReturn}
              </span>
            </div>
          </div>

          {/* Complete Finishing Field */}
          {result.fullRunners && result.fullRunners.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-white">
                {t.fullField}
              </div>
              <div className="bg-[#07150e] rounded-xl border border-[#163828] divide-y divide-[#163828]">
                {result.fullRunners.map((runner) => (
                  <div
                    key={runner.number}
                    className="p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 font-mono font-bold text-white">
                        {runner.finishPosition ? `${runner.finishPosition}.` : '-'}
                      </span>
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: runner.silkColor }}
                      />
                      <span className="font-semibold text-white">
                        {currentLang === 'si' ? runner.horseNameSi : runner.horseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-slate-300">
                      <span>{runner.odds}</span>
                      <span className="text-[#34d399] font-bold">{runner.margin || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Action Controls */}
        <div className="p-3.5 bg-[#08150f] border-t border-[#163828] flex items-center gap-2.5">
          <button
            onClick={() => onSave(result)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] ${
              isSaved
                ? 'bg-[#0f2c1f] text-emerald-200 border border-[#1c553c]'
                : 'bg-[#0e2a1e] hover:bg-[#143929] text-white border border-[#1d4d38]'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>{t.savedSuccessfully}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-[#38bdf8]" />
                <span>{t.saveToHistory}</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0e6245] hover:bg-[#117553] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] border border-[#1b8863]"
          >
            <span>{t.scanAnother}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
