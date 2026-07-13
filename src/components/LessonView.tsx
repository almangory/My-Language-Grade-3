import React, { useState } from 'react';
import { Lesson, LessonType } from '../types';
import { Music, Star, BookOpen, Quote, Maximize2, Volume2, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import GrammarCard from './GrammarCard';
import { playSound } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

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

const LESSON_DETAILS: Record<string, { sticker: string; desc: string; label: string }> = {
  'u1-l1': { sticker: '👨‍👩‍👦', label: 'حُبُّ الْوَالِدَيْنِ', desc: 'بِرُّ الْوَالِدَيْنِ وَحُبُّ الْأُسْرَةِ الْجَمِيلَةِ الَّتِي تَتْعَبُ مِنْ أَجْلِنَا' },
  'u1-l2': { sticker: '💖', label: 'أَبِي وَأُمِّي', desc: 'نَشِيدُ وَالِدَيَّ الْحَبِيبَيْنِ وَعَطَاؤُهُمَا الدَّافِئُ الْكَبِيرُ' },
  'u1-l3': { sticker: '🏡', label: 'إِكْرَامُ الْجَارِ', desc: 'حُقُوقُ الْجَارِ وَالضَّيْفِ وَإِكْرَامُهُمَا بِالْأَخْلَاقِ الْكَرِيمَةِ' },
  'u1-l4': { sticker: '🐓', label: 'الْعَيْشُ الشَّرِيفُ', desc: 'الْعَيْشُ الشَّرِيفُ وَكِفَاحُ الْعَمِّ حَمْدَانَ الدَّجَّاجِ رَغْمَ الْعَمَى' },
  'u1-l5': { sticker: '🌟', label: 'مَكَارِمُ الْأَخْلَاقِ', desc: 'مِنْ مَكَارِمِ الْأَخْلَاقِ وَالْأَمَانَةِ وَمَحَبَّةِ الْجِيرَانِ وَالْإِخْوَةِ' },
  'u2-l1': { sticker: '🎒', label: 'الْعَوْدَةُ لِلْمَدْرَسَةِ', desc: 'نَشِيدُ الْعَوْدَةِ السَّعِيدَةِ لِمَقَاعِدِ الدِّرَاسَةِ وَالشَّوْقِ لِلْعِلْمِ' },
  'u2-l2': { sticker: '🧹', label: 'نَظَافَةُ الْمَدْرَسَةِ', desc: 'تَنْظِيفُ سَاحَةِ وَفُصُولِ الْمَدْرَسَةِ بِالتَّعَاوُنِ وَالنَّشَاطِ' },
  'u2-l3': { sticker: '🇸🇩', label: 'تَحِيَّةُ الْعَلَمِ', desc: 'تَحِيَّةُ عِلَمِ الْوَّطَنِ الْغَالِي بِكُلِّ فَخْرٍ وَاعْتِزَازٍ وَسَلَامٍ' },
  'u2-l4': { sticker: '🚦', label: 'فِي الطَّرِيقِ', desc: 'تَعَلُّمُ قَوَاعِدِ الْمُرُورِ وَآدَابِ الطَّرِيقِ لِلْمُحَافَظَةِ عَلَى سَلَامَتِنَا' },
  'u2-l5': { sticker: '🚶‍♂️', label: 'آدَابُ الْمَشْيِ', desc: 'نَشِيدُ كَيْفَ أَمْشِي فِي الطَّرِيقِ بِهُدُوءٍ وَاعْتِدَالٍ وَتَجَنُّبِ اللَّعِبِ' },
  'u3-l1': { sticker: '🕊️', label: 'أُحِبُّ بِلَادِي', desc: 'حُبُّ الْوَطَنِ الْغَالِي وَلُغَتِنَا الْجَمِيلَةِ وَحَنِينِ الْحَمَامَةِ لِبَيْتِهَا' },
  'u3-l2': { sticker: '🌳', label: 'يَا بِلَادِي', desc: 'نَشِيدُ يَا بِلَادِي وَجَمَالُ طَبِيعَتِهَا وَأَشْجَارِهَا وَثِمَارِهَا الشَّهِيَّةِ' },
  'u3-l3': { sticker: '🐎', label: 'مَهِيرَةُ بِنْتُ عَبُّودٍ', desc: 'بُطُولَةُ وَشَجَاعَةُ مَهِيرَةَ بِنْتِ عَبُّودٍ وَحَثُّ قَوْمِهَا بِالْحَمَاسِ' },
  'u3-l4': { sticker: '🎖️', desc: 'شَجَاعَةُ الضَّابِطِ عَبْدِ الْفَضِيلِ أَلْمَاظِ وَدِفَاعُهُ عَنِ اسْتِقْلَالِ بِلَادِهِ', label: 'عَبْدُ الْفَضِيلِ أَلْمَاظٌ' },
  'u3-l5': { sticker: '🇸🇩', desc: 'قِصَّةُ يَوْمِ اسْتِقْلَالِ السُّودَانِ الْمَجِيدِ وَرَفْعِ الْعَلَمِ الْحُرِّ', label: 'عِيدُ الِاسْتِقْلَالِ' },
  'u4-l1': { sticker: '🦊', desc: 'فِطْنَةُ وَذَكَاءُ الدِّيكِ لِتَجَنُّبِ مَكْرِ وَخِدَاعِ الثَّعْلَبِ الْمُحْتَالِ', label: 'الدِّيكُ وَالثَّعْلَبُ' },
  'u4-l2': { sticker: '🐝', desc: 'خَلِيَّةُ النَّحْلِ النَّشِيطَةِ وَالتَّعَاوُنِ لِصُنْعِ الْعَسَلِ الشَّافِي لِلنَّاسِ', label: 'خَلِيَّةُ النَّحْلِ' },
  'u4-l3': { sticker: '🐱', desc: 'حِوَارُ الْفَأْرِ الذَّكِيِّ وَالْقِطِّ الشِّرِّيرِ وَسَطِ مِيَاهِ النِّيلِ', label: 'الْفَأْرُ وَالْقِطُّ' },
  'u4-l4': { sticker: '🐦', desc: 'نشيد طُيُورِ الرِّيَاضِ وَأَلْحَانِ الطَّبِيعَةِ وَخَرِيرِ الْمِيَاهِ الْعَذْبَةِ', label: 'طُيُورُ الرِّيَاضِ' },
  'u4-l5': { sticker: '🐜', desc: 'حَيَاةُ النَّمْلِ النَّشِيطِ تَحْتَ الْأَرْضِ وَتَقْسِيمِ الْأَعْمَالِ وَالِادِّخَارِ', label: 'النَّمْلُ النَّشِيطُ' },
  'u5-l1': { sticker: '👦', desc: 'مَرَاحِلُ نُمُوِّ الْجِسْمِ الصَّحِيحِ وَحَاجَتِهِ لِلْغِذَاءِ وَالرِّيَاضَةِ وَالنَّوْمِ', label: 'أَنَا جِسْمُكَ' },
  'u5-l2': { sticker: '👂', desc: 'الْحَوَاسُّ الْخَمْسُ الْعَجِيبَةُ وَكَيْفِيَّةُ اسْتِخْدَامِهَا وَالْمُحَافَظَةِ عَلَيْهَا', label: 'الْحَوَاسُّ الْخَمْسُ' },
  'u5-l3': { sticker: '🍎', desc: 'الدَّوَاءُ فِي الْغِذَاءِ وَتَنَوُّعِ الْأَكْلِ وَحِكْمَةِ الْجَدِّ فِي تَنَوُّعِ الْغِذَاءِ', label: 'الدَّوَاءُ فِي الْغِذَاءِ' },
  'u5-l4': { sticker: '🪥', desc: 'الطَّرِيقَةُ الصَّحِيحَةُ لِتَنْظِيفِ الْأَسْنَانِ بِالْفُرْشَاةِ وَالْمَعْجُونِ', label: 'الْأَسْنَانُ اللَّامِعَةُ' },
  'u5-l5': { sticker: '🦟', desc: 'خَطَرُ الْأَطْعَمَةِ الْمَكْشُوفَةِ وَالْجَرَاثِيمِ وَوِقَايَةُ الصِّحَّةِ بِالنَّظَافَةِ', label: 'الْأَطْعَمَةُ الْمَكْشُوفَةُ' },
  'u6-l1': { sticker: '🌾', desc: 'وَصِيَّةُ الْمُزَارِعِ الْحَكِيمِ لِوَلَدِهِ وَالْبَحْثِ عَنِ الْكَنْزِ الْحَقِيقِيِّ وَهُوَ الْعَمَلُ', label: 'الْمُزَارِعُ الْحَكِيمُ' },
  'u6-l2': { sticker: '🍲', desc: 'نَوَادِرُ أَشْعَبَ الْأَكُولِ الطَّرِيفَةِ وَحُكْمُهُ بِالصُّلْحِ بَيْنَ الْأَكَلَاتِ', label: 'أَشْعَبُ الْأَكُولُ' },
  'u6-l3': { sticker: '🧂', desc: 'مِلْحُ الطَّعَامِ وَفَوَائِدُهُ وَكَيْفِيَّةُ اسْتِخْرَاجِهِ مِنْ مَلَّاحَاتِ بُورْتِسُودَانَ', label: 'مِلْحُ الطَّعَامِ' },
  'u6-l4': { sticker: '🚪', desc: 'مَسْرَحِيَّةُ التَّاجِرِ عَلِيٍّ وَاللُّصُوصِ وَبَوَّابَةِ الْغَارِ السِّحْرِيَّةِ', label: 'عَلِيٌّ وَاللُّصُوصُ' },
  'u6-l5': { sticker: '⭕', desc: 'لُعْبَةُ الْوَلَدِ التَّائِهِ الْجَمِيلَةِ وَأَنَاشِيدِ الطُّفُولَةِ وَمَحَبَّةِ الْأَصْدِقَاءِ', label: 'لُعْبَةُ الْوَلَدِ التَّائِهِ' },
};

interface LessonViewProps {
  lesson: Lesson;
  showGrammarCard?: boolean;
  setShowGrammarCard?: (show: boolean) => void;
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

export default function LessonView({ 
  lesson,
  showGrammarCard: externalShowGrammarCard,
  setShowGrammarCard: externalSetShowGrammarCard
}: LessonViewProps) {
  const [activeCharIndex, setActiveCharIndex] = React.useState<number>(-1);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [localShowGrammarCard, setLocalShowGrammarCard] = useState<boolean>(false);

  const showGrammarCard = externalShowGrammarCard !== undefined ? externalShowGrammarCard : localShowGrammarCard;
  const setShowGrammarCard = externalSetShowGrammarCard !== undefined ? externalSetShowGrammarCard : setLocalShowGrammarCard;

  // Reading Mode States (with LocalStorage persistence)
  const [readingMode, setReadingMode] = useState<'standard' | 'warm' | 'soft-dark'>(() => {
    try {
      return (localStorage.getItem('reading_mode') as 'standard' | 'warm' | 'soft-dark') || 'standard';
    } catch {
      return 'standard';
    }
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    try {
      return (localStorage.getItem('reading_font_size') as 'sm' | 'md' | 'lg' | 'xl') || 'md';
    } catch {
      return 'md';
    }
  });
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold' | 'black'>(() => {
    try {
      return (localStorage.getItem('reading_font_weight') as 'normal' | 'bold' | 'black') || 'bold';
    } catch {
      return 'bold';
    }
  });
  const [textWidth, setTextWidth] = useState<'narrow' | 'medium' | 'wide'>(() => {
    try {
      return (localStorage.getItem('reading_text_width') as 'narrow' | 'medium' | 'wide') || 'medium';
    } catch {
      return 'medium';
    }
  });

  // Persist settings
  React.useEffect(() => {
    try {
      localStorage.setItem('reading_mode', readingMode);
    } catch (e) {}
  }, [readingMode]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_font_size', fontSize);
    } catch (e) {}
  }, [fontSize]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_font_weight', fontWeight);
    } catch (e) {}
  }, [fontWeight]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_text_width', textWidth);
    } catch (e) {}
  }, [textWidth]);

  // Color mapping helpers
  const getTextColor = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'text-charcoal';
    if (mode === 'warm') return 'text-[#4E3620]';
    return 'text-[#F4ECE1]';
  };

  const getHoverBg = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'hover:bg-yellow-accent/40 hover:text-coral';
    if (mode === 'warm') return 'hover:bg-[#EAD4AC]/40 hover:text-[#C84B31]';
    return 'hover:bg-[#4E3D33] hover:text-[#FFE66D]';
  };

  const getHighlightedClass = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'bg-yellow-200 text-[#5B3E1B] font-extrabold scale-105 shadow-sm border-yellow-400';
    if (mode === 'warm') return 'bg-[#EAD4AC] text-[#3D2305] font-extrabold scale-105 shadow-sm border-amber-500';
    return 'bg-yellow-accent text-charcoal font-extrabold scale-105 shadow-sm border-yellow-300';
  };

  const getStanzaHoverBg = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'hover:bg-cream/40 hover:border-yellow-border/60';
    if (mode === 'warm') return 'hover:bg-[#F2E7CD]/45 hover:border-amber-300/60';
    return 'hover:bg-[#3D332B] hover:border-[#4A3D33]/60';
  };

  // Font style mappings
  const fontSizeClass = 
    fontSize === 'sm' ? 'text-base md:text-lg' : 
    fontSize === 'md' ? 'text-lg md:text-xl' : 
    fontSize === 'lg' ? 'text-xl md:text-2xl' : 
    'text-2xl md:text-3xl lg:text-4xl';

  const fontWeightClass = 
    fontWeight === 'normal' ? 'font-semibold' : 
    fontWeight === 'bold' ? 'font-bold' : 
    'font-black';

  const textWidthClass = 
    textWidth === 'narrow' ? 'max-w-xl' : 
    textWidth === 'medium' ? 'max-w-3xl' : 
    'max-w-full';

  // Speech synthesis helpers to speak single words on demand
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove common punctuation and emojis to make pronunciation clean
      const cleanWord = word
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?«»"']/g, "")
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, "")
        .trim();
      if (cleanWord) {
        const ut = new SpeechSynthesisUtterance(cleanWord);
        ut.lang = 'ar-SA';
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || null;
        if (arabicVoice) {
          ut.voice = arabicVoice;
        }
        ut.rate = 0.65; // Slightly slower, perfect for children learning to read
        window.speechSynthesis.speak(ut);
      }
    }
  };

  // Helper to get prefix text - set to empty so the TTS reader skips title and new words
  const getPrefixText = (): string => {
    return "";
  };

  // Aggregate text for TTS read-aloud (Directly starts with the lesson content)
  const getFullTextForReading = (): string => {
    let text = "";
    if (lesson.type === LessonType.Poem && lesson.stanzas) {
      text += lesson.stanzas.map(s => `${s.hemistich1}  ${s.hemistich2}`).join('\n');
    } else {
      text += lesson.content;
    }
    return text;
  };

  const prefixLength = 0;

  // Render interactive text with optional word highlighting for prose
  const renderInteractiveText = (text: string) => {
    const tokens = tokenizeText(text);
    
    return (
      <div className="leading-loose mb-2">
        {tokens.map((token, idx) => {
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

          const absStart = prefixLength + token.start;
          const absEnd = prefixLength + token.end;
          const isHighlighted = activeCharIndex >= absStart && activeCharIndex < absEnd;

          const highlightStyle = isHighlighted
            ? getHighlightedClass(readingMode)
            : `${getTextColor(readingMode)} ${getHoverBg(readingMode)} border-transparent`;

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${highlightStyle}`}
                title="اضغط لسماع نطق الكلمة بالصوت 🔊"
              >
                {token.text}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Render poetry hemistich with precise offset highlighting
  const renderHemistichTokens = (text: string, startOffset: number) => {
    const tokens = tokenizeText(text);
    return (
      <div className="leading-loose">
        {tokens.map((token, idx) => {
          if (!token.isWord) {
            return <span key={idx}>{token.text}</span>;
          }

          const absStart = startOffset + token.start;
          const absEnd = startOffset + token.end;
          const isHighlighted = activeCharIndex >= absStart && activeCharIndex < absEnd;

          const highlightStyle = isHighlighted
            ? getHighlightedClass(readingMode)
            : `${getTextColor(readingMode)} ${getHoverBg(readingMode)} border-transparent`;

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${highlightStyle}`}
                title="اضغط لسماع نطق الكلمة بالصوت 🔊"
              >
                {token.text}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Pre-calculate poem stanza offsets relative to the spoken text
  let currentOffset = prefixLength;
  const stanzasWithOffsets = lesson.stanzas?.map((stanza) => {
    const text1 = stanza.hemistich1;
    const text2 = stanza.hemistich2;
    const startOffset = currentOffset;
    
    // Stanza spoken text is "text1  text2"
    const stanzaLength = text1.length + 2 + text2.length;
    currentOffset += stanzaLength + 1; // +1 for trailing newline
    
    return {
      ...stanza,
      text1,
      text2,
      startOffset,
      text2RelOffset: text1.length + 2,
    };
  }) || [];

  return (
    <div className="flex flex-col gap-6 select-text text-charcoal">
      {/* Playful Header */}
      <div className="flex flex-col gap-3 bg-white p-6 rounded-[32px] border-2 border-yellow-border relative overflow-hidden shadow-sm">
        {/* Playful absolute accents */}
        <div className="absolute top-2 left-2 text-coral/10 transform rotate-12">
          <BookOpen className="w-16 h-16" />
        </div>
        
        <div className="flex items-center gap-3">
          {lesson.type === LessonType.Poem ? (
            <span className="bg-yellow-accent text-coral px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm border border-yellow-border animate-bounce">
              <Music className="w-3.5 h-3.5" />
              نشيد ملون وعذب 🎵
            </span>
          ) : (
            <span className="bg-teal-accent text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              قراءة ومفردات 📖
            </span>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight leading-relaxed">
          {lesson.title}
        </h2>

        {/* New words shelf */}
        {lesson.newWords && lesson.newWords.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-coral bg-cream px-3 py-1.5 rounded-xl border border-yellow-border shadow-sm">
              الكلمات الجديدة ✨ (اضغط لقراءتها):
            </span>
            {lesson.newWords.map((word, index) => (
              <span
                key={index}
                className="bg-white px-3.5 py-1 rounded-full text-xs font-black text-charcoal border-2 border-yellow-border shadow-sm hover:scale-105 hover:bg-cream/40 transition-all duration-150 cursor-pointer"
                title="اضغط للاستماع للكلمة"
                onClick={() => speakWord(word)}
              >
                {word} 🔊
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Body Sheet (Simulating an editable Interactive PDF book leaf) */}
      <div className={`rounded-[40px] p-6 md:p-10 shadow-lg border-2 transition-all duration-300 relative ${
        readingMode === 'standard'
          ? 'bg-white border-yellow-border text-charcoal'
          : readingMode === 'warm'
          ? 'bg-[#FDF6E2] border-amber-300'
          : 'bg-[#2D231D] border-[#4A3D33]'
      }`}>
        {/* PDF notebook margins and hole punches */}
        <div className={`absolute top-0 bottom-0 left-4 w-0.5 hidden md:block transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-rose-200' : readingMode === 'warm' ? 'bg-amber-200/50' : 'bg-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-0 bottom-0 left-6 w-0.5 hidden md:block transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-rose-200' : readingMode === 'warm' ? 'bg-amber-200/50' : 'bg-[#4A3D33]'
        }`}></div>
        
        {/* Punch holes in the book */}
        <div className={`absolute top-1/4 left-1 w-4 h-4 rounded-full border hidden md:block transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-1/2 left-1 w-4 h-4 rounded-full border hidden md:block transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-3/4 left-1 w-4 h-4 rounded-full border hidden md:block transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>

        {/* Reading Settings Toolbar */}
        <div className={`mb-6 pb-6 border-b-2 border-dashed flex flex-col lg:flex-row items-center justify-between gap-4 select-none relative z-10 transition-colors duration-300 ${
          readingMode === 'standard' 
            ? 'border-yellow-border/30 text-charcoal' 
            : readingMode === 'warm' 
            ? 'border-amber-300/30 text-[#4E3620]' 
            : 'border-[#4A3D33]/40 text-[#F4ECE1]'
        }`}>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors duration-300 ${
              readingMode === 'standard' ? 'bg-coral/10 text-coral' : readingMode === 'warm' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/40 text-yellow-accent'
            }`}>
              📖
            </span>
            <div className="text-right">
              <h4 className={`text-sm font-black transition-colors duration-300 ${
                readingMode === 'standard' ? 'text-charcoal' : readingMode === 'warm' ? 'text-[#4E3620]' : 'text-[#F4ECE1]'
              }`}>إعدادات القراءة والمظهر</h4>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>تحكم في وضع المظهر وسُمك وحجم وعرض الخطوط لراحة عينيك</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* Theme / Reading Mode Selector */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <button
                onClick={() => setReadingMode('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'standard'
                    ? 'bg-white text-charcoal shadow-sm border border-yellow-border/50'
                    : 'text-slate-600 hover:text-charcoal'
                }`}
                title="الوضع الافتراضي الأبيض"
              >
                ☀️ عادي
              </button>
              <button
                onClick={() => setReadingMode('warm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'warm'
                    ? 'bg-[#FFF9E6] text-[#4E3620] shadow-sm border border-amber-300/60'
                    : readingMode === 'standard' ? 'text-slate-600 hover:text-charcoal' : 'text-[#9C8F84] hover:text-[#F4ECE1]'
                }`}
                title="الوضع الدافئ المريح جداً للعين"
              >
                🌾 دافئ
              </button>
              <button
                onClick={() => setReadingMode('soft-dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'soft-dark'
                    ? 'bg-[#2D231D] text-[#F4ECE1] shadow-sm border border-[#4A3D33]'
                    : readingMode === 'standard' ? 'text-slate-600 hover:text-charcoal' : 'text-[#826E5D]'
                }`}
                title="الوضع الهادئ لقرائة ليلية مريحة"
              >
                🌙 هادئ
              </button>
            </div>

            {/* Font Size Selector */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>الحجم:</span>
              <button
                onClick={() => setFontSize('sm')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  fontSize === 'sm' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط صغير"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[14px] font-black transition-all cursor-pointer ${
                  fontSize === 'md' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط متوسط"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[18px] font-black transition-all cursor-pointer ${
                  fontSize === 'lg' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط كبير"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[22px] font-black transition-all cursor-pointer ${
                  fontSize === 'xl' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط ضخم جداً"
              >
                أ+
              </button>
            </div>

            {/* Font Weight Selector (سُمك الخط) */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>السُّمك:</span>
              <button
                onClick={() => setFontWeight('normal')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'normal' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عادي
              </button>
              <button
                onClick={() => setFontWeight('bold')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'bold' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عريض
              </button>
              <button
                onClick={() => setFontWeight('black')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'black' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عريض جداً
              </button>
            </div>

            {/* Column Width / Text Width Control (عرض النص) */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>عرض النص:</span>
              <button
                onClick={() => setTextWidth('narrow')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'narrow' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص ضيق ومريح للتركيز"
              >
                ضيق
              </button>
              <button
                onClick={() => setTextWidth('medium')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'medium' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص متوسط"
              >
                متوسط
              </button>
              <button
                onClick={() => setTextWidth('wide')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'wide' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص كامل"
              >
                كامل
              </button>
            </div>
          </div>
        </div>

        {/* Beautiful Lesson Illustration (Child-appealing, with a Polaroid/Frame effect) */}
        {(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]) && (
          <div className="mb-8 md:pr-10 flex flex-col items-center">
            <div className={`w-full max-w-2xl p-4 rounded-3xl border-2 shadow-md transform hover:rotate-1 hover:scale-[1.01] transition-all duration-300 relative ${
              readingMode === 'standard' 
                ? 'bg-[#FFFBF0] border-yellow-border' 
                : readingMode === 'warm' 
                ? 'bg-[#F2E8CD] border-amber-300' 
                : 'bg-[#221A15] border-[#4A3D33]'
            }`}>
              
              {/* Creative Sticker Stamp (Lesson-specific) */}
              {LESSON_DETAILS[lesson.id] && (
                <div className={`absolute -top-4 -right-4 border-2 shadow-lg rounded-full px-3.5 py-1.5 z-20 flex items-center gap-2 transform rotate-3 select-none transition-colors duration-300 ${
                  readingMode === 'standard' 
                    ? 'bg-white border-yellow-border text-slate-800' 
                    : readingMode === 'warm' 
                    ? 'bg-[#FCF5E3] border-amber-300 text-[#4E3620]' 
                    : 'bg-[#1E1E1E] border-[#4A3D33] text-[#F4ECE1]'
                }`}>
                  <span className="text-2xl">{LESSON_DETAILS[lesson.id].sticker}</span>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-coral leading-none">طابع ترفيهي 🌟</p>
                    <p className="text-[11px] font-black leading-tight mt-0.5">{LESSON_DETAILS[lesson.id].label}</p>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl relative border border-yellow-border/30 shadow-inner group cursor-zoom-in">
                <img 
                  src={LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]} 
                  alt={lesson.title} 
                  className="w-full h-auto aspect-[16/9] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 select-none"
                  referrerPolicy="no-referrer"
                  onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                />
                
                {/* Fullscreen Button overlay */}
                <button
                  onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                  className="absolute top-3 left-3 bg-white/95 hover:bg-white text-coral p-2 rounded-full border border-yellow-border/50 shadow transition active:scale-95 flex items-center gap-1.5 text-[10px] font-black cursor-pointer"
                  title="عرض بملء الشاشة 📺"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>تكبير الصورة 🔍</span>
                </button>

                {/* Visual Label overlay */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-coral border border-yellow-border/50 shadow flex items-center gap-1">
                  🎨 لوحة الدرس التوضيحية
                </div>
              </div>

              {/* Lesson Specific Description */}
              {LESSON_DETAILS[lesson.id] && (
                <div className={`mt-4 p-3 rounded-2xl border transition-colors duration-300 text-right ${
                  readingMode === 'standard' 
                    ? 'bg-white border-yellow-border/30 text-slate-800' 
                    : readingMode === 'warm' 
                    ? 'bg-[#FCF5E3] border-amber-300/40 text-[#4E3620]' 
                    : 'bg-[#1E1E1E] border-[#4A3D33]/40 text-[#D5C7B7]'
                }`}>
                  <p className="font-extrabold text-xs md:text-sm flex flex-row-reverse items-center gap-2 justify-start leading-relaxed">
                    <span className="text-coral shrink-0">🎯 فكرة الدرس اليوم:</span>
                    <span>{LESSON_DETAILS[lesson.id].desc}</span>
                  </p>
                </div>
              )}

              <p className={`text-center font-bold text-[11px] md:text-xs mt-3 ${
                readingMode === 'standard' ? 'text-slate-600' : readingMode === 'warm' ? 'text-[#6E553F]' : 'text-[#B2A394]'
              }`}>
                🖼️ رسمة توضيحية لدرس: <span className="text-coral underline font-black">{lesson.title}</span>
              </p>
            </div>
          </div>
        )}

        {/* Content Renderers */}
        {lesson.type === LessonType.Poem && lesson.stanzas ? (
          /* Poetry Layout - classical Arabic bicolumn display */
          <div className={`flex flex-col gap-6 md:gap-8 mx-auto py-4 select-text transition-all duration-300 ${textWidthClass}`}>
            {stanzasWithOffsets.map((stanza, index) => (
              <div 
                key={stanza.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center text-center group transition-all duration-200 p-2.5 rounded-2xl border border-transparent ${getStanzaHoverBg(readingMode)}`}
              >
                {/* Right side (الصدر) */}
                <div className={`font-serif leading-relaxed md:text-left md:pl-2 ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
                  {renderHemistichTokens(stanza.text1, stanza.startOffset)}
                </div>

                {/* Decorative Separator */}
                <div className="flex justify-center text-coral scale-90 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-300">
                  {index % 2 === 0 ? <Music className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
                </div>

                {/* Left side (العجز) */}
                <div className={`font-serif leading-relaxed md:text-right md:pr-2 ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
                  {renderHemistichTokens(stanza.text2, stanza.startOffset + stanza.text2RelOffset)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Normal Lesson Text Layout */
          <div className={`md:pr-10 select-text mx-auto transition-all duration-300 ${textWidthClass}`}>
            <div className={`absolute top-8 right-8 opacity-10 pointer-events-none ${
              readingMode === 'soft-dark' ? 'text-white' : 'text-yellow-accent'
            }`}>
              <Quote className="w-16 h-16 transform scale-x-[-1]" />
            </div>

            <div className={`font-serif leading-loose text-justify whitespace-pre-line ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
              {renderInteractiveText(lesson.content)}
            </div>
          </div>
        )}

        {/* Playful cartoon note at the bottom */}
        <div className={`mt-8 border-t-2 border-dashed pt-6 flex items-start gap-3 p-4 rounded-2xl border transition-colors duration-300 ${
          readingMode === 'standard' 
            ? 'border-yellow-border/40 bg-cream/50 border-yellow-border/30' 
            : readingMode === 'warm' 
            ? 'border-amber-300/40 bg-[#FAF1DC]/60 border-amber-300/30 text-[#4E3620]' 
            : 'border-[#4A3D33]/40 bg-[#1E1E1E]/50 border-[#4A3D33]/30 text-[#D5C7B7]'
        }`}>
          <span className="text-3xl">💡</span>
          <div className="text-right">
            <p className="font-bold text-coral text-xs md:text-sm">نصيحة المعلم الصغير 🧑‍🏫:</p>
            <p className={`text-xs mt-1 font-extrabold ${
              readingMode === 'standard' ? 'text-slate-600' : readingMode === 'warm' ? 'text-[#6E553F]' : 'text-[#B2A394]'
            }`}>
              ✨ ميزة جديدة رائعة: اضغط على أي كلمة في الدرس أو النشيد لسماع نطقها الصحيح بالصوت! 🔊
            </p>
          </div>
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
                alt={lesson.title}
                className="max-h-[80vh] max-w-full rounded-2xl border-4 border-white/10 shadow-2xl object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <div className="text-white flex flex-col items-center">
                <p className="font-extrabold text-sm md:text-base">{lesson.title}</p>
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

      {/* Floating Audio Player Box (صندوق القارئ الآلي العائم) */}
      <AnimatePresence>
        {showAudioPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed bottom-44 right-4 left-4 sm:left-auto sm:right-6 md:right-12 z-40 max-w-full sm:w-[500px] bg-white rounded-[32px] border-4 border-[#FFD93D] shadow-2xl p-5"
            dir="rtl"
          >
            {/* Header of the floating box */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span className="text-xs font-black text-coral bg-cream px-2.5 py-1 rounded-full border border-yellow-border">
                  مُسَاعِدُ الْقِرَاءَةِ الذَّكِيِّ
                </span>
              </div>
              <button
                onClick={() => {
                  setShowAudioPlayer(false);
                  try { playSound('click'); } catch(e){}
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer border border-transparent hover:border-slate-200 active:scale-95"
                title="إغلاق الصندوق ❌"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AudioPlayer inside the box */}
            <div className="max-h-[380px] overflow-y-auto pr-1">
              <AudioPlayer 
                textToRead={getFullTextForReading()} 
                title={lesson.title} 
                lessonId={lesson.id}
                audioUrl={lesson.audioUrl}
                onBoundary={setActiveCharIndex}
                onEnd={() => setActiveCharIndex(-1)}
                onStart={() => setActiveCharIndex(-1)}
              />
            </div>
            
            <p className="text-center text-[10px] font-bold text-slate-400 mt-3 leading-normal">
              💡 يمكنك استماع القراءة أثناء تصفح الدرس وقراءة الكلمات المضيئة!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Player Trigger Button (أيقونة الصوت العائمة) */}
      <motion.button
        onClick={() => {
          setShowAudioPlayer(!showAudioPlayer);
          try { playSound('click'); } catch(e){}
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-24 right-6 md:right-12 z-50 flex items-center justify-center gap-2.5 px-5 py-4 rounded-full shadow-2xl transition-all duration-300 border-3 border-white ${
          showAudioPlayer
            ? 'bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 shadow-rose-500/30'
            : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white animate-bounce shadow-emerald-500/30'
        }`}
        style={{ animationDuration: '3s' }}
        title="تنشيط القارئ الصوتي الآلي 🤖🔊"
      >
        <Volume2 className={`w-6 h-6 ${showAudioPlayer ? 'rotate-12' : 'animate-pulse'}`} />
        <span className="text-sm font-black hidden sm:inline-block tracking-tight">الْقَارِئُ الْآلِيُّ 🤖🔊</span>
      </motion.button>

      {/* Floating Grammar Card Box (صندوق القواعد العائم) */}
      <AnimatePresence>
        {showGrammarCard && lesson.grammarRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-[32px] border-4 border-amber-400 shadow-2xl p-2"
            >
              {/* Close Button on top of the card */}
              <button
                onClick={() => {
                  setShowGrammarCard(false);
                  try { playSound('click'); } catch(e){}
                }}
                className="absolute top-5 left-5 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-md active:scale-95"
                title="إغلاق ❌"
              >
                <X className="w-5 h-5" />
              </button>

              <GrammarCard
                grammarRule={lesson.grammarRule}
                readingMode={readingMode}
                speakWord={speakWord}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Grammar Rules Trigger Button */}
      {lesson.grammarRule && (
        <motion.button
          onClick={() => {
            setShowGrammarCard(!showGrammarCard);
            try { playSound('click'); } catch(e){}
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-40 right-6 md:right-12 z-50 flex items-center justify-center gap-2.5 px-5 py-4 rounded-full shadow-2xl transition-all duration-300 border-3 border-white ${
            showGrammarCard
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-bounce shadow-amber-500/30'
          }`}
          style={{ animationDuration: '4s' }}
          title="مِصْبَاحُ الْقَوَاعِدِ الْإِمْلَائِيَّةِ 💡"
        >
          <span className="text-xl">💡</span>
          <span className="text-sm font-black hidden sm:inline-block tracking-tight">مِصْبَاحُ الْقَوَاعِدِ 💡</span>
        </motion.button>
      )}
    </div>
  );
}
