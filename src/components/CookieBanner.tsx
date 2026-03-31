import { useState, useEffect } from "react";

const CONSENT_KEY = "oms-cookie-consent";

interface ConsentState {
  necessary: true; // always on
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

/** Enable/disable Umami tracking based on consent */
function applyAnalyticsConsent(allowed: boolean) {
  if (typeof window === "undefined") return;
  // Umami respects this flag — when true, it disables tracking
  (window as any).umami = (window as any).umami || {};
  if (!allowed) {
    localStorage.setItem("umami.disabled", "1");
  } else {
    localStorage.removeItem("umami.disabled");
  }
}

/** Enable/disable Mautic tracking based on consent */
function applyMarketingConsent(allowed: boolean) {
  if (typeof window === "undefined") return;
  if (allowed) {
    // Load Mautic tracking script if not already loaded
    if (!document.getElementById("mautic-tracking")) {
      const script = document.createElement("script");
      script.id = "mautic-tracking";
      script.async = true;
      script.src = "https://mautic.intelmedica.ai/mtc.js";
      document.head.appendChild(script);
    }
  } else {
    // Remove Mautic cookies
    document.cookie = "mautic_device_id=; max-age=0; path=/; domain=.openmedica.us";
    document.cookie = "mtc_id=; max-age=0; path=/; domain=.openmedica.us";
    document.cookie = "mtc_sid=; max-age=0; path=/; domain=.openmedica.us";
    // Remove Mautic script if loaded
    const script = document.getElementById("mautic-tracking");
    if (script) script.remove();
  }
}

function applyConsent(consent: ConsentState) {
  applyAnalyticsConsent(consent.analytics);
  applyMarketingConsent(consent.marketing);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [crumbs, setCrumbs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      applyConsent(stored);
      return;
    }
    // No prior consent — show banner after short delay
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (consent: ConsentState) => {
    saveConsent(consent);
    applyConsent(consent);
    setCrumbs(true);
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 500);
    }, 600);
  };

  const acceptAll = () => {
    dismiss({ necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() });
  };

  const acceptSelected = () => {
    dismiss({ necessary: true, analytics, marketing, timestamp: new Date().toISOString() });
  };

  const rejectNonEssential = () => {
    dismiss({ necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] flex justify-center px-4 pb-4 transition-all duration-500 ${
        exiting ? "translate-y-full opacity-0" : "translate-y-0 opacity-100 animate-slide-up"
      }`}
    >
      <div className="relative max-w-xl w-full rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 animate-shimmer" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span
              className={`text-3xl select-none ${crumbs ? "animate-cookie-crumble" : "animate-cookie-wobble"}`}
              role="img"
              aria-label="cookie"
            >
              {crumbs ? "\uD83C\uDF6A\uD83D\uDCA8" : "\uD83C\uDF6A"}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                Your Privacy Matters
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                We use cookieless analytics (Umami + Cloudflare Insights) that don't track you personally.
                Marketing tools (Mautic) require your explicit consent and set cookies.
                You choose what's allowed.
              </p>
            </div>
          </div>

          {/* Consent categories — always visible in summary */}
          <div className="mt-3 space-y-2">
            {/* Necessary — always on */}
            <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-white">Strictly Necessary</p>
                <p className="text-[10px] text-slate-500">Theme, consent memory, Cloudflare security</p>
              </div>
              <span className="text-[10px] font-medium text-emerald-400">Always On</span>
            </div>

            {/* Analytics */}
            <label className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <p className="text-xs font-medium text-white">Analytics</p>
                <p className="text-[10px] text-slate-500">Umami (self-hosted, cookieless) + CF Insights</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
            </label>

            {/* Marketing */}
            <label className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <p className="text-xs font-medium text-white">Marketing</p>
                <p className="text-[10px] text-slate-500">Mautic (self-hosted) — sets tracking cookies</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
            </label>
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div className="mt-3 rounded-lg border border-slate-700/50 bg-slate-950/50 p-3 text-[10px] leading-relaxed text-slate-500">
              <p className="font-medium text-slate-400 mb-2">Detailed Cookie Information</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-1 pr-2 font-medium text-slate-400">Cookie</th>
                    <th className="pb-1 pr-2 font-medium text-slate-400">Purpose</th>
                    <th className="pb-1 pr-2 font-medium text-slate-400">Duration</th>
                    <th className="pb-1 font-medium text-slate-400">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">__cf_bm</td>
                    <td className="py-1 pr-2">Bot management</td>
                    <td className="py-1 pr-2">30 min</td>
                    <td className="py-1">Necessary</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">theme</td>
                    <td className="py-1 pr-2">Dark/light mode</td>
                    <td className="py-1 pr-2">Persistent</td>
                    <td className="py-1">Necessary</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">oms-cookie-consent</td>
                    <td className="py-1 pr-2">Your consent choices</td>
                    <td className="py-1 pr-2">Persistent</td>
                    <td className="py-1">Necessary</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">mautic_device_id</td>
                    <td className="py-1 pr-2">Visitor identification</td>
                    <td className="py-1 pr-2">1 year</td>
                    <td className="py-1 text-amber-400">Marketing</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">mtc_id</td>
                    <td className="py-1 pr-2">Contact tracking</td>
                    <td className="py-1 pr-2">1 year</td>
                    <td className="py-1 text-amber-400">Marketing</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2 font-mono text-cyan-400/70">mtc_sid</td>
                    <td className="py-1 pr-2">Session tracking</td>
                    <td className="py-1 pr-2">Session</td>
                    <td className="py-1 text-amber-400">Marketing</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-slate-600">
                <strong className="text-slate-500">Analytics note:</strong> Umami and Cloudflare Insights are cookieless — they do not set any cookies or collect personally identifiable information.
              </p>
              <p className="mt-1">
                <strong className="text-slate-500">Legal basis:</strong> Necessary cookies: legitimate interest (Art. 6(1)(f) GDPR).
                Analytics: legitimate interest (cookieless, no PII). Marketing: consent (Art. 6(1)(a) GDPR, ePrivacy Directive Art. 5(3)).
              </p>
            </div>
          )}

          {/* Toggle details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            {showDetails ? "Hide details" : "Show cookie details & legal basis"}
          </button>

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              Accept All
            </button>
            <button
              onClick={acceptSelected}
              className="flex-1 rounded-lg border border-cyan-700 px-4 py-2 text-xs font-semibold text-cyan-400 transition-all hover:bg-cyan-950/50 active:scale-95"
            >
              Accept Selected
            </button>
            <button
              onClick={rejectNonEssential}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-white active:scale-95"
            >
              Reject All
            </button>
          </div>

          {/* Compliance links */}
          <div className="mt-2.5 flex items-center justify-center gap-3 text-[10px] text-slate-600">
            <a href="/privacy" className="underline hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <span>&middot;</span>
            <a href="/terms" className="underline hover:text-slate-400 transition-colors">
              Terms of Use
            </a>
            <span>&middot;</span>
            <span>GDPR &middot; CCPA &middot; ePrivacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
