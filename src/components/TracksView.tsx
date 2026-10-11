import React, { useState } from 'react';
import { MapPin, Trophy, Compass } from 'lucide-react';
import { Language } from '../types/racing';

interface TracksViewProps {
  currentLang: Language;
  onSelectTrack: (trackName: string) => void;
}

interface TrackInfo {
  id: string;
  name: string;
  nameSi: string;
  country: string;
  flag: string;
  city: string;
  surface: string;
  signatureRace: string;
  signatureRaceSi: string;
  length: string;
  established: number;
  highlight: string;
  highlightSi: string;
}

const GLOBAL_TRACKS: TrackInfo[] = [
  {
    id: 'nuwara-eliya',
    name: 'Nuwara Eliya Racecourse (Royal Turf Club)',
    nameSi: 'නුවරඑළිය රාජකීය තුරඟ තරඟ පිටිය (RTC)',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    city: 'Nuwara Eliya (1,868m altitude)',
    surface: 'Lush Mountain Turf',
    signatureRace: 'Governor\'s Cup Sri Lanka',
    signatureRaceSi: 'ශ්‍රී ලංකා ආණ්ඩුකාර කුසලානය',
    length: '1,800m',
    established: 1875,
    highlight: 'One of the highest and oldest active turf courses in South Asia, nestled in the misty central tea highlands.',
    highlightSi: 'මධ්‍යම කඳුකරයේ පිහිටි දකුණු ආසියාවේ ඉපැරණිම හා උසින් වැඩිම ඓතිහාසික තුරඟ තරඟ පිටියකි.'
  },
  {
    id: 'ascot',
    name: 'Ascot Racecourse',
    nameSi: 'ඇස්කොට් ධාවන පථය',
    country: 'United Kingdom',
    flag: '🇬🇧',
    city: 'Berkshire, England',
    surface: 'Right-handed Turf',
    signatureRace: 'Royal Ascot Gold Cup',
    signatureRaceSi: 'රෝයල් ඇස්කොට් ගෝල්ඩ් කුසලානය',
    length: '2,800m triangle',
    established: 1711,
    highlight: 'Founded by Queen Anne; the pinnacle of European thoroughbred flat racing with the prestigious Royal Meeting.',
    highlightSi: 'බ්‍රිතාන්‍ය රාජකීය සම්ප්‍රදායේ අග්‍රගන්‍ය යුරෝපීය තුරඟ තරඟ මධ්‍යස්ථානය.'
  },
  {
    id: 'flemington',
    name: 'Flemington Racecourse',
    nameSi: 'ෆ්ලෙමින්ටන් ධාවන පථය',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Melbourne, Victoria',
    surface: 'Left-handed Turf',
    signatureRace: 'Lexus Melbourne Cup (3,200m)',
    signatureRaceSi: 'මෙල්බර්න් කුසලාන තරඟය (3,200m)',
    length: '2,312m pear-shaped',
    established: 1840,
    highlight: 'Home to the "race that stops a nation", renowned for its 1,200m straight six course.',
    highlightSi: 'ඕස්ට්‍රේලියානු ජාතියම නරඹන සුප්‍රකට මෙල්බර්න් කුසලාන තරඟයේ නිජබිම.'
  },
  {
    id: 'churchill',
    name: 'Churchill Downs',
    nameSi: 'චර්චිල් ඩවුන්ස් ධාවන පථය',
    country: 'United States',
    flag: '🇺🇸',
    city: 'Louisville, Kentucky',
    surface: 'Dirt & Turf',
    signatureRace: 'Kentucky Derby (Run for the Roses)',
    signatureRaceSi: 'කෙන්ටකි ඩර්බි (Kentucky Derby)',
    length: '1 mile oval',
    established: 1875,
    highlight: 'Iconic Twin Spires hosting the most exciting two minutes in sports and the first jewel of the American Triple Crown.',
    highlightSi: 'ඇමරිකානු ත්‍රිත්ව කිරුළේ ප්‍රමුඛතම හා වඩාත්ම උද්වේගකර කෙන්ටකි ඩර්බි තරඟයේ නිජබිම.'
  },
  {
    id: 'meydan',
    name: 'Meydan Racecourse',
    nameSi: 'මෙයිදාන් ධාවන පථය (Meydan)',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    city: 'Dubai',
    surface: 'Dirt & Turf',
    signatureRace: 'Dubai World Cup ($12M)',
    signatureRaceSi: 'ඩුබායි වර්ල්ඩ් කුසලානය (ඩොලර් මිලියන 12)',
    length: '2,400m Turf / 1,750m Dirt',
    established: 2010,
    highlight: 'World\'s most opulent grandstand accommodating over 60,000 spectators and richest global prize purses.',
    highlightSi: 'ලොව ඉහළම ත්‍යාග මුදල් පිරිනමන අතිනවීන හා අලංකාර ඩුබායි මෙයිදාන් ධාවන පථය.'
  },
  {
    id: 'shatin',
    name: 'Sha Tin Racecourse',
    nameSi: 'ෂා ටින් ධාවන පථය (Sha Tin)',
    country: 'Hong Kong',
    flag: '🇭🇰',
    city: 'New Territories, Hong Kong',
    surface: 'Turf & All-Weather',
    signatureRace: 'Longines Hong Kong International Races',
    signatureRaceSi: 'හොංකොං ජාත්‍යන්තර කුසලාන තරඟාවලිය',
    length: '1,899m Turf',
    established: 1978,
    highlight: 'The epicenter of world-class Asian racing managed by the Hong Kong Jockey Club with electrifying atmosphere.',
    highlightSi: 'ආසියාවේ විශිෂ්ටතම තුරඟ තරඟ පැවැත්වෙන හොංකොං ජොකී ක්ලබ් මූලස්ථානය.'
  }
];

