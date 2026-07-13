import React from 'react';
import { GrammarRule } from '../types';
import { motion } from 'motion/react';
import { BookOpenCheck, Volume2, Sparkles, HelpCircle } from 'lucide-react';

interface GrammarCardProps {
  grammarRule: GrammarRule;
  readingMode: 'standard' | 'warm' | 'soft-dark';
  speakWord: (word: string) => void;
}

export default function GrammarCard({ grammarRule, readingMode, speakWord }: GrammarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-[32px] p-6 md:p-8 border-3 shadow-lg transition-all duration-300 relative overflow-hidden ${
        readingMode === 'standard'
          ? 'bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-[#bae6fd] text-[#0369a1]'
          : readingMode === 'warm'
          ? 'bg-[#FAF1D6] border-[#eab308]/40 text-[#713f12]'
          : 'bg-[#2a2d36] border-[#4b5563] text-[#f3f4f6]'
      }`}
    >
      {/* Decorative floating sparkle backgrounds */}
      <div className="absolute -top-1 -left-1 opacity-10 text-sky-400">
        <Sparkles className="w-24 h-24 rotate-12" />
      </div>

      <div className="flex items-center gap-3.5 mb-6 relative z-10">
        <div className={`p-3.5 rounded-2xl flex items-center justify-center ${
          readingMode === 'standard'
            ? 'bg-sky-100 text-sky-600 border border-sky-200'
            : readingMode === 'warm'
            ? 'bg-[#FAF1D6] text-[#713f12] border border-amber-300'
            : 'bg-[#1f2937] text-amber-400 border border-gray-700'
        }`}>
          <BookOpenCheck className="w-7 h-7" />
        </div>
        <div className="text-right">
          <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
            readingMode === 'standard'
              ? 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
              : readingMode === 'warm'
              ? 'bg-[#fef9c3] text-[#a16207] border-[#fef08a]'
              : 'bg-[#374151] text-amber-400 border-[#4b5563]'
          }`}>
            فَائِدَةٌ إِمْلَائِيَّةٌ ذَكِيَّةٌ 💡
          </span>
          <h3 className={`text-2xl font-black mt-1.5 ${
            readingMode === 'standard'
              ? 'text-[#0f172a]'
              : readingMode === 'warm'
              ? 'text-[#451a03]'
              : 'text-[#f9fafb]'
          }`}>
            مِصْبَاحُ الْقَوَاعِدِ الْلُّغَوِيَّةِ
          </h3>
        </div>
      </div>

      {/* Main Rule Card */}
      <div className={`p-5 rounded-2xl border-2 mb-6 leading-relaxed relative z-10 shadow-sm ${
        readingMode === 'standard'
          ? 'bg-white border-sky-100/70 text-slate-800'
          : readingMode === 'warm'
          ? 'bg-[#FFFBF2] border-amber-200 text-[#4a2e0a]'
          : 'bg-[#1e293b] border-gray-700 text-[#f3f4f6]'
      }`}>
        <h4 className="text-lg font-black text-coral mb-2 flex items-center gap-1.5">
          <span>✨ {grammarRule.title}</span>
        </h4>
        <p className="text-base font-extrabold leading-relaxed">
          {grammarRule.ruleText}
        </p>
      </div>

      {/* Explanation Details */}
      <div className="mb-6 relative z-10">
        <h5 className={`text-sm font-black mb-2 flex items-center gap-1.5 justify-start ${
          readingMode === 'standard' ? 'text-sky-700' : readingMode === 'warm' ? 'text-[#854d0e]' : 'text-gray-400'
        }`}>
          <HelpCircle className="w-4 h-4" />
          <span>الشَّرْحُ وَالتَّوْضِيحُ:</span>
        </h5>
        <p className={`text-sm leading-relaxed font-bold ${
          readingMode === 'standard'
            ? 'text-slate-600'
            : readingMode === 'warm'
            ? 'text-[#5c4033]'
            : 'text-gray-300'
        }`}>
          {grammarRule.explanation}
        </p>
      </div>

      {/* Interactive Examples */}
      <div className="relative z-10">
        <h5 className={`text-sm font-black mb-3.5 ${
          readingMode === 'standard' ? 'text-sky-700' : readingMode === 'warm' ? 'text-[#854d0e]' : 'text-gray-400'
        }`}>
          🎯 أَمْثِلَةٌ تَفَاعُلِيَّةٌ (انْقُرْ عَلَى الْكَلِمَةِ لِسَمَاعِ نُطْقِهَا 🔊):
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {grammarRule.examples.map((ex, index) => (
            <motion.div
              key={index}
              onClick={() => speakWord(ex.word)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl border-2 text-right transition-all duration-150 cursor-pointer shadow-sm ${
                readingMode === 'standard'
                  ? 'bg-white hover:bg-sky-50/50 border-[#bae6fd]/60 hover:border-sky-400'
                  : readingMode === 'warm'
                  ? 'bg-[#FFFBF2] hover:bg-[#FAF4E2] border-amber-200 hover:border-amber-500'
                  : 'bg-[#1e293b] hover:bg-[#334155] border-gray-700 hover:border-amber-500'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-coral font-black flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  مِثَالٌ {index + 1}
                </span>
                <span className={`text-[10px] font-black ${
                  readingMode === 'standard' ? 'text-sky-400' : readingMode === 'warm' ? 'text-amber-500' : 'text-gray-400'
                }`}>
                  🔊 اضْغَطْ لِلِاسْتِمَاعِ
                </span>
              </div>
              <p className="text-3xl font-black text-[#FF6F61] leading-none mb-2 hover:text-[#FF6F61]/80">
                {ex.word}
              </p>
              <p className={`text-xs font-bold leading-normal ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#5c4033]/85' : 'text-gray-400'
              }`}>
                {ex.explanation}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
