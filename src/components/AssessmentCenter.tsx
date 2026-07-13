import React, { useState } from 'react';
import { Award, Star, BookOpen, RefreshCw, Check, X, ShieldCheck, User, Sparkles, AlertCircle } from 'lucide-react';
import { playSound } from '../utils';

interface AssessmentQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  type: 'choice' | 'blank' | 'boolean';
  explanation: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questions: AssessmentQuestion[];
}

const ASSESSMENT_EXAMS: Exam[] = [
  {
    id: "exam-1",
    title: "📝 تَقْيِيمُ الْوَحْدَتَيْنِ الْأُولَى وَالثَّانِيَةِ (الْقِيَمُ وَالْمَدْرَسَةُ)",
    description: "أسئلة تقيم فهم الطالب لدروس: بر الوالدين، إكرام الجار، ونظافة وتحية العلم في المدرسة.",
    difficulty: "سهل ⭐",
    questions: [
      {
        id: "q1-1",
        questionText: "ما هو السبيل الأساسي للفوز برضا الله وجنته كما ورد في الدروس الأولى؟",
        options: ["اللعب طوال اليوم", "بر الوالدين وطاعتهما والإحسان إليهما", "السفر الدائم"],
        correctAnswer: "بر الوالدين وطاعتهما والإحسان إليهما",
        type: "choice",
        explanation: "بر الوالدين وطاعتهما ورعايتهما بالدعاء والرحمة هو من أعظم الأعمال التي تُدخل الجنة."
      },
      {
        id: "q1-2",
        questionText: "نقف باحترام وانضباط تام في طابور الصباح المدرسي لنؤدي تحية ______.",
        correctAnswer: "العلم",
        type: "blank",
        explanation: "تحية العلم السوداني في طابور الصباح تغرس في نفوس التلاميذ حب الوطن وتقديره."
      },
      {
        id: "q1-3",
        questionText: "يُعتبر إزعاج الجيران بالصوت العالي واللعب الصاخب سلوكاً مقبولاً وحميداً.",
        options: ["صحيح 👍", "خطأ 👎"],
        correctAnswer: "خطأ 👎",
        type: "boolean",
        explanation: "إكرام الجار وحفظ حقوقه وعدم إزعاجه هي من وصايا نبينا الكريم ومكارم الأخلاق."
      },
      {
        id: "q1-4",
        questionText: "ما معنى 'العيش الشريف'؟",
        options: ["كسب المال بطرق غير سليمة", "العمل والجهد الشريف لكسب الرزق الحلال", "النوم وعدم العمل"],
        correctAnswer: "العمل والجهد الشريف لكسب الرزق الحلال",
        type: "choice",
        explanation: "العيش الشريف هو الكسب الحلال بالجهد وعرق الجبين مثل عمل المزارع أو بائع الخبز."
      }
    ]
  },
  {
    id: "exam-2",
    title: "📝 تَقْيِيمُ الْوَحْدَتَيْنِ الثَّالِثَةِ وَالرَّابِعَةِ (الْوَطَنُ وَحِكَمُ الْحَيَوَانِ)",
    description: "تقييم نضال أبطال السودان كعبد الفضيل الماظ، ودروس الديك والثعلب والتعاون عند النحل.",
    difficulty: "متوسط ⭐⭐",
    questions: [
      {
        id: "q2-1",
        questionText: "مَن هي البطلة والشاعرة السودانية التاريخية التي حثت الفرسان على الدفاع عن الوطن؟",
        options: ["مهيرة بت عبود", "فاطمة أحمد إبراهيم", "تاجوج"],
        correctAnswer: "مهيرة بت عبود",
        type: "choice",
        explanation: "مهيرة بت عبود شاعرة سودانية بطلة حثت الفرسان بأشعارها الحماسية على الاستبسال لصد الغزاة."
      },
      {
        id: "q2-2",
        questionText: "استشهد البطل الصنديد ______ الماظ وهو يدافع بكل شجاعة عن أرض السودان.",
        correctAnswer: "عبد الفضيل",
        type: "blank",
        explanation: "عبد الفضيل الماظ بطل وطني سوداني قاوم الاستعمار واستشهد ممسكاً بسلاحه مدافعاً عن شعبه."
      },
      {
        id: "q2-3",
        questionText: "يضرب لنا النحل والنمل مثلاً عظيماً في المثابرة، الكسل، والتخاذل.",
        options: ["صحيح 👍", "خطأ 👎"],
        correctAnswer: "خطأ 👎",
        type: "boolean",
        explanation: "النحل والنمل يعلموننا حب العمل، والمثابرة، والتنظيم، والنشاط الدائم ورفض الكسل."
      },
      {
        id: "q2-4",
        questionText: "ما هو الدرس المستفاد من قصة الديك والثعلب؟",
        options: ["تصدق كل من يمدحك بكلمات لطيفة ومخادعة", "الحذر والفطنة والذكاء في مواجهة المخادعين", "النوم في الغابة بأمان"],
        correctAnswer: "الحذر والفطنة والذكاء في مواجهة المخادعين",
        type: "choice",
        explanation: "الديك تفطن لخديعة الثعلب ومكره، مما يعلم الأطفال الحذر والذكاء أمام الغرباء."
      }
    ]
  },
  {
    id: "exam-3",
    title: "📝 الْاِمْتِحَانُ النِّهَائِيُّ الشَّامِلُ (لِكُلِّ دُرُوسِ الْمَنْهَجِ السوداني 🇸🇩)",
    description: "الامتحان النهائي الشامل لمنهج الصف الثالث الابتدائي. اجتز هذا الامتحان لتحصل على شهادة التفوق والامتياز الكبرى!",
    difficulty: "متقدم ⭐⭐⭐",
    questions: [
      {
        id: "q3-1",
        questionText: "أيٌّ من الآتي يُعدُّ من العادات الصحية السليمة للمحافظة على الأسنان؟",
        options: ["تناول الكثير من الحلوى والمثلجات قبل النوم", "تنظيف الأسنان بالفرشاة والمعجون مرتين يومياً على الأقل", "عدم غسل الفم بعد الأكل"],
        correctAnswer: "تنظيف الأسنان بالفرشاة والمعجون مرتين يومياً على الأقل",
        type: "choice",
        explanation: "غسل الأسنان يزيل بقايا الطعام ويحميها من التسوس والآلام المزعجة."
      },
      {
        id: "q3-2",
        questionText: "تسمى الأطعمة التي تترك بدون غطاء ويتجمع عليها الغبار والذباب بالأطعمة ______.",
        correctAnswer: "المكشوفة",
        type: "blank",
        explanation: "الأطعمة المكشوفة تسبب التسمم والأمراض المعوية الخطيرة بسبب انتقال الميكروبات إليها."
      },
      {
        id: "q3-3",
        questionText: "من صفات شخصية 'أشعب الأكول' في التراث العربي الكرم والزهد في تناول الطعام والولائم.",
        options: ["صحيح 👍", "خطأ 👎"],
        correctAnswer: "خطأ 👎",
        type: "boolean",
        explanation: "اشتهر أشعب الأكول بالطمع وحبه الشديد والمفرط للأكل وتتبع ولائم الناس."
      },
      {
        id: "q3-4",
        questionText: "ما معنى الحكمة الصحية الشهيرة 'الدواء في الغذاء'؟",
        options: ["أن الغذاء الصحي المتنوع يقي الجسم من الأمراض ويغنيه عن العقاقير والأدوية", "أن نخلط الدواء مع الطعام دائماً", "شراء الأدوية من الصيدلية بكثرة"],
        correctAnswer: "أن الغذاء الصحي المتنوع يقي الجسم من الأمراض ويغنيه عن العقاقير والأدوية",
        type: "choice",
        explanation: "تناول الفاكهة والخضروات الغنية بالفيتامينات يعزز مناعة الجسم الطبيعية ليدافع عن نفسه ضد الأمراض."
      },
      {
        id: "q3-5",
        questionText: "يحتفل السودان بعيد الاستقلال المجيد في الأول من شهر ______ من كل عام.",
        correctAnswer: "يناير",
        type: "blank",
        explanation: "رُفع علم السودان معلناً استقلال البلاد وحريتها في الأول من يناير عام 1956م."
      },
      {
        id: "q3-6",
        questionText: "الصدق والأمانة وإكرام الضيف هي صفات حميدة تمثل مكارم الأخلاق للتلميذ السوداني النجيب.",
        options: ["صحيح 👍", "خطأ 👎"],
        correctAnswer: "صحيح 👍",
        type: "boolean",
        explanation: "تتحلى الشخصية السودانية بمكارم الأخلاق التي تدعو للمروءة، الكرم، النزاهة وحسن معشر الجميع."
      }
    ]
  }
];

