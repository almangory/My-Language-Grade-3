import React, { useState } from 'react';
import { Lesson, LessonType } from '../types';
import { Music, Star, BookOpen, Quote, Maximize2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { motion, AnimatePresence } from 'motion/react';

const LESSON_ILLUSTRATIONS: Record<string, string> = {
  // Unit 1: قيم وآداب
  'u1-l1': '/src/assets/images/sudanese_family_love_1783937441296.jpg', // حب الوالدين
  'u1-l2': '/src/assets/images/sudanese_parent_hug_1783937460334.jpg', // نشيد أبي وأمي
  'u1-l3': '/src/assets/images/sudanese_guest_welcome_1783937425720.jpg', // إكرام الجار والضيف
  'u1-l4': '/src/assets/images/sudanese_chicken_seller_1783937475265.jpg', // العيش الشريف
  'u1-l5': '/src/assets/images/sudanese_family_love_1783937441296.jpg', // مكارم الأخلاق

  // Unit 2: مدرستي
  'u2-l1': '/src/assets/images/sudanese_school_kids_1783937490242.jpg', // العودة إلى المدرسة
  'u2-l2': '/src/assets/images/school_cleaning_kids_1783932758944.jpg', // نظافة المدرسة
  'u2-l3': '/src/assets/images/sudan_pride_illustration_1783925595849.jpg', // تحية العلم
  'u2-l4': '/src/assets/images/sudanese_school_kids_1783937490242.jpg', // في الطريق
  'u2-l5': '/src/assets/images/sudanese_school_kids_1783937490242.jpg', // آداب المشي

  // Unit 3: وطني
  'u3-l1': '/src/assets/images/sudan_map_landscape_1783932792262.jpg', // أحب بلادي
  'u3-l2': '/src/assets/images/sudan_nature_landscape_1783932807921.jpg', // يا بلادي
  'u3-l3': '/src/assets/images/sudanese_girl_horse_1783931339607.jpg',      // مهيرة بت عبود
  'u3-l4': '/src/assets/images/sudanese_soldier_hero_1783932818588.jpg', // عبد الفضيل الماظ
  'u3-l5': '/src/assets/images/sudan_independence_celebration_1783932830535.jpg', // عيد الاستقلال

  // Unit 4: من حكم الحيوان
  'u4-l1': '/src/assets/images/forest_animals_illustration_1783925610838.jpg', // الديك والثعلب
  'u4-l2': '/src/assets/images/beehive_honey_bees_1783931318188.jpg',         // خلية النحل
  'u4-l3': '/src/assets/images/cartoon_cat_mouse_1783932842389.jpg', // الفأر والقط
  'u4-l4': '/src/assets/images/meadow_birds_singing_1783932858031.jpg', // طيور الرياض
  'u4-l5': '/src/assets/images/anthill_busy_ants_1783932869246.jpg', // النمل النشيط

  // Unit 5: صحتي
  'u5-l1': '/src/assets/images/body_health_running_1783932879813.jpg', // أنا جسمك
  'u5-l2': '/src/assets/images/sudanese_wise_farmer_1783937507425.jpg', // الحواس الخمس
  'u5-l3': '/src/assets/images/sudanese_family_love_1783937441296.jpg', // الدواء في الغذاء
  'u5-l4': '/src/assets/images/teeth_brushing_kids_1783931303450.jpg',      // الأسنان اللامعة
  'u5-l5': '/src/assets/images/covered_clean_food_1783932920644.jpg', // الأطعمة المكشوفة

  // Unit 6: تأملات متباينة
  'u6-l1': '/src/assets/images/sudanese_wise_farmer_1783937507425.jpg',  // المزارع الحكيم
  'u6-l2': '/src/assets/images/hungry_boy_feast_1783932935766.jpg', // أشعب الأكول
  'u6-l3': '/src/assets/images/salt_flats_port_sudan_1783932946735.jpg',  // ملح الطعام
  'u6-l4': '/src/assets/images/magical_cave_treasure_1783931328825.jpg',     // علي واللصوص
  'u6-l5': '/src/assets/images/sudanese_school_kids_1783937490242.jpg', // لعبة الولد التائه
};

const UNIT_ILLUSTRATIONS: Record<string, string> = {
  'unit-1': '/src/assets/images/sudanese_family_love_1783937441296.jpg',
  'unit-2': '/src/assets/images/sudanese_school_kids_1783937490242.jpg',
  'unit-3': '/src/assets/images/sudan_pride_illustration_1783925595849.jpg',
  'unit-4': '/src/assets/images/forest_animals_illustration_1783925610838.jpg',
  'unit-5': '/src/assets/images/sudanese_family_love_1783937441296.jpg',
  'unit-6': '/src/assets/images/sudanese_wise_farmer_1783937507425.jpg',
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

export default function LessonView({ lesson }: LessonViewProps) {
  const [activeCharIndex, setActiveCharIndex] = React.useState<number>(-1);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

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

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${
                  isHighlighted
                    ? 'bg-yellow-200 text-[#5B3E1B] font-extrabold scale-110 shadow-sm border-yellow-400'
                    : 'text-charcoal hover:text-coral hover:bg-yellow-accent/40 border-transparent hover:border-coral/30'
                }`}
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

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${
                  isHighlighted
                    ? 'bg-yellow-200 text-[#5B3E1B] font-extrabold scale-110 shadow-sm border-yellow-400'
                    : 'text-charcoal hover:text-coral hover:bg-yellow-accent/40 border-transparent hover:border-coral/30'
                }`}
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

      {/* TTS Reader Section */}
      <AudioPlayer 
        textToRead={getFullTextForReading()} 
        title={lesson.title} 
        lessonId={lesson.id}
        audioUrl={lesson.audioUrl}
        onBoundary={setActiveCharIndex}
        onEnd={() => setActiveCharIndex(-1)}
        onStart={() => setActiveCharIndex(-1)}
      />

      {/* Lesson Body Sheet (Simulating an editable Interactive PDF book leaf) */}
      <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-lg border-2 border-yellow-border relative">
        {/* PDF notebook margins and hole punches */}
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-rose-200 hidden md:block"></div>
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-rose-200 hidden md:block"></div>
        
        {/* Punch holes in the book */}
        <div className="absolute top-1/4 left-1 w-4 h-4 bg-cream rounded-full border border-yellow-border/50 hidden md:block"></div>
        <div className="absolute top-1/2 left-1 w-4 h-4 bg-cream rounded-full border border-yellow-border/50 hidden md:block"></div>
        <div className="absolute top-3/4 left-1 w-4 h-4 bg-cream rounded-full border border-yellow-border/50 hidden md:block"></div>

        {/* Beautiful Lesson Illustration (Child-appealing, with a Polaroid/Frame effect) */}
        {(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]) && (
          <div className="mb-8 md:pr-10 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-[#FFFBF0] p-4 rounded-3xl border-2 border-yellow-border shadow-md transform hover:rotate-1 hover:scale-[1.01] transition-all duration-300 relative">
              
              {/* Creative Sticker Stamp (Lesson-specific) */}
              {LESSON_DETAILS[lesson.id] && (
                <div className="absolute -top-4 -right-4 bg-white border-2 border-yellow-border shadow-lg rounded-full px-3.5 py-1.5 z-20 flex items-center gap-2 transform rotate-3 select-none">
                  <span className="text-2xl">{LESSON_DETAILS[lesson.id].sticker}</span>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-coral leading-none">طابع ترفيهي 🌟</p>
                    <p className="text-[11px] font-black text-slate-800 leading-tight mt-0.5">{LESSON_DETAILS[lesson.id].label}</p>
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
                <div className="mt-4 p-3 bg-white rounded-2xl border border-yellow-border/30 text-right">
                  <p className="font-extrabold text-xs md:text-sm text-slate-800 flex flex-row-reverse items-center gap-2 justify-start leading-relaxed">
                    <span className="text-coral shrink-0">🎯 فكرة الدرس اليوم:</span>
                    <span>{LESSON_DETAILS[lesson.id].desc}</span>
                  </p>
                </div>
              )}

              <p className="text-center font-bold text-[11px] md:text-xs mt-3 text-slate-600">
                🖼️ رسمة توضيحية لدرس: <span className="text-coral underline font-black">{lesson.title}</span>
              </p>
            </div>
          </div>
        )}

        {/* Content Renderers */}
        {lesson.type === LessonType.Poem && lesson.stanzas ? (
          /* Poetry Layout - classical Arabic bicolumn display */
          <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto py-4 select-text">
            {stanzasWithOffsets.map((stanza, index) => (
              <div 
                key={stanza.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center text-center group transition-all duration-200 hover:bg-cream/40 p-2.5 rounded-2xl border border-transparent hover:border-yellow-border/60"
              >
                {/* Right side (الصدر) */}
                <div className="font-extrabold text-lg md:text-xl text-charcoal font-serif leading-relaxed md:text-left md:pl-2">
                  {renderHemistichTokens(stanza.text1, stanza.startOffset)}
                </div>

                {/* Decorative Separator */}
                <div className="flex justify-center text-coral scale-90 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-300">
                  {index % 2 === 0 ? <Music className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
                </div>

                {/* Left side (العجز) */}
                <div className="font-extrabold text-lg md:text-xl text-charcoal font-serif leading-relaxed md:text-right md:pr-2">
                  {renderHemistichTokens(stanza.text2, stanza.startOffset + stanza.text2RelOffset)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Normal Lesson Text Layout */
          <div className="md:pr-10 select-text">
            <div className="absolute top-8 right-8 text-yellow-accent opacity-20 pointer-events-none">
              <Quote className="w-16 h-16 transform scale-x-[-1]" />
            </div>

            <div className="font-serif font-bold text-lg md:text-xl text-charcoal leading-loose text-justify whitespace-pre-line">
              {renderInteractiveText(lesson.content)}
            </div>
          </div>
        )}

        {/* Playful cartoon note at the bottom */}
        <div className="mt-8 border-t-2 border-dashed border-yellow-border/40 pt-6 flex items-start gap-3 bg-cream/50 p-4 rounded-2xl border border-yellow-border/30">
          <span className="text-3xl">💡</span>
          <div className="text-right">
            <p className="font-bold text-coral text-xs md:text-sm">نصيحة المعلم الصغير 🧑‍🏫:</p>
            <p className="text-xs text-slate-600 mt-1 font-extrabold">
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
    </div>
  );
}
