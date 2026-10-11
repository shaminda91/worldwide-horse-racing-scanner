import React from 'react';
import { Bookmark, Trash2, Camera, Trophy, ExternalLink } from 'lucide-react';
import { Language, ScanDetectionResult } from '../types/racing';
import { getTranslation } from '../locales/translations';

interface SavedSlipsViewProps {
  currentLang: Language;
  savedSlips: ScanDetectionResult[];
  onOpenDetail: (slip: ScanDetectionResult) => void;
  onClearHistory: () => void;
  onGoToScanner: () => void;
}

export const SavedSlipsView: React.FC<SavedSlipsViewProps> = ({
  currentLang,
  savedSlips,
  onOpenDetail,
  onClearHistory,
  onGoToScanner,
}) => {
  const t = getTranslation(currentLang);

  return (
    <div className="max-w-3xl mx-auto px-4 py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#34d399]" />
            <span>{t.navSaved}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentLang === 'si'
              ? 'ඔබ විසින් ස්කෑන් කර සුරැකි සියලුම රේස් ටිකට්පත් සහ ප්‍රතිඵල.'
              : 'All your previously scanned betting slips and verified outcomes.'}
          </p>
        </div>

        {savedSlips.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs text-red-200 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {savedSlips.length === 0 ? (
        <div className="bg-[#0b1c14] border border-[#163828] rounded-2xl p-8 text-center flex flex-col items-center justify-center my-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0e2a1e] border border-[#1b5035] flex items-center justify-center mb-3 text-[#34d399]">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {t.noSavedSlips}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {currentLang === 'si'
              ? 'නෙල්සන් කැමරා ස්කෑනරය භාවිතයෙන් ඕනෑම අශ්ව රේස් ටිකට්පතක් photo ගෙන මෙහි සුරකින්න.'
              : 'Scan any ticket or racecard using the camera scanner and tap "Save to My Slips" to store it here.'}
          </p>
          <button
            onClick={onGoToScanner}
            className="px-5 py-2.5 rounded-xl bg-[#0e6245] hover:bg-[#117553] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] border border-[#1b8863]"
          >
            <Camera className="w-4 h-4" />
            <span>{t.openCamera}</span>
          </button>
        </div>
      ) : (
        /* Saved Items List */
        <div className="space-y-2.5">
          {savedSlips.map((slip, index) => {
            const isWinner = slip.finishPosition === 1 || slip.finishStatus === 'WIN';
            const isPlace = slip.finishPosition === 2 || slip.finishPosition === 3;

            return (
              <div
                key={`${slip.detectedHorseName}-${index}`}
                onClick={() => onOpenDetail(slip)}
                className="bg-[#0b1c14] border border-[#163828] hover:border-[#1e4d37] p-3.5 rounded-2xl transition-colors cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isWinner
                        ? 'bg-[#0e6245] text-white'
                        : isPlace
                        ? 'bg-[#1e3a8a] text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Trophy className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">
                        {currentLang === 'si' && slip.detectedHorseNameSi
                          ? slip.detectedHorseNameSi
                          : slip.detectedHorseName}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isWinner ? 'text-[#34d399]' : isPlace ? 'text-[#38bdf8]' : 'text-slate-400'
                        }`}
                      >
                        {isWinner ? t.wonBadge : isPlace ? t.placedBadge : t.lostBadge}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                      <span>{slip.detectedTrack}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300 font-medium">{slip.odds || 'Odds N/A'}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-white font-medium">{slip.margin || 'Finished'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-black font-mono text-[#34d399] tabular-nums">
                    {slip.finishPosition === 1 ? '1st' : slip.finishPosition ? `${slip.finishPosition}th` : '-'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
