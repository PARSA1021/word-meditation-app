"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Copy, Check, Sparkles, ShieldCheck, ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    bankName: "KB국민은행",
    accountNumber: "020602-04-230715",
    accountHolder: "문성민",
  },
];

const PRESET_AMOUNTS = [5000, 10000, 30000, 50000, 100000];

export default function DonateClient() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyAccount = (accountNumber: string, bankName: string) => {
    navigator.clipboard.writeText(accountNumber.replace(/-/g, ""));
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setSelectedAmount(null);
  };

  const currentAmount = selectedAmount
    ? selectedAmount.toLocaleString()
    : customAmount
    ? parseInt(customAmount).toLocaleString()
    : "0";

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/donation/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName,
          message,
          amount: currentAmount !== "0" ? currentAmount + "원" : "미정"
        })
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg/40 py-8 px-4 sm:px-6 md:px-8 selection:bg-brand-primary/10">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/70 text-slate-700 hover:text-brand-primary hover:border-brand-primary/40 transition-all active:scale-95 text-xs sm:text-sm font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-brand-primary" />
            <span>← 말씀 묵상으로 돌아가기</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>자발적 후원 안내</span>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/70 shadow-sm relative overflow-hidden"
        >
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-100 shadow-inner">
            <Gift className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-deep tracking-tight">
            말씀 묵상 사역 후원
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto break-keep font-medium">
            TruePath는 광고 없이 깨끗한 말씀 묵상 환경을 제공합니다.<br className="hidden sm:block" />
            여러분의 소중한 후원은 말씀 데이터 지속 유지와 서비스 개선에 사용됩니다.
          </p>
        </motion.div>

        {/* Bank Transfer Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-primary" />
              <h2 className="text-sm sm:text-base font-bold text-brand-deep tracking-tight">
                후원 계좌 안내
              </h2>
            </div>
            <span className="text-[11px] font-bold text-slate-500">예금주: 문성민</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {BANK_ACCOUNTS.map((account) => {
              const isCopied = copiedBank === account.bankName;
              return (
                <div
                  key={account.bankName}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-brand-primary/40 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[11px] font-bold">
                        {account.bankName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">예금주: {account.accountHolder}</span>
                    </div>
                    <p className="text-base sm:text-lg font-black text-brand-deep font-mono tracking-wide">
                      {account.accountNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-0 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar shrink-0">
                    <button
                      onClick={() => {
                        handleCopyAccount(account.accountNumber, account.bankName);
                        setTimeout(() => { window.location.href = "supertoss://"; }, 300);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0050FF] hover:bg-[#0040DD] text-white text-[11px] sm:text-xs font-bold rounded-xl transition-colors shrink-0 active:scale-95 shadow-sm"
                    >
                      토스 열기
                    </button>
                    <button
                      onClick={() => {
                        handleCopyAccount(account.accountNumber, account.bankName);
                        setTimeout(() => { window.location.href = "kakaotalk://"; }, 300);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] text-[11px] sm:text-xs font-bold rounded-xl transition-colors shrink-0 active:scale-95 shadow-sm"
                    >
                      카카오페이
                    </button>
                    <button
                      onClick={() => handleCopyAccount(account.accountNumber, account.bankName)}
                      className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all active:scale-95 shrink-0 ${
                        isCopied
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-brand-primary hover:text-brand-primary shadow-xs"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">복사 완료!</span>
                          <span className="sm:hidden">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">계좌 복사</span>
                          <span className="sm:hidden">계좌 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Preset Amount Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="text-sm sm:text-base font-bold text-brand-deep tracking-tight">
                후원 금액 선택
              </h2>
            </div>
            {currentAmount !== "0" && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                {currentAmount} 원
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <button
                  key={amt}
                  onClick={() => handlePresetClick(amt)}
                  className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center ${
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm scale-[1.02]"
                      : "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {amt >= 10000 ? `${amt / 10000}만원` : `${amt.toLocaleString()}원`}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="직접 금액 입력 (원)..."
              className="w-full bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-brand-deep outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:font-normal"
            />
            {customAmount && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                원
              </span>
            )}
          </div>
        </motion.div>

        {/* Message & Gratitude Note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm sm:text-base font-bold text-brand-deep tracking-tight">
              응원 메시지 남기기
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-3 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl px-4"
              >
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">
                  {donorName}님, 따뜻한 마음 감사드립니다!
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto leading-relaxed">
                  보내주신 응원 메시지가 사역팀에 전달되었습니다. 더욱 은혜로운 말씀 플랫폼으로 보답하겠습니다.
                </p>
                <button
                  onClick={() => { setIsSubmitted(false); setMessage(""); }}
                  className="mt-2 text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
                >
                  다시 작성하기
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    후원자 성함 / 닉네임 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-brand-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    응원 및 한마디 (선택)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="말씀 묵상 앱을 통해 큰 은혜 받고 있습니다. 감사합니다!"
                    className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-brand-primary transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-brand-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-brand-deep transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{isSubmitting ? "전송 중..." : "응원 메시지 전송하기"}</span>
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security & Trust Footer Note */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium py-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>TruePath는 투명하고 깨끗한 말씀 후원 문화에 앞장섭니다.</span>
        </div>

      </div>
    </div>
  );
}