export const TracksView: React.FC<TracksViewProps> = ({
  currentLang,
  onSelectTrack,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const filtered = selectedCountry === 'all'
    ? GLOBAL_TRACKS
    : GLOBAL_TRACKS.filter((t) => t.country === selectedCountry);

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-4">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5 text-[#34d399]" />
          <span>{currentLang === 'si' ? 'ලෝක ප්‍රමුඛ තුරඟ ධාවන පථ' : 'Premier Global Racecourses'}</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {currentLang === 'si'
            ? 'ශ්‍රී ලංකාවේ නුවරඑළිය ඇතුළු ලෝකයේ ප්‍රකට ධාවන පථයන්හි තොරතුරු, මතුපිට ස්වභාවය සහ ප්‍රධාන කුසලාන තරඟ.'
            : 'Explore world-renowned racecourses from Sri Lanka\'s RTC to Ascot, Flemington, Churchill Downs, and Meydan.'}
        </p>
      </div>

      {/* Country Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCountry('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            selectedCountry === 'all'
              ? 'bg-[#0e6245] text-white border border-[#1b8863]'
              : 'bg-[#0b1c14] text-slate-300 hover:bg-[#102b1f] border border-[#163828]'
          }`}
        >
          {currentLang === 'si' ? 'සියලු රටවල්' : 'All Countries'}
        </button>
        {['Sri Lanka', 'United Kingdom', 'Australia', 'United States', 'United Arab Emirates', 'Hong Kong'].map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCountry === country
                ? 'bg-[#0e6245] text-white font-bold border border-[#1b8863]'
                : 'bg-[#0b1c14] text-slate-300 hover:bg-[#102b1f] border border-[#163828]'
            }`}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Tracks Grid (Clean native sports cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((track) => (
          <div
            key={track.id}
            className="bg-[#0b1c14] border border-[#163828] rounded-2xl p-4 transition-colors hover:border-[#1e4d37] flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{track.flag}</span>
                  <span className="font-bold text-white">{track.country}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span>Est. {track.established}</span>
                </div>
                <span className="text-[11px] font-mono text-[#38bdf8] font-bold">
                  {track.length}
                </span>
              </div>

              {/* Track Name */}
              <h3 className="text-base font-bold text-white tracking-tight mb-1">
                {currentLang === 'si' ? track.nameSi : track.name}
              </h3>

              {/* City & Surface */}
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span>{track.city}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{track.surface}</span>
              </div>

              {/* Signature Feature */}
              <div className="bg-[#07150e] p-3 rounded-xl border border-[#163828] mb-3">
                <div className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>{currentLang === 'si' ? 'ප්‍රධාන තරඟය' : 'Signature Trophy Race'}</span>
                </div>
                <div className="text-xs font-bold text-white">
                  {currentLang === 'si' ? track.signatureRaceSi : track.signatureRace}
                </div>
              </div>

              {/* Editorial Highlight */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLang === 'si' ? track.highlightSi : track.highlight}
              </p>
            </div>

            {/* Action button */}
            <div className="pt-3 mt-3 border-t border-[#163828]">
              <button
                onClick={() => onSelectTrack(track.name)}
                className="w-full py-2 px-3 rounded-xl bg-[#0e2a1e] hover:bg-[#143929] border border-[#1d4d38] text-xs font-bold text-white transition-colors cursor-pointer text-center"
              >
                {currentLang === 'si' ? 'මෙම පථයේ ප්‍රතිඵල බලන්න' : 'View Fixtures & Results for this Track'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