export default function AssessmentCenter() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);

  // Student certificate details
  const [studentName, setStudentName] = useState('');
  const [isCertificateClaimed, setIsCertificateClaimed] = useState(false);

  const startExam = (exam: Exam) => {
    playSound('click');
    setSelectedExam(exam);
    setCurrentQuestionIdx(0);
    setSelectedAnswer('');
    setBlankAnswer('');
    setShowExplanation(false);
    setExamScore(0);
    setIsExamCompleted(false);
    setWrongAnswersCount(0);
    setIsCertificateClaimed(false);
  };

  const handleNextQuestion = () => {
    if (!selectedExam) return;
    playSound('click');
    setSelectedAnswer('');
    setBlankAnswer('');
    setShowExplanation(false);

    if (currentQuestionIdx < selectedExam.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setIsExamCompleted(true);
      playSound('success');
    }
  };

  const checkAnswer = () => {
    if (!selectedExam) return;
    const currentQuestion = selectedExam.questions[currentQuestionIdx];
    
    let isCorrect = false;
    if (currentQuestion.type === 'blank') {
      const cleanUser = blankAnswer.trim().replace(/[أإآ]/g, 'ا').toLowerCase();
      const cleanCorrect = currentQuestion.correctAnswer.trim().replace(/[أإآ]/g, 'ا').toLowerCase();
      isCorrect = cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser);
    } else {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setExamScore(prev => prev + 1);
      playSound('success');
    } else {
      setWrongAnswersCount(prev => prev + 1);
      playSound('failure');
    }

    setShowExplanation(true);
  };

  const getPassPercentage = () => {
    if (!selectedExam) return 0;
    return Math.round((examScore / selectedExam.questions.length) * 100);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-coral to-orange-500 text-white rounded-[24px] p-6 shadow-md border-2 border-yellow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 text-3xl shadow-inner animate-pulse">
              📝
            </div>
            <div>
              <h2 className="font-black text-xl md:text-2xl">مَرْكَزُ التَّقْيِيمَاتِ وَالِامْتِحَانَاتِ الشَّامِلَةِ</h2>
              <p className="text-xs md:text-sm text-coral-100 font-bold mt-1">امتحانات مخصصة لقياس مهارات الفهم والاستيعاب لمنهج اللغة العربية لجمهورية السودان 🇸🇩</p>
            </div>
          </div>
        </div>
      </div>

      {!selectedExam ? (
        /* LIST OF EXAMS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ASSESSMENT_EXAMS.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-[32px] border-2 border-yellow-border hover:border-coral p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transform transition duration-200 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-coral/10 text-coral font-black px-2.5 py-1 rounded-full">
                    مستوى الصعوبة: {exam.difficulty}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                    {exam.questions.length} أسئلة 📝
                  </span>
                </div>
                <h3 className="font-black text-base text-charcoal mt-2 leading-relaxed">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  {exam.description}
                </p>
              </div>

              <button
                onClick={() => startExam(exam)}
                className="mt-6 w-full py-2.5 bg-coral text-white font-black text-xs rounded-full border-b-4 border-rose-700 shadow hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>ابدأ الامتحان التفاعلي 🚀</span>
              </button>
            </div>
          ))}
        </div>
      ) : isExamCompleted ? (
        /* EXAM COMPLETED SUMMARY / CERTIFICATE */
        <div className="bg-white rounded-[32px] p-8 border-2 border-yellow-border shadow-lg flex flex-col items-center gap-6">
          <div className="text-center flex flex-col items-center gap-2 max-w-xl">
            <span className="text-5xl">🏆</span>
            <h3 className="font-black text-2xl text-coral">لقد أكملت الامتحان بنجاح!</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              تلميذنا النجيب، لقد قمت بمجهود رائع في الإجابة على التقييم المخصص لمنهج الصف الثالث الابتدائي! إليك نتائجك بالتفصيل:
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[11px] text-emerald-600 font-black">الإجابات الصحيحة ✅</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{examScore}</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <span className="text-[11px] text-rose-600 font-black">الأخطاء المرتكبة ❌</span>
                <p className="text-2xl font-black text-rose-700 mt-1">{wrongAnswersCount}</p>
              </div>
            </div>

            <div className="mt-4 px-6 py-2 bg-yellow-accent/40 text-charcoal font-black rounded-full text-sm border border-yellow-border">
              🏆 النسبة المئوية للنجاح: {getPassPercentage()}%
            </div>
          </div>

          {/* DYNAMIC CERTIFICATE GENERATION */}
          {getPassPercentage() >= 75 ? (
            <div className="w-full max-w-2xl bg-cream p-6 md:p-8 rounded-[32px] border-4 border-double border-yellow-border shadow-md flex flex-col items-center gap-5 relative overflow-hidden select-none">
              {/* Corner ribbons */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-border/20 rotate-45 transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-border/20 rotate-45 transform -translate-x-8 translate-y-8"></div>
              
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl">🎓</span>
                <h4 className="font-black text-lg md:text-xl text-yellow-800">شَهَادَةُ تَمَيُّزٍ وَتَفَوُّقٍ أَكَادِيمِيٍّ</h4>
                <p className="text-[10px] text-slate-500 font-bold italic leading-none">مُقدّمة من منصة لغتي الجميلة للمنهج السوداني التفاعلي 🇸🇩</p>
              </div>

              {!isCertificateClaimed ? (
                <div className="flex flex-col items-center gap-3 w-full max-w-md">
                  <span className="text-xs text-slate-600 font-extrabold">اكتب اسمك الثلاثي لطباعة الشهادة الرسمية:</span>
                  <div className="relative w-full flex items-center">
                    <User className="absolute right-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="اسم التلميذ البطل..."
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 bg-white border-2 border-slate-200 focus:border-coral focus:outline-none rounded-2xl text-xs font-bold text-right shadow-sm"
                    />
                  </div>
                  <button
                    disabled={!studentName.trim()}
                    onClick={() => { setIsCertificateClaimed(true); playSound('success'); }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-full border-b-4 border-indigo-900 shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>توليد وطباعة الشهادة الملونة 🎨</span>
                  </button>
                </div>
              ) : (
                /* Dynamic Certificate layout ready for visual preview */
                <div className="w-full bg-white p-6 rounded-2xl border-2 border-yellow-border shadow-inner text-center flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 bg-yellow-accent/40 rounded-full flex items-center justify-center border-2 border-yellow-border text-2xl shadow-sm animate-bounce">
                    🇸🇩
                  </div>
                  <p className="text-xs text-slate-500 font-bold">يَسُرُّ مَرْكَزَ الْمَنَاهِجِ وَالْبَحْثِ التَّرْبَوِيِّ بِمَحَبَّةٍ أَنْ يَمْنَحَ التِّلْمِيذَ الْبَطَلَ:</p>
                  <p className="font-black text-2xl text-indigo-700 underline decoration-yellow-border decoration-wavy underline-offset-8">
                    ✨ {studentName} ✨
                  </p>
                  <p className="text-xs text-slate-700 font-extrabold leading-relaxed max-w-md">
                    وسامَ التفوّق والامتياز من الدرجة الأولى لاجتيازه بنجاح وتفوّق <span className="text-coral underline font-black">{selectedExam.title.split(':')[1]?.trim() || selectedExam.title}</span> بنسبة نجاح بلغت <span className="font-black text-indigo-600">{getPassPercentage()}%</span>.
                  </p>
                  <div className="flex justify-between w-full border-t border-dashed pt-4 text-[9px] text-slate-400 font-bold px-4 mt-2">
                    <span>التوقيع: بَوَّابَةُ التِّلْمِيذِ الذَّكِيَّةِ 🎒</span>
                    <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center max-w-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs font-black text-amber-800 leading-relaxed">
                لكي تتمكن من الحصول على وسام التميز وشهادة النجاح، يجب أن تبلغ نسبة إجاباتك الصحيحة 75% على الأقل. لا تيأس، أعد قراءة الدروس وحاول مجدداً! 💪
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => startExam(selectedExam)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-black text-xs rounded-full transition-all active:scale-95 cursor-pointer"
            >
              🔄 إعادة الامتحان
            </button>
            <button
              onClick={() => { setSelectedExam(null); playSound('click'); }}
              className="px-6 py-2.5 bg-coral text-white font-black text-xs rounded-full border-b-4 border-rose-700 shadow hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              🚪 قائمة الامتحانات الأخرى
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE EXAM RUNNING LOOP */
        <div className="bg-white rounded-[32px] p-6 border-2 border-yellow-border shadow-md flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between border-b pb-3">
            <span className="text-xs font-black text-slate-500">
              {selectedExam.title}
            </span>
            <button
              onClick={() => { setSelectedExam(null); playSound('click'); }}
              className="text-xs text-rose-500 font-black hover:underline cursor-pointer"
            >
              إلغاء وانسحاب 🚪
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
            <div
              className="bg-coral h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx) / selectedExam.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Display */}
          <div className="w-full max-w-xl text-center flex flex-col gap-4 mt-2">
            <span className="text-xs text-slate-400 font-black">السؤال {currentQuestionIdx + 1} من {selectedExam.questions.length}:</span>
            <h3 className="font-black text-lg md:text-xl text-indigo-900 leading-relaxed">
              {selectedExam.questions[currentQuestionIdx].questionText}
            </h3>
          </div>

          {/* Answer Modes */}
          <div className="w-full max-w-xl mt-2">
            {selectedExam.questions[currentQuestionIdx].type === 'blank' ? (
              /* Fill in the blank question input */
              <div className="flex flex-col items-center gap-3">
                <input
                  type="text"
                  disabled={showExplanation}
                  value={blankAnswer}
                  onChange={(e) => setBlankAnswer(e.target.value)}
                  placeholder="اكتب الإجابة باللغة العربية هنا..."
                  className="w-full p-4 border-2 border-slate-200 focus:border-coral focus:outline-none rounded-2xl text-xs md:text-sm font-black text-center shadow-inner"
                />
              </div>
            ) : (
              /* Multiple Choice or True/False options list */
              <div className="grid grid-cols-1 gap-3 w-full">
                {selectedExam.questions[currentQuestionIdx].options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === selectedExam.questions[currentQuestionIdx].correctAnswer;
                  
                  let btnStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800";
                  if (showExplanation) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500 border-rose-600 text-white shadow-md";
                    } else {
                      btnStyle = "opacity-50 bg-slate-50 border-slate-200 text-slate-400";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-coral/10 border-coral text-coral font-black scale-[1.01]";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => { setSelectedAnswer(option); playSound('click'); }}
                      className={`w-full text-right p-4 rounded-2xl border-2 font-bold text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${
                        !showExplanation ? "hover:translate-x-[-4px] active:scale-95" : ""
                      } ${btnStyle} cursor-pointer`}
                    >
                      <span className="leading-relaxed">{option}</span>
                      {showExplanation && isCorrectAnswer && <Check className="w-5 h-5 shrink-0" />}
                      {showExplanation && isSelected && !isCorrectAnswer && <X className="w-5 h-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time check explanation panel */}
          {showExplanation && (
            <div className="w-full max-w-xl bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl flex flex-col gap-1 animate-fade-in">
              <span className="font-black text-xs text-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                شرح الموجه التربوي 💡:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-bold mt-1">
                {selectedExam.questions[currentQuestionIdx].explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full flex justify-center border-t pt-4 mt-2">
            {!showExplanation ? (
              <button
                disabled={
                  (selectedExam.questions[currentQuestionIdx].type === 'blank' && !blankAnswer.trim()) ||
                  (selectedExam.questions[currentQuestionIdx].type !== 'blank' && !selectedAnswer)
                }
                onClick={checkAnswer}
                className="px-8 py-2.5 bg-coral text-white disabled:opacity-50 font-black text-xs rounded-full border-b-4 border-rose-700 shadow-md transition active:scale-95 cursor-pointer"
              >
                تأكيد الإجابة والتحقق منها 🔍
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-full border-b-4 border-indigo-900 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>السؤال التالي ➡️</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
