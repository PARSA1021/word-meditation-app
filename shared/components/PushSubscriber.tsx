"use client";

import { useState, useEffect } from "react";

export default function PushSubscriber() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

      // 서버에 구독 정보 저장
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      alert('매일 아침 말씀 알림이 설정되었습니다! 🌿');
    } catch (error) {
      console.error('푸시 구독 중 오류 발생:', error);
      alert('알림 설정 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={handleSubscribe}
      disabled={isSubscribed || isLoading}
      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2
        ${isSubscribed 
          ? 'bg-slate-100 text-brand-primary border border-brand-primary/20' 
          : 'bg-[#0099FF] text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/20'}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isSubscribed ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        )}
      </svg>
      {isLoading ? '설정 중...' : isSubscribed ? '알림 설정됨' : '매일 아침 알림 받기'}
    </button>
  );
}
