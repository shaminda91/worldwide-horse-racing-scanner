import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Image, Upload, Zap, AlertCircle, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { Language, PresetSampleSlip, ScanDetectionResult } from '../types/racing';
import { PRESET_SAMPLE_SLIPS } from '../data/racingFixtures';
import { getTranslation } from '../locales/translations';
import { sfx } from '../utils/audio';
import { processPhonePhoto } from '../utils/imageCompressor';

interface CameraScannerProps {
  currentLang: Language;
  onScanComplete: (result: ScanDetectionResult) => void;
  presetSampleId?: string | null;
  initialMode?: 'camera' | 'gallery';
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  currentLang,
  onScanComplete,
  presetSampleId,
  initialMode = 'gallery', // Default to phone photos as requested by user
}) => {
  const t = getTranslation(currentLang);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const directCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Scanner Mode: 'camera' (Live WebRTC) or 'gallery' (Phone Photos)
  const [scanMode, setScanMode] = useState<'camera' | 'gallery'>(initialMode);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Phone photo preview state
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<PresetSampleSlip | null>(null);

  // Auto-trigger if a preset was passed
  useEffect(() => {
    if (presetSampleId) {
      const found = PRESET_SAMPLE_SLIPS.find((p) => p.id === presetSampleId);
      if (found) {
        handleTriggerSample(found);
      }
    }
  }, [presetSampleId]);

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access denied or error:', err);
      setCameraError(t.cameraPermissionError);
      setCameraActive(false);
      // Automatically switch to Phone Gallery mode if camera fails
      setScanMode('gallery');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Toggle Torch if supported
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      const capabilities: any = track.getCapabilities?.() || {};
      if (capabilities.torch) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch {}
      } else {
        setTorchOn(!torchOn);
      }
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame and process
  const captureAndScan = async () => {
    if (!videoRef.current || isScanning) return;

    sfx.playShutter();
    setIsScanning(true);
    setScanStep(1);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      await executeScanApi({ imageBase64: dataUrl, mimeType: 'image/jpeg' });
    } catch (err: any) {
      console.error('Scan error:', err);
      setIsScanning(false);
    }
  };

  // Handle Photo Selection from Phone's Photos / Gallery
  const handlePhonePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      sfx.playShutter();
      setIsScanning(true);
      setScanStep(1);

      setSelectedPhotoName(file.name);

      // Process and compress large phone camera photos to crisp 1280px
      const { dataUrl, mimeType } = await processPhonePhoto(file);
      setSelectedPhotoUrl(dataUrl);

      // Immediately execute scanning API
      await executeScanApi({ imageBase64: dataUrl, mimeType });
    } catch (err) {
      console.error('Error processing phone photo:', err);
      setIsScanning(false);
    }
  };

  // Trigger Preset Sample Slip
  const handleTriggerSample = async (sample: PresetSampleSlip) => {
    setSelectedPreset(sample);
    setSelectedPhotoUrl(null);
    sfx.playShutter();
    setIsScanning(true);
    setScanStep(1);

    await executeScanApi({
      sampleId: sample.id,
      clientLang: currentLang,
    });
  };

  // Send to server API
  const executeScanApi = async (payload: any) => {
    try {
      sfx.playScanBlip();
      setTimeout(() => setScanStep(2), 500);
      setTimeout(() => setScanStep(3), 1000);

      const response = await fetch('/api/scan-race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ScanDetectionResult = await response.json();

      setTimeout(() => {
        setIsScanning(false);
        setScanStep(0);
        if (data.finishStatus === 'WIN') {
          sfx.playFanfare();
        } else {
          sfx.playScanBlip();
        }
        onScanComplete(data);
      }, 1400);
    } catch (err) {
      console.error('API call failed, fallback used:', err);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden file input for Phone Gallery / Photos */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhonePhotoUpload}
        className="hidden"
      />

      {/* Hidden file input for direct phone camera capture fallback */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhonePhotoUpload}
        className="hidden"
      />

      {/* Mode Selector Tabs (Phone Photos vs Live Camera) */}
      <div className="w-full max-w-md px-4 mb-3">
        <div className="grid grid-cols-2 p-1 bg-[#0b1c14] border border-[#163828] rounded-xl text-xs font-bold">
          <button
            onClick={() => {
              setScanMode('gallery');
              stopCamera();
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              scanMode === 'gallery'
                ? 'bg-[#0e6245] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>{t.modeGallery}</span>
          </button>
          <button
            onClick={() => {
              setScanMode('camera');
              startCamera();
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-[#0e6245] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.modeCamera}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: PHONE PHOTOS / GALLERY (Prominent & Easy) */}
      {scanMode === 'gallery' && (
        <div className="w-full max-w-md px-4 space-y-3">
          {/* Large Tap to Upload Phone Photo Box */}
          <div
            onClick={() => galleryInputRef.current?.click()}
            className="w-full aspect-[4/3] bg-[#0b1c14] border-2 border-dashed border-[#1e4d37] hover:border-[#34d399] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden"
          >
            {/* If a photo was already selected, show preview */}
            {selectedPhotoUrl ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={selectedPhotoUrl}
                  alt="Selected racing slip"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <span className="text-xs font-bold text-white bg-[#0e6245] px-3 py-1.5 rounded-lg border border-[#1b8863]">
                    {t.changePhoto}
                  </span>
                </div>
              </div>
            ) : (
              /* Default Upload Prompt */
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-16 h-16 rounded-2xl bg-[#0e2a1e] border border-[#1b5035] flex items-center justify-center text-[#34d399] group-hover:scale-105 transition-transform shadow-inner">
                  <Image className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">
                    {t.selectFromPhone}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                    {t.dropOrTapPhone}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e6245] hover:bg-[#117553] text-white text-xs font-bold border border-[#1b8863] shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{currentLang === 'si' ? 'Photos ගොනුව විවෘත කරන්න' : 'Open Photo Library'}</span>
                </div>
              </div>
            )}

            {/* Scanning Progress Overlay inside gallery box */}
            {isScanning && (
              <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-900 border-t-[#34d399] animate-spin mb-3" />
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {t.scanningInProgress}
                </h3>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${scanStep >= 1 ? 'text-[#34d399]' : 'text-slate-600'}`}
                    />
                    <span>{t.detectingElements}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${scanStep >= 2 ? 'text-[#38bdf8]' : 'text-slate-600'}`}
                    />
                    <span>{t.verifyingResult}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons for Phone Photos */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0e2a1e] hover:bg-[#143929] border border-[#1d4d38] text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <Image className="w-4 h-4 text-[#38bdf8]" />
              <span>{t.selectFromPhone}</span>
            </button>

            <button
              onClick={() => directCameraInputRef.current?.click()}
              className="py-2.5 px-4 rounded-xl bg-[#0b1c14] hover:bg-[#102b1f] border border-[#163828] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <Camera className="w-4 h-4 text-[#34d399]" />
              <span>{currentLang === 'si' ? 'කැමරා Snapshot' : 'Camera Snap'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: LIVE WEBRTC CAMERA SCANNER */}
      {scanMode === 'camera' && (
        <div className="w-full max-w-md mx-auto px-4">
          <div className="relative w-full aspect-[4/5] sm:aspect-square bg-black rounded-2xl overflow-hidden border border-[#163828] flex flex-col justify-between p-4">
            {/* Real Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Idle Camera Placeholder if camera not active */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#07150e]">
                <div className="w-16 h-16 rounded-2xl bg-[#0b2417] border border-[#16422b] flex items-center justify-center mb-3 text-[#34d399]">
                  <Camera className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h2 className="text-base font-bold text-white mb-1">
                  {currentLang === 'si' ? 'සජීවී කැමරාව' : 'Live Camera Viewfinder'}
                </h2>
                <p className="text-xs text-slate-300 max-w-xs mb-4">
                  {currentLang === 'si'
                    ? 'රේස් ටිකට්පතක් ස්කෑන් කිරීමට කැමරාව ආරම්භ කරන්න.'
                    : 'Capture live photo of any bet ticket, racecard, or horse name.'}
                </p>
                <button
                  onClick={() => startCamera()}
                  className="px-5 py-2.5 rounded-xl bg-[#0e6245] hover:bg-[#117553] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] border border-[#1b8863]"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.openCamera}</span>
                </button>

                {cameraError && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 bg-[#092015] px-3 py-2 rounded-lg border border-[#1b5035]">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#34d399]" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Viewfinder Target Framing Brackets */}
            <div className="absolute inset-6 pointer-events-none z-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-7 h-7 border-t-2 border-l-2 border-white rounded-tl-sm" />
                <div className="w-7 h-7 border-t-2 border-r-2 border-white rounded-tr-sm" />
              </div>

              <div className="text-center">
                <span className="text-[11px] font-medium text-white bg-black/75 px-3 py-1 rounded border border-[#1b5035]">
                  {currentLang === 'si' ? 'ටිකට්පත මෙතැනට යොමු කරන්න' : 'Align Ticket within Frame'}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="w-7 h-7 border-b-2 border-l-2 border-white rounded-bl-sm" />
                <div className="w-7 h-7 border-b-2 border-r-2 border-white rounded-tr-sm" />
              </div>

              {cameraActive && (
                <div className="absolute left-0 right-0 h-0.5 bg-[#34d399] animate-scan-guide" />
              )}
            </div>

            {/* Top HUD Controls */}
            {cameraActive && (
              <div className="relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTorch}
                    aria-label="Toggle Torch"
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      torchOn ? 'bg-[#0e6245] text-white' : 'bg-black/60 text-white hover:bg-black/80 border border-slate-700'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleFacingMode}
                    aria-label="Switch Camera"
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-slate-700 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  {t.stopCamera}
                </button>
              </div>
            )}

            {/* Bottom HUD Camera Triggers */}
            {cameraActive && (
              <div className="relative z-20 flex items-center justify-center pb-2">
                <button
                  onClick={captureAndScan}
                  disabled={isScanning}
                  aria-label="Capture & Scan Ticket"
                  className="w-16 h-16 rounded-full bg-[#0e6245] hover:bg-[#117553] text-white border-4 border-white shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-7 h-7 stroke-[2.2]" />
                </button>
              </div>
            )}

            {/* Active Scanning Progress Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-3 border-emerald-900 border-t-[#34d399] animate-spin mb-4" />
                <h3 className="text-sm font-bold text-white mb-2">
                  {t.scanningInProgress}
                </h3>
                <div className="space-y-1 max-w-xs text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${scanStep >= 1 ? 'text-[#34d399]' : 'text-slate-600'}`}
                    />
                    <span>{t.detectingElements}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${scanStep >= 2 ? 'text-[#38bdf8]' : 'text-slate-600'}`}
                    />
                    <span>{t.verifyingResult}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Realistic Sample Racing Slips */}
      <div className="w-full max-w-md mx-auto mt-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            {t.orTrySample}
          </span>
          <span className="text-[10px] text-[#34d399] font-bold">
            {currentLang === 'si' ? '1-ක්ලික් පරීක්ෂාව' : 'Instant 1-Tap Test'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {PRESET_SAMPLE_SLIPS.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleTriggerSample(sample)}
              disabled={isScanning}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer min-h-[64px] flex flex-col justify-between ${
                selectedPreset?.id === sample.id
                  ? 'bg-[#0f2c1f] border-[#1c553c] text-white'
                  : 'bg-[#0b1c14] hover:bg-[#102b1f] border-[#163828] text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white truncate">
                  {currentLang === 'si' ? sample.horseNameSi : sample.horseName}
                </span>
                <FileText className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                {currentLang === 'si' ? sample.titleSi : sample.title}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sample.track}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
