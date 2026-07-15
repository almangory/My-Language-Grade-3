import React, { useState, useEffect, useRef } from 'react';
import { Unit, Lesson, LessonType } from '../types';
import { playSound } from '../utils';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Search, 
  List, 
  Sparkles, 
  Compass, 
  Volume2, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TextbookFlipbookProps {
  units: Unit[];
  completedLessons: string[];
  onSelectLesson: (lesson: Lesson) => void;
}

// Static Image Imports for Production Build Compatibility
import imgSudaneseFamilyLove from '../assets/images/sudanese_family_love_1783937441296.jpg';
import imgSudaneseParentHug from '../assets/images/sudanese_parent_hug_1783937460334.jpg';
import imgSudaneseGuestWelcome from '../assets/images/sudanese_guest_welcome_1783937425720.jpg';
import imgSudaneseChickenSeller from '../assets/images/sudanese_chicken_seller_1783937475265.jpg';
import imgSudaneseSchoolKids from '../assets/images/sudanese_school_kids_1783937490242.jpg';
import imgSchoolCleaningKids from '../assets/images/school_cleaning_kids_1783932758944.jpg';
import imgSudanPrideIllustration from '../assets/images/sudan_pride_illustration_1783925595849.jpg';
import imgSudanMapLandscape from '../assets/images/sudan_map_landscape_1783932792262.jpg';
import imgSudanNatureLandscape from '../assets/images/sudan_nature_landscape_1783932807921.jpg';
import imgSudaneseGirlHorse from '../assets/images/sudanese_girl_horse_1783931339607.jpg';
import imgSudaneseSoldierHero from '../assets/images/sudanese_soldier_hero_1783932818588.jpg';
import imgSudanIndependenceCelebration from '../assets/images/sudan_independence_celebration_1783932830535.jpg';
import imgForestAnimalsIllustration from '../assets/images/forest_animals_illustration_1783925610838.jpg';
import imgBeehiveHoneyBees from '../assets/images/beehive_honey_bees_1783931318188.jpg';
import imgCartoonCatMouse from '../assets/images/cartoon_cat_mouse_1783932842389.jpg';
import imgMeadowBirdsSinging from '../assets/images/meadow_birds_singing_1783932858031.jpg';
import imgAnthillBusyAnts from '../assets/images/anthill_busy_ants_1783932869246.jpg';
import imgBodyHealthRunning from '../assets/images/body_health_running_1783932879813.jpg';
import imgSudaneseWiseFarmer from '../assets/images/sudanese_wise_farmer_1783937507425.jpg';
import imgTeethBrushingKids from '../assets/images/teeth_brushing_kids_1783931303450.jpg';
import imgCoveredCleanFood from '../assets/images/covered_clean_food_1783932920644.jpg';
import imgHungryBoyFeast from '../assets/images/hungry_boy_feast_1783932935766.jpg';
import imgSaltFlatsPortSudan from '../assets/images/salt_flats_port_sudan_1783932946735.jpg';
import imgMagicalCaveTreasure from '../assets/images/magical_cave_treasure_1783931328825.jpg';

// Map of custom lesson illustrations (matching LessonView.tsx)
const LESSON_ILLUSTRATIONS: Record<string, string> = {
  // Unit 1: قيم وآداب
  'u1-l1': imgSudaneseFamilyLove, // حب الوالدين
  'u1-l2': imgSudaneseParentHug, // نشيد أبي وأمي
  'u1-l3': imgSudaneseGuestWelcome, // إكرام الجار والضيف
  'u1-l4': imgSudaneseChickenSeller, // العيش الشريف
  'u1-l5': imgSudaneseFamilyLove, // مكارم الأخلاق

  // Unit 2: مدرستي
  'u2-l1': imgSudaneseSchoolKids, // العودة إلى المدرسة
  'u2-l2': imgSchoolCleaningKids, // نظافة المدرسة
  'u2-l3': imgSudanPrideIllustration, // تحية العلم
  'u2-l4': imgSudaneseSchoolKids, // في الطريق
  'u2-l5': imgSudaneseSchoolKids, // آداب المشي

  // Unit 3: وطني
  'u3-l1': imgSudanMapLandscape, // أحب بلادي
  'u3-l2': imgSudanNatureLandscape, // يا بلادي
  'u3-l3': imgSudaneseGirlHorse,      // مهيرة بت عبود
  'u3-l4': imgSudaneseSoldierHero, // عبد الفضيل الماظ
  'u3-l5': imgSudanIndependenceCelebration, // عيد الاستقلال

  // Unit 4: من حكم الحيوان
  'u4-l1': imgForestAnimalsIllustration, // الديك والثعلب
  'u4-l2': imgBeehiveHoneyBees,         // خلية النحل
  'u4-l3': imgCartoonCatMouse, // الفأر والقط
  'u4-l4': imgMeadowBirdsSinging, // طيور الرياض
  'u4-l5': imgAnthillBusyAnts, // النمل النشيط

  // Unit 5: صحتي
  'u5-l1': imgBodyHealthRunning, // أنا جسمك
  'u5-l2': imgSudaneseWiseFarmer, // الحواس الخمس
  'u5-l3': imgSudaneseFamilyLove, // الدواء في الغذاء
  'u5-l4': imgTeethBrushingKids,      // الأسنان اللامعة
  'u5-l5': imgCoveredCleanFood, // الأطعمة المكشوفة

  // Unit 6: تأملات متباينة
  'u6-l1': imgSudaneseWiseFarmer,  // المزارع الحكيم
  'u6-l2': imgHungryBoyFeast, // أشعب الأكول
  'u6-l3': imgSaltFlatsPortSudan,  // ملح الطعام
  'u6-l4': imgMagicalCaveTreasure,     // علي واللصوص
  'u6-l5': imgSudaneseSchoolKids, // لعبة الولد التائه
};

