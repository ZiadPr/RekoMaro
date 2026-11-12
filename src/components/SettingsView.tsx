import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import { CURRENCIES } from '../data/currencies';
import { CurrencyCode } from '../types/game';
import {
  Settings,
  Globe,
  Coins,
  Bell,
  Volume2,
  Smartphone,
  ShieldAlert,
  Info,
  CheckCircle2,
  Database,
  Cpu,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences } = useRekoMaro();
  const isAr = preferences.language === 'ar';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-[#FFAB00] text-black flex items-center justify-center">
            <Settings className="w-4 h-4 fill-black" />
          </div>
          <h2 className="font-rockstar text-2xl sm:text-3xl text-white">
            {isAr ? 'إعدادات تطبيق ريكومارو' : 'RekoMaro App Settings'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          {isAr
            ? 'تخصيص العملة، تنبيهات التخفيضات، وتجربة الاستخدام.'
            : 'Configure currency, discount notifications, and preview mode.'}
        </p>
      </div>

      {/* Preferences Cards */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl divide-y divide-[#222] overflow-hidden">
        {/* Currency & Region */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#FFAB00] shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'العملة والمنطقة السعرية' : 'Currency & Region'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAr
                  ? 'عرض الأسعار بالعملة المحلية مع تحويل تلقائي للأسعار الحية'
                  : 'Convert live store prices to your preferred local currency'}
              </p>
            </div>
          </div>

          <select
            value={preferences.currency}
            onChange={(e) => updatePreferences({ currency: e.target.value as CurrencyCode })}
            className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#FFAB00] cursor-pointer min-w-[160px]"
          >
            {Object.keys(CURRENCIES).map((cur) => (
              <option key={cur} value={cur}>
                {cur} ({isAr ? CURRENCIES[cur as CurrencyCode].symbolAr : CURRENCIES[cur as CurrencyCode].symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#FFAB00] shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'لغة الواجهة (Language)' : 'Interface Language'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAr ? 'التبديل بين العربية والإنجليزية مع دعم كامل لاتجاه RTL' : 'Switch between Arabic and English'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#1C1C1C] rounded-xl border border-[#2E2E2E]">
            <button
              onClick={() => updatePreferences({ language: 'ar' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                preferences.language === 'ar' ? 'bg-[#FFAB00] text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => updatePreferences({ language: 'en' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                preferences.language === 'en' ? 'bg-[#FFAB00] text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#FFAB00] shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'تنبيهات التخفيضات اللحظية' : 'Instant Deal Notifications'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAr
                  ? 'إرسال إشعار فوري عند هبوط السعر أو توفر عرض جديد'
                  : 'Receive push alerts whenever a tracked game drops in price'}
              </p>
            </div>
          </div>

          <button
            onClick={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              preferences.notificationsEnabled ? 'bg-[#00E676]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black transition-transform ${
                preferences.notificationsEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Minimum Discount Alert Threshold Slider */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'الحد الأدنى لنسبة الخصم المطلوبة للتنبيه' : 'Minimum Discount Alert Threshold'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAr
                  ? 'لا تزعجني إلا بالتخفيضات الكبيرة التي تتجاوز هذه النسبة'
                  : 'Only notify me if the deal meets or exceeds this percentage'}
              </p>
            </div>

            <span className="font-num text-lg font-bold text-[#FFAB00] bg-[#1C1C1C] px-3 py-1 rounded-xl border border-[#2E2E2E]">
              {preferences.minDiscountAlert}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="70"
            step="5"
            value={preferences.minDiscountAlert}
            onChange={(e) => updatePreferences({ minDiscountAlert: parseInt(e.target.value, 10) })}
            className="w-full accent-[#FFAB00] bg-[#1C1C1C] rounded-lg h-2 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-500 font-num">
            <span>10% ({isAr ? 'أي تخفيض بسيط' : 'Any drop'})</span>
            <span>20% ({isAr ? 'افتراضي' : 'Default'})</span>
            <span>50% ({isAr ? 'نصف السعر' : 'Half price'})</span>
            <span>70% ({isAr ? 'تخفيضات تاريخية' : 'Historic'})</span>
          </div>
        </div>

        {/* Watchlist Only Alert filter */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'تنبيهي فقط للألعاب الموجودة في المفضلة' : 'Only Alert for Watchlist Games'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAr
                ? 'تجاهل الألعاب غير المضافة للمفضلة وتقليل الإشعارات غير الضرورية'
                : 'Restrict deal notifications strictly to games in your watchlist'}
            </p>
          </div>

          <button
            onClick={() => updatePreferences({ onlyWatchlistAlerts: !preferences.onlyWatchlistAlerts })}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              preferences.onlyWatchlistAlerts ? 'bg-[#FFAB00]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black transition-transform ${
                preferences.onlyWatchlistAlerts ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Automated Background Client Sync */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#00E676] shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-thmanyah">
                {isAr ? 'الجلب التلقائي المؤتمت من جانب العميل (Auto-Sync)' : 'Automated Client-Side Sync'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-thmanyah">
                {isAr
                  ? 'مزامنة حية مستمرة في الخلفية تفحص أسعار الألعاب تلقائياً وتطلق التنبيهات'
                  : 'Automated background polling that continuously verifies live prices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={preferences.autoSyncIntervalMinutes || 1}
              onChange={(e) => updatePreferences({ autoSyncIntervalMinutes: parseInt(e.target.value, 10) })}
              className="bg-[#1C1C1C] text-xs font-bold text-white border border-[#2A2A2A] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FFAB00]"
            >
              <option value={1}>{isAr ? 'كل دقيقة (فوري)' : 'Every 1 min'}</option>
              <option value={2}>{isAr ? 'كل دقيقتين' : 'Every 2 mins'}</option>
              <option value={5}>{isAr ? 'كل 5 دقائق' : 'Every 5 mins'}</option>
            </select>
          </div>
        </div>

        {/* Audio Tactile Clicks */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#FFAB00] shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-thmanyah">
                {isAr ? 'المؤثرات الصوتية واللمسية (Haptic & Audio)' : 'Sound Effects'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-thmanyah">
                {isAr ? 'أصوات تفاعلية مريحة عند النقر والتنقل في التطبيق' : 'Tactile Web Audio feedback on interactions'}
              </p>
            </div>
          </div>

          <button
            onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              preferences.soundEnabled ? 'bg-[#00E676]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black transition-transform ${
                preferences.soundEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Android Device Simulator Mode */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#FFAB00] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-thmanyah">
                {isAr ? 'محاكي هاتف أندرويد (Material 3 Frame)' : 'Android Smartphone Frame View'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-thmanyah">
                {isAr
                  ? 'عرض التطبيق داخل إطار هاتف أندرويد مع شريط الحالة والتحكم اللمسي المخصص'
                  : 'Simulate the native Android Kotlin/Material 3 device frame on desktop'}
              </p>
            </div>
          </div>

          <button
            onClick={() => updatePreferences({ deviceFrameMode: !preferences.deviceFrameMode })}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              preferences.deviceFrameMode ? 'bg-[#FFAB00]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black transition-transform ${
                preferences.deviceFrameMode ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Technical Architecture & Data Sources Section */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#FFAB00]" />
          <h3 className="font-bold text-white text-base font-thmanyah">
            {isAr ? 'المعمارية التقنية وتغطية جميع الناشرين' : 'Technical Architecture & All Publishers'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300 font-thmanyah">
          <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-[#262626]">
            <span className="font-bold text-[#FFAB00] block mb-1">
              {isAr ? '🌐 تغطية كل الناشرين العالميين' : '🌐 All Major Publishers'}
            </span>
            <p className="text-gray-400 leading-relaxed">
              {isAr
                ? 'تغطية شاملة لألعاب PlayStation Studios و Xbox Game Studios و CD PROJEKT RED و Rockstar Games و Electronic Arts و Capcom و Bandai Namco و Ubisoft مع إمكانية البحث المباشر عن أي لعبة.'
                : 'Comprehensive coverage across Sony, Microsoft, CDPR, Rockstar, EA, Capcom, FromSoftware, and Ubisoft.'}
            </p>
          </div>

          <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-[#262626]">
            <span className="font-bold text-[#00E676] block mb-1">
              {isAr ? '⚡ أتمتة كاملة وجلب من جانب العميل' : '⚡ 100% Automated Client Fetching'}
            </span>
            <p className="text-gray-400 leading-relaxed">
              {isAr
                ? 'جلب وتحديث تلقائي للأسعار، وبحث حي عبر واجهات المتاجر المعتمدة، مع حفظ محلي في المتصفح وتنبيهات فورية.'
                : 'Automated background price comparisons, instant search, and real-time push alerts.'}
            </p>
          </div>
        </div>

        {/* Trademark & Disclaimer */}
        <div className="bg-[#161616] p-4 rounded-2xl border border-white/5 text-[11px] text-gray-400 leading-relaxed space-y-2 font-thmanyah">
          <div className="flex items-center gap-1.5 text-gray-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-[#FFAB00]" />
            <span>{isAr ? 'إخلاء مسؤولية العلامات التجارية وحقوق الملكية' : 'Trademark Notice & Disclaimer'}</span>
          </div>
          <p>
            {isAr
              ? 'RekoMaro (ريكومارو) منصة وتطبيق مستقل لمتابعة ومقارنة أسعار ألعاب الفيديو. جميع الشعارات وعلامات الألعاب التجارية هي ملك لأصحابها الشرعيين وتُستخدم هنا لأغراض التعريف والتوضيح فقط.'
              : 'RekoMaro is an independent games price tracking utility. All company names, game titles, and logos belong to their respective owners.'}
          </p>
        </div>
      </div>
    </div>
  );
};
