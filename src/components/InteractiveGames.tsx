import React, { useState } from 'react';
import { Star, Trophy, RefreshCw, Check, X, ShieldAlert, Heart, HelpCircle, Sparkles, Smile, ArrowLeft } from 'lucide-react';
import { playSound } from '../utils';

// GAME 1: Spelling/Scrambled Letters Game data
interface SpellingWord {
  word: string; // The correct target word
  hint: string;
  letters: string[]; // Scrambled letters
}

const SPELLING_WORDS: SpellingWord[] = [
  { word: "وطني", hint: "بلدي الغالي الحبيب (جمهورية السودان) 🇸🇩", letters: ["ط", "ي", "و", "ن"] },
  { word: "أمي", hint: "أحنُّ مخلوقٍ في الكون وأقرب الناس لقلبي 👩‍👦", letters: ["ي", "أ", "م"] },
  { word: "نحل", hint: "حشرةٌ نشيطة تصنع لنا العسل وتعيش في خلية 🐝", letters: ["ل", "ن", "ح"] },
  { word: "صحة", hint: "التاجُ الحقيقي الذي نحافظ عليه بالغذاء النظيف والرياضة 💪", letters: ["ح", "ة", "ص"] },
  { word: "أمانة", hint: "خلقٌ عظيم يعني المحافظة على حقوق الناس وودائعهم 💎", letters: ["أ", "ة", "م", "ن", "ا"] },
  { word: "مزارع", hint: "الرجل الطيب الصبور الذي يزرع لنا الأرض بالحب والخير 🌾", letters: ["ع", "م", "ز", "ا", "ر"] }
];

// GAME 2: Habits Sort Data
interface HabitItem {
  id: string;
  name: string;
  isHealthy: boolean;
}

const HABIT_ITEMS: HabitItem[] = [
  { id: "h1", name: "غَسْلُ الْأَسْنَانِ بِالْفُرْشَاةِ وَالْمَعْجُونِ 🪥", isHealthy: true },
  { id: "h2", name: "شِرَاءُ الْأَطْعَمَةِ الْمَكْشُوفَةِ مِنَ الشَّارِعِ 🚫", isHealthy: false },
  { id: "h3", name: "تَنَاوُلُ الْخُضْرَوَاتِ وَالْفَوَاكِهِ الطَّازَجَةِ 🍎", isHealthy: true },
  { id: "h4", name: "شُرْبُ الْمَاءِ النَّظِيفِ الْمُعَقَّمِ 🥛", isHealthy: true },
  { id: "h5", name: "تَرْكُ الذُّبَابِ يَقِفُ عَلَى الطَّعَامِ 🪰", isHealthy: false },
  { id: "h6", name: "النَّوْمُ الْبَاكِرُ لِأَخْذِ رَاحَةٍ كَافِيَةٍ 😴", isHealthy: true },
  { id: "h7", name: "اللَّعِبُ حَافِيَ الْقَدَمَيْنِ قُرْبَ الْبِرَكِ 💧", isHealthy: false },
  { id: "h8", name: "غَسْلُ الْيَدَيْنِ جَيِّداً قَبْلَ وَبَعْدَ الْأَكْلِ 🧼", isHealthy: true }
];

// GAME 3: Morals/Socio-Emotional Sorting Game
interface MoralItem {
  id: string;
  name: string;
  isGood: boolean;
}

const MORAL_ITEMS: MoralItem[] = [
  { id: "m1", name: "بِرُّ الْوَالِدَيْنِ وَطَاعَتُهُمَا ❤️", isGood: true },
  { id: "m2", name: "إِكْرَامُ الْجَارِ وَمُسَاعَدَتُهُ 🤝", isGood: true },
  { id: "m3", name: "الْكَذِبُ عَلَى الْآخَرِينَ 🤥", isGood: false },
  { id: "m4", name: "الْأَمَانَةُ وَحِفْظُ الْأَسْرَارِ 💎", isGood: true },
  { id: "m5", name: "الْفُضُولُ وَتَتَبُّعُ عَوْرَاتِ النَّاسِ 👁️", isGood: false },
  { id: "m6", name: "إِكْرَامُ الضَّيْفِ وَالتَّرْحِيبُ بِهِ ☕", isGood: true },
  { id: "m7", name: "إِزْعَاجُ الْجِيرَانِ بِاللَّعِبِ الصَّاخِبِ 🥁", isGood: false },
  { id: "m8", name: "الْمُحَافَظَةُ عَلَى نَظَافَةِ الْمَدْرَسَةِ 🏫", isGood: true }
];

