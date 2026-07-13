import React, { useState, useEffect, useRef } from 'react';
import { Unit, Lesson } from './types';
import { INITIAL_UNITS } from './data';
import KidDashboard from './components/KidDashboard';
import LessonView from './components/LessonView';
import ExerciseView from './components/ExerciseView';
import TextbookFlipbook from './components/TextbookFlipbook';
import DictionaryView from './components/DictionaryView';
import InteractiveGames from './components/InteractiveGames';
import AssessmentCenter from './components/AssessmentCenter';
import SmartSearchBot from './components/SmartSearchBot';
import { playSound } from './utils';
import { BookOpen, Award, ArrowRight, Star, Wifi, WifiOff, Download, CheckCircle, RefreshCw } from 'lucide-react';

const ALL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa_icon.svg',
  '/src/assets/audio/u5_l5_uncovered_food.mp3',
  '/src/assets/images/sudanese_family_love_1783937441296.jpg',
  '/src/assets/images/sudanese_parent_hug_1783937460334.jpg',
  '/src/assets/images/sudanese_guest_welcome_1783937425720.jpg',
  '/src/assets/images/sudanese_chicken_seller_1783937475265.jpg',
  '/src/assets/images/sudanese_school_kids_1783937490242.jpg',
  '/src/assets/images/school_cleaning_kids_1783932758944.jpg',
  '/src/assets/images/sudan_pride_illustration_1783925595849.jpg',
  '/src/assets/images/sudan_map_landscape_1783932792262.jpg',
  '/src/assets/images/sudan_nature_landscape_1783932807921.jpg',
  '/src/assets/images/sudanese_girl_horse_1783931339607.jpg',
  '/src/assets/images/sudanese_soldier_hero_1783932818588.jpg',
  '/src/assets/images/sudan_independence_celebration_1783932830535.jpg',
  '/src/assets/images/forest_animals_illustration_1783925610838.jpg',
  '/src/assets/images/beehive_honey_bees_1783931318188.jpg',
  '/src/assets/images/cartoon_cat_mouse_1783932842389.jpg',
  '/src/assets/images/meadow_birds_singing_1783932858031.jpg',
  '/src/assets/images/anthill_busy_ants_1783932869246.jpg',
  '/src/assets/images/body_health_running_1783932879813.jpg',
  '/src/assets/images/sudanese_wise_farmer_1783937507425.jpg',
  '/src/assets/images/teeth_brushing_kids_1783931303450.jpg',
  '/src/assets/images/covered_clean_food_1783932920644.jpg',
  '/src/assets/images/hungry_boy_feast_1783932935766.jpg',
  '/src/assets/images/salt_flats_port_sudan_1783932946735.jpg',
  '/src/assets/images/magical_cave_treasure_1783931328825.jpg',
  '/src/assets/images/blind_chicken_seller_1783932732781.jpg',
  '/src/assets/images/family_love_illustration_1783925570624.jpg',
  '/src/assets/images/five_senses_illustration_1783932891742.jpg',
  '/src/assets/images/guest_welcome_cartoon_1783932719909.jpg',
  '/src/assets/images/health_kids_illustration_1783925629554.jpg',
  '/src/assets/images/healthy_nutrition_kids_1783932908570.jpg',
  '/src/assets/images/kids_playing_circle_1783932958146.jpg',
  '/src/assets/images/kindness_friends_cartoon_1783932743793.jpg',
  '/src/assets/images/parent_hug_cartoon_1783932707600.jpg',
  '/src/assets/images/traffic_safety_kids_1783932769358.jpg',
  '/src/assets/images/walking_sidewalk_kids_1783932780066.jpg',
  '/src/assets/images/wise_farmer_illustration_1783925642564.jpg',
  '/src/assets/images/pwa_icon_1783959148370.jpg'
];

