import React, { useState } from 'react';
import { Unit, Lesson, LessonType } from '../types';
import { Heart, School, Sparkles, BookOpen, Music, CheckCircle, ChevronLeft } from 'lucide-react';
import { playSound } from '../utils';

interface KidDashboardProps {
  units: Unit[];
  completedLessons: string[];
  totalScore: number;
  onSelectLesson: (lesson: Lesson) => void;
}

const UNIT_THEMES: Record<string, { badge: string; border: string; textAccent: string; shadowAccent: string }> = {
  'unit-1': { badge: 'bg-coral text-white', border: 'border-yellow-border hover:border-coral', textAccent: 'text-coral', shadowAccent: 'hover:shadow-lg hover:shadow-coral/10' },
  'unit-2': { badge: 'bg-teal-accent text-white', border: 'border-yellow-border hover:border-teal-accent', textAccent: 'text-teal-accent', shadowAccent: 'hover:shadow-lg hover:shadow-teal-accent/10' },
  'unit-3': { badge: 'bg-[#FF9F43] text-white', border: 'border-yellow-border hover:border-[#FF9F43]', textAccent: 'text-[#FF9F43]', shadowAccent: 'hover:shadow-lg hover:shadow-orange-400/10' },
};

export default function KidDashboard({ units, completedLessons, totalScore, onSelectLesson }: KidDashboardProps) {
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  const getIcon = (name: string, colorClass: string) => {
    switch (name) {
      case 'Heart': return <Heart className={`w-6 h-6 fill-current ${colorClass}`} />;
      case 'School': return <School className={`w-6 h-6 fill-current ${colorClass}`} />;
      case 'Sparkles': return <Sparkles className={`w-6 h-6 fill-current ${colorClass}`} />;
      default: return <Sparkles className={`w-6 h-6 fill-current ${colorClass}`} />;
    }
  };

  const getUnitTheme = (id: string, index: number) => {
    const keys = Object.keys(UNIT_THEMES);
    const key = keys[index % keys.length];
    return UNIT_THEMES[id] || UNIT_THEMES[key];
  };

  return (
    <div className="flex flex-col gap-8 select-none text-right">
      {/* Main Units Journey map */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xl text-charcoal flex items-center gap-1.5">
            <School className="w-6 h-6 text-coral" />
            رحلة الوحدات والدروس التفاعلية 🗺️
          </h3>
          <span className="text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-full border border-yellow-border">اضغط على وحدة لفتح دروسها</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {units.map((unit, idx) => {
            const isSelected = activeUnitId === unit.id;
            const comCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
            const theme = getUnitTheme(unit.id, idx);

            return (
              <div
                key={unit.id}
                className="flex flex-col transition-all duration-200"
              >
                {/* Unit Map Card */}
                <button
                  type="button"
                  id={`unit-card-btn-${unit.id}`}
                  onClick={() => {
                    setActiveUnitId(isSelected ? null : unit.id);
                    playSound('click');
                  }}
                  className={`w-full text-right p-6 rounded-[32px] bg-white text-charcoal border-2 ${theme.border} ${theme.shadowAccent} shadow-sm hover:scale-[1.01] transform active:scale-95 transition-all duration-150 cursor-pointer flex flex-col gap-3 relative ${
                    isSelected ? 'ring-4 ring-coral/30 ring-offset-2 border-coral' : ''
                  }`}
                >
                  {/* Icon indicators */}
                  <div className="absolute top-4 left-4 bg-[#FFF9E6] p-2.5 rounded-full border border-yellow-border shadow-inner">
                    {getIcon(unit.iconName, theme.textAccent)}
                  </div>

                  <span className={`text-xs ${theme.badge} px-3 py-1 rounded-full font-black self-start uppercase font-sans tracking-wide shadow-sm`}>
                    الوحدة {unit.id.split('-')[1]}
                  </span>

                  <h4 className="font-black text-lg md:text-xl leading-relaxed mt-2 text-charcoal">
                    {unit.title}
                  </h4>
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">
                    {unit.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold w-full">
                    <span className="text-slate-600">التقدم: {comCount} / {unit.lessons.length} من الدروس</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      comCount === unit.lessons.length ? 'bg-[#F0FFF4] text-[#2D6A4F] border border-[#B7E4C7]' : 'bg-yellow-accent/40 text-charcoal border border-yellow-border'
                    }`}>
                      {comCount === unit.lessons.length ? 'مكتملة بالكامل 👑' : 'مستمرة ⚡'}
                    </span>
                  </div>
                </button>

                {/* CONDITION-RENDER: LESSONS SHELF */}
                {isSelected && (
                  <div className="flex flex-col gap-2 mt-4 bg-white p-4 rounded-[24px] border-2 border-dashed border-yellow-border transition-all duration-200 shadow-inner">
                    <p className="text-xs font-bold text-slate-500 mb-2">اختر درساً للبدء بقراءته وحل تمارينه:</p>
                    
                    {unit.lessons.map(lesson => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          id={`lesson-item-btn-${lesson.id}`}
                          onClick={() => {
                            onSelectLesson(lesson);
                            playSound('click');
                          }}
                          className={`w-full text-right p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all duration-150 transform hover:translate-x-[-4px] cursor-pointer ${
                            isCompleted
                              ? 'bg-[#F0FFF4] border-[#B7E4C7] text-[#2D6A4F]'
                              : 'bg-slate-50 hover:bg-[#FFF9E6]/40 border-slate-100 hover:border-yellow-border text-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-2 rounded-xl ${
                              lesson.type === LessonType.Poem 
                                ? 'bg-[#FFE66D]/30 text-[#FF9F43] animate-pulse' 
                                : 'bg-coral/10 text-coral'
                            }`}>
                              {lesson.type === LessonType.Poem ? <Music className="w-4 h-4 fill-current" /> : <BookOpen className="w-4 h-4" />}
                            </span>
                            <div className="flex flex-col text-right">
                              <span className="font-extrabold text-sm md:text-base leading-relaxed">
                                {lesson.title}
                              </span>
                              {lesson.type === LessonType.Poem && (
                                <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5">
                                  ★ نشيد منسق بنفس طريقة المنهج السوداني 🎨
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs bg-emerald-100/50 px-2 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4 fill-current" />
                                مكتمل +10 🌟
                              </span>
                            ) : (
                              <ChevronLeft className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {unit.lessons.length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">لا توجد دروس مضافة في هذه الوحدة حتى الآن.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