export default function InteractiveGames() {
  const [activeGame, setActiveGame] = useState<'menu' | 'spelling' | 'habits' | 'morals'>('menu');
  const [starsAwarded, setStarsAwarded] = useState(0);

  // 1. SPELLING GAME STATE
  const [spellingIdx, setSpellingIdx] = useState(0);
  const [spellingUserLetters, setSpellingUserLetters] = useState<string[]>([]);
  const [spellingStatus, setSpellingStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  // 2. HABITS SORT STATE
  const [habitsScore, setHabitsScore] = useState(0);
  const [habitsCompleted, setHabitsCompleted] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [currentHabitIdx, setCurrentHabitIdx] = useState(0);

  // 3. MORALS SORT STATE
  const [moralsScore, setMoralsScore] = useState(0);
  const [moralsCompleted, setMoralsCompleted] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [currentMoralIdx, setCurrentMoralIdx] = useState(0);

  // Sound and feedback wrapper
  const triggerGameSound = (type: 'success' | 'failure' | 'click') => {
    playSound(type);
  };

  // SPELLING GAME HANDLERS
  const handleLetterClick = (letter: string, idx: number) => {
    if (spellingStatus !== 'playing') return;
    triggerGameSound('click');
    const updated = [...spellingUserLetters, letter];
    setSpellingUserLetters(updated);

    const currentWord = SPELLING_WORDS[spellingIdx];
    
    // If spelling matches length
    if (updated.length === currentWord.word.length) {
      const fullWord = updated.join('');
      if (fullWord === currentWord.word) {
        setSpellingStatus('correct');
        setStarsAwarded(prev => prev + 10);
        triggerGameSound('success');
      } else {
        setSpellingStatus('wrong');
        triggerGameSound('failure');
      }
    }
  };

  const resetSpellingWord = () => {
    triggerGameSound('click');
    setSpellingUserLetters([]);
    setSpellingStatus('playing');
  };

  const nextSpellingWord = () => {
    triggerGameSound('click');
    setSpellingUserLetters([]);
    setSpellingStatus('playing');
    if (spellingIdx < SPELLING_WORDS.length - 1) {
      setSpellingIdx(prev => prev + 1);
    } else {
      setSpellingIdx(0); // Loop back
    }
  };

  // HABITS SORT HANDLERS
  const sortHabit = (isHealthySelection: boolean) => {
    if (currentHabitIdx >= HABIT_ITEMS.length) return;
    
    const item = HABIT_ITEMS[currentHabitIdx];
    const isCorrect = item.isHealthy === isHealthySelection;
    
    setHabitsCompleted(prev => ({
      ...prev,
      [item.id]: isCorrect ? 'correct' : 'wrong'
    }));

    if (isCorrect) {
      setHabitsScore(prev => prev + 10);
      setStarsAwarded(prev => prev + 10);
      triggerGameSound('success');
    } else {
      triggerGameSound('failure');
    }

    setTimeout(() => {
      setCurrentHabitIdx(prev => prev + 1);
    }, 1200);
  };

  const resetHabitsGame = () => {
    triggerGameSound('click');
    setHabitsScore(0);
    setHabitsCompleted({});
    setCurrentHabitIdx(0);
  };

  // MORALS SORT HANDLERS
  const sortMoral = (isGoodSelection: boolean) => {
    if (currentMoralIdx >= MORAL_ITEMS.length) return;
    
    const item = MORAL_ITEMS[currentMoralIdx];
    const isCorrect = item.isGood === isGoodSelection;
    
    setMoralsCompleted(prev => ({
      ...prev,
      [item.id]: isCorrect ? 'correct' : 'wrong'
    }));

    if (isCorrect) {
      setMoralsScore(prev => prev + 10);
      setStarsAwarded(prev => prev + 10);
      triggerGameSound('success');
    } else {
      triggerGameSound('failure');
    }

    setTimeout(() => {
      setCurrentMoralIdx(prev => prev + 1);
    }, 1200);
  };

  const resetMoralsGame = () => {
    triggerGameSound('click');
    setMoralsScore(0);
    setMoralsCompleted({});
    setCurrentMoralIdx(0);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-right">
      
      {/* Stars Header Display */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-yellow-border shadow-sm">
        <div className="flex items-center gap-2">
          {activeGame !== 'menu' && (
            <button
              onClick={() => { setActiveGame('menu'); triggerGameSound('click'); }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-full transition-transform active:scale-95 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              قائمة الألعاب الرئيسية 🎮
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-yellow-accent text-charcoal px-4 py-1.5 rounded-full flex items-center gap-1.5 border-b-2 border-yellow-border font-extrabold shadow-sm text-xs md:text-sm">
            <Star className="w-4 h-4 fill-current text-coral animate-spin-slow" />
            <span>نجوم الألعاب المكتسبة ⭐: {starsAwarded}</span>
          </div>
        </div>
      </div>

      {activeGame === 'menu' && (
        /* GAMES MENU SELECTION */
        <div className="flex flex-col gap-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-[24px] p-6 shadow-md border-2 border-yellow-border relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 text-3xl shadow-inner">
                  🎮
                </div>
                <div>
                  <h2 className="font-black text-xl md:text-2xl">أَلْعَابُ التِّلْمِيذِ التَّفَاعُلِيَّةِ الْأَكَّادِيمِيَّةِ</h2>
                  <p className="text-xs md:text-sm text-teal-100 font-bold mt-1">ألعاب تعليمية مسلية لتثبيت فهم معاني الدروس، القراءة السليمة، والوعي الصحي والخلقي 🇸🇩</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of games */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Game 1: Spelling */}
            <div className="bg-white rounded-[32px] border-2 border-yellow-border hover:border-coral p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transform transition duration-200 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">
                  🔠
                </div>
                <h3 className="font-black text-lg text-charcoal">تَحَدِّي تَرْتِيبِ الْحُرُوفِ</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  احزر الكلمة المقررة في المنهج من خلال التلميح الممتع، ورتّب الحروف المتناثرة هجائياً بشكلٍ صحيح!
                </p>
              </div>
              <button
                onClick={() => { setActiveGame('spelling'); triggerGameSound('click'); }}
                className="mt-6 w-full py-2.5 bg-coral text-white font-black text-xs md:text-sm rounded-full border-b-4 border-rose-700 shadow hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                العب الآن 🚀
              </button>
            </div>

            {/* Game 2: Habits Sort */}
            <div className="bg-white rounded-[32px] border-2 border-yellow-border hover:border-teal-accent p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transform transition duration-200 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-teal-accent/10 text-teal-accent rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">
                  🍎
                </div>
                <h3 className="font-black text-lg text-charcoal">فَرْزُ الْعَادَاتِ الصِّحِّيَّةِ</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  مستوحاة من وحدة "صحتي". صَنِّف السلوكيات اليومية إلى عادات صحية مفيدة أو عادات ضارة ومرفوضة.
                </p>
              </div>
              <button
                onClick={() => { setActiveGame('habits'); triggerGameSound('click'); }}
                className="mt-6 w-full py-2.5 bg-teal-accent text-white font-black text-xs md:text-sm rounded-full border-b-4 border-teal-700 shadow hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                العب الآن 🚀
              </button>
            </div>

            {/* Game 3: Morals Sort */}
            <div className="bg-white rounded-[32px] border-2 border-yellow-border hover:border-indigo-500 p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transform transition duration-200 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">
                  🍎
                </div>
                <h3 className="font-black text-lg text-charcoal">سَلَّتُ مَكَارِمِ الْأَخْلَاقِ</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  تعلم مكارم الأخلاق بطريقة تفاعلية! افرز الثمار الطيبة (سلوك حسن) عن الثمار غير الصالحة (سلوك خاطئ).
                </p>
              </div>
              <button
                onClick={() => { setActiveGame('morals'); triggerGameSound('click'); }}
                className="mt-6 w-full py-2.5 bg-indigo-600 text-white font-black text-xs md:text-sm rounded-full border-b-4 border-indigo-800 shadow hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                العب الآن 🚀
              </button>
            </div>

          </div>
        </div>
      )}

      {activeGame === 'spelling' && (
        /* GAME 1: SPELLING CHALLENGE SCREEN */
        <div className="bg-white rounded-[32px] p-6 border-2 border-yellow-border shadow-md flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between border-b pb-3">
            <span className="text-sm font-black text-coral flex items-center gap-1.5">
              🔠 تحدي ترتيب الحروف والتهجئة
            </span>
            <span className="text-xs text-slate-500 font-bold">
              الكلمة {spellingIdx + 1} من {SPELLING_WORDS.length}
            </span>
          </div>

          <div className="bg-cream border-2 border-yellow-border/50 p-5 rounded-2xl text-center max-w-xl w-full flex flex-col gap-2 relative">
            <span className="text-2xl absolute top-3 right-3">💡</span>
            <span className="text-xs text-coral font-black">التلميح المساعد:</span>
            <p className="font-extrabold text-sm md:text-base text-slate-800 leading-relaxed px-6 mt-1">
              {SPELLING_WORDS[spellingIdx].hint}
            </p>
          </div>

          {/* Letter placeholders */}
          <div className="flex flex-wrap gap-3.5 justify-center my-4 min-h-16">
            {Array.from({ length: SPELLING_WORDS[spellingIdx].word.length }).map((_, idx) => {
              const letter = spellingUserLetters[idx];
              return (
                <div
                  key={idx}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-3 flex items-center justify-center font-black text-xl md:text-2xl transition-all shadow-inner ${
                    letter 
                      ? spellingStatus === 'correct'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 animate-pulse'
                        : spellingStatus === 'wrong'
                        ? 'bg-rose-50 border-rose-500 text-rose-600 animate-shake'
                        : 'bg-yellow-accent/10 border-yellow-border text-slate-800'
                      : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  {letter || ''}
                </div>
              );
            })}
          </div>

          {spellingStatus === 'playing' ? (
            /* Scrambled Letters Selection */
            <div className="flex flex-col items-center gap-4">
              <span className="text-[11px] text-slate-400 font-black">اضغط على الحروف لتركيب الكلمة بالترتيب الصحيح:</span>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {SPELLING_WORDS[spellingIdx].letters.map((letter, idx) => {
                  // Count occurrences to disable already selected letter
                  const occurrencesInTarget = SPELLING_WORDS[spellingIdx].letters.filter(l => l === letter).length;
                  const occurrencesInUser = spellingUserLetters.filter(l => l === letter).length;
                  const isUsed = occurrencesInUser >= occurrencesInTarget;

                  return (
                    <button
                      key={idx}
                      disabled={isUsed}
                      onClick={() => handleLetterClick(letter, idx)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 text-lg md:text-xl font-black transition-all shadow-sm active:scale-90 ${
                        isUsed
                          ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                          : 'bg-white border-yellow-border hover:bg-cream text-slate-800 cursor-pointer hover:translate-y-[-2px]'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Success / Failure Screen feedback */
            <div className="flex flex-col items-center gap-3 animate-fade-in mt-2">
              {spellingStatus === 'correct' ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 px-6 py-3 rounded-2xl flex flex-col items-center gap-1">
                  <span className="font-black text-base">🎉 أحسنت صنعاً يا بطل! تهجئة ممتازة!</span>
                  <span className="text-xs font-bold text-emerald-600">أضفت +10 نجوم إلى خزنتك 🌟</span>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 px-6 py-3 rounded-2xl flex flex-col items-center gap-1">
                  <span className="font-black text-base">💡 ممم، الترتيب غير صحيح تماماً.</span>
                  <span className="text-xs font-bold text-rose-600">اضغط على زر إعادة المحاولة وجرب مجدداً! 💪</span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 border-t pt-4 w-full justify-center">
            <button
              onClick={resetSpellingWord}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-black text-xs rounded-full transition-all active:scale-95 cursor-pointer"
            >
              🔄 إعادة المحاولة
            </button>
            <button
              onClick={nextSpellingWord}
              className="px-6 py-2.5 bg-coral text-white font-black text-xs rounded-full border-b-4 border-rose-700 shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>الكلمة التالية ➡️</span>
            </button>
          </div>
        </div>
      )}

      {activeGame === 'habits' && (
        /* GAME 2: HEALTHY HABITS SORT CHALLENGE */
        <div className="bg-white rounded-[32px] p-6 border-2 border-yellow-border shadow-md flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between border-b pb-3">
            <span className="text-sm font-black text-teal-accent flex items-center gap-1.5">
              🍎 فرز وتصنيف العادات الصحية
            </span>
            <span className="text-xs text-slate-500 font-bold">
              مجموع النقاط: {habitsScore} نقطة
            </span>
          </div>

          {currentHabitIdx < HABIT_ITEMS.length ? (
            /* Active sorting game loop */
            <div className="flex flex-col items-center w-full gap-6">
              
              <div className="flex flex-col items-center text-center max-w-xl gap-1">
                <span className="text-[11px] bg-slate-100 text-slate-500 font-black px-2.5 py-1 rounded-full border">صَنِّف السلوك التالي:</span>
                <p className="font-black text-lg md:text-xl text-indigo-900 mt-4 leading-relaxed bg-cream px-6 py-4 rounded-2xl border-2 border-yellow-border shadow-inner">
                  {HABIT_ITEMS[currentHabitIdx].name}
                </p>
              </div>

              {/* Feedbacks */}
              <div className="h-6">
                {habitsCompleted[HABIT_ITEMS[currentHabitIdx].id] === 'correct' && (
                  <span className="text-emerald-600 font-black text-sm flex items-center gap-1 animate-bounce">
                    🎉 إجابة رائعة وصحيحة! أحسنت! (+10⭐)
                  </span>
                )}
                {habitsCompleted[HABIT_ITEMS[currentHabitIdx].id] === 'wrong' && (
                  <span className="text-rose-600 font-black text-sm flex items-center gap-1 animate-bounce">
                    ❌ ممم، حاول التركيز، السلوك غير مصنف بشكل صحيح!
                  </span>
                )}
              </div>

              {/* Action Buttons: Sorting columns */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg select-none">
                <button
                  disabled={habitsCompleted[HABIT_ITEMS[currentHabitIdx].id] !== undefined}
                  onClick={() => sortHabit(true)}
                  className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm rounded-3xl border-b-4 border-emerald-700 hover:scale-103 active:scale-95 transition-all shadow cursor-pointer flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">👍</span>
                  <span>عَادَةٌ صِحِّيَّةٌ مُفِيدَةٌ</span>
                </button>
                <button
                  disabled={habitsCompleted[HABIT_ITEMS[currentHabitIdx].id] !== undefined}
                  onClick={() => sortHabit(false)}
                  className="p-5 bg-gradient-to-br from-rose-500 to-orange-600 text-white font-black text-sm rounded-3xl border-b-4 border-rose-700 hover:scale-103 active:scale-95 transition-all shadow cursor-pointer flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">👎</span>
                  <span>عَادَةٌ ضَارَّةٌ مَرْفُوضَةٌ</span>
                </button>
              </div>

              {/* Mini progress tracker */}
              <div className="flex gap-1.5 items-center justify-center mt-4">
                {HABIT_ITEMS.map((item, idx) => {
                  const state = habitsCompleted[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        idx === currentHabitIdx
                          ? 'bg-yellow-accent border-yellow-border scale-125 animate-pulse'
                          : state === 'correct'
                          ? 'bg-emerald-500 border-emerald-600'
                          : state === 'wrong'
                          ? 'bg-rose-500 border-rose-600'
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

            </div>
          ) : (
            /* Game over summary */
            <div className="flex flex-col items-center text-center p-6 gap-4 animate-fade-in">
              <span className="text-5xl">👑</span>
              <h3 className="font-black text-2xl text-teal-accent">اكتمال اللعبة بالكامل!</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
                لقد انتهيت من فرز كل العادات اليومية بنجاح وحققت علامة مميزة! واصل الحفاظ على صحتك دائماً.
              </p>
              
              <div className="bg-[#F0FFF4] border border-[#B7E4C7] p-4 rounded-2xl font-black text-emerald-800 text-sm mt-2 flex items-center gap-2">
                🏆 نتيجتك النهائية: {habitsScore} / {HABIT_ITEMS.length * 10} نقطة ذكاء!
              </div>

              <button
                onClick={resetHabitsGame}
                className="mt-4 px-6 py-2.5 bg-teal-accent text-white font-black text-xs rounded-full border-b-4 border-teal-700 shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                العب من جديد 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {activeGame === 'morals' && (
        /* GAME 3: THE WISE FARMER'S MORALS SORT BASKETS */
        <div className="bg-white rounded-[32px] p-6 border-2 border-yellow-border shadow-md flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between border-b pb-3">
            <span className="text-sm font-black text-indigo-700 flex items-center gap-1.5">
              🍎 سلة الأخلاق ومكارم السلوك
            </span>
            <span className="text-xs text-slate-500 font-bold">
              نقاط الفرز الأخلاقي: {moralsScore} نقطة
            </span>
          </div>

          {currentMoralIdx < MORAL_ITEMS.length ? (
            /* Active moral basket sorting game loop */
            <div className="flex flex-col items-center w-full gap-6">
              
              <div className="flex flex-col items-center text-center max-w-xl gap-1">
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-full border border-indigo-100">سلوك من الدروس:</span>
                <p className="font-black text-lg md:text-xl text-indigo-900 mt-4 leading-relaxed bg-cream px-6 py-4 rounded-2xl border-2 border-yellow-border shadow-inner">
                  {MORAL_ITEMS[currentMoralIdx].name}
                </p>
              </div>

              {/* Feedbacks */}
              <div className="h-6">
                {moralsCompleted[MORAL_ITEMS[currentMoralIdx].id] === 'correct' && (
                  <span className="text-emerald-600 font-black text-sm flex items-center gap-1 animate-bounce">
                    🎉 أحسنت الفرز! سلوك تم تصنيفه بنجاح. (+10⭐)
                  </span>
                )}
                {moralsCompleted[MORAL_ITEMS[currentMoralIdx].id] === 'wrong' && (
                  <span className="text-rose-600 font-black text-sm flex items-center gap-1 animate-bounce">
                    ❌ عذراً، تصنيف غير صحيح للسلوك الأخلاقي!
                  </span>
                )}
              </div>

              {/* Baskets layout */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg select-none">
                <button
                  disabled={moralsCompleted[MORAL_ITEMS[currentMoralIdx].id] !== undefined}
                  onClick={() => sortMoral(true)}
                  className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-black text-sm rounded-3xl border-b-4 border-indigo-900 hover:scale-103 active:scale-95 transition-all shadow cursor-pointer flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">🍎</span>
                  <span>سُلُوكٌ حَسَنٌ وَحَمِيدٌ</span>
                </button>
                <button
                  disabled={moralsCompleted[MORAL_ITEMS[currentMoralIdx].id] !== undefined}
                  onClick={() => sortMoral(false)}
                  className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white font-black text-sm rounded-3xl border-b-4 border-amber-800 hover:scale-103 active:scale-95 transition-all shadow cursor-pointer flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">🐛</span>
                  <span>سُلُوكٌ خَاطِئٌ وَسَيِّءٌ</span>
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 items-center justify-center mt-4">
                {MORAL_ITEMS.map((item, idx) => {
                  const state = moralsCompleted[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        idx === currentMoralIdx
                          ? 'bg-yellow-accent border-yellow-border scale-125 animate-pulse'
                          : state === 'correct'
                          ? 'bg-emerald-500 border-emerald-600'
                          : state === 'wrong'
                          ? 'bg-rose-500 border-rose-600'
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

            </div>
          ) : (
            /* Game over morals sort */
            <div className="flex flex-col items-center text-center p-6 gap-4 animate-fade-in">
              <span className="text-5xl">🎓</span>
              <h3 className="font-black text-2xl text-indigo-700">تهانينا الحارة!</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
                لقد نجحت في تصنيف السلوكيات ومكارم الأخلاق، تذكر دائماً أن تتخلق بالأخلاق الحميدة في مدرستك وبيتِك ومع جيرانك!
              </p>
              
              <div className="bg-[#F0FFF4] border border-[#B7E4C7] p-4 rounded-2xl font-black text-emerald-800 text-sm mt-2 flex items-center gap-2">
                🏆 نقاط مكارم الأخلاق: {moralsScore} / {MORAL_ITEMS.length * 10} نقطة!
              </div>

              <button
                onClick={resetMoralsGame}
                className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-full border-b-4 border-indigo-800 shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                أعد الفرز مجدداً 🔄
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
