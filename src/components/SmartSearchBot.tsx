import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Volume2, VolumeX, X, HelpCircle, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { playSound } from '../utils';

// Pre-defined kid-friendly Q&A Knowledge Base
interface QAItem {
  keywords: string[];
  question: string;
  answer: string;
}

const KNOWLEDGE_BASE: QAItem[] = [
  {
    keywords: ["بر الوالدين", "حب الوالدين", "أبي وأمي", "الوالدين", "طاعة"],
    question: "ما معنى بِرّ الوالِدَين وكيف نحترمهما؟",
    answer: "بِرّ الوالدَين يعني طاعتهما، واحترامهما، ومساعدتهما في المنزل، والدعاء لهما بالخير دائماً، لأنَّهما يتعبان كثيراً من أجل راحتنا وسعادتنا!"
  },
  {
    keywords: ["يتفقد", "يطمئن"],
    question: "ما معنى كلمة (يَتَفَقَّدُ)؟",
    answer: "يَتَفَقَّدُ يعني: يَسْأَل عن أحوال غيره، ويَطْمَئِنّ عليهم ويرعاهم، مثلما يذهب الأب ليتفقد والديه كل ليلة."
  },
  {
    keywords: ["عاهدت", "وعدت", "ألزمت"],
    question: "ما معنى كلمة (عَاهَدْتُ نَفْسِي)؟",
    answer: "عَاهَدْتُ نَفْسِي تعني: أَلْزَمْتُ نَفْسِي وأعطيتُ وعداً صادقاً للقيام بعمل طيب."
  },
  {
    keywords: ["دوما", "دائما"],
    question: "ما معنى كلمة (دَوْماً)؟",
    answer: "دَوْماً تعني: فِي كُلِّ وَقْتٍ، أو باستمرار دون توقف."
  },
  {
    keywords: ["واهبا", "الواهب"],
    question: "ما معنى كلمة (وَاهِباً)؟",
    answer: "وَاهِباً تعني: مُعْطِياً، والمقصود به هو الله سبحانه وتعالى الذي يعطينا النعم الكثيرة."
  },
  {
    keywords: ["الجار", "إكرام الجار", "الضيف", "إكرام الضيف"],
    question: "كيف نُكرم الجار والضيف؟",
    answer: "نُكرم الضيف بالترحيب به بابتسامة وتقديم أفضل الطعام والشراب له. ونُكرم الجار بمساعدته واحترامه وعدم إزعاجه أبداً."
  },
  {
    keywords: ["أركان الإسلام", "الأركان خمسة", "الإسلام"],
    question: "ما هي أَرْكَانُ الإِسْلَامِ الخمسة؟",
    answer: "أركان الإسلام خمسة يا بطل: أولاً الشهادتان، ثانياً إقامة الصلاة، ثالثاً إيتاء الزكاة، رابعاً صوم رمضان، وخامساً حج البيت لمن استطاع إليه سبيلاً!"
  },
  {
    keywords: ["الفرخ السعيد", "كتكوت", "أنا الفرخ"],
    question: "من هو الفَرْخُ السَّعِيدُ؟",
    answer: "الفرخ السعيد هو كتكوت جميل يعيش سعيداً ومطيعاً، يستيقظ مبكراً مع الفجر، يغسل ريشه بالماء البارد، ويحمد الله ويقول كوكو كوكو!"
  },
  {
    keywords: ["العيش الشريف", "العمل", "كسب"],
    question: "ما هو العَيْشُ الشَّرِيفُ؟",
    answer: "العيش الشريف هو أن يعمل الإنسان بجد ونشاط ليكسب رزقه بالحلال والعمل الطيب، مبتعداً عن الكسل أو الاعتماد على الآخرين."
  },
  {
    keywords: ["الغذاء الصحي", "أكل صحي", "طعام"],
    question: "ما هو الغِذَاءُ الصِّحِّيُّ المفيد للجسم؟",
    answer: "الغذاء الصحي هو الطعام المفيد الذي يمنحنا القوة والنشاط! مثل الفواكه، الخضروات، الحليب، اللحوم، والبيض، مع شرب الماء بكثرة والابتعاد عن الحلويات الضارة."
  },
  {
    keywords: ["النظافة", "حماية الجسم", "الأسنان", "فرشاة"],
    question: "كيف نحمي أجسامنا وأسناننا؟",
    answer: "نحمي أجسامنا بالنظافة! بغسل اليدين جيداً بالماء والصابون قبل وبعد الطعام، وتفريش أسناننا بالفرشاة والمعجون يومياً لحمايتها من التسوس."
  },
  {
    keywords: ["السودان", "بلادي", "عاصمة"],
    question: "ما هي عاصمة السودان وبماذا تشتهر؟",
    answer: "عاصمة السودان هي الخرطوم الحبيبة، وهي بلد الكرم والخيرات، ويلتقي فيها النيل الأزرق والنيل الأبيض في منظر ساحر يسمى مقرن النيلين!"
  },
  {
    keywords: ["البيئة", "شجرة", "أوساخ"],
    question: "كيف نُحافظ على البِيئَةِ من حولنا؟",
    answer: "نحافظ على البيئة بزراعة الأشجار الجميلة، والمحافظة على نظافة المدرسة والشارع، ووضع النفايات دائماً في سلة المهملات!"
  },
  {
    keywords: ["الخم", "البيت"],
    question: "ما معنى كلمة (الخُمُّ)؟",
    answer: "الخُمُّ هو بَيْتُ الدَّجَاجِ الصغير حيث تنام الطيور وتعيش بأمان."
  },
  {
    keywords: ["التسوس", "تسوس"],
    question: "ما هو تَسَوُّسُ الأَسْنَانِ؟",
    answer: "تسوّس الأسنان هو مرض يصيب الأسنان ويجعلها تؤلمنا بسبب تناول الكثير من الحلويات وعدم تنظيفها بالفرشاة والمعجون."
  }
];

