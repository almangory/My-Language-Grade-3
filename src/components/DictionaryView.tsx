import React, { useState, useEffect } from 'react';
import { Search, Volume2, BookOpen, Sparkles, RefreshCw, Check, X, HelpCircle, GraduationCap } from 'lucide-react';
import { playSound } from '../utils';

interface DictionaryEntry {
  word: string;
  meaning: string;
  unitId: string;
  unitName: string;
  example: string;
}

const DICTIONARY_WORDS: DictionaryEntry[] = [
  // Unit 1
  { word: "بِرُّ الْوَالِدَيْنِ", meaning: "الإحسانُ إليهما، وطاعتهما، ورعايتهما بالحب والدعاء.", unitId: "unit-1", unitName: "قيم وآداب", example: "بِرُّ الْوَالِدَيْنِ يدخل صاحبه الجنة." },
  { word: "يَتْعَبُ", meaning: "يبذلُ جهداً كبيراً ومشقةً من أجل راحة الآخرين.", unitId: "unit-1", unitName: "قيم وآداب", example: "يتعب أبي في العمل ليوفر لنا العيش الكريم." },
  { word: "الْعَيْشُ الشَّرِيفُ", meaning: "كسبُ الرزق والمال الحلال من خلال العمل المخلص والجهد الشريف.", unitId: "unit-1", unitName: "قيم وآداب", example: "العمل في الحقل هو سبيل للعيش الشريف." },
  { word: "مَكَارِمِ الْأَخْلَاقِ", meaning: "الصفات والأفعال الحسنة مثل الصدق، الأمانة، الكرم ومساعدة المحتاجين.", unitId: "unit-1", unitName: "قيم وآداب", example: "مساعدة الضعفاء من مكارم الأخلاق." },
  { word: "إِكْرَامُ الضَّيْفِ", meaning: "الترحيبُ بالزائر وتقديم أحسن الطعام والشراب والحديث الطيب له.", unitId: "unit-1", unitName: "قيم وآداب", example: "من إكرام الضيف استقباله بابتسامة وبشاشة." },
  { word: "الْأَمَانَةُ", meaning: "المحافظةُ على حقوق الآخرين وأسرارهم وإرجاع الودائع لأصحابها.", unitId: "unit-1", unitName: "قيم وآداب", example: "الصدق والأمانة هما زينة التلميذ المسلم." },

  // Unit 2
  { word: "نَظَافَةُ", meaning: "المحافظةُ على الجسم والملابس والمكان نقياً وخالياً من الأوساخ والأمراض.", unitId: "unit-2", unitName: "مدرستي", example: "نظافة المدرسة مسؤولية كل تلميذ وتلميذة." },
  { word: "تَحِيَّةُ الْعَلَمِ", meaning: "الوقوفُ بانتظام واحترام أمام علم السودان مع إنشاد النشيد الوطني بقوة وفخر.", unitId: "unit-2", unitName: "مدرستي", example: "نقف في الطابور صباحاً لنؤدي تحية العلم." },
  { word: "آدابُ الْمَشْيِ", meaning: "السيرُ على الرصيف بتواضع وهدوء، وعدم إزعاج الناس أو تعطيل الطريق.", unitId: "unit-2", unitName: "مدرستي", example: "نتعلم في المدرسة آداب المشي في الطرقات العامة." },
  { word: "الْاِحْتِرَامُ", meaning: "تقدير الآخرين وحسن التعامل معهم، وخاصة المعلمين والكبار في السن.", unitId: "unit-2", unitName: "مدرستي", example: "احترام المعلم واجب على كل تلميذ." },

  // Unit 3
  { word: "الْإِسْتِقْلَالِ", meaning: "حريةُ الوطن العزيز وإدارته بأيدي أبنائه المخلصين دون تدخل خارجي.", unitId: "unit-3", unitName: "وطني", example: "يحتفل السودان بعيد الاستقلال في الأول من يناير." },
  { word: "مَهيرَة بِتْ عَبُّود", meaning: "شاعرة سودانية شجاعة من التاريخ حثت الفرسان على الدفاع عن أرض الوطن.", unitId: "unit-3", unitName: "وطني", example: "مهيرة بت عبود رمز للمرأة السودانية القوية البطلة." },
  { word: "عَبْدُ الْفَضِيلِ الْمَاظ", meaning: "ضابط سوداني بطل ناضل بشجاعة فائقة ضد الاستعمار واستشهد دفاعاً عن وطنه.", unitId: "unit-3", unitName: "وطني", example: "عبد الفضيل الماظ سطر ببطولته أروع ملاحم الفداء." },
  { word: "الْبِلَاد", meaning: "الأوطانُ التي ننتمي إليها ونحب ترابها ونعمل على رفعتها وإعمارها.", unitId: "unit-3", unitName: "وطني", example: "أحب بلادي السودان وأتمنى لها السلام والازدهار." },

  // Unit 4
  { word: "خَلِيَّةُ النَّحْلِ", meaning: "بيتُ النحل المنظم الذي يتعاون فيه الجميع لإنتاج العسل الحلو اللذيذ.", unitId: "unit-4", unitName: "من حكم الحيوان", example: "خلية النحل تعلمنا قيمة النظام والعمل الجماعي." },
  { word: "الثَّعْلَبُ", meaning: "حيوانٌ ذكي ومكار في القصص التراثية، يُضرب به المثل في الخداع والمراوغة.", unitId: "unit-4", unitName: "من حكم الحيوان", example: "حاول الثعلب خداع الديك بكلماته اللطيفة." },
  { word: "الرِّيَاض", meaning: "البساتينُ والحدائقُ المورقة الخضراء المليئة بالأزهار المغردة فيها الطيور.", unitId: "unit-4", unitName: "من حكم الحيوان", example: "تغرد الطيور فوق أشجار الرياض الجميلة." },
  { word: "الْمُثَابَرَةُ", meaning: "الاستمرارُ في العمل بنشاط وصبر وعدم الاستسلام حتى تحقيق النجاح.", unitId: "unit-4", unitName: "من حكم الحيوان", example: "النمل يضرب لنا مثلاً عظيماً في المثابرة وجمع القوت." },

  // Unit 5
  { word: "الْحَوَاسُّ الْخَمْسُ", meaning: "أعضاءُ الاستكشاف وهي: السمع، البصر، الشم، التذوق، واللمس.", unitId: "unit-5", unitName: "صحتي", example: "الْحَوَاسُّ الْخَمْسُ هي نعمٌ عظيمة من الله لنرى ونسمع العالم." },
  { word: "الْأَسْنَانِ اللَّامِعَة", meaning: "الأسنان النظيفة البيضاء التي نحافظ عليها بغسلها بالفرشاة والمعجون يومياً.", unitId: "unit-5", unitName: "صحتي", example: "الأسنان اللامعة تمنحنا ابتسامة جميلة وتصوننا من الآلام." },
  { word: "الْأَطْعَمَةُ الْمَكْشُوفَة", meaning: "الطعامُ المتروك بدون غطاء مما يجعله عرضة للذباب والغبار الحامل للجراثيم.", unitId: "unit-5", unitName: "صحتي", example: "شراء الأطعمة المكشوفة من الباعة المتجولين يسبب الأمراض." },
  { word: "الدَّوَاء فِي الْغِذَاء", meaning: "مفهومٌ يعني أن تناول الطعام المتنوع والصحي يغنينا عن تناول الأدوية والعقاقير.", unitId: "unit-5", unitName: "صحتي", example: "البرتقال يقينا من الرشح، فالدواء في الغذاء الصحي." },

  // Unit 6
  { word: "الْمُزَارِعُ الْحَكِيمُ", meaning: "الفلاحُ الذكي الذي يعرف كيف يعتني بأرضه ويصبر عليها حتى تجود بالخيرات.", unitId: "unit-6", unitName: "تأملات متباينة", example: "تعلم الأبناء الصبر والتعاون من نصائح المزارع الحكيم." },
  { word: "أَشْعَبُ الْأَكُولُ", meaning: "شخصيةٌ تراثية فكاهية اشتهرت بالطمع والولع الشديد بالطعام وتتبع الولائم.", unitId: "unit-6", unitName: "تأملات متباينة", example: "ضحك الأطفال من قصة أشعب الأكول وتصرفاته الطريفة." },
  { word: "الْوَلَدُ التَّائِهُ", meaning: "الطفلُ الذي يضلُ طريقه عن منزله ويحتاج إلى التوجيه والمساعدة للوصول لأهله.", unitId: "unit-6", unitName: "تأملات متباينة", example: "لعبنا لعبة الولد التائه مع زملائنا في ساحة المدرسة." }
];

