"use client";

import { useState, useEffect } from "react";

export default function PushSubscriber() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredTime, setPreferredTime] = useState("07:00");

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // 현재 구독 상태 확인
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('알림 권한이 거부되어 있습니다. 브라우저 주소창 좌측의 자물쇠(또는 설정) 아이콘을 눌러 알림 권한을 [허용]으로 변경해 주세요.');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const applicationServerKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
      );

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 서버에 구독 정보 및 시간 저장
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, preferredTime }),
      });

      setIsSubscribed(true);
      alert(`${preferredTime}에 매일 말씀 알림이 설정되었습니다! 🌿`);
    } catch (error) {
      console.error('푸시 구독 중 오류 발생:', error);
      alert('알림 설정 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full max-w-sm mx-auto sm:w-auto sm:max-w-none">
      <select
        value={preferredTime}
        onChange={(e) => setPreferredTime(e.target.value)}
        disabled={isLoading}
        className="px-3 py-2 xs:px-2 xs:py-1.5 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-brand-primary text-center xs:text-left shadow-sm transition-all"
      >
        <option value="06:00">오전 6시</option>
        <option value="07:00">오전 7시</option>
        <option value="08:00">오전 8시</option>
        <option value="09:00">오전 9시</option>
        <option value="22:00">오후 10시</option>
      </select>

      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 w-full xs:w-auto
          ${isSubscribed 
            ? 'bg-slate-100 text-brand-primary border border-brand-primary/20 hover:bg-slate-200 shadow-sm' 
            : 'bg-[#0099FF] text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/20'}`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSubscribed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          )}
        </svg>
        <span className="whitespace-nowrap">{isLoading ? '저장 중...' : isSubscribed ? '시간 변경/저장' : '알림 받기'}</span>
      </button>
    </div>
  );
}
