import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings, Music, Sparkles, Mic, Trash2, Save, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { playSound } from '../utils';

// ==========================================
// Simple IndexedDB Wrapper for Custom Lesson Recordings
// ==========================================
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = indexedDB.open('LessonAudioDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getRecording = async (lessonId: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('recordings', 'readonly');
      const store = transaction.objectStore('recordings');
      const request = store.get(lessonId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB get error:', err);
    return null;
  }
};

const saveRecording = async (lessonId: string, blob: Blob): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('recordings', 'readwrite');
      const store = transaction.objectStore('recordings');
      const request = store.put(blob, lessonId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB save error:', err);
  }
};

const deleteRecording = async (lessonId: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('recordings', 'readwrite');
      const store = transaction.objectStore('recordings');
      const request = store.delete(lessonId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB delete error:', err);
  }
};

interface AudioPlayerProps {
  textToRead: string;
  title: string;
  lessonId?: string; // Unique lesson ID to map custom user recordings
  audioUrl?: string; // Predefined recording URL
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export default function AudioPlayer({ textToRead, title, lessonId, audioUrl, onBoundary, onEnd, onStart }: AudioPlayerProps) {
  // Sound mode: 'tts' (text-to-speech auto), 'file' (provided mp3), 'user' (user's custom recorded voice)
  const [mode, setMode] = useState<'tts' | 'file' | 'user'>(audioUrl ? 'file' : 'tts');
  
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(0.85); // slower rate is better for kids
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Pre-recorded mp3 file audio state
  const [fileIsPlaying, setFileIsPlaying] = useState(false);
  const [fileDuration, setFileDuration] = useState(0);
  const [fileCurrentTime, setFileCurrentTime] = useState(0);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // User recording audio playback state
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [userIsPlaying, setUserIsPlaying] = useState(false);
  const [userDuration, setUserDuration] = useState(0);
  const [userCurrentTime, setUserCurrentTime] = useState(0);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recording feature state
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  // Clean-up refs on unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const arabicVoices = availableVoices.filter(v => v.lang.startsWith('ar'));
        
        const sortedArabicVoices = [...arabicVoices].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aIsNatural = aName.includes('natural') || aName.includes('google') || aName.includes('premium') || aName.includes('microsoft');
          const bIsNatural = bName.includes('natural') || bName.includes('google') || bName.includes('premium') || bName.includes('microsoft');
          
          if (aIsNatural && !bIsNatural) return -1;
          if (!aIsNatural && bIsNatural) return 1;
          
          const aIsSA = a.lang.toLowerCase().includes('sa');
          const bIsSA = b.lang.toLowerCase().includes('sa');
          if (aIsSA && !bIsSA) return -1;
          if (!aIsSA && bIsSA) return 1;
          
          return 0;
        });

        const arabicVoice = sortedArabicVoices[0] || null;
        setVoice(arabicVoice);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Load custom recording if available
  const loadUserRecording = async () => {
    if (lessonId) {
      const blob = await getRecording(lessonId);
      if (blob) {
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        // Switch to user custom recording by default!
        setMode('user');
      } else {
        setRecordedBlob(null);
        setRecordedUrl(null);
        // Fall back to mp3 file if present, else TTS
        setMode(audioUrl ? 'file' : 'tts');
      }
    }
  };

  useEffect(() => {
    loadUserRecording();
  }, [lessonId]);

  // Set up predefined mp3 audio object when audioUrl changes
  useEffect(() => {
    setHasLoadError(false);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const onLoadedMetadata = () => {
        setFileDuration(audio.duration);
        setHasLoadError(false);
      };

      const onTimeUpdate = () => {
        setFileCurrentTime(audio.currentTime);
      };

      const onPlay = () => {
        setFileIsPlaying(true);
        if (onStart) onStart();
      };

      const onPause = () => {
        setFileIsPlaying(false);
        if (onEnd) onEnd();
      };

      const onEnded = () => {
        setFileIsPlaying(false);
        setFileCurrentTime(0);
        if (onEnd) onEnd();
      };

      const onError = () => {
        console.warn(`Pre-recorded audio file failed to load: ${audioUrl}. Falling back to TTS.`);
        setHasLoadError(true);
        // Auto fallback to TTS so there is no silence
        setMode('tts');
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      // If we don't have a user recording, default to 'file'
      getRecording(lessonId || '').then((blob) => {
        if (!blob) {
          setMode('file');
        }
      });

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
    } else {
      getRecording(lessonId || '').then((blob) => {
        if (!blob) {
          setMode('tts');
        }
      });
    }
  }, [audioUrl, lessonId]);

  // Set up custom user recording audio object when recordedUrl changes
  useEffect(() => {
    if (recordedUrl) {
      const audio = new Audio(recordedUrl);
      userAudioRef.current = audio;

      const onLoadedMetadata = () => {
        setUserDuration(audio.duration);
      };

      const onTimeUpdate = () => {
        setUserCurrentTime(audio.currentTime);
      };

      const onPlay = () => {
        setUserIsPlaying(true);
        if (onStart) onStart();
      };

      const onPause = () => {
        setUserIsPlaying(false);
        if (onEnd) onEnd();
      };

      const onEnded = () => {
        setUserIsPlaying(false);
        setUserCurrentTime(0);
        if (onEnd) onEnd();
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [recordedUrl]);

  const cleanTextForReading = (text: string) => {
    let cleaned = text.replace(/\r/g, '');
    cleaned = cleaned.replace(/\n/g, ' ');
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu;
    cleaned = cleaned.replace(emojiRegex, (match) => ' '.repeat(match.length));
    const decorationRegex = /[🌟✨🔴🔵🟢🟡🟠🟣🟤⬛⬜🔸🔹🔺🔻🟥🟦🟧🟨🟩🟪🟫🚫]/gu;
    cleaned = cleaned.replace(decorationRegex, (match) => ' '.repeat(match.length));
    return cleaned;
  };

  // ==========================================
  // PLAYBACK CONTROLS
  // ==========================================

  // 1. Text-To-Speech (AI Voice) Playback
  const handlePlay = () => {
    if (!synthRef.current) return;

    // Pause other players
    if (audioRef.current && fileIsPlaying) audioRef.current.pause();
    if (userAudioRef.current && userIsPlaying) userAudioRef.current.pause();

    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      if (onStart) onStart();
      playSound('read');
      return;
    }

    synthRef.current.cancel();

    const cleanedText = cleanTextForReading(textToRead);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    utterance.lang = 'ar-SA';
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = rate;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onBoundary) {
        onBoundary(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    if (onStart) onStart();
    playSound('read');
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      if (onEnd) onEnd();
      playSound('click');
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
      playSound('click');
    }
  };

  // 2. Pre-recorded MP3 File Playback
  const handleFilePlay = () => {
    if (!audioRef.current) return;
    
    // Stop other active playbacks
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    }
    if (userAudioRef.current && userIsPlaying) userAudioRef.current.pause();

    if (fileIsPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn("Pre-recorded file playback error:", err);
      });
      playSound('read');
    }
  };

  const handleFileStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setFileIsPlaying(false);
    setFileCurrentTime(0);
    playSound('click');
  };

  const handleFileSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setFileCurrentTime(seekTime);
  };

  // 3. User Recording Playback
  const handleUserPlay = () => {
    if (!userAudioRef.current) return;

    // Stop other active playbacks
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    }
    if (audioRef.current && fileIsPlaying) audioRef.current.pause();

    if (userIsPlaying) {
      userAudioRef.current.pause();
    } else {
      userAudioRef.current.play().catch(err => {
        console.warn("User custom recording playback error:", err);
      });
      playSound('read');
    }
  };

  const handleUserStop = () => {
    if (!userAudioRef.current) return;
    userAudioRef.current.pause();
    userAudioRef.current.currentTime = 0;
    setUserIsPlaying(false);
    setUserCurrentTime(0);
    playSound('click');
  };

  const handleUserSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userAudioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    userAudioRef.current.currentTime = seekTime;
    setUserCurrentTime(seekTime);
  };

  const handleMuteToggle = () => {
    const targetMuted = !isMuted;
    setIsMuted(targetMuted);
    if (audioRef.current) audioRef.current.muted = targetMuted;
    if (userAudioRef.current) userAudioRef.current.muted = targetMuted;
    playSound('click');
  };

  const handleModeChange = (newMode: 'tts' | 'file' | 'user') => {
    // Cancel all current sounds before switching
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setFileIsPlaying(false);
      setFileCurrentTime(0);
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      setUserIsPlaying(false);
      setUserCurrentTime(0);
    }
    setMode(newMode);
    playSound('click');
  };

  // ==========================================
  // VOICE RECORDER CONTROLS
  // ==========================================
  const startRecording = async () => {
    setRecordingError(null);
    setSaveSuccess(false);
    try {
      // 1. Terminate all active players
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) audioRef.current.pause();
      if (userAudioRef.current) userAudioRef.current.pause();
      setIsPlaying(false);
      setFileIsPlaying(false);
      setUserIsPlaying(false);

      // 2. Get user microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        // Stop all track media streams to release hardware lock
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      playSound('click');
    } catch (err: any) {
      console.error("Microphone error:", err);
      setRecordingError("عذراً، لم نتمكن من تشغيل الميكروفون. يرجى السماح بصلاحية استخدام الميكروفون في المتصفح.");
      playSound('failure');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      playSound('success');
    }
  };

  const saveRecordedAudio = async () => {
    if (recordedBlob && lessonId) {
      await saveRecording(lessonId, recordedBlob);
      setSaveSuccess(true);
      setMode('user');
      playSound('star');
      setTimeout(() => {
        setSaveSuccess(false);
        setShowRecorder(false);
      }, 1500);
    }
  };

  const deleteRecordedAudio = async () => {
    if (lessonId) {
      if (window.confirm("هل أنت متأكد من رغبتك في حذف تسجيلك الصوتي المخصص؟")) {
        await deleteRecording(lessonId);
        setRecordedBlob(null);
        setRecordedUrl(null);
        setMode(audioUrl ? 'file' : 'tts');
        playSound('failure');
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-[24px] p-4 md:p-5 shadow-sm border-2 border-yellow-border flex flex-col gap-4 select-none">
      
      {/* 1. Header Information & Mode Selection */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-start">
          <div className={`p-3 rounded-full shadow-md animate-pulse shrink-0 ${
            mode === 'file' ? 'bg-indigo-600 text-white' : mode === 'user' ? 'bg-emerald-600 text-white' : 'bg-coral text-white'
          }`}>
            {mode === 'file' ? <Music className="w-6 h-6" /> : mode === 'user' ? <Mic className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </div>
          <div className="text-right">
            <h4 className="font-bold text-charcoal text-sm md:text-base">
              {mode === 'file' 
                ? 'تَسْجِيلُ الدَّرْسِ الْمُرْفَقِ 🎵' 
                : mode === 'user' 
                  ? 'تَسْجِيلِي الصَّوْتِيُّ الْمُخَصَّصُ 🎙️' 
                  : 'الْقَارِئُ الْآلِيُّ التَّفَاعُلِيُّ 🤖'
              }
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'file' 
                ? 'استمع لتسجيل صوتي ملحن بجودة عالية وواضحة لمضمون الدرس' 
                : mode === 'user' 
                  ? 'تستمع حالياً لتسجيلك الخاص الملقى بصوتك المميز' 
                  : `استمع لنطق درس "${title}" بوضوح وبكل سهولة`
              }
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-full border-2 border-yellow-border shadow-sm shrink-0 gap-1">
          {audioUrl && !hasLoadError && (
            <button
              onClick={() => handleModeChange('file')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                mode === 'file' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              🎵 تسجيل صفي
            </button>
          )}

          {recordedUrl && (
            <button
              onClick={() => handleModeChange('user')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                mode === 'user' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              🎙️ تسجيلي الخاص
            </button>
          )}

          <button
            onClick={() => handleModeChange('tts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              mode === 'tts' 
                ? 'bg-coral text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            🤖 قارئ آلي
          </button>
        </div>
      </div>

      {/* 2. Error Fallback Alert (If the preloaded file is missing / fails to load) */}
      {audioUrl && hasLoadError && (
        <div className="bg-[#FFF5F5] border-l-4 border-rose-500 rounded-xl p-3 text-right flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-rose-800">تنبيه: ملف تسجيل الدرس غير متوفر حالياً ⚠️</p>
              <p className="text-xs font-bold text-slate-600">
                الملف الصوتي للدرس الخامس بالوحدة الخامسة <code className="bg-white px-1 py-0.5 rounded border border-rose-200 text-rose-600 font-mono">u5_l5_uncovered_food.mp3</code> لم يتم رفعه للمجلد بعد.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                💡 قمنا بتفعيل <span className="font-bold text-coral">القارئ الآلي التفاعلي</span> تلقائياً بدلاً منه لكي تتمكن من سماع الدرس بالتشكيل حالاً! يمكنك أيضاً تسجيل قراءتك بصوتك فوراً بالأسفل.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowRecorder(true); playSound('click'); }}
            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-full shadow border-b-4 border-rose-700 transition-transform active:scale-95 whitespace-nowrap"
          >
            🎙️ سجل قراءتك بصوتك
          </button>
        </div>
      )}

      {/* 3. Main Player Control Interface */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
        
        {/* Playback status visualizer */}
        {((mode === 'tts' && isPlaying) || (mode === 'file' && fileIsPlaying) || (mode === 'user' && userIsPlaying)) ? (
          <div className="flex gap-1 h-6 items-end shrink-0">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2].map((height, i) => (
              <span
                key={i}
                className={`w-1 rounded-full animate-bounce ${
                  mode === 'file' ? 'bg-indigo-600' : mode === 'user' ? 'bg-emerald-600' : 'bg-coral'
                }`}
                style={{
                  height: `${height * 20}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1 shrink-0">
            <span className={mode === 'file' ? 'text-indigo-500' : mode === 'user' ? 'text-emerald-500' : 'text-coral'}>●</span> جاهز للتشغيل
          </div>
        )}

        {/* Playback controls according to active mode */}
        {mode === 'file' ? (
          /* PRE-RECORDED FILE AUDIO PLAYER */
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto md:flex-1 md:justify-end">
            <div className="flex items-center gap-2 w-full md:max-w-md md:flex-1">
              <span className="text-xs font-mono text-slate-500">{formatTime(fileCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={fileDuration || 100}
                value={fileCurrentTime}
                onChange={handleFileSeek}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-500">{formatTime(fileDuration)}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleFilePlay}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-md transition-transform transform active:scale-95 cursor-pointer ${
                  fileIsPlaying
                    ? 'bg-yellow-accent text-coral border-b-4 border-yellow-border'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800'
                }`}
              >
                {fileIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span className="text-sm font-sans">{fileIsPlaying ? 'إيقاف مؤقت' : 'استمع لتسجيل الدرس 🔊'}</span>
              </button>

              {(fileIsPlaying || fileCurrentTime > 0) && (
                <button
                  onClick={handleFileStop}
                  className="p-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full font-bold shadow-md transition-transform transform active:scale-95 border-b-4 border-rose-700 cursor-pointer"
                  title="إيقاف"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              )}

              <button
                onClick={handleMuteToggle}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full font-bold shadow border-b-4 border-slate-300 cursor-pointer"
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : mode === 'user' ? (
          /* USER RECORDED CUSTOM AUDIO PLAYER */
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto md:flex-1 md:justify-end">
            <div className="flex items-center gap-2 w-full md:max-w-md md:flex-1">
              <span className="text-xs font-mono text-slate-500">{formatTime(userCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={userDuration || 100}
                value={userCurrentTime}
                onChange={handleUserSeek}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-500">{formatTime(userDuration)}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleUserPlay}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-md transition-transform transform active:scale-95 cursor-pointer ${
                  userIsPlaying
                    ? 'bg-yellow-accent text-coral border-b-4 border-yellow-border'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800'
                }`}
              >
                {userIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span className="text-sm font-sans">{userIsPlaying ? 'إيقاف مؤقت' : 'قراءتي الخاصة 🔊'}</span>
              </button>

              {(userIsPlaying || userCurrentTime > 0) && (
                <button
                  onClick={handleUserStop}
                  className="p-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full font-bold shadow-md transition-transform transform active:scale-95 border-b-4 border-rose-700 cursor-pointer"
                  title="إيقاف"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              )}

              <button
                onClick={handleMuteToggle}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full font-bold shadow border-b-4 border-slate-300 cursor-pointer"
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {lessonId && (
                <button
                  onClick={deleteRecordedAudio}
                  className="p-2.5 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full font-bold shadow border-b-4 border-rose-200 cursor-pointer"
                  title="حذف تسجيلي المخصص"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* TEXT TO SPEECH (SYNTHETIC) PLAYER */
          <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end w-full md:w-auto">
            <button
              id="tts-play-btn"
              onClick={handlePlay}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-md transition-transform transform active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-yellow-accent text-coral border-b-4 border-yellow-border'
                  : 'bg-teal-accent hover:bg-teal-accent/90 text-white border-b-4 border-teal-700'
              }`}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span className="text-sm font-sans">{isPaused ? 'استئناف القراءة' : 'اقرأ لي الدرس (آلي) 📢'}</span>
            </button>

            {isPlaying && (
              <button
                id="tts-pause-btn"
                onClick={handlePause}
                className="p-2.5 bg-yellow-accent text-coral hover:bg-yellow-accent/90 rounded-full font-bold shadow-md transition-transform transform active:scale-95 border-b-4 border-yellow-border cursor-pointer"
                title="إيقاف مؤقت"
              >
                <Pause className="w-5 h-5" />
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                id="tts-stop-btn"
                onClick={handleStop}
                className="p-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full font-bold shadow-md transition-transform transform active:scale-95 border-b-4 border-rose-700 cursor-pointer"
                title="إيقاف"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}

            {/* Speed Adjustment */}
            <div className="flex items-center gap-1.5 bg-[#FFF9E6] px-3 py-1.5 rounded-full border border-yellow-border shadow-sm text-xs font-bold text-charcoal">
              <Settings className="w-3.5 h-3.5 text-coral" />
              <span>السرعة:</span>
              <select
                value={rate}
                onChange={(e) => {
                  setRate(parseFloat(e.target.value));
                  if (isPlaying) {
                    setTimeout(() => handlePlay(), 50); // restart with new speed
                  }
                }}
                className="bg-transparent border-none outline-none font-bold text-coral cursor-pointer"
              >
                <option value="0.7">بطيئة جداً 🐢</option>
                <option value="0.85">مريحة للأطفال 👶</option>
                <option value="1.0">طبيعية 🗣️</option>
                <option value="1.15">سريعة قليلاً ⚡</option>
              </select>
            </div>
          </div>
        )}

      </div>

      {/* 4. Teacher/Parent In-App Voice Recorder Toggle Button */}
      {lessonId && (
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center select-none">
          <div className="text-xs text-slate-400 font-medium">
            💡 <span className="font-bold text-slate-600">للمعلمين وأولياء الأمور:</span> يمكنك تسجيل قراءتك وتجويدك الخاص للدرس وتثبيته للطفل!
          </div>
          <button
            onClick={() => { setShowRecorder(!showRecorder); playSound('click'); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black shadow transition-all transform active:scale-95 cursor-pointer ${
              showRecorder 
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700'
            }`}
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>{showRecorder ? 'إغلاق مسجل الصوت ×' : 'سجل قراءتك بصوتك للدرس 🎙️'}</span>
          </button>
        </div>
      )}

      {/* 5. Audio Recorder Control Panel Drawer */}
      {showRecorder && lessonId && (
        <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-[20px] p-4 text-right flex flex-col gap-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
            <h5 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <Mic className="w-5 h-5 text-emerald-600" />
              أداة تسجيل الصوت وتجويد الدرس 🎙️
            </h5>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
              معرّف الدرس: <span className="font-mono">{lessonId}</span>
            </span>
          </div>

          {recordingError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-bold text-red-600 flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{recordingError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-emerald-500 text-white rounded-xl p-3 text-xs font-black flex gap-2 items-center justify-center shadow">
              <Check className="w-4 h-4" />
              <span>تم حفظ القراءة المخصصة وتثبيتها بنجاح! 🎉</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
            {/* Main Record Trigger */}
            <div className="flex flex-col items-center gap-2 select-none">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform active:scale-90 cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-500 hover:bg-rose-600 animate-ping' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                style={{ animationDuration: '2s' }}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 text-white fill-current animate-pulse" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>
              <span className={`text-xs font-black ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
                {isRecording ? `جاري التسجيل: ${formatTime(recordingTime)} 🔴` : 'اضغط لبدء التسجيل'}
              </span>
            </div>

            {/* Waveform Animation during active recording */}
            {isRecording && (
              <div className="flex gap-1.5 h-10 items-center justify-center px-4 bg-white/70 rounded-full border border-emerald-100 shadow-inner">
                {[1, 2, 3, 4, 3, 2, 3, 4, 5, 2, 3, 1, 4, 2].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full animate-bounce"
                    style={{
                      height: `${height * 20}%`,
                      animationDelay: `${i * 0.08}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Post-Recording Action Preview & Save Buttons */}
            {recordedUrl && !isRecording && (
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border-2 border-emerald-100 shadow-sm">
                
                {/* Audio preview playback */}
                <button
                  onClick={() => {
                    const previewAudio = new Audio(recordedUrl);
                    previewAudio.play().catch(e => console.warn(e));
                    playSound('read');
                  }}
                  className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-black transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>معاينة التسجيل 🔊</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={saveRecordedAudio}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-black shadow border-b-4 border-emerald-800 transition-transform active:scale-95 cursor-pointer animate-bounce"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ وتثبيت التسجيل 💾</span>
                </button>

                {/* Reset/Retry Button */}
                <button
                  onClick={() => { setRecordedBlob(null); setRecordedUrl(null); playSound('click'); }}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة 🔄</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="text-[11px] text-slate-500 leading-relaxed bg-white/40 p-2.5 rounded-xl border border-emerald-100">
            📌 <span className="font-black text-emerald-800">ملاحظة أمنية وتوافقية:</span> يتم حفظ هذا التسجيل مخصّصاً داخل المتصفح المحلي للوصول إليه بأعلى سرعة وأقل تأخير. في حال واجهت مشكلة في التشغيل أو عدم تسجيل الصوت، تأكد من منح الإذن لاستخدام الميكروفون عند طلب المتصفح.
          </div>
        </div>
      )}

    </div>
  );
}
