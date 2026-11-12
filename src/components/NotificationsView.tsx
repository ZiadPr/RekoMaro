import React from 'react';
import { useRekoMaro } from '../context/RekoMaroContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  TrendingDown,
  Sparkles,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    simulateWorkManagerCheck,
    loading,
    games,
    setSelectedGame,
    formatPrice,
    preferences,
  } = useRekoMaro();

  const isAr = preferences.language === 'ar';

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    const targetGame = games.find((g) => g.id === notif.gameId);
    if (targetGame) {
      setSelectedGame(targetGame);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF3B30] text-white flex items-center justify-center">
              <Bell className="w-4 h-4 fill-white" />
            </div>
            <h2 className="font-rockstar text-2xl sm:text-3xl text-white">
              {isAr ? 'سجل تنبيهات التخفيضات والإشعارات' : 'Notification History & Price Alerts'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl font-thmanyah">
            {isAr
              ? 'تسجيل فوري مؤتمت لكل هبوط في أسعار الألعاب العالمية لجميع الناشرين. الضغط على أي إشعار يفتح تفاصيل اللعبة مباشرة.'
              : 'Automated live record of game price drops across all publishers. Tapping any alert deep-links directly to the game comparison.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => simulateWorkManagerCheck()}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-[#FFAB00] hover:bg-[#FFB81C] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'فحص دوري الآن (WorkManager)' : 'Simulate WorkManager'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="h-10 px-3.5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-gray-200 border border-[#2E2E2E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="h-10 px-3 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-gray-400 hover:text-[#FF3B30] border border-[#2E2E2E] text-xs font-semibold flex items-center gap-1 transition-colors"
              title={isAr ? 'مسح السجل' : 'Clear all'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Android Notification Channel Badge info */}
      <div className="bg-[#121212] border border-[#222] rounded-2xl p-3.5 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span>
            {isAr
              ? 'قناة الإشعارات النشطة: "تنبيهات التخفيضات" (أولوية عالية - High Priority)'
              : 'Active Notification Channel: "Discount Alerts" (High Priority Channel)'}
          </span>
        </div>
        <span className="font-num text-[#FFAB00]">
          {unreadCount} {isAr ? 'غير مقروء' : 'unread'}
        </span>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#1C1C1C] flex items-center justify-center text-gray-500 mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-lg mb-1">
            {isAr ? 'لا توجد إشعارات سابقة' : 'No Notifications Yet'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isAr
              ? 'ستظهر هنا كافة الإشعارات عند اكتشاف تخفيض جديد على أي لعبة من ألعاب روكستار.'
              : 'Alerts will automatically appear here when discounts match your criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isHistoric = notif.type === 'historic_low';
            const isUpcoming = notif.type === 'upcoming_update';

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !notif.read
                    ? 'bg-[#1A1A1A] border-[#FFAB00]/40 shadow-lg shadow-black/40'
                    : 'bg-[#141414] border-[#222] opacity-80 hover:opacity-100 hover:border-[#333]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isHistoric
                        ? 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30'
                        : isUpcoming
                        ? 'bg-[#FFAB00]/20 text-[#FFAB00] border border-[#FFAB00]/30'
                        : 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30'
                    }`}
                  >
                    {isHistoric ? (
                      <Sparkles className="w-5 h-5" />
                    ) : isUpcoming ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">
                        {isAr ? notif.gameTitleAr : notif.gameTitle}
                      </span>
                      {notif.discountPercent && notif.discountPercent > 0 ? (
                        <span className="bg-[#00E676] text-black font-num font-black text-[11px] px-1.5 py-0.2 rounded">
                          -{notif.discountPercent}%
                        </span>
                      ) : null}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#FFAB00]" />
                      )}
                    </div>

                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {isAr ? notif.messageAr : notif.message}
                    </p>

                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                      <span>{notif.storeName}</span>
                      <span>·</span>
                      <span className="font-num">
                        {new Date(notif.timestamp).toLocaleDateString()}{' '}
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right button */}
                <div className="flex items-center justify-end gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs text-[#FFAB00] font-semibold flex items-center gap-1 hover:underline">
                    <span>{isAr ? 'فتح اللعبة' : 'View'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