export default function SmartSearchBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [answerResult, setAnswerResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside of the assistant container
  useEffect(() => {
    function handleClickOutside(event: TouchEvent | MouseEvent) {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'ar-SA';
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          handleBotSearch(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setRecognitionError('يرجى السماح بصلاحية المايكروفون للتحدث 🎙️');
        } else {
          setRecognitionError('لم نتمكن من سماعك بوضوح، يرجى المحاولة مرة أخرى.');
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    playSound('click');
    if (isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (!isOpen) {
      // Welcome greeting in voice when opened
      const welcomeMsg = 'أهلاً بك يا بطل في باحث الضاد الذكي! اسألني عن أي كلمة أو درس وسأجيبك فوراً بالصوت!';
      speakText(welcomeMsg);
    }
  };

  // Safe Text-to-Speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9; // Kids friendly slower speed

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      playSound('click');
    }
  };

  // Search Logic based on Keyword & Substring overlap scoring
  const handleBotSearch = (query: string) => {
    if (!query.trim()) return;

    // Standardize Arabic characters for robust matching (remove accents / tashkeel and unify letters)
    const normalizeArabic = (text: string) => {
      return text
        .replace(/[\u064B-\u0652]/g, "") // Remove tashkeel (fatha, damma, etc.)
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي");
    };

    const normQuery = normalizeArabic(query.toLowerCase());
    
    let bestMatch: QAItem | null = null;
    let highestScore = 0;

    KNOWLEDGE_BASE.forEach(item => {
      let score = 0;
      
      // Match words
      item.keywords.forEach(keyword => {
        const normKeyword = normalizeArabic(keyword.toLowerCase());
        if (normQuery.includes(normKeyword)) {
          score += 3; // Direct keyword match
        }
      });

      // Match parts of the question
      const normQuestion = normalizeArabic(item.question.toLowerCase());
      if (normQuestion.split(' ').some(word => word.length > 2 && normQuery.includes(word))) {
        score += 1;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    let finalAnswer = '';
    if (highestScore > 0 && bestMatch) {
      finalAnswer = (bestMatch as QAItem).answer;
    } else {
      finalAnswer = "سؤال جميل يا ذكي! لم أجد هذه الكلمة بالتحديد في المعجم المنهجي الحالي، ولكن تذكر دائماً أن بر الوالدين، والنظافة، والغذاء الصحي، والاجتهاد في طلب العلم هي أهم مفاتيح النجاح للبطل الصغير!";
    }

    setAnswerResult(finalAnswer);
    speakText(finalAnswer);
    playSound('success');
  };

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('ميزة الإدخال الصوتي غير مدعومة في هذا المتصفح حالياً. يرجى الكتابة في صندوق البحث.');
      return;
    }
    playSound('click');
    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-50 select-none font-sans" dir="rtl">
      {/* 1. FLOATING ACTION BUTTON (حرف الضاد) */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-4 border-yellow-accent shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 animate-bounce font-black text-3xl select-none"
          title="باحث الضاد الذكي 💬"
          id="smart-search-fab"
        >
          ض
        </button>
      )}

      {/* 2. CHAT ASSISTANT PANEL */}
      {isOpen && (
        <div 
          className="w-[90vw] sm:w-[420px] max-h-[580px] bg-white rounded-[32px] border-4 border-teal-500 shadow-2xl flex flex-col overflow-hidden transition-all transform duration-300 ease-out animate-in slide-in-from-bottom-5"
          id="smart-search-panel"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 flex items-center justify-between text-white border-b-2 border-teal-600">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-xl border border-white/20">
                ض
              </div>
              <div className="text-right">
                <h3 className="font-black text-sm">باحِثُ الضَّادِ الذَّكِي 🚀</h3>
                <p className="text-[10px] text-teal-10 font-bold">مُساعدك الشخصي للدروس والمعاني</p>
              </div>
            </div>
            <button 
              onClick={handleToggleOpen}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 min-h-[250px] max-h-[380px]">
            
            {/* Greeting Card */}
            <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-100 flex items-start gap-3 shadow-sm">
              <span className="text-3xl">🤖</span>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800">أهلاً بك يا بطل! 👋</p>
                <p className="text-[11px] text-slate-600 font-bold mt-1 leading-relaxed">
                  أنا باحثك الذكي لمساعدة الصف الثالث. اكتب أي سؤال أو معنى كلمة تريد معرفتها، أو اضغط على المايك وتحدث معي بالصوت!
                </p>
              </div>
            </div>

            {/* Suggestions Box */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-slate-400 font-black flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> أسئلة شائعة يمكنك تجربتها:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {KNOWLEDGE_BASE.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item.question);
                      handleBotSearch(item.question);
                    }}
                    className="text-[10px] font-extrabold bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-100 transition-colors text-right cursor-pointer"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Result Display */}
            {answerResult && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3.5 flex flex-col gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">الجواب الذكي ✨</span>
                  <div className="flex gap-1">
                    {isSpeaking ? (
                      <button 
                        onClick={stopSpeaking}
                        className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                        title="إيقاف قراءة الصوت"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>إيقاف 🔇</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => speakText(answerResult)}
                        className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                        title="قراءة بالصوت"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>اسمع 🔊</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs font-black text-slate-800 leading-relaxed text-justify">
                  {answerResult}
                </p>
              </div>
            )}

            {/* Error Indicators */}
            {recognitionError && (
              <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] rounded-xl font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{recognitionError}</span>
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Mic STT button */}
              <button
                onClick={startListening}
                className={`p-3 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse scale-105' 
                    : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600'
                }`}
                title={isListening ? 'جاري الاستماع... اضغط للإيقاف' : 'اضغط للتحدث بالصوت 🎙️'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={isListening ? 'تكلم الآن، جاري الكتابة...' : 'اكتب الكلمة أو السؤال هنا...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBotSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-100 focus:bg-white text-xs font-bold rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none text-right transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Submit Button */}
              <button
                onClick={() => handleBotSearch(searchQuery)}
                disabled={!searchQuery.trim()}
                className={`p-2.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  searchQuery.trim()
                    ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="ابحث الآن"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>
            {isListening && (
              <p className="text-[10px] text-rose-500 font-extrabold text-center animate-pulse">
                🎙️ جاري الاستماع صوتياً... تحدث باللغة العربية الآن
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
