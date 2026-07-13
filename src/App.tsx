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
import { playSound } from './utils';
import { BookOpen, Award, ArrowRight, Star } from 'lucide-react';

export default function App() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [lessonSubTab, setLessonSubTab] = useState<'read' | 'exercises'>('read');
  const [mainTab, setMainTab] = useState<'journey' | 'flipbook' | 'dictionary' | 'games' | 'assessment'>('journey');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isPopStateRef = useRef(false);

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
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
            <span className="text-2xl font-bold">🇸🇩</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-white text-base md:text-xl leading-none">لغتي 🇸🇩</h1>
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
        
        {/* Playful top-level tab switchers */}
        <div className="flex justify-center select-none w-full">
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

      {/* Floating Back to Dashboard Button (FAB) */}
      {selectedLesson && (
        <button
          onClick={handleBackToDashboard}
          className="fixed bottom-6 left-6 md:left-12 z-50 flex items-center justify-center gap-2 px-5 py-3.5 bg-coral hover:bg-coral-dark text-white font-black text-sm md:text-base rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white hover:bg-opacity-95"
          title="الرجوع للرئيسية 🗺️"
        >
          <ArrowRight className="w-5 h-5 ml-1" />
          <span>الرجوع 🗺️</span>
        </button>
      )}

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
