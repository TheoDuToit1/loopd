import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('looopd-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    Cookies.set('looopd-cookie-consent', 'true', { expires: 365 });
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="bg-[#0C0C1E] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-2xl flex items-center justify-center shrink-0">
                <Cookie className="text-[#4F46E5]" size={24} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Cookie Notice</h3>
                  <button onClick={() => setShow(false)} className="text-[var(--dark-grey)] hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-[var(--dark-grey)] leading-relaxed">
                  We use cookies to enhance your experience, remember your theme preferences, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={accept}
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <CheckCircle2 size={18} />
                    Accept All Cookies
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
