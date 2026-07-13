import React, { useState, useEffect } from 'react';
import { Lesson, Question, ExerciseType, MatchingPair } from '../types';
import { CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { playSound, generateConfetti, ConfettiItem } from '../utils';

interface ExerciseViewProps {
  lesson: Lesson;
  onLessonCompleted: (lessonId: string, finalScore: number) => void;
}

export default function ExerciseView({ lesson, onLessonCompleted }: ExerciseViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isSubmitted, setIsPlayingSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<{ questionId: string; pairId: string } | null>(null);
  const [matchingLinks, setMatchingLinks] = useState<Record<string, Record<string, string>>>({}); // questionId -> { sourceId: targetId }

  // Re-initialize questions when lesson changes
  useEffect(() => {
    const initialized = lesson.questions.map(q => {
      let initialAns: any = '';
      if (q.type === ExerciseType.TrueFalse) {
        initialAns = null;
      }
      return {
        ...q,
        userAnswer: initialAns,
        isCorrect: undefined
      };
    });
    setQuestions(initialized);
    setShowModelAnswer(false);
    setIsPlayingSubmitted(false);
    setScore(0);
    setConfetti([]);
    setMatchingLinks({});
    setSelectedSource(null);
  }, [lesson]);

  // Animate confetti if active
  useEffect(() => {
    if (confetti.length > 0) {
      const timer = setInterval(() => {
        setConfetti(prev => 
          prev.map(c => ({
            ...c,
            y: c.y + 2.5, // fall down
            rotation: c.rotation + 4,
            x: c.x + Math.sin(c.y * 0.05) * 0.3 // gentle sway
          })).filter(c => c.y < 120) // filter out off-screen
        );
      }, 30);
      return () => clearInterval(timer);
    }
  }, [confetti]);

  const handleMultipleChoice = (qId: string, option: string) => {
    if (isSubmitted) return;
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, userAnswer: option } : q));
    playSound('click');
  };

  const handleBlankChange = (qId: string, value: string) => {
    if (isSubmitted) return;
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, userAnswer: value } : q));
  };

  const handleTrueFalse = (qId: string, val: boolean) => {
    if (isSubmitted) return;
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, userAnswer: val } : q));
    playSound('click');
  };

  // Tactile Matching Actions
  const handleSourceClick = (qId: string, pairId: string) => {
    if (isSubmitted) return;
    setSelectedSource({ questionId: qId, pairId });
    playSound('click');
  };

  const handleTargetClick = (qId: string, targetId: string) => {
    if (isSubmitted || !selectedSource || selectedSource.questionId !== qId) return;
    
    const sourceId = selectedSource.pairId;
    setMatchingLinks(prev => {
      const qLinks = { ...(prev[qId] || {}) };
      
      // If this target was linked elsewhere, remove that link
      Object.keys(qLinks).forEach(k => {
        if (qLinks[k] === targetId) delete qLinks[k];
      });

      qLinks[sourceId] = targetId;
      return { ...prev, [qId]: qLinks };
    });

    setSelectedSource(null);
    playSound('star');
  };

  const handleResetMatch = (qId: string) => {
    if (isSubmitted) return;
    setMatchingLinks(prev => ({ ...prev, [qId]: {} }));
    setSelectedSource(null);
    playSound('click');
  };

  // Verify and Evaluate
  const checkAnswers = () => {
    let correctCount = 0;
    const evaluated = questions.map(q => {
      let isCorrect = false;

      if (q.type === ExerciseType.Matching) {
        // Matching validation: compare linked state against actual values
        const links = matchingLinks[q.id] || {};
        const pairs = q.matchingPairs || [];
        
        // Count how many links are correct
        let matchedCorrect = 0;
        pairs.forEach(p => {
          const userLinkedTargetId = links[p.id];
          if (userLinkedTargetId === p.id) {
            matchedCorrect++;
          }
        });
        
        isCorrect = matchedCorrect === pairs.length;
      } else if (q.type === ExerciseType.TrueFalse) {
        isCorrect = q.userAnswer === q.correctAnswer;
      } else {
        // MultipleChoice & Blank
        const userStr = String(q.userAnswer || '').trim().toLowerCase();
        const correctStr = String(q.correctAnswer || '').trim().toLowerCase();
        isCorrect = userStr === correctStr;
      }

      if (isCorrect) correctCount++;
      return { ...q, isCorrect };
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setQuestions(evaluated);
    setScore(calculatedScore);
    setIsPlayingSubmitted(true);

    if (calculatedScore >= 70) {
      playSound('success');
      setConfetti(generateConfetti());
      onLessonCompleted(lesson.id, calculatedScore);
    } else {
      playSound('failure');
    }
  };

  const resetExercises = () => {
    const initialized = lesson.questions.map(q => ({
      ...q,
      userAnswer: q.type === ExerciseType.TrueFalse ? null : '',
      isCorrect: undefined
    }));
    setQuestions(initialized);
    setIsPlayingSubmitted(false);
    setScore(0);
    setConfetti([]);
    setMatchingLinks({});
    setSelectedSource(null);
    setShowModelAnswer(false);
    playSound('click');
  };

  return (
    <div className="flex flex-col gap-8 relative select-none">
      {/* Playful Confetti Canvas */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map(c => (
            <div
              key={c.id}
              className="absolute rounded-sm"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.size}px`,
                height: `${c.size * 0.6}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg) scaleX(${c.scaleX})`,
                opacity: 0.9,
                transition: 'top 30ms linear, left 30ms linear'
              }}
            />
          ))}
        </div>
      )}

      {/* Intro Exercise banner */}
      <div className="bg-[#FF9F43] text-white p-5 rounded-[24px] border-2 border-yellow-border shadow-md flex items-center gap-3">
        <span className="text-3xl animate-bounce">✏️</span>
        <div className="text-right">
          <h3 className="font-extrabold text-lg">دفتر التمارين والتقييم التفاعلي</h3>
          <p className="text-xs text-orange-50 font-medium">أجب عن التمارين التالية لتجمع النجوم وتحصل على التقييم المعتمد!</p>
        </div>
      </div>

      {/* Question Loop */}
      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => {
          const links = matchingLinks[q.id] || {};
          const matchedColors: Record<string, string> = {
            m1: 'bg-emerald-50 border-emerald-300 text-[#2D6A4F]',
            m2: 'bg-sky-50 border-sky-300 text-sky-800',
            m3: 'bg-yellow-accent/20 border-yellow-border text-coral',
            m4: 'bg-rose-50 border-rose-300 text-rose-800',
            m5: 'bg-purple-50 border-purple-300 text-purple-800',
            m6: 'bg-orange-50 border-orange-300 text-orange-800',
            m7: 'bg-[#FFF9E6] border-[#FFD93D] text-charcoal'
          };

          return (
            <div 
              key={q.id}
              className={`bg-white rounded-[32px] p-6 md:p-8 border-2 shadow-md relative transition-all duration-250 ${
                q.isCorrect === true
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : q.isCorrect === false
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-yellow-border'
              }`}
            >
              {/* Correct/Incorrect Ribbons */}
              {isSubmitted && q.isCorrect !== undefined && (
                <div className={`absolute -top-3.5 left-6 px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm ${
                  q.isCorrect 
                    ? 'bg-emerald-500 text-white animate-bounce' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {q.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      ممتاز! إجابة صحيحة 🌟
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      حاول مرة أخرى ✏️
                    </>
                  )}
                </div>
              )}

              {/* Header */}
              <div className="flex gap-2.5 mb-4 text-right">
                <span className="bg-cream text-coral border border-yellow-border w-7 h-7 flex items-center justify-center rounded-full font-extrabold text-sm font-sans shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-extrabold text-charcoal text-base md:text-lg leading-relaxed">
                  {q.instruction}
                </p>
              </div>

              {/* RENDER QUESTION BY TYPE */}
              {q.type === ExerciseType.MultipleChoice && q.options && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {q.options.map(opt => {
                    const isSelected = q.userAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleMultipleChoice(q.id, opt)}
                        className={`text-right p-4 rounded-2xl border-2 font-bold transition-all text-sm md:text-base cursor-pointer ${
                          isSelected
                            ? 'bg-coral text-white border-[#E05A5A] shadow-md scale-[1.02]'
                            : 'bg-slate-50 text-slate-700 hover:bg-cream/30 border-slate-200 hover:border-yellow-border'
                        } ${isSubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === ExerciseType.FillInTheBlank && (
                <div className="mt-4 flex flex-col md:flex-row gap-3 items-center">
                  <span className="text-xs font-bold text-slate-400">اكتب الكلمة هنا ⬅️</span>
                  <input
                    type="text"
                    value={String(q.userAnswer || '')}
                    disabled={isSubmitted}
                    onChange={(e) => handleBlankChange(q.id, e.target.value)}
                    placeholder="اكتب الإجابة بالتشكيل أو بدونه..."
                    className="w-full max-w-md p-3.5 border-2 border-yellow-border focus:border-coral bg-slate-50 text-slate-800 font-extrabold rounded-2xl outline-none text-center text-lg placeholder:text-slate-400/80 transition-all font-serif focus:bg-white"
                  />
                  {/* Word helper tags */}
                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 md:mt-0 justify-center">
                      {q.options.map(helper => (
                        <button
                          key={helper}
                          type="button"
                          onClick={() => handleBlankChange(q.id, helper)}
                          className="bg-cream hover:bg-yellow-accent/50 text-coral font-bold border border-yellow-border px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                          disabled={isSubmitted}
                        >
                          {helper}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {q.type === ExerciseType.TrueFalse && (
                <div className="flex gap-4 mt-4 justify-center">
                  <button
                    type="button"
                    onClick={() => handleTrueFalse(q.id, true)}
                    className={`px-8 py-3.5 rounded-2xl font-black text-base md:text-lg border-2 flex items-center gap-2 shadow-sm cursor-pointer ${
                      q.userAnswer === true
                        ? 'bg-teal-accent text-white border-teal-600 animate-pulse'
                        : 'bg-slate-50 hover:bg-cream/40 text-[#2D6A4F] border-slate-200'
                    } ${isSubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  >
                    👍 نَعَمْ (صَحِيح)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTrueFalse(q.id, false)}
                    className={`px-8 py-3.5 rounded-2xl font-black text-base md:text-lg border-2 flex items-center gap-2 shadow-sm cursor-pointer ${
                      q.userAnswer === false
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-slate-50 hover:bg-cream/40 text-rose-600 border-slate-200'
                    } ${isSubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  >
                    👎 لَا (خَطَأ)
                  </button>
                </div>
              )}

              {q.type === ExerciseType.Matching && q.matchingPairs && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-600 bg-cream/50 p-2.5 rounded-xl border border-yellow-border/60 gap-2">
                    <span>العمود الأول (أ) 🏷️</span>
                    <span className="flex items-center gap-1 text-coral">
                      <ArrowLeftRight className="w-4.5 h-4.5 animate-pulse" />
                      اضغط على الكلمة ثم اضغط على ما يناسبها باليسار!
                    </span>
                    <span>العمود الثاني (ب) 💡</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 mt-2 relative">
                    {/* Column A (Sources) */}
                    <div className="flex flex-col gap-3">
                      {q.matchingPairs.map(pair => {
                        const targetId = links[pair.id];
                        const isSelected = selectedSource?.pairId === pair.id;
                        let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-cream/30 text-slate-700';

                        if (isSelected) {
                          btnStyle = 'bg-coral text-white border-[#E05A5A] scale-[1.02] ring-4 ring-coral/20';
                        } else if (targetId) {
                          // Locked linked color style
                          btnStyle = matchedColors[pair.id] || 'bg-cream text-charcoal border-yellow-border';
                        }

                        return (
                          <button
                            key={pair.id}
                            type="button"
                            onClick={() => handleSourceClick(q.id, pair.id)}
                            className={`p-4 rounded-2xl border-2 font-black text-sm md:text-base text-right transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnStyle} ${
                              isSubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                            }`}
                          >
                            <span>{pair.source}</span>
                            {targetId && <span className="text-xs bg-white/70 px-2.5 py-0.5 rounded-full border border-yellow-border/50 text-coral font-black">✓ موصل</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Column B (Targets) */}
                    <div className="flex flex-col gap-3">
                      {q.matchingPairs.map(pair => {
                        // Find if this specific pair target has been mapped from any source
                        const linkedSourceId = Object.keys(links).find(k => links[k] === pair.id);
                        let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-cream/30 text-slate-700';
                        
                        if (linkedSourceId) {
                          btnStyle = matchedColors[linkedSourceId] || 'bg-cream text-charcoal border-yellow-border';
                        }

                        return (
                          <button
                            key={pair.id}
                            type="button"
                            onClick={() => handleTargetClick(q.id, pair.id)}
                            className={`p-4 rounded-2xl border-2 font-bold text-sm md:text-base text-right transition-all flex items-center justify-between shadow-sm cursor-pointer ${btnStyle} ${
                              isSubmitted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                            }`}
                          >
                            <span>{pair.target}</span>
                            {linkedSourceId && <span className="text-xs bg-white/70 px-2.5 py-0.5 rounded-full border border-yellow-border/50 text-coral font-black">🔒 مطبق</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!isSubmitted && Object.keys(links).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleResetMatch(q.id)}
                      className="mt-2 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 self-start cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      إعادة تعيين التوصيل لهذه المسألة
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Evaluation Bar Actions */}
      <div className="bg-white p-6 rounded-[32px] border-2 border-yellow-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        {!isSubmitted ? (
          <>
            <div className="text-right">
              <h4 className="font-extrabold text-charcoal text-base">هل انتهيت من كتابة وتوصيل جميع الأجوبة؟</h4>
              <p className="text-xs text-slate-500 font-medium">اضغط على زر التحقق لمعرفة النتيجة وحساب نقاطك!</p>
            </div>
            <button
              id="check-answers-btn"
              type="button"
              onClick={checkAnswers}
              className="w-full md:w-auto px-10 py-4 bg-coral hover:bg-coral/90 text-white font-black text-lg rounded-full border-b-4 border-[#E05A5A] shadow-md transition-transform transform active:scale-95 cursor-pointer"
            >
              تحقق من صحة إجاباتي 🎯
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 text-right">
              <div className={`p-4 rounded-full font-black text-2xl shadow-inner ${
                score >= 70 ? 'bg-[#F0FFF4] text-[#2D6A4F] border border-[#B7E4C7]' : 'bg-rose-100 text-rose-700'
              }`}>
                {score}%
              </div>
              <div>
                <h4 className="font-extrabold text-charcoal text-base">
                  {score >= 70 ? 'تهانينا الحارة يا بطل! 🎉' : 'أداء جيد، حاول مرة أخرى لتصل لـ 100%!'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {score >= 70 
                    ? 'لقد اجتزت التقييم بنجاح وحصلت على النجوم الذهبية والدرجة الممتازة.' 
                    : 'يمكنك مراجعة الأخطاء وتجربة حلها من جديد لتثبيت المعلومة.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
              <button
                id="reset-exercises-btn"
                type="button"
                onClick={resetExercises}
                className="flex-1 md:flex-none px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                حاول مجدداً 🔄
              </button>
              
              <button
                id="toggle-model-answers-btn"
                type="button"
                onClick={() => {
                  setShowModelAnswer(!showModelAnswer);
                  playSound('click');
                }}
                className={`flex-1 md:flex-none px-6 py-3.5 font-extrabold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showModelAnswer
                    ? 'bg-coral text-white hover:bg-coral/90 border-b-4 border-[#E05A5A]'
                    : 'bg-[#FFE66D]/40 text-coral hover:bg-[#FFE66D]/60 border border-yellow-border shadow-sm'
                }`}
              >
                <Eye className="w-5 h-5" />
                {showModelAnswer ? 'إخفاء الحل النموذجي' : 'عرض الحل النموذجي 💡'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Model Answer Drawer Panel (الحلول النموذجية المفسرة) */}
      {showModelAnswer && (
        <div className="bg-[#FFF9E6]/70 border-2 border-yellow-border rounded-[32px] p-6 md:p-8 animate-fade-in text-right">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-yellow-border/50 pb-3">
            <Sparkles className="w-6 h-6 text-[#FF9F43] animate-spin-slow" />
            <h4 className="font-extrabold text-[#FF9F43] text-lg">كراسة الحلول النموذجية والمراجعة 📖</h4>
          </div>

          <p className="text-xs text-slate-600 font-extrabold mb-6">
            مرحباً يا بطل! إليك الأجوبة المعتمدة في منهج الصف الثالث لوزارة التربية والتعليم السودانية مع الشرح المفسر لمساعدتك:
          </p>

          <div className="flex flex-col gap-6">
            {lesson.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-yellow-border/65 shadow-sm">
                <p className="font-bold text-charcoal text-sm md:text-base mb-2">
                  السؤال {idx + 1}: <span className="text-slate-600 font-medium">{q.instruction}</span>
                </p>

                <div className="bg-cream/45 p-3.5 rounded-xl border border-yellow-border/30">
                  <p className="font-black text-coral text-sm md:text-base">
                    📌 الحل الصحيح المعتمد:
                  </p>
                  
                  {q.type === ExerciseType.Matching && q.matchingPairs ? (
                    <ul className="list-disc list-inside mt-2 text-xs md:text-sm font-semibold text-slate-700 flex flex-col gap-2 pr-2">
                      {q.matchingPairs.map(p => (
                        <li key={p.id}>
                          المطابقة الصحيحة: <span className="text-coral font-bold bg-cream px-2 py-0.5 rounded border border-yellow-border/30">{p.source}</span> تعني <span className="text-[#2D6A4F] font-bold bg-[#F0FFF4] px-2 py-0.5 rounded border border-[#B7E4C7]">{p.target}</span>.
                        </li>
                      ))}
                    </ul>
                  ) : q.type === ExerciseType.TrueFalse ? (
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      {q.correctAnswer ? 'نَعَمْ (صَحِيح)' : 'لَا (خَطَأ)'} - وذلك وفق نصوص وقصائد منهج الوزارة المعتمد بالصف الثالث.
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      هو: <span className="text-coral font-extrabold bg-cream px-3 py-1 rounded-lg border border-yellow-border">{String(q.correctAnswer)}</span>.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