export default function App() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [lessonSubTab, setLessonSubTab] = useState<'read' | 'exercises'>('read');
  const [mainTab, setMainTab] = useState<'journey' | 'flipbook' | 'dictionary' | 'games' | 'assessment'>('journey');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isPopStateRef = useRef(false);

  // Connection & Offline states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [isFullyDownloaded, setIsFullyDownloaded] = useState(() => {
    try {
      return localStorage.getItem('lughaty_fully_downloaded') === 'true';
    } catch {
      return false;
    }
  });
  const [showOfflinePanel, setShowOfflinePanel] = useState(false);

  // Track browser online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      playSound('success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      playSound('click');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Proactively clear stale caches and force update check to avoid service worker caching issues
  useEffect(() => {
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== 'lughaty-v5') {
            caches.delete(key).then(() => {
              console.log('Cleared stale cache:', key);
            });
          }
        });
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update().then(() => {
            console.log('Forced Service Worker update check on mount');
          });
        });
      });
    }
  }, []);

  // Handle messages from Service Worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.action === 'PRECACHE_PROGRESS') {
          const { completed, total } = event.data;
          setDownloadProgress({ completed, total });
          setDownloadStatus('downloading');
        } else if (event.data.action === 'PRECACHE_COMPLETE') {
          setDownloadStatus('completed');
          setIsFullyDownloaded(true);
          try {
            localStorage.setItem('lughaty_fully_downloaded', 'true');
          } catch (e) {}
          playSound('success');
          // Hide completion status after 6 seconds
          setTimeout(() => setDownloadStatus('idle'), 6000);
        }
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Trigger resource downloads via SW
  const startFullDownload = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setDownloadStatus('downloading');
      setDownloadProgress({ completed: 0, total: ALL_RESOURCES.length });
      navigator.serviceWorker.controller.postMessage({
        action: 'PRECACHE_RESOURCES',
        urls: ALL_RESOURCES,
        taskId: 'precache-all'
      });
      playSound('click');
    } else {
      // SW might be registering, try to fetch anyway or guide user
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 5000);
    }
  };

  // Intercept physical / browser Back Button & handle navigation
  useEffect(() => {
    // 1. Establish the exit guardian baseline
    window.history.replaceState({ isExitGuard: true }, '');

    // 2. Push initial active home state
    const homeState = {
      mainTab: 'journey',
      selectedLessonId: null,
      lessonSubTab: 'read',
      isHome: true
    };
    window.history.pushState(homeState, '');

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.isExitGuard) {
          // Intercept exiting back button at dashboard root
          setShowExitConfirm(true);
          playSound('click');

          // Immediately re-push home state to maintain history lock
          const homeState = {
            mainTab: 'journey',
            selectedLessonId: null,
            lessonSubTab: 'read',
            isHome: true
          };
          window.history.pushState(homeState, '');

          setMainTab('journey');
          setSelectedLesson(null);
          setLessonSubTab('read');
          return;
        }

        // Standard internal backwards navigation
        isPopStateRef.current = true;
        const { mainTab: poppedTab, selectedLessonId: poppedLessonId, lessonSubTab: poppedSubTab } = e.state;

        setMainTab(poppedTab || 'journey');
        setLessonSubTab(poppedSubTab || 'read');

        if (poppedLessonId) {
          const foundLesson = INITIAL_UNITS.flatMap(u => u.lessons).find(l => l.id === poppedLessonId);
          setSelectedLesson(foundLesson || null);
        } else {
          setSelectedLesson(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Synchronize internal React state transitions into browser history entries
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const nextState = {
      mainTab,
      selectedLessonId: selectedLesson ? selectedLesson.id : null,
      lessonSubTab
    };

    const currentHistoryState = window.history.state;
    const isDifferent = !currentHistoryState ||
      currentHistoryState.mainTab !== nextState.mainTab ||
      currentHistoryState.selectedLessonId !== nextState.selectedLessonId ||
      currentHistoryState.lessonSubTab !== nextState.lessonSubTab;

    if (isDifferent && !currentHistoryState?.isExitGuard) {
      window.history.pushState(nextState, '');
    }
  }, [mainTab, selectedLesson?.id, lessonSubTab]);

  // Intercept Tab Closures or Reloads
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = 'هل أنت متأكد من المغادرة؟';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Navigation helpers for current unit
  const currentUnit = selectedLesson ? units.find(u => u.id === selectedLesson.unitId) : null;
  const currentLessonIndex = (currentUnit && selectedLesson) ? currentUnit.lessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const prevLesson = (currentUnit && currentLessonIndex > 0) ? currentUnit.lessons[currentLessonIndex - 1] : null;
  const nextLesson = (currentUnit && currentLessonIndex !== -1 && currentLessonIndex < currentUnit.lessons.length - 1) ? currentUnit.lessons[currentLessonIndex + 1] : null;

  // Load curriculum and progress from LocalStorage
  useEffect(() => {
    // 1. Units & Lessons
    const savedUnits = localStorage.getItem('sudanese_arabic_units_v_final_preload_v10_textbook_sync');
    if (savedUnits) {
      try {
        setUnits(JSON.parse(savedUnits));
      } catch (e) {
        setUnits(INITIAL_UNITS);
      }
    } else {
      setUnits(INITIAL_UNITS);
      localStorage.setItem('sudanese_arabic_units_v_final_preload_v10_textbook_sync', JSON.stringify(INITIAL_UNITS));
    }

    // 2. Completed lessons & score
    const savedProgress = localStorage.getItem('sudanese_arabic_progress_v_final_preload');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCompletedLessons(parsed.completedLessons || []);
        setTotalScore(parsed.totalScore || 0);
      } catch (e) {
        // default empty
      }
    }
  }, []);

  // Save Progress helpers
  const handleLessonCompleted = (lessonId: string, score: number) => {
    setCompletedLessons(prev => {
      const updated = prev.includes(lessonId) ? prev : [...prev, lessonId];
      
      // Calculate active average score
      const newScore = Math.min(100, Math.round(((totalScore * prev.length) + score) / updated.length) || score);
      setTotalScore(newScore);

      localStorage.setItem('sudanese_arabic_progress_v_final_preload', JSON.stringify({
        completedLessons: updated,
        totalScore: newScore
      }));

      return updated;
    });
  };

  // Scroll smoothly to the top of the screen when selecting a lesson, switching tabs, or going back
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [selectedLesson?.id, lessonSubTab]);

  const handleBackToDashboard = () => {
    const currentHistoryState = window.history.state;
    if (currentHistoryState && currentHistoryState.selectedLessonId !== null) {
      window.history.back();
    } else {
      setSelectedLesson(null);
    }
    playSound('click');
  };

  return (
    <div className="min-h-screen bg-cream pb-12 flex flex-col font-sans antialiased text-right text-charcoal" dir="rtl">
      
      {/* Top Main Navigation Header */}
      <header className="h-20 bg-coral sticky top-0 z-40 shadow-lg px-6 md:px-12 flex items-center justify-between select-none">
        
        {/* Playful logo and credentials */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#14212e] rounded-xl flex items-center justify-center shadow-md border border-[#d4af37]/70 overflow-hidden p-0.5">
            <img 
              src="/pwa_icon.svg" 
              alt="شعار نقلة NAQLA" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-white text-base md:text-xl leading-none">لغتي التفاعلي</h1>
              <span className="bg-[#d4af37] text-[#14212e] text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">نقلة 🚀</span>
            </div>
            <p className="text-[10px] md:text-xs text-white/85 font-extrabold mt-1">الصف الثالث الابتدائي - المنهج السوداني التفاعلي</p>
          </div>
        </div>

        {/* Playful Portal Badge */}
        <div className="flex bg-white/20 px-5 py-2.5 rounded-full border border-white/30 shadow-inner text-white text-xs md:text-sm font-black select-none">
          🎒 بَوَّابَةُ التِّلْمِيذِ الذَّكِيَّةِ
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className={`${mainTab === 'flipbook' ? 'max-w-none w-full px-2 md:px-6' : 'max-w-6xl w-full mx-auto px-4 md:px-8'} mt-6 flex-1 flex flex-col gap-6`}>
        
        {/* Offline & Connection Management Panel - Collapsible Wi-Fi Icon Only */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none gap-3">
          {/* Pulsing Wi-Fi Icon Toggle Button */}
          <button
            onClick={() => {
              setShowOfflinePanel(!showOfflinePanel);
              playSound('click');
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border-3 cursor-pointer hover:scale-110 active:scale-95 relative ${
              showOfflinePanel 
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-yellow-accent' 
                : isOnline 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="حالة الاتصال والتحميل بدون إنترنت 📡"
          >
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6 animate-bounce" />}
            {/* Status dot indicator */}
            <span className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isOnline ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </button>

          {/* Expanded panel details */}
          {showOfflinePanel && (
            <div className="w-full bg-white p-4 rounded-[28px] border-2 border-yellow-border shadow-md flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
              {/* Connection Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-500 block leading-none">حالة الاتصال</span>
                  <span className={`text-sm font-black ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isOnline ? 'متصل بالشبكة (أونلاين) ⚡' : 'تعمل الآن بدون اتصال بالإنترنت (أوفلاين) 📴'}
                  </span>
                </div>
              </div>

              {/* Download and Offline Progress Section */}
              <div className="flex-1 md:max-w-md w-full flex flex-col gap-2">
                {downloadStatus === 'downloading' && downloadProgress ? (
                  <div className="w-full text-right">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-coral animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        جاري حفظ الدروس والملفات الصوتية للعمل بدون شبكة...
                      </span>
                      <span className="text-xs font-black text-slate-700">
                        {Math.round((downloadProgress.completed / downloadProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="bg-coral h-full rounded-full transition-all duration-300"
                        style={{ width: `${(downloadProgress.completed / downloadProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                      تم تحميل {downloadProgress.completed} من أصل {downloadProgress.total} ملف تفاعلي بنجاح
                    </p>
                  </div>
                ) : downloadStatus === 'completed' || isFullyDownloaded ? (
                  <div className="flex items-center gap-2.5 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 w-full justify-between">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="text-right">
                        <p className="text-xs font-black">جاهز للعمل بدون إنترنت بالكامل! 💾✓</p>
                        <p className="text-[9px] font-bold text-emerald-600">تم حفظ كافة الصور والملفات الصوتية والأنشطة محلياً</p>
                      </div>
                    </div>
                    <button 
                      onClick={startFullDownload}
                      disabled={!isOnline}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-colors cursor-pointer ${
                        isOnline 
                          ? 'bg-white hover:bg-emerald-100 text-emerald-700 border-emerald-300' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                      title={isOnline ? 'إعادة فحص وتحديث الملفات المحفوظة' : 'يجب الاتصال بالشبكة للتحديث'}
                    >
                      تحديث 🔄
                    </button>
                  </div>
                ) : downloadStatus === 'error' ? (
                  <div className="text-right p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-black text-rose-600 flex justify-between items-center">
                    <span>⚠️ لم نتمكن من تنشيط التحميل حالياً. يرجى التحديث والمحاولة.</span>
                    <button 
                      onClick={() => setDownloadStatus('idle')}
                      className="text-[10px] bg-white border border-rose-300 rounded px-1.5 py-0.5 font-bold"
                    >
                      حسناً
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startFullDownload}
                    disabled={!isOnline}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                      isOnline 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 active:scale-95' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل كافة دروس وصوتيات الكتاب للعمل بدون إنترنت 📥</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Playful top-level tab switchers - Sticky below the header */}
        <div className="sticky top-20 z-30 bg-cream/95 backdrop-blur-md py-3 flex justify-center select-none w-full transition-all">
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-1.5 bg-white p-1.5 rounded-3xl border-2 border-yellow-border shadow-md w-full max-w-4xl">
            <button
              onClick={() => { setMainTab('journey'); setSelectedLesson(null); playSound('click'); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mainTab === 'journey'
                  ? 'bg-coral text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              🗺️ خَرِيطَةُ الدُّرُوسِ
            </button>
            <button
              onClick={() => { setMainTab('flipbook'); setSelectedLesson(null); playSound('click'); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mainTab === 'flipbook'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📖 كِتَابُ الْفْلِيبِ
            </button>
            <button
              onClick={() => { setMainTab('dictionary'); setSelectedLesson(null); playSound('click'); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mainTab === 'dictionary'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📚 قَامُوسُ الْمَعَانِي
            </button>
            <button
              onClick={() => { setMainTab('games'); setSelectedLesson(null); playSound('click'); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mainTab === 'games'
                  ? 'bg-teal-accent text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              🎮 أَلْعَابٌ تَفَاعُلِيَّةٌ
            </button>
            <button
              onClick={() => { setMainTab('assessment'); setSelectedLesson(null); playSound('click'); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mainTab === 'assessment'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📝 تَقْيِيمَاتٌ شَامِلَةٌ
            </button>
          </div>
        </div>

        {/* Kid's Dashboard or active textbook page */}
        <div className="flex flex-col gap-6">
          {mainTab === 'flipbook' ? (
            <TextbookFlipbook 
              units={units}
              completedLessons={completedLessons}
              onSelectLesson={(lesson) => {
                setSelectedLesson(lesson);
                setMainTab('journey');
                setLessonSubTab('exercises');
              }}
            />
          ) : mainTab === 'dictionary' ? (
            <DictionaryView />
          ) : mainTab === 'games' ? (
            <InteractiveGames />
          ) : mainTab === 'assessment' ? (
            <AssessmentCenter />
          ) : !selectedLesson ? (
            /* Playful Unit Selection dashboard */
            <KidDashboard
              units={units}
              completedLessons={completedLessons}
              totalScore={totalScore}
              onSelectLesson={(lesson) => {
                setSelectedLesson(lesson);
                setLessonSubTab('read'); // default to reading text
              }}
            />
          ) : (
            /* Active Lesson Interactive workspace */
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Back button and Lesson Context */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-yellow-border shadow-sm">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-1 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs md:text-sm rounded-full transition-transform active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  الرجوع للرئيسية 🗺️
                </button>

                <div className="flex items-center bg-[#F0F7FF] text-[#4D96FF] px-4 py-1.5 rounded-full font-bold text-xs md:text-sm border border-[#4D96FF]/30">
                  <Star className="w-4 h-4 fill-current text-yellow-accent ml-1.5 animate-pulse" />
                  أكمل الدرس والتمارين لتكسب النجوم الملونة!
                </div>
              </div>

              {/* Quick Navigation for Unit Lessons */}
              {currentUnit && (
                <div className="flex flex-col gap-2.5 bg-teal-50 p-4 rounded-3xl border-2 border-teal-100 shadow-sm text-right">
                  <span className="text-xs md:text-sm font-black text-teal-800 flex items-center gap-1.5">
                    🎯 دُرُوسُ هَذِهِ الْوَحْدَةِ ({currentUnit.title}):
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentUnit.lessons.map((l, index) => {
                      const isCurrent = l.id === selectedLesson.id;
                      const isCompleted = completedLessons.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => {
                            setSelectedLesson(l);
                            setLessonSubTab('read'); // default to reading text
                            playSound('click');
                          }}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : isCompleted
                              ? 'bg-white text-teal-700 border-teal-200 hover:bg-teal-100'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{index + 1}.</span>
                          <span>{l.title.split(':')[1]?.trim() || l.title}</span>
                          {isCompleted && <span className="text-teal-500">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lesson split tabs (Read vs Exercises) */}
              <div className="flex justify-center select-none">
                <div className="flex bg-white/80 backdrop-blur p-1.5 rounded-full border-2 border-yellow-border shadow-md w-full max-w-md">
                  <button
                    onClick={() => { setLessonSubTab('read'); playSound('click'); }}
                    className={`flex-1 py-3 rounded-full font-black text-sm md:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      lessonSubTab === 'read'
                        ? 'bg-coral text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    قراءة النص والنشيد 📖
                  </button>
                  <button
                    onClick={() => { setLessonSubTab('exercises'); playSound('click'); }}
                    className={`flex-1 py-3 rounded-full font-black text-sm md:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      lessonSubTab === 'exercises'
                        ? 'bg-teal-accent text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-5 h-5 fill-current" />
                    حل التمارين والتقييم ✏️
                  </button>
                </div>
              </div>

              {/* Conditional Sub Tab Panel Rendering */}
              {lessonSubTab === 'read' ? (
                <LessonView lesson={selectedLesson} />
              ) : (
                <ExerciseView 
                  lesson={selectedLesson} 
                  onLessonCompleted={handleLessonCompleted}
                />
              )}

              {/* Bottom Navigation Buttons */}
              {currentUnit && (
                <div className="flex items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-yellow-border shadow-sm mt-2 select-none">
                  {prevLesson ? (
                    <button
                      onClick={() => {
                        setSelectedLesson(prevLesson);
                        setLessonSubTab('read');
                        playSound('click');
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs md:text-sm rounded-2xl border-2 border-slate-200 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>⬅️ الدرس السابق</span>
                      <span className="hidden md:inline font-bold text-slate-500">
                        ({prevLesson.title.split(':')[1]?.trim() || prevLesson.title})
                      </span>
                    </button>
                  ) : (
                    <div /> // Spacer
                  )}

                  {nextLesson ? (
                    <button
                      onClick={() => {
                        setSelectedLesson(nextLesson);
                        setLessonSubTab('read');
                        playSound('click');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-coral hover:bg-opacity-90 text-white font-black text-xs md:text-sm rounded-2xl transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg animate-pulse"
                    >
                      <span>الدرس التالي ➡️</span>
                      <span className="hidden md:inline font-bold text-coral-100">
                        ({nextLesson.title.split(':')[1]?.trim() || nextLesson.title})
                      </span>
                    </button>
                  ) : (
                    <div /> // Spacer
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 font-bold select-none flex flex-col gap-2 items-center justify-center border-t border-[#FFD93D]/30 pt-6">
        <p className="flex items-center gap-1">
          صُنِعَ بِحُبّ وشَغَف لتعليمِ أبنائِنا في الصفّ الثَّالث 🇸🇩❤️
        </p>
        <p className="text-[10px] text-slate-400">
          منهج اللغة العربية لجمهورية السودان - وزارة التربية والتعليم - المركز القومي للمناهج والبحث التربوي
        </p>
      </footer>

      {/* Floating Back to Dashboard Button (FAB) on the bottom right to prevent collision with SmartSearchBot on the left */}
      {selectedLesson && (
        <button
          onClick={handleBackToDashboard}
          className="fixed bottom-6 right-6 md:right-12 z-50 flex items-center justify-center gap-2 px-5 py-3.5 bg-coral hover:bg-coral-dark text-white font-black text-sm md:text-base rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white hover:bg-opacity-95"
          title="الرجوع للرئيسية 🗺️"
        >
          <ArrowRight className="w-5 h-5 ml-1" />
          <span>الرجوع 🗺️</span>
        </button>
      )}

      {/* Floating Smart Offline Search and Assistant on the bottom left */}
      <SmartSearchBot />

      {/* Playful Exit Confirmation Dialogue Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-[#FFD93D] shadow-2xl text-center transform scale-100 transition-all">
            <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-coral">
              <span className="text-4xl">🚪</span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">هل أنت متأكد من المغادرة؟</h2>
            <p className="text-xs md:text-sm text-slate-500 font-extrabold mb-6">
              مجموع نجومك ونقاطك محفوظة، ولكن سنشتاق إليك كثيراً! العب وتعلم لتكسب المزيد من الجوائز.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  playSound('success');
                }}
                className="w-full py-3.5 bg-teal-accent hover:bg-opacity-95 text-white font-black rounded-2xl shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                🎒 البقاء ومواصلة التعلم
              </button>
              
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  window.location.href = "about:blank";
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl active:scale-95 transition-transform cursor-pointer"
              >
                🚪 نعم، مغادرة التطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
