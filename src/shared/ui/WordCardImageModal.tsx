"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Word } from "@/shared/types/word";
import { Download, Share2, ArrowLeft, Check, Sparkles, X, Smartphone, Image as ImageIcon } from "lucide-react";

interface WordCardImageModalProps {
  word: Word;
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeConfig {
  id: string;
  name: string;
  badge: string;
  bgGradient: [string, string, string];
  textColor: string;
  accentColor: string;
  borderColor: string;
  subTextColor: string;
  swatchBg: string;
}

type AspectRatioMode = "1:1" | "4:5" | "16:9";

const CARD_STUDIO_THEMES: ThemeConfig[] = [
  {
    id: "truelove",
    name: "참사랑과 평화",
    badge: "세계평화통일가정연합",
    bgGradient: ["#0284c7", "#0369a1", "#075985"],
    textColor: "#ffffff",
    accentColor: "#fde047",
    borderColor: "#eab308",
    subTextColor: "#e0f2fe",
    swatchBg: "linear-gradient(135deg, #0284c7, #fde047)",
  },
  {
    id: "cheonilguk",
    name: "천일국 로얄 골드",
    badge: "天一國 聖言",
    bgGradient: ["#0f172a", "#1e1b4b", "#311042"],
    textColor: "#fef08a",
    accentColor: "#f59e0b",
    borderColor: "#d97706",
    subTextColor: "#cbd5e1",
    swatchBg: "linear-gradient(135deg, #0f172a, #f59e0b)",
  },
  {
    id: "holywhite",
    name: "순백의 은혜",
    badge: "참부모님 말씀",
    bgGradient: ["#ffffff", "#f8fafc", "#f1f5f9"],
    textColor: "#1e293b",
    accentColor: "#d97706",
    borderColor: "#f59e0b",
    subTextColor: "#64748b",
    swatchBg: "linear-gradient(135deg, #ffffff, #d97706)",
  },
  {
    id: "peacegarden",
    name: "천주 평화 동산",
    badge: "원리 묵상",
    bgGradient: ["#064e3b", "#047857", "#065f46"],
    textColor: "#ecfdf5",
    accentColor: "#6ee7b7",
    borderColor: "#34d399",
    subTextColor: "#a7f3d0",
    swatchBg: "linear-gradient(135deg, #064e3b, #6ee7b7)",
  },
  {
    id: "hanji",
    name: "전통 한지 훈독",
    badge: "참부모님 성언",
    bgGradient: ["#fef3c7", "#fde68a", "#fef08a"],
    textColor: "#451a03",
    accentColor: "#991b1b",
    borderColor: "#b45309",
    subTextColor: "#78350f",
    swatchBg: "linear-gradient(135deg, #fef3c7, #991b1b)",
  },
  {
    id: "charcoal",
    name: "클래식 먹선 블랙",
    badge: "말씀 묵상",
    bgGradient: ["#09090b", "#18181b", "#27272a"],
    textColor: "#fafafa",
    accentColor: "#38bdf8",
    borderColor: "#52525b",
    subTextColor: "#a1a1aa",
    swatchBg: "linear-gradient(135deg, #09090b, #38bdf8)",
  },
];

export default function WordCardImageModal({ word, isOpen, onClose }: WordCardImageModalProps) {
  const [themeIndex, setThemeIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("1:1");
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [isPressHoldModalOpen, setIsPressHoldModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedTheme = CARD_STUDIO_THEMES[themeIndex];

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          if (isPressHoldModalOpen) {
            setIsPressHoldModalOpen(false);
          } else {
            onClose();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isPressHoldModalOpen, onClose]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // High-DPI Responsive Canvas Studio Renderer
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 1600;
    let height = 1600;

    if (aspectRatio === "4:5") {
      width = 1440;
      height = 1800;
    } else if (aspectRatio === "16:9") {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, selectedTheme.bgGradient[0]);
    grad.addColorStop(0.5, selectedTheme.bgGradient[1]);
    grad.addColorStop(1, selectedTheme.bgGradient[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer & Inner Frame Borders
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.45;
    const padding = Math.min(width, height) * 0.04;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
    ctx.strokeRect(padding + 14, padding + 14, width - (padding + 14) * 2, height - (padding + 14) * 2);
    ctx.globalAlpha = 1.0;

    // Corner Ornaments
    const drawCorner = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fill();
    };
    drawCorner(padding + 7, padding + 7);
    drawCorner(width - (padding + 7), padding + 7);
    drawCorner(padding + 7, height - (padding + 7));
    drawCorner(width - (padding + 7), height - (padding + 7));

    // 3. Header Emblem Badge
    const headerY = height * 0.14;
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.textAlign = "center";
    ctx.fillText(`❖ ${selectedTheme.badge} ❖`, width / 2, headerY);

    // 4. Auto-Fit Text Wrapping Algorithm
    const fullText = word.text.trim();
    const maxWidth = width - padding * 4 - 80;
    const maxTextHeight = height * 0.52;

    const getWrappedLines = (text: string, currentFontSize: number): string[] => {
      ctx.font = `500 ${currentFontSize}px sans-serif`;
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + " ";
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    };

    let fontSize = aspectRatio === "16:9" ? 44 : 52;
    if (fullText.length > 350) fontSize = 30;
    else if (fullText.length > 250) fontSize = 34;
    else if (fullText.length > 150) fontSize = 40;
    else if (fullText.length > 80) fontSize = 46;

    let lines = getWrappedLines(fullText, fontSize);
    let lineHeight = fontSize * 1.65;

    while (lines.length * lineHeight > maxTextHeight && fontSize > 20) {
      fontSize -= 2;
      lineHeight = fontSize * 1.65;
      lines = getWrappedLines(fullText, fontSize);
    }

    const textStartY = headerY + 70 + (maxTextHeight - lines.length * lineHeight) / 2;
    ctx.font = `500 ${fontSize}px sans-serif`;
    ctx.fillStyle = selectedTheme.textColor;
    ctx.textAlign = "center";

    let currentY = textStartY;
    for (const l of lines) {
      ctx.fillText(l, width / 2, currentY);
      currentY += lineHeight;
    }

    // 5. Speaker / Source Attribution
    let attrY = Math.max(currentY + 30, height * 0.78);
    if (attrY > height * 0.86) attrY = height * 0.86;

    if (word.speaker) {
      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fillText(`— ${word.speaker} —`, width / 2, attrY);
      attrY += 48;
    }

    if (word.source) {
      ctx.font = "normal 26px sans-serif";
      ctx.fillStyle = selectedTheme.subTextColor;
      ctx.fillText(word.source, width / 2, attrY);
    }

    // 6. Footer Watermark
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = selectedTheme.subTextColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText("세계평화통일가정연합 말씀 묵상", width / 2, height - (padding + 30));
    ctx.globalAlpha = 1.0;

    try {
      setPreviewDataUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Canvas export error", err);
    }
  }, [word, selectedTheme, aspectRatio]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => renderCanvas(), 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedTheme, aspectRatio, renderCanvas]);

  // Robust Blob Download (Mobile, Tablet, Desktop PC compatible)
  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);