export default function DictionaryView() {
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry>(DICTIONARY_WORDS[0]);
  
  // Game state within Dictionary
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{ word: string; options: string[]; correctMeaning: string } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Generate word of the day
  useEffect(() => {
    const today = new Date();
    const index = today.getDate() % DICTIONARY_WORDS.length;
    setWordOfTheDay(DICTIONARY_WORDS[index]);
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = 'ar-SA';
      ut.rate = 0.75;
      
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || null;
      if (arabicVoice) ut.voice = arabicVoice;
      
      window.speechSynthesis.speak(ut);
    }
  };

  const getNewWordOfTheDay = () => {
    const randomIndex = Math.floor(Math.random() * DICTIONARY_WORDS.length);
    setWordOfTheDay(DICTIONARY_WORDS[randomIndex]);
    playSound('click');
  };

  // Setup word-meaning mini-game
  const startNewQuiz = () => {
    playSound('click');
    const randomEntry = DICTIONARY_WORDS[Math.floor(Math.random() * DICTIONARY_WORDS.length)];
    
    // Pick 2 other random meanings
    const otherEntries = DICTIONARY_WORDS.filter(w => w.word !== randomEntry.word);
    const shuffledOthers = [...otherEntries].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 2).map(e => e.meaning);
    
    const options = [randomEntry.meaning, ...distractors].sort(() => 0.5 - Math.random());
    
    setCurrentQuiz({
      word: randomEntry.word,
      options,
      correctMeaning: randomEntry.meaning
    });
    setQuizActive(true);
    setQuizFeedback(null);
    setSelectedOption(null);
  };

  const handleOptionClick = (option: string) => {
    if (quizFeedback !== null) return;
    setSelectedOption(option);
    
    if (option === currentQuiz?.correctMeaning) {
      setQuizFeedback('correct');
      setQuizScore(prev => prev + 10);
      playSound('success');
    } else {
      setQuizFeedback('wrong');
      playSound('failure');
    }
  };

  const filteredWords = DICTIONARY_WORDS.filter(entry => {
    const matchesSearch = entry.word.includes(search) || entry.meaning.includes(search);
    const matchesUnit = selectedUnit === 'all' || entry.unitId === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-right">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-[24px] p-6 shadow-md border-2 border-yellow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 text-3xl shadow-inner">
              📚
            </div>
            <div>
              <h2 className="font-black text-xl md:text-2xl">قَامُوسُ مَعَانِي الْكَلِمَاتِ التَّفَاعُلِيُّ</h2>
              <p className="text-xs md:text-sm text-purple-100 font-bold mt-1">قاموسٌ ذكيٌّ لتبسيط المفردات الصعبة وتسهيل فهم الدروس في المنهج السوداني 🇸🇩</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (quizActive) {
                setQuizActive(false);
              } else {
                startNewQuiz();
              }
            }}
            className="px-5 py-2.5 bg-yellow-accent text-charcoal font-black rounded-full border-b-4 border-yellow-600 shadow-md hover:scale-105 active:scale-95 transition-all text-xs md:text-sm cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap className="w-4.5 h-4.5 text-indigo-700" />
            {quizActive ? "📖 الرجوع للقاموس" : "🎮 الْعَبْ تَحَدِّي الْمَعَانِي!"}
          </button>
        </div>
      </div>

      {quizActive && currentQuiz ? (
        /* Quiz Mode */
        <div className="bg-white rounded-[32px] p-6 border-2 border-yellow-border shadow-md flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between border-b pb-3">
            <span className="text-sm font-black text-purple-700 flex items-center gap-1.5">
              🏆 نقاط التحدي: {quizScore}
            </span>
            <span className="text-xs text-slate-500 font-bold">تخمين معاني الكلمات الصعبة 🧠</span>
          </div>

          <div className="flex flex-col items-center text-center max-w-xl gap-4 my-4">
            <span className="text-xs bg-purple-100 text-purple-800 font-black px-3 py-1 rounded-full border border-purple-200">مَا مَعْنَى كَلِمَة:</span>
            <h3 className="text-3xl md:text-4xl font-black text-coral drop-shadow-sm tracking-wide bg-cream px-6 py-3 rounded-2xl border-2 border-yellow-border">
              {currentQuiz.word}
            </h3>
            
            <button
              onClick={() => speakText(currentQuiz.word)}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition active:scale-90"
              title="انطق الكلمة"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 w-full max-w-2xl">
            {currentQuiz.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuiz.correctMeaning;
              
              let btnStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800";
              if (selectedOption !== null) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500 border-rose-600 text-white shadow-md";
                } else {
                  btnStyle = "opacity-50 bg-slate-50 border-slate-200 text-slate-400";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                  className={`w-full text-right p-4 rounded-2xl border-2 font-bold text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${
                    selectedOption === null ? "hover:translate-x-[-4px] active:scale-95" : ""
                  } ${btnStyle} cursor-pointer`}
                >
                  <span className="leading-relaxed">{option}</span>
                  {selectedOption !== null && isCorrect && <Check className="w-5 h-5 shrink-0" />}
                  {selectedOption !== null && isSelected && !isCorrect && <X className="w-5 h-5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {quizFeedback && (
            <div className="flex flex-col items-center gap-3 animate-fade-in mt-4">
              <div className="flex items-center gap-2">
                {quizFeedback === 'correct' ? (
                  <span className="text-emerald-600 font-black text-base flex items-center gap-1 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
                    🎉 إجابة مذهلة! زادت نقاطك +10
                  </span>
                ) : (
                  <span className="text-rose-600 font-black text-base flex items-center gap-1 bg-rose-100 px-4 py-1.5 rounded-full border border-rose-300">
                    💡 حاول مجدداً! الجواب الصحيح تم تحديده بالأخضر
                  </span>
                )}
              </div>
              <button
                onClick={startNewQuiz}
                className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs md:text-sm rounded-full transition shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                كلمة تالية ➡️
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Dictionary Main View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Right Side: Search and List */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* Search and Filters Card */}
            <div className="bg-white p-5 rounded-[24px] border-2 border-yellow-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن كلمة أو معنى..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:outline-none rounded-2xl text-xs md:text-sm font-bold text-right transition"
                />
              </div>

              {/* Unit Switcher */}
              <select
                value={selectedUnit}
                onChange={(e) => { setSelectedUnit(e.target.value); playSound('click'); }}
                className="w-full md:w-56 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs md:text-sm font-black text-right cursor-pointer focus:border-purple-500 focus:outline-none text-slate-700"
              >
                <option value="all">📚 كل الوحدات الدراسية</option>
                <option value="unit-1">الوحدة 1: قيم وآداب</option>
                <option value="unit-2">الوحدة 2: مدرستي</option>
                <option value="unit-3">الوحدة 3: وطني</option>
                <option value="unit-4">الوحدة 4: من حكم الحيوان</option>
                <option value="unit-5">الوحدة 5: صحتي</option>
                <option value="unit-6">الوحدة 6: تأملات متباينة</option>
              </select>
            </div>

            {/* Vocabulary list */}
            <div className="flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredWords.map((entry, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-3xl border-2 border-yellow-border/40 hover:border-purple-400 transition shadow-sm hover:shadow-md flex flex-col gap-3 relative overflow-hidden group"
                >
                  {/* Decorative background number */}
                  <span className="absolute -left-2 -bottom-2 text-6xl font-black text-slate-100/50 group-hover:text-purple-100/40 select-none transition">
                    {index + 1}
                  </span>

                  <div className="flex items-center justify-between w-full z-10">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base md:text-lg text-indigo-700 font-sans tracking-wide">
                        {entry.word}
                      </h4>
                      <button
                        onClick={() => speakText(entry.word)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition active:scale-90 cursor-pointer"
                        title="انطق الكلمة"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-2.5 py-1 rounded-full border border-slate-200">
                      الوحدة: {entry.unitName}
                    </span>
                  </div>

                  <div className="z-10 flex flex-col gap-1">
                    <p className="font-bold text-xs md:text-sm text-charcoal leading-relaxed">
                      💡 <span className="font-black text-purple-700">المعنى:</span> {entry.meaning}
                    </p>
                    <p className="font-medium text-[11px] md:text-xs text-slate-500 italic mt-0.5 leading-relaxed bg-cream/30 p-2 rounded-xl border border-dashed border-yellow-border/20">
                      📝 <span className="font-extrabold text-indigo-500">مثال مفيد:</span> {entry.example}
                    </p>
                  </div>
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="bg-white py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                  <HelpCircle className="w-12 h-12 text-slate-300" />
                  <p className="font-bold text-slate-500 text-sm">لم نجد أي كلمات تطابق بحثك حالياً.</p>
                </div>
              )}
            </div>

          </div>

          {/* Left Side: Word of the Day & Quick Game Trigger */}
          <div className="flex flex-col gap-6">
            
            {/* Word of the Day Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 p-6 rounded-[32px] border-2 border-yellow-border shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -top-4 -left-4 text-4xl animate-bounce">🌟</div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-orange-600 text-white font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  مفردة اليوم المتجددة
                </span>
                <button
                  onClick={getNewWordOfTheDay}
                  className="p-1.5 bg-white hover:bg-orange-100 text-orange-600 rounded-full border border-orange-200 shadow transition active:scale-90 cursor-pointer"
                  title="تغيير الكلمة عشوائياً"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center my-3 gap-2">
                <h3 className="text-2xl md:text-3xl font-black text-coral font-sans underline decoration-yellow-border decoration-3 underline-offset-4">
                  {wordOfTheDay.word}
                </h3>
                <button
                  onClick={() => speakText(wordOfTheDay.word + ". " + wordOfTheDay.meaning)}
                  className="px-4 py-1.5 bg-white text-orange-600 font-extrabold text-xs rounded-full border border-orange-200 shadow-sm transition hover:bg-orange-50 active:scale-95 flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <Volume2 className="w-4 h-4" />
                  استمع للنطق والمعنى 🗣️
                </button>
              </div>

              <div className="flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-yellow-border/40 shadow-inner">
                <p className="font-bold text-xs leading-relaxed text-charcoal">
                  📌 <span className="font-black text-orange-700">شرح مبسط:</span> {wordOfTheDay.meaning}
                </p>
                <div className="h-px bg-slate-100"></div>
                <p className="font-medium text-[11px] leading-relaxed text-slate-500">
                  🇸🇩 <span className="font-black text-indigo-600">مثال من المنهج:</span> {wordOfTheDay.example}
                </p>
              </div>
            </div>

            {/* Quick Game Promo Box */}
            <div className="bg-indigo-900 text-white p-6 rounded-[32px] border-2 border-yellow-border shadow-md flex flex-col gap-3 relative overflow-hidden select-none">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-6 text-7xl opacity-10 pointer-events-none">🎮</div>
              <h4 className="font-black text-base flex items-center gap-1.5">
                <span>تحدّي المفرادت التفاعلي 🕹️</span>
              </h4>
              <p className="text-[11px] text-indigo-200 leading-relaxed font-bold">
                هل أنت مستعدٌ لاختبار ذكائك ومعرفة مدى تمكنك من معاني الكلمات السودانية المقررة؟ العب الآن واحصد النجوم!
              </p>
              <button
                onClick={startNewQuiz}
                className="mt-2 w-full py-2.5 bg-yellow-accent hover:bg-[#ffe251] text-charcoal font-black text-xs md:text-sm rounded-full shadow border-b-4 border-yellow-600 active:scale-95 transition-all cursor-pointer"
              >
                ابدأ اللعب الآن! 🚀
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
