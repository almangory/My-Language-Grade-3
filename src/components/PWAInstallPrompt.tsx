import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Sparkles, Share, Smartphone, CheckCircle, Apple, HelpCircle } from 'lucide-react';
import { playSound } from '../utils';

interface PWAInstallPromptProps {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  show: boolean;
  onClose: () => void;
}

export default function PWAInstallPrompt({
  deferredPrompt,
  setDeferredPrompt,
  show,
  onClose
}: PWAInstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback message if deferredPrompt is not available (e.g. some browsers or if already registered)
      alert("الرجاء استخدام خيار 'إضافة إلى الشاشة الرئيسية' من إعدادات المتصفح لديك لتثبيت التطبيق.");
      return;
    }
    
    try {
      playSound('click');
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        playSound('success');
        setInstallSuccess(true);
        setDeferredPrompt(null);
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error("Error triggering PWA install prompt:", err);
    }
  };

  const handleDismiss = () => {
    playSound('click');
    // Save in localStorage to respect user choice and prevent constant nagging
    localStorage.setItem('pwa_install_dismissed_v1', 'true');
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="relative max-w-lg w-full bg-[#FFFDF6] rounded-[36px] border-4 border-[#FFD93D] shadow-2xl p-6 md:p-8 overflow-hidden text-right"
        >
          {/* Decorative Background Circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-coral/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-accent/10 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-sm active:scale-95 z-20"
            title="إغلاق ❌"
          >
            <X className="w-5 h-5" />
          </button>

          {installSuccess ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-400 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">تهانينا! تم التثبيت بنجاح 🎉</h2>
              <p className="text-sm text-emerald-700 font-extrabold max-w-xs">
                لقد تم تثبيت تطبيق "لغتي" التفاعلي على هاتفك بنجاح. يمكنك الآن فتحه مباشرة من الشاشة الرئيسية والتعلم بدون إنترنت! 🇸🇩🎒
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-5 select-none">
              {/* App Icon and Heading */}
              <div className="flex items-center gap-4 border-b border-yellow-border/30 pb-4">
                <div className="w-16 h-16 bg-[#14212e] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#FFD93D] p-1 overflow-hidden shrink-0">
                  <span className="text-3xl">🇸🇩</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-black text-slate-800">ثبّت تطبيق "لغتي" التفاعلي 📱</h2>
                    <span className="bg-coral text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">مميز ✨</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-1">الصف الثالث الابتدائي - المنهج السوداني</p>
                </div>
              </div>

              {/* Promo Pitch Bullets */}
              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-yellow-border/40 shadow-inner flex flex-col gap-3 text-xs font-black text-slate-600">
                <p className="text-xs text-coral-dark font-black mb-1">لماذا يفضّل تثبيته كتطبيق على جوالك؟</p>
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0">📡</span>
                  <p><strong>يعمل بالكامل بدون إنترنت:</strong> تصفح الدروس وحل التمارين الصوتية دون الحاجة لشبكة.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0">🚀</span>
                  <p><strong>سرعة فائقة ولمسة واحدة:</strong> يفتح التطبيق مباشرة بدون متصفح وعوائق تحميل.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0">💡</span>
                  <p><strong>تجربة شاشة كاملة (أمان طفلك):</strong> يمنع تشتيت الطفل بأزرار المتصفح والروابط الخارجية.</p>
                </div>
              </div>

              {/* Platform Conditional Instructions */}
              {isIOS ? (
                /* iOS Safari installation guide (No native prompt available) */
                <div className="flex flex-col gap-3.5 bg-amber-500/10 p-4 rounded-2xl border border-amber-300">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Apple className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-extrabold">تعليمات التثبيت البسيطة لأجهزة الآيفون والآيباد:</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 text-xs text-slate-700 font-bold pr-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white rounded-full border border-amber-300 flex items-center justify-center font-bold text-[10px] text-amber-800 shrink-0">١</span>
                      <p className="flex items-center gap-1">
                        اضغط على زر <strong>المشاركة</strong> <Share className="w-3.5 h-3.5 text-blue-500 inline mx-0.5" /> في أسفل شاشة المتصفح.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white rounded-full border border-amber-300 flex items-center justify-center font-bold text-[10px] text-amber-800 shrink-0">٢</span>
                      <p>
                        مرر القائمة لأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> <span className="font-extrabold text-slate-800">➕</span>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white rounded-full border border-amber-300 flex items-center justify-center font-bold text-[10px] text-amber-800 shrink-0">٣</span>
                      <p>
                        اضغط على كلمة <strong>"إضافة"</strong> في أعلى يسار الشاشة لتثبيت التطبيق.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Android / Chrome installation button (Native prompt is supported) */
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-4 bg-coral hover:bg-coral-dark text-white font-black rounded-2xl shadow-lg border-2 border-white transform hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-sm md:text-base"
                    id="pwa-install-trigger-btn"
                  >
                    <Download className="w-5 h-5 animate-bounce" />
                    <span>تثبيت كَتَطْبِيق جَوَّال الآن 📱✨</span>
                  </button>
                  
                  {!deferredPrompt && (
                    <div className="flex items-start gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-bold">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p>إذا لم تظهر نافذة التثبيت التلقائي، يمكنك الضغط على النقاط الثلاث <strong className="text-slate-700">⋮</strong> أعلى المتصفح واختيار <strong className="text-slate-700">"تثبيت التطبيق"</strong> أو <strong className="text-slate-700">"إضافة إلى الشاشة الرئيسية"</strong>.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Close / Skip Actions */}
              <div className="flex items-center justify-between border-t border-yellow-border/20 pt-4 mt-1">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl active:scale-95 transition-transform cursor-pointer"
                  id="pwa-install-dismiss-btn"
                >
                  🌐 مواصلة التصفح عبر الويب
                </button>
                <div className="text-[10px] text-slate-400 font-bold">🇸🇩 وزارة التربية والتعليم السودانية</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
