"use client"

import { useState, useEffect } from "react"

export default function NotificationSetup() {
    const [permission, setPermission] = useState<NotificationPermission>("default")
    const [isRequested, setIsRequested] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission)
            // Check if we previously saved that they did click the button
            const stored = localStorage.getItem("truepath-notification-setup")
            if (stored === "true") {
                setIsRequested(true)
            }
        }
    }, [])

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            alert("현재 브라우저는 알림 기능을 지원하지 않습니다.")
            return
        }

        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            setIsRequested(true)
            localStorage.setItem("truepath-notification-setup", "true")

            if (result === "granted") {
                new Notification("TruePath 알림 설정 완료!", {
                    body: "매일 당신을 위한 오늘의 말씀과 즐거운 묵상을 안내해 드릴게요.",
                    icon: "/favicon.ico"
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    // If already granted/denied or user closed it, don't show the setup card
    if (permission === "granted" || permission === "denied" || isRequested) {
        return null
    }

    return (
        <div className="airbnb-card bg-[#f0f7ff] border border-blue-100 p-6 space-y-4 shadow-[0_4px_20px_rgba(0,153,255,0.1)] mb-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#0099ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <div>
                    <h3 className="text-[17px] font-bold text-slate-800">알림을 받아보세요</h3>
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed mt-1">
                        "오늘의 말씀" 업데이트 및 마음의 평화를 위한 알림을 받아보시겠어요?
                    </p>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => setIsRequested(true)}
                    className="flex-1 py-3 px-4 rounded-xl text-[14px] font-bold text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    나중에 하기
                </button>
                <button
                    onClick={requestPermission}
                    className="flex-1 py-3 px-4 rounded-xl text-[14px] font-bold text-white bg-[#0099ff] hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-colors"
                >
                    알림 켜기
                </button>
            </div>
        </div>
    )
}
