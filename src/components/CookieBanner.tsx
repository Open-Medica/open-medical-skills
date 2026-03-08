import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [crumbs, setCrumbs] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("oms-cookie-ok");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = (accepted: boolean) => {
    setCrumbs(true);
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        localStorage.setItem("oms-cookie-ok", accepted ? "yes" : "no-thanks");
        setVisible(false);
      }, 500);
    }, 600);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] flex justify-center px-4 pb-4 transition-all duration-500 ${
        exiting
          ? "translate-y-full opacity-0"
          : "translate-y-0 opacity-100 animate-slide-up"
      }`}
    >
      <div className="relative max-w-lg w-full rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 animate-shimmer" />

        <div className="p-5">
          {/* Cookie icon with wobble */}
          <div className="flex items-start gap-3">
            <span
              className={`text-3xl select-none ${crumbs ? "animate-cookie-crumble" : "animate-cookie-wobble"}`}
              role="img"
              aria-label="cookie"
            >
              {crumbs ? "🍪💨" : "🍪"}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                About those "cookies"...
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Plot twist: we barely use any. Your{" "}
                <span className="text-cyan-400 font-mono text-[11px]">
                  theme preference
                </span>{" "}
                lives in localStorage (never leaves your device). No tracking pixels. No
                ad networks. No selling your data to shadowy third parties in trench
                coats. We're physicians, not advertisers.
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500 italic">
                Cloudflare may set essential security cookies. That's it. That's the whole list.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => dismiss(true)}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              Sounds Reasonable
            </button>
            <button
              onClick={() => dismiss(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-white active:scale-95"
            >
              I'll Pass
            </button>
          </div>

          {/* Fine print */}
          <p className="mt-2.5 text-center text-[10px] text-slate-600">
            See our{" "}
            <a href="/privacy" className="underline hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>{" "}
            for the full (short) story
          </p>
        </div>
      </div>
    </div>
  );
}