    canvas.toBlob(
      (blob) => {
        setIsDownloading(false);
        if (!blob) {
          showToast("이미지 생성에 실패했습니다.");
          return;
        }

        try {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `TruePath_Word_${word.id || Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
          showToast("🖼️ 말씀 카드가 갤러리에 저장되었습니다!");
        } catch (err) {
          console.error("Download link error", err);
          setIsPressHoldModalOpen(true);
        }
      },
      "image/png",
      1.0
    );
  };

  // Web Share API (Mobile & Tablet native share sheet)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `TruePath_Word_${word.id || "card"}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: "TruePath 말씀 묵상",
            text: word.text.slice(0, 60),
            files: [file],
          });
          showToast("공유가 완료되었습니다.");
        } catch (err) {
          console.log("Share skipped", err);
        }
      } else {
        handleDownload();
      }
    }, "image/png");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            style={{ zIndex: 99998 }}
          />

          {/* Main Floating Word Card Studio Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 -translate-x-1/2 top-4 bottom-4 sm:top-12 sm:bottom-12 w-[95vw] max-w-[660px] md:max-w-[760px] lg:max-w-[820px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col p-3 sm:p-5 lg:p-6 space-y-2 sm:space-y-3.5 border border-slate-200"
            style={{ zIndex: 99999 }}
          >
            {/* Header: Prominent "말씀으로 돌아가기" Button + Action controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 sm:pb-3 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-xs sm:text-sm font-black active:scale-95 transition-all shadow-sm group"
                aria-label="말씀으로 돌아가기"
              >
                <ArrowLeft className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-1" />
                <span>← 말씀 묵상으로 돌아가기</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/60 text-amber-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>말씀 카드 스튜디오</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="flex items-center justify-between gap-2 shrink-0 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-500 pl-2 hidden sm:inline">
                카드 비율:
              </span>
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
                {(["1:1", "4:5", "16:9"] as AspectRatioMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAspectRatio(mode)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      aspectRatio === mode
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {mode === "1:1" ? "1:1 정사각형" : mode === "4:5" ? "4:5 스토리/휴대폰" : "16:9 가로형"}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden Offscreen Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live High-Resolution Card Display Studio */}
            <div className="flex-1 relative overflow-hidden min-h-0 bg-slate-950/95 rounded-2xl p-2.5 sm:p-4 flex items-center justify-center border border-slate-800 shadow-inner group">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="말씀 카드 미리보기"
                  className="w-full h-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-300 cursor-pointer touch-auto"
                  onClick={() => setIsPressHoldModalOpen(true)}
                  title="클릭/터치하여 사진 저장 도움말 보기"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-bold gap-2">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span>카드 생성 중...</span>
                </div>
              )}

              {/* Quick Mobile Tip Overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] sm:text-xs font-bold text-amber-300 pointer-events-none border border-slate-700/60 shadow-lg">
                💡 모바일/태블릿: 이미지를 꾹 누르면 사진 앱에 직접 저장됩니다
              </div>
            </div>

            {/* Color Swatch Toolbar */}
            <div className="space-y-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                원하는 테마 분위기를 선택하세요
              </span>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1 overflow-x-auto no-scrollbar">
                {CARD_STUDIO_THEMES.map((t, idx) => {
                  const isSelected = idx === themeIndex;
                  return (
                    <button
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemeIndex(idx);
                      }}
                      className={`relative px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 border shadow-xs ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 ring-2 ring-brand-primary/50 scale-105"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ background: t.swatchBg }} />
                      <span>{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar: Save & Share */}
            <div className="grid grid-cols-3 gap-2 pt-1 shrink-0">
              <button
                onClick={() => handleDownload()}
                disabled={isDownloading}
                className="py-3 px-3 sm:px-4 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-brand-primary transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{isDownloading ? "저장 중..." : "🖼️ 갤러리 저장"}</span>
              </button>

              <button
                onClick={() => setIsPressHoldModalOpen(true)}
                className="py-3 px-3 sm:px-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="truncate">📱 꾹 눌러 저장</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 sm:px-4 rounded-2xl bg-brand-primary text-white text-xs sm:text-sm font-bold hover:bg-brand-deep transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Share2 className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">💬 카톡/SNS 공유</span>
              </button>
            </div>
          </motion.div>

          {/* Press & Hold Mobile / Tablet Saving Dedicated Modal */}
          <AnimatePresence>
            {isPressHoldModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPressHoldModalOpen(false)}
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-[120] flex flex-col items-center justify-center p-4"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center relative"
                >
                  <button
                    onClick={() => setIsPressHoldModalOpen(false)}
                    className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto border border-amber-200/60">
                    <ImageIcon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black text-brand-deep">모바일 / 태블릿 이미지 저장</h3>

                  <p className="text-xs text-slate-500 leading-relaxed break-keep font-medium">
                    아래 말씀 카드를 <strong className="text-brand-primary font-bold">1~2초간 꾹~ 눌러주시면</strong><br />
                    ‘사진 앱에 저장’ 또는 ‘이미지 저장’ 메뉴가 나타납니다.
                  </p>

                  <div className="bg-slate-950 p-2 rounded-2xl max-h-[50vh] flex items-center justify-center border border-slate-800 shadow-inner">
                    <img
                      src={previewDataUrl}
                      alt="고화질 말씀 카드"
                      className="max-h-[42vh] w-auto object-contain rounded-xl touch-auto select-auto"
                    />
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setIsPressHoldModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-deep transition-all"
                    >
                      확인 완료 (닫기)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-2"
                style={{ zIndex: 100000 }}
              >
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
