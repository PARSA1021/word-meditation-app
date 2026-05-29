"use client";

import { useState, useEffect } from "react";

type TestState = "idle" | "sending" | "success" | "error";

export default function PushSubscriber() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredTime, setPreferredTime] = useState("07:00");
  const [showPanel, setShowPanel] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
            const savedTime = localStorage.getItem("pushPreferredTime");
            if (savedTime) setPreferredTime(savedTime);
          }
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
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
      if (permission !== "granted") {
        alert(
          "알림 권한이 거부되어 있습니다. 브라우저 주소창 좌측의 자물쇠(또는 설정) 아이콘을 눌러 알림 권한을 [허용]으로 변경해 주세요."
        );
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

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, preferredTime }),
      });

      localStorage.setItem("pushPreferredTime", preferredTime);
      setIsSubscribed(true);
      setShowPanel(false);

      const timeLabel =
        TIME_OPTIONS.find((t) => t.value === preferredTime)?.label ??
        preferredTime;
      alert(`✅ 매일 ${timeLabel}에 말씀 알림이 설정되었습니다!`);
    } catch (error) {
      console.error("푸시 구독 중 오류 발생:", error);
      alert("알림 설정 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      localStorage.removeItem("pushPreferredTime");
      setIsSubscribed(false);
      setShowPanel(false);
      alert("알림이 해제되었습니다.");
    } catch (error) {
      console.error("구독 해제 중 오류 발생:", error);
      alert("알림 해제 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTime = async () => {
    if (!isSubscribed) {
      await handleSubscribe();
      return;
    }
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        await handleSubscribe();
        return;
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, preferredTime }),
      });

      localStorage.setItem("pushPreferredTime", preferredTime);
      setShowPanel(false);

      const timeLabel =
        TIME_OPTIONS.find((t) => t.value === preferredTime)?.label ??
        preferredTime;
      alert(`✅ 알림 시간이 ${timeLabel}으로 변경되었습니다!`);
    } catch (error) {
      console.error("시간 변경 중 오류 발생:", error);
      alert("시간 변경 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 테스트 알림 전송 — 서버 경유 실제 푸시
  const handleTestNotification = async () => {
    setTestState("sending");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.error("테스트 알림: 구독 정보 없음 (재구독 필요)");
        setTestState("error");
        setTimeout(() => setTestState("idle"), 2500);
        return;
      }

      // endpoint만이 아닌 subscription 전체를 전송 — 서버가 DB 조회 없이 바로 사용
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setTestState("success");
    } catch (error) {
      console.error("테스트 알림 오류:", error instanceof Error ? error.message : error);
      setTestState("error");
    } finally {
      setTimeout(() => setTestState("idle"), 3000);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="relative">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setShowPanel((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
          ${
            isSubscribed
              ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
              : "bg-[#0099FF] text-white hover:bg-blue-600 shadow-md shadow-blue-500/20"
          }`}
        aria-label="알림 설정"
        title={isSubscribed ? "알림 설정 중" : "알림 받기"}
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="whitespace-nowrap hidden sm:inline">
          {isSubscribed ? "알림 설정 중" : "알림 받기"}
        </span>
        {isSubscribed && (
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        )}
      </button>

      {/* 드롭다운 패널 */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* 헤더 영역 */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {isSubscribed ? "알림 설정" : "알림 받기"}
                </span>
                {isSubscribed ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                    활성화됨
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">비활성</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                매일 원하는 시간에 말씀 알림을 받아보세요.
              </p>
            </div>

            <div className="px-4 py-3 flex flex-col gap-3">
              {/* 시간 선택 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  알림 시간
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  disabled={isLoading}
                  aria-label="알림 시간 선택"
                  title="알림 시간 선택"
                  className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-[#0099FF] focus:ring-2 focus:ring-[#0099FF]/20 transition-all disabled:opacity-50"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleUpdateTime}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-[#0099FF] text-white hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    저장 중...
                  </>
                ) : isSubscribed ? (
                  "시간 변경 저장"
                ) : (
                  "알림 설정하기"
                )}
              </button>

              {/* 테스트 알림 버튼 — 구독 중일 때만 노출 */}
              {isSubscribed && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-slate-500">
                      테스트 알림
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    실제로 어떻게 오는지 지금 바로 확인해보세요.
                    알림이 기기에 즉시 전송됩니다.
                  </p>
                  <button
                    onClick={handleTestNotification}
                    disabled={testState === "sending" || isLoading}
                    className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed
                      ${
                        testState === "success"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : testState === "error"
                          ? "bg-red-50 text-red-500 border border-red-100"
                          : testState === "sending"
                          ? "bg-slate-200 text-slate-400"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-[#0099FF] hover:text-[#0099FF] hover:bg-blue-50"
                      }`}
                  >
                    {testState === "sending" && (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {testState === "success" && (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {testState === "error" && (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    {testState === "idle" && "🔔 테스트 알림 보내기"}
                    {testState === "sending" && "전송 중..."}
                    {testState === "success" && "알림을 보냈어요!"}
                    {testState === "error" && "전송 실패 — 다시 시도"}
                  </button>
                </div>
              )}

              {/* 알림 해제 */}
              {isSubscribed && (
                <button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  알림 해제하기
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const TIME_OPTIONS = [
  { value: "06:00", label: "오전 6시" },
  { value: "07:00", label: "오전 7시" },
  { value: "08:00", label: "오전 8시" },
  { value: "09:00", label: "오전 9시" },
  { value: "12:00", label: "오후 12시" },
  { value: "18:00", label: "오후 6시" },
  { value: "21:00", label: "오후 9시" },
  { value: "22:00", label: "오후 10시" },
];