const UNIT_ILLUSTRATIONS: Record<string, string> = {
  'unit-1': imgSudaneseFamilyLove,
  'unit-2': imgSudaneseSchoolKids,
  'unit-3': imgSudanPrideIllustration,
  'unit-4': imgForestAnimalsIllustration,
  'unit-5': imgSudaneseFamilyLove,
  'unit-6': imgSudaneseWiseFarmer,
};

const UNIT_THEME_COLORS: Record<string, { bg: string, text: string, border: string, badge: string, accent: string }> = {
  'unit-1': { bg: 'bg-[#FFF5F5]', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-500 text-white', accent: 'text-rose-500' },
  'unit-2': { bg: 'bg-[#F0FDFA]', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-500 text-white', accent: 'text-teal-500' },
  'unit-3': { bg: 'bg-[#FFFBEB]', text: 'text-amber-800', border: 'border-amber-200', badge: 'bg-amber-500 text-white', accent: 'text-amber-500' },
  'unit-4': { bg: 'bg-[#F0FDF4]', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-500 text-white', accent: 'text-emerald-500' },
  'unit-5': { bg: 'bg-[#F4F4F5]', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-500 text-white', accent: 'text-slate-500' },
  'unit-6': { bg: 'bg-[#FAF5FF]', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-500 text-white', accent: 'text-purple-500' },
};

interface BookPage {
  pageNumber: number;
  type: 'cover' | 'index' | 'unit_cover' | 'lesson';
  title?: string;
  subtitle?: string;
  unitId?: string;
  lesson?: Lesson;
  unit?: Unit;
}

interface TextToken {
  text: string;
  isWord: boolean;
  isNewline: boolean;
  start: number;
  end: number;
}

function tokenizeText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const regex = /(\n+)|(\s+)|([^\s\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const start = match.index;
    const end = start + matchedText.length;
    const isNewline = matchedText.includes('\n');
    const isWord = !isNewline && /[^\s]/.test(matchedText);
    tokens.push({
      text: matchedText,
      isWord,
      isNewline,
      start,
      end,
    });
  }
  return tokens;
}

export default function TextbookFlipbook({ units, completedLessons, onSelectLesson }: TextbookFlipbookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpreading, setIsSpreading] = useState(true); // Double-page spread on desktop
  const [searchTerm, setSearchTerm] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const [speakingLessonId, setSpeakingLessonId] = useState<string | null>(null);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1);
  
  // Ref for swipe/drag detection
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isFlippingNext, setIsFlippingNext] = useState(false);
  const [isFlippingPrev, setIsFlippingPrev] = useState(false);

  // Compile Book Pages
  const pages: BookPage[] = [];

  // Page 1: Cover
  pages.push({
    pageNumber: 1,
    type: 'cover',
    title: 'لُغَتِي الْجَمِيلَةُ',
    subtitle: 'الصَّفُّ الثَّالِثُ الِابْتِدَائِيُّ',
  });

  // Page 2: Table of Contents / Index
  pages.push({
    pageNumber: 2,
    type: 'index',
    title: 'فِهْرِسُ الدُّرُوسِ الْمَنْهَجِيَّةِ',
  });

  // Programmatically map units and lessons into the pages list
  let pageCounter = 3;
  units.forEach((unit) => {
    // Add Unit Cover Page
    pages.push({
      pageNumber: pageCounter++,
      type: 'unit_cover',
      unitId: unit.id,
      unit: unit,
    });

    // Add Lesson Pages
    unit.lessons.forEach((lesson) => {
      pages.push({
        pageNumber: pageCounter++,
        type: 'lesson',
        unitId: unit.id,
        lesson: lesson,
      });
    });
  });

  // Adjust display pages based on desktop vs mobile view and spreads
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSpreading(false); // Single page on small screens
      } else {
        setIsSpreading(true);  // Double-page spread on desktop
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync fullscreen state with document state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Text-to-speech for lessons
  const speakText = (text: string, lessonId: string) => {
    playSound('read');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      
      setSpeakingLessonId(lessonId);
      setActiveCharIndex(-1);

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setActiveCharIndex(event.charIndex);
        }
      };

      utterance.onend = () => {
        setSpeakingLessonId(null);
        setActiveCharIndex(-1);
      };

      utterance.onerror = () => {
        setSpeakingLessonId(null);
        setActiveCharIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingLessonId(null);
    setActiveCharIndex(-1);
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    playSound('click');
    if (!bookContainerRef.current) return;

    if (!document.fullscreenElement) {
      bookContainerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Navigation functions
  const handleNextPage = () => {
    stopSpeaking();
    const step = isSpreading ? 2 : 1;
    if (currentPageIndex + step < pages.length) {
      setIsFlippingNext(true);
      playSound('click');
      setTimeout(() => {
        setCurrentPageIndex(prev => prev + step);
        setIsFlippingNext(false);
      }, 300);
    } else {
      playSound('failure');
    }
  };

  const handlePrevPage = () => {
    stopSpeaking();
    const step = isSpreading ? 2 : 1;
    if (currentPageIndex - step >= 0) {
      setIsFlippingPrev(true);
      playSound('click');
      setTimeout(() => {
        setCurrentPageIndex(prev => prev - step);
        setIsFlippingPrev(false);
      }, 300);
    } else {
      playSound('failure');
    }
  };

  const handleJumpToPage = (targetPageIndex: number) => {
    stopSpeaking();
    playSound('click');
    
    // Ensure index aligns correctly for double pages
    let index = targetPageIndex;
    if (isSpreading && index % 2 !== 0) {
      index = index - 1; // align to right page start index
    }
    
    setCurrentPageIndex(Math.max(0, Math.min(index, pages.length - 1)));

    // Smoothly scroll the book container into view so the user can see the content immediately
    setTimeout(() => {
      bookContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Pointer event handlers for custom drag/swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const currentX = e.clientX;
    const diffX = currentX - dragStartX.current;
    
    // Smooth responsive resistance drag display
    setDragOffset(diffX);
  };

  const handlePointerUp = () => {
    if (!isDragging.current || dragStartX.current === null) return;
    isDragging.current = false;
    
    const threshold = 80; // Swipe sensitivity
    if (dragOffset > threshold) {
      // Swipe from left to right (turn page forward / next page in Arabic)
      handleNextPage();
    } else if (dragOffset < -threshold) {
      // Swipe from right to left (turn page back / previous page in Arabic)
      handlePrevPage();
    }
    
    setDragOffset(0);
    dragStartX.current = null;
    dragStartY.current = null;
  };

  // Search filter
  const filteredLessons = searchTerm.trim() === '' ? [] : pages.filter(p => {
    if (p.type === 'lesson' && p.lesson) {
      return p.lesson.title.includes(searchTerm) || p.lesson.content.includes(searchTerm);
    }
    if (p.type === 'unit_cover' && p.unit) {
      return p.unit.title.includes(searchTerm) || p.unit.description.includes(searchTerm);
    }
    return false;
  });

  // Calculate pages currently on screen
  const rightPageIdx = currentPageIndex;
  const leftPageIdx = isSpreading ? currentPageIndex + 1 : -1;

  const rightPage = pages[rightPageIdx];
  const leftPage = leftPageIdx !== -1 && leftPageIdx < pages.length ? pages[leftPageIdx] : null;

  // Custom JSX for rendering a single textbook page beautifully
  const renderTextbookPage = (page: BookPage, isLeft: boolean) => {
    const isCompleted = page.lesson && completedLessons.includes(page.lesson.id);
    const theme = page.unitId ? UNIT_THEME_COLORS[page.unitId] : { bg: 'bg-white', text: 'text-slate-800', border: 'border-yellow-border/20', badge: 'bg-coral text-white', accent: 'text-coral' };

    switch (page.type) {
      case 'cover':
        return (
          <div className="w-full h-full bg-[#FCF8E8] p-6 md:p-12 flex flex-col items-center justify-between border-8 border-[#CD9655] rounded-2xl relative shadow-inner overflow-hidden select-none">
            {/* National Pyramids Graphic overlay */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#CD9655]/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 text-6xl opacity-15">🇸🇩</div>

            {/* Ministry stamp */}
            <div className="text-center">
              <p className="text-[10px] md:text-xs font-black text-[#8C6D41] tracking-widest leading-relaxed">جُمْهُورِيَّةُ السُّودَانِ</p>
              <p className="text-[9px] md:text-[10px] font-black text-[#AA8855]">وِزَارَةُ التَّرْبِيَّةِ وَالتَّعْلِيمِ</p>
              <div className="w-8 h-8 mx-auto mt-1 opacity-45 border border-[#8C6D41] rounded-full flex items-center justify-center text-[10px] font-black text-[#CD9655]">
                🦅
              </div>
            </div>

            {/* Main Title card */}
            <div className="my-auto flex flex-col items-center text-center gap-3 w-full">
              <span className="text-xs md:text-sm font-black bg-emerald-600 text-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-500 flex items-center gap-1.5">
                📖 كِتَابُ الطَّالِبِ الْمَدْرَسِيِّ
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-[#5B3E1B] leading-normal tracking-tight drop-shadow-sm mt-2 font-sans font-outline-2">
                لُغَتِي الْجَمِيلَةُ
              </h1>
              <p className="text-sm md:text-lg font-black text-[#CD9655] tracking-wider mt-1">
                الصَّفُّ الثَّالِثُ الِابْتِدَائِيُّ
              </p>
              <div className="w-32 h-1 bg-yellow-accent rounded-full mt-3"></div>
            </div>

            {/* Beautiful Sudanese pyamids vector */}
            <div className="flex justify-center items-end gap-3 mt-4">
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-[#CD9655]/40 relative"></div>
              <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-[#CD9655]/70 relative -mb-1"></div>
              <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-[#CD9655]/30 relative"></div>
            </div>

            {/* School Session badge */}
            <div className="text-center mt-6">
              <p className="text-[10px] font-bold text-slate-500">الْمَرْكَزُ الْقَوْمِيُّ لِلْمَنَاهِجِ وَالْبَحْثِ التَّرْبَوِيِّ - بَخْتُ الرِّضَا</p>
              <p className="text-[11px] font-black text-[#8C6D41] mt-1 bg-white/60 px-4 py-1 rounded-full border border-[#CD9655]/20 shadow-sm inline-block">الْمَنْهَجُ التَّفَاعُلِيُّ الْجَدِيدُ</p>
            </div>
          </div>
        );

      case 'index':
        return (
          <div className="w-full h-full bg-[#FFFBF0] p-5 md:p-8 flex flex-col justify-between border-2 border-[#EAD093]/40 rounded-2xl shadow-inner relative text-right">
            <div>
              {/* Header */}
              <div className="border-b-2 border-yellow-border/50 pb-3 mb-4 flex items-center justify-between">
                <span className="text-xs font-black text-slate-500">فِهْرِسُ الْمَوَاضِيعِ</span>
                <List className="w-5 h-5 text-coral" />
              </div>

              {/* Index Lists */}
              <h2 className="text-lg md:text-xl font-black text-charcoal mb-4 flex items-center gap-1.5 justify-start">
                📌 فِهْرِسُ عَنَاوِينِ دُرُوسِ الْمَنْهَجِ
              </h2>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {units.map((unit, uIdx) => {
                  // Find the target page index in pages array
                  const unitPageIdx = pages.findIndex(p => p.type === 'unit_cover' && p.unitId === unit.id);
                  
                  return (
                    <div key={unit.id} className="mb-3">
                      <button
                        onClick={() => handleJumpToPage(unitPageIdx)}
                        className="w-full text-right font-black text-xs md:text-sm text-coral hover:bg-coral/5 p-1 rounded transition flex items-center justify-between border-b border-coral/10"
                      >
                        <span className="flex items-center gap-1">
                          📁 الوحدة {uIdx + 1}: {unit.title.replace('الوحدة الأولى: ', '').replace('الوحدة الثانية: ', '').replace('الوحدة الثالثة: ', '').replace('الوحدة الرابعة: ', '').replace('الوحدة الخامسة: ', '').replace('الوحدة السادسة: ', '')}
                        </span>
                        <span className="text-[10px] text-slate-400">صفحة {unitPageIdx + 1}</span>
                      </button>

                      <div className="mr-3 mt-1 space-y-1 pl-1">
                        {unit.lessons.map(les => {
                          const lesPageIdx = pages.findIndex(p => p.type === 'lesson' && p.lesson?.id === les.id);
                          const isLesCompleted = completedLessons.includes(les.id);
                          return (
                            <button
                              key={les.id}
                              onClick={() => handleJumpToPage(lesPageIdx)}
                              className="w-full text-right text-[11px] md:text-xs text-slate-600 hover:text-coral hover:bg-slate-100 p-1.5 rounded flex items-center justify-between"
                            >
                              <span className="flex items-center gap-1">
                                📃 {les.title} {isLesCompleted && '✅'}
                              </span>
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">ص {lesPageIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/80 p-3 rounded-xl border border-yellow-border/40 text-[10px] md:text-xs text-slate-600 leading-relaxed shadow-sm">
              💡 <span className="font-bold text-coral">نصيحة ذكية:</span> يمكنك الضغط على أي درس أو وحدة بالفهرس للانتقال إليه فوراً بقلب الصفحات بشكل تفاعلي ممتع!
            </div>
          </div>
        );

      case 'unit_cover':
        if (!page.unit) return null;
        const unitTheme = UNIT_THEME_COLORS[page.unitId || ''] || { bg: 'bg-white', text: 'text-slate-800', border: 'border-yellow-border/20', badge: 'bg-coral text-white', accent: 'text-coral' };
        
        return (
          <div className={`w-full h-full ${unitTheme.bg} p-6 md:p-10 flex flex-col justify-between border-2 ${unitTheme.border} rounded-2xl shadow-inner relative text-right overflow-hidden`}>
            {/* Visual background decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

            <div className="flex flex-col items-center text-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black ${unitTheme.badge} shadow-sm uppercase tracking-wider`}>
                بِدَايَةُ الْوَحْدَةِ الدِّرَاسِيَّةِ
              </span>
              
              <h2 className={`text-2xl md:text-3xl font-black mt-4 leading-relaxed ${unitTheme.text} drop-shadow-sm font-sans`}>
                {page.unit.title}
              </h2>
              <div className="w-16 h-1 bg-yellow-accent rounded-full mt-1"></div>
            </div>

            {/* Centered illustration */}
            {UNIT_ILLUSTRATIONS[page.unitId || ''] && (
              <div className="my-auto mx-auto w-full max-w-sm rounded-2xl overflow-hidden border-2 border-yellow-border shadow-md bg-white p-2 transform rotate-1 scale-[0.98] cursor-zoom-in relative group">
                <img 
                  src={UNIT_ILLUSTRATIONS[page.unitId || '']} 
                  alt={page.unit.title}
                  className="w-full h-auto aspect-[16/10] object-cover rounded-xl select-none"
                  referrerPolicy="no-referrer"
                  onClick={() => setFullScreenImage(UNIT_ILLUSTRATIONS[page.unitId || ''])}
                />
                <button
                  onClick={() => setFullScreenImage(UNIT_ILLUSTRATIONS[page.unitId || ''])}
                  className="absolute top-4 left-4 bg-white/90 hover:bg-white text-coral p-1.5 rounded-full border border-yellow-border/40 shadow transition active:scale-95 flex items-center justify-center cursor-pointer z-10"
                  title="عرض بملء الشاشة 📺"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 text-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-yellow-border/20">
              <p className="text-xs font-black text-slate-700">مَحَاوِرُ هَذِهِ الْوَحْدَةِ:</p>
              <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed">
                {page.unit.description}
              </p>
            </div>

            {/* Navigation indicator */}
            <div className="text-center text-[10px] text-slate-400 font-bold">
              اقْلِبِ الصَّفْحَةَ لِتَبْدَأَ بِالْمَادَّةِ الْعِلْمِيَّةِ 📖
            </div>
          </div>
        );

      case 'lesson':
        if (!page.lesson) return null;
        const lesson = page.lesson;
        const pageTheme = UNIT_THEME_COLORS[page.unitId || ''] || { bg: 'bg-white', text: 'text-slate-800', border: 'border-[#F1C40F]/20', badge: 'bg-coral text-white', accent: 'text-coral' };
        const hasIllustration = LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId];

        const isThisLessonSpeaking = speakingLessonId === lesson.id;

        const renderBookWordTokens = (text: string, startOffset: number) => {
          const tokens = tokenizeText(text);
          return tokens.map((token, idx) => {
            if (token.isNewline) {
              return (
                <React.Fragment key={idx}>
                  {token.text.split('').map((_, i) => <br key={i} />)}
                </React.Fragment>
              );
            }

            if (!token.isWord) {
              return <span key={idx}>{token.text}</span>;
            }

            const absStart = startOffset + token.start;
            const absEnd = startOffset + token.end;
            const isHighlighted = isThisLessonSpeaking && activeCharIndex >= absStart && activeCharIndex < absEnd;

            return (
              <span
                key={idx}
                className={`transition-all duration-150 inline-block px-0.5 rounded ${
                  isHighlighted
                    ? 'bg-yellow-200 text-[#5B3E1B] font-extrabold scale-110 shadow-sm border-b-2 border-yellow-400'
                    : ''
                }`}
              >
                {token.text}
              </span>
            );
          });
        };

        // Pre-calculate poem stanza offsets relative to the spoken text
        let currentPoemOffset = 0;
        const bookStanzasWithOffsets = lesson.stanzas?.map((stanza) => {
          const text1 = stanza.hemistich1;
          const text2 = stanza.hemistich2;
          const startOffset = currentPoemOffset;
          
          const stanzaLength = text1.length + 2 + text2.length;
          currentPoemOffset += stanzaLength + 1; // +1 for trailing newline
          
          return {
            ...stanza,
            text1,
            text2,
            startOffset,
            text2RelOffset: text1.length + 2,
          };
        }) || [];

        // Pre-calculate paragraph offsets for Prose
        let currentProseOffset = 0;
        const bookParagraphsWithOffsets = lesson.content.split('\n').map((para) => {
          const startOffset = currentProseOffset;
          currentProseOffset += para.length + 1; // +1 for '\n'
          return {
            text: para,
            startOffset,
          };
        });

        return (
          <div className="w-full h-full bg-[#FCFBF7] p-4 md:p-6 flex flex-col justify-between border border-[#EBE7DF] rounded-2xl shadow-inner relative text-right">
            
            {/* Header with metadata */}
            <div className="border-b border-[#E3DCD0] pb-2 mb-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500 font-bold">
              <span>الصَّفُّ الثَّالِثُ - كِتَابُ الْقِرَاءَةِ</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${pageTheme.badge} opacity-90`}>
                {pageTheme.accent ? lesson.id.toUpperCase() : ''}
              </span>
            </div>

            {/* Core textbook content */}
            <div className="flex-1 flex flex-col overflow-y-auto pr-1">
              
              {/* Lesson Badge / Title */}
              <div className="mb-3">
                <span className={`text-[10px] font-black ${pageTheme.text} uppercase tracking-wider block mb-0.5`}>
                  {lesson.type === LessonType.Poem ? '🎼 أُنْشُودَةٌ مَنْهَجِيَّةٌ' : '📖 نَصُّ الْقِرَاءَةِ'}
                </span>
                <h3 className="text-base md:text-lg font-black text-charcoal leading-relaxed flex items-center gap-1.5 justify-start">
                  {lesson.title}
                  {isCompleted && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">مكتمل 🌟</span>}
                </h3>
              </div>

              {/* Optional Lesson Illustration */}
              {hasIllustration && (
                <div className="mb-3 max-w-md mx-auto w-full">
                  <div className="bg-white p-1.5 rounded-xl border border-yellow-border/40 shadow-sm relative cursor-zoom-in group">
                    <img 
                      src={LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]} 
                      alt={lesson.title}
                      className="w-full h-24 md:h-32 object-cover rounded-lg select-none"
                      referrerPolicy="no-referrer"
                      onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                    />
                    <button
                      onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                      className="absolute top-3 left-3 bg-white/90 hover:bg-white text-coral p-1.5 rounded-full border border-yellow-border/40 shadow transition active:scale-95 flex items-center justify-center cursor-pointer z-10"
                      title="عرض بملء الشاشة 📺"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Lesson Text formatting */}
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-800 leading-relaxed font-semibold text-justify font-sans">
                {lesson.type === LessonType.Poem ? (
                  /* Poem / Poem stanzas formatting */
                  <div className="space-y-2.5 max-w-xl mx-auto bg-[#FFFDF6] p-4 rounded-xl border border-yellow-border/30 shadow-inner">
                    {bookStanzasWithOffsets.map((stanza, sIdx) => {
                      const isCenteredSingleLine = !stanza.text2 || !stanza.text2.trim();
                      if (isCenteredSingleLine) {
                        return (
                          <div key={stanza.id} className="flex flex-col gap-1 text-center py-2 bg-coral/5 border border-dashed border-coral/25 rounded-xl p-2.5 my-1.5">
                            <div className="font-black text-coral text-[11px] sm:text-xs md:text-sm lg:text-base">
                              {renderBookWordTokens(stanza.text1, stanza.startOffset)}
                            </div>
                            {/* Mini divider between stanzas */}
                            {sIdx < (lesson.stanzas?.length || 0) - 1 && (
                              <div className="w-12 h-px bg-yellow-border/15 mx-auto mt-1.5"></div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div key={stanza.id} className="flex flex-col gap-1 text-center py-1.5">
                          {/* Double hemistich columns layout */}
                          <div className="grid grid-cols-2 gap-4 font-black text-slate-800 text-[11px] sm:text-xs md:text-sm lg:text-base">
                            <div className="bg-white/50 p-2 rounded border border-yellow-border/10 text-right pr-3">
                              {renderBookWordTokens(stanza.text1, stanza.startOffset)}
                            </div>
                            <div className="bg-white/50 p-2 rounded border border-yellow-border/10 text-left pl-3">
                              {renderBookWordTokens(stanza.text2, stanza.startOffset + stanza.text2RelOffset)}
                            </div>
                          </div>
                          {/* Mini divider between stanzas */}
                          {sIdx < (lesson.stanzas?.length || 0) - 1 && (
                            <div className="w-12 h-px bg-yellow-border/20 mx-auto"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Normal story prose with proper linebreaks and paragraph separation */
                  <div className="space-y-3 whitespace-pre-line bg-[#FFFDF6]/85 p-4 rounded-xl border border-yellow-border/10">
                    {bookParagraphsWithOffsets.map((para, pIdx) => (
                      <p key={pIdx} className="leading-relaxed font-bold tracking-wide text-justify text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-700">
                        {renderBookWordTokens(para.text, para.startOffset)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Dictionary Section: New Words (الكلمات الجديدة) */}
              {lesson.newWords && lesson.newWords.length > 0 && (
                <div className="mt-4 bg-[#FFFAEA] p-2.5 rounded-xl border-l-4 border-yellow-accent shadow-sm">
                  <p className="text-[10px] font-black text-amber-700 mb-1 flex items-center gap-1">
                    🔍 الْمُفْرَدَاتُ الْجَدِيدَةُ:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {lesson.newWords.map((word, wIdx) => (
                      <span key={wIdx} className="bg-white border border-[#F2DCA5] px-2 py-0.5 rounded-md text-[10px] font-black text-slate-700">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions bar for the lesson page */}
            <div className="border-t border-[#E3DCD0] pt-2 mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakText(lesson.type === LessonType.Poem 
                    ? lesson.stanzas?.map(s => `${s.hemistich1}  ${s.hemistich2}`).join('\n') || ''
                    : lesson.content,
                    lesson.id
                  )}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                  title="استمع إلى قراءة الدرس بصوت واضح"
                >
                  <Volume2 className="w-3 h-3" />
                  قِرَاءَةُ النَّصِّ 🔊
                </button>
                <button
                  onClick={stopSpeaking}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  title="إيقاف الصوت"
                >
                  ■
                </button>
              </div>

              <button
                onClick={() => onSelectLesson(lesson)}
                className="px-3 py-1 bg-teal-accent hover:bg-teal-600 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                الذَّهَابُ لِلْتَّمَارِينِ ✏️
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={bookContainerRef}
      className={`w-full flex flex-col gap-4 font-sans select-none text-right ${
        isFullscreen ? 'bg-cream p-3 md:p-6 h-screen justify-between overflow-hidden' : ''
      }`}
      dir="rtl"
    >
      {/* Top Header controls */}
      <div className="bg-white p-3 md:p-4 rounded-3xl border-2 border-yellow-border shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left indicators: Fullscreen, Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-full transition active:scale-95 cursor-pointer shadow-sm"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-coral" /> : <Maximize2 className="w-4 h-4 text-coral" />}
            <span>{isFullscreen ? 'شاشة عادية' : 'ملء الشاشة 📺'}</span>
          </button>
        </div>

        {/* Central Search block */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="ابحث عن درس أو موضوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-right py-1.5 pr-8 pl-3 border border-yellow-border/60 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-coral/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />

          {/* Floating Search Results */}
          {searchTerm.trim() !== '' && (
            <div className="absolute right-0 top-10 left-0 bg-white border-2 border-yellow-border rounded-2xl shadow-xl p-2.5 max-h-52 overflow-y-auto z-50 animate-fade-in text-right">
              <p className="text-[10px] font-bold text-slate-400 mb-1.5">نتائج البحث في الكتاب المنهجي:</p>
              {filteredLessons.length > 0 ? (
                filteredLessons.map(p => (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      handleJumpToPage(p.pageNumber - 1);
                      setSearchTerm('');
                    }}
                    className="w-full text-right text-xs p-1.5 rounded hover:bg-coral/5 hover:text-coral transition font-bold border-b border-slate-50 flex justify-between items-center"
                  >
                    <span>
                      {p.type === 'lesson' ? `📃 ${p.lesson?.title}` : `📁 ${p.unit?.title}`}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">ص {p.pageNumber}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">لا توجد دُروس تطابق بحثك</p>
              )}
            </div>
          )}
        </div>

        {/* Right Info Label */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-extrabold bg-amber-50/80 px-3.5 py-1.5 rounded-full border border-yellow-border/50">
          <Sparkles className="w-4 h-4 text-yellow-accent fill-current animate-pulse" />
          <span>كِتَابُ الْقِرَاءَةِ وَالْأَنَاشِيدِ التَّفَاعُلِيِّ الرَّقْمِيِّ 📚</span>
        </div>
      </div>

      {/* Main interactive Book Stage Wrapper */}
      <div 
        className={`flex-grow flex items-center justify-center relative py-4 bg-slate-100/50 rounded-[32px] border-2 border-dashed border-yellow-border/40 overflow-hidden cursor-grab active:cursor-grabbing shadow-inner ${
          isFullscreen 
            ? 'min-h-0 h-0 flex-1' 
            : 'min-h-[460px] md:min-h-[600px] lg:min-h-[680px]'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Swipe Hint Helper (Pulse Indicator) */}
        <div className="absolute bottom-3 left-4 text-[10px] font-black text-slate-400 pointer-events-none animate-pulse flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full shadow-sm z-30">
          👉 اسحب من اليسار لليمين لقلب الصفحات
        </div>

        {/* The Realistic Book Layout structure */}
        <div 
          className={`relative w-full transition-transform duration-300 z-10 select-none px-2 md:px-4 flex justify-center items-center ${
            isSpreading 
              ? 'aspect-[16/10] max-h-full max-w-[115vh] lg:max-w-[125vh]' 
              : 'aspect-[2/3] max-h-full max-w-[50vh]'
          }`}
          style={{
            transform: `translateX(${dragOffset * 0.15}px)`
          }}
        >
          {/* Virtual 3D Desk/Desk shadow background */}
          <div className="absolute inset-0 bg-white/5 rounded-3xl pointer-events-none shadow-2xl opacity-80 border-b-8 border-slate-300"></div>

          {/* Book Spine (3D Book center bind) on Double page view */}
          {isSpreading && (
            <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-slate-800/40 via-slate-900/50 to-slate-800/40 z-30 shadow-md border-l border-r border-black/10"></div>
          )}

          {/* Right Page (Double page view on desk, or Single Page on Mobile) */}
          <div 
            className={`h-full select-none relative z-20 transition-transform duration-300 ${
              isSpreading ? 'w-1/2 p-2 md:p-3 origin-left' : 'w-full max-w-md p-1'
            } ${isFlippingPrev ? 'rotate-y-[-90deg] scale-95 opacity-50' : ''}`}
            style={{
              perspective: '1000px'
            }}
          >
            <div className={`w-full h-full bg-white border-y border-[#CD9655]/40 shadow-xl overflow-hidden relative ${
              isSpreading ? 'rounded-r-2xl border-r-4' : 'rounded-2xl border-x-4'
            }`}>
              {/* Book margin right overlay shadow */}
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10"></div>
              {/* Inner page shadow near spine */}
              {isSpreading && (
                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10"></div>
              )}

              {/* Real page render */}
              {renderTextbookPage(rightPage, false)}

              {/* Right Page Number Badge */}
              <div className="absolute bottom-2 right-4 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200 shadow-sm z-30">
                {rightPage.pageNumber}
              </div>
            </div>
          </div>

          {/* Left Page (Double page view) */}
          {isSpreading && leftPage && (
            <div 
              className={`w-1/2 h-full p-2 md:p-3 select-none relative z-20 origin-right transition-transform duration-300 ${
                isFlippingNext ? 'rotate-y-90 scale-95 opacity-50' : ''
              }`}
              style={{
                perspective: '1000px'
              }}
            >
              <div className="w-full h-full bg-white rounded-l-2xl border-l-4 border-y border-[#CD9655]/40 shadow-xl overflow-hidden relative">
                {/* Book margin left overlay shadow */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10"></div>
                {/* Inner page shadow near spine */}
                <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/15 to-transparent pointer-events-none z-10"></div>
                
                {/* Real page render */}
                {renderTextbookPage(leftPage, true)}

                {/* Left Page Number Badge */}
                <div className="absolute bottom-2 left-4 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black border border-slate-200 shadow-sm z-30">
                  {leftPage.pageNumber}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Flip Floating navigation buttons */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-40">
          <button
            onClick={handleNextPage}
            className="w-10 h-10 bg-white/90 hover:bg-white text-coral rounded-full border border-yellow-border shadow-md flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-40">
          <button
            onClick={handlePrevPage}
            className="w-10 h-10 bg-white/90 hover:bg-white text-coral rounded-full border border-yellow-border shadow-md flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom controls: Slide indicator and shortcuts */}
      <div className="bg-white p-3 rounded-3xl border-2 border-yellow-border shadow-sm flex flex-col gap-3 select-none text-right">
        
        {/* Jump-slider and page ratio labels */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-extrabold shrink-0">
            صَفْحَة: {rightPage.pageNumber} {isSpreading && leftPage ? ` - ${leftPage.pageNumber}` : ''} / {pages.length}
          </span>

          <div className="flex-1 px-4 relative flex items-center">
            <input
              type="range"
              min={0}
              max={pages.length - 1}
              step={isSpreading ? 2 : 1}
              value={currentPageIndex}
              onChange={(e) => handleJumpToPage(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-coral"
            />
          </div>

          <span className="text-xs text-slate-500 font-extrabold shrink-0">
            الْغِلَافُ الأَخِيرُ 🏁
          </span>
        </div>

        {/* Table of Quick Chapter shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 justify-start border-t border-slate-100 pt-2.5">
          <span className="text-[10px] font-black text-slate-400">انتقال سريع:</span>
          
          <button
            onClick={() => handleJumpToPage(0)}
            className={`px-3 py-1 text-[10px] font-black rounded-full border transition ${
              currentPageIndex === 0 
                ? 'bg-coral text-white border-coral shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            📕 الغلاف
          </button>

          <button
            onClick={() => handleJumpToPage(1)}
            className={`px-3 py-1 text-[10px] font-black rounded-full border transition ${
              currentPageIndex === 1 
                ? 'bg-coral text-white border-coral shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            📋 الفهرس
          </button>

          {units.map((unit, uIdx) => {
            const unitPageIdx = pages.findIndex(p => p.type === 'unit_cover' && p.unitId === unit.id);
            const isCurrentUnit = rightPage.unitId === unit.id || (leftPage && leftPage.unitId === unit.id);
            
            return (
              <button
                key={unit.id}
                onClick={() => handleJumpToPage(unitPageIdx)}
                className={`px-3 py-1 text-[10px] font-black rounded-full border transition ${
                  isCurrentUnit 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                📂 الوحدة {uIdx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullScreenImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center gap-4 text-center">
              <motion.img
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                src={fullScreenImage}
                alt="معاينة الصورة"
                className="max-h-[80vh] max-w-full rounded-2xl border-4 border-white/10 shadow-2xl object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <div className="text-white flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenImage(null);
                  }}
                  className="mt-3 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-full transition shadow-md active:scale-95 cursor-pointer"
                >
                  إغلاق المعاينة ❌
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
