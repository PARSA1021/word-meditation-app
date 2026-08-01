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
    id: "minimal_white",
    name: "순백의 미니멀",
    badge: "오늘의 말씀",
    bgGradient: ["#ffffff", "#fafafa", "#f5f5f5"],
    textColor: "#1f2937",
    accentColor: "#9ca3af",
    borderColor: "#e5e7eb",
    subTextColor: "#6b7280",
    swatchBg: "linear-gradient(135deg, #ffffff, #e5e7eb)",
  },
  {
    id: "serene_dawn",
    name: "새벽의 은혜",
    badge: "평온한 묵상",
    bgGradient: ["#f8fafc", "#f1f5f9", "#e2e8f0"],
    textColor: "#334155",
    accentColor: "#64748b",
    borderColor: "#cbd5e1",
    subTextColor: "#94a3b8",
    swatchBg: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
  },
  {
    id: "warm_sunset",
    name: "따스한 위로",
    badge: "마음의 안식",
    bgGradient: ["#fff7ed", "#ffedd5", "#fed7aa"],
    textColor: "#431407",
    accentColor: "#fb923c",
    borderColor: "#fdba74",
    subTextColor: "#9a3412",
    swatchBg: "linear-gradient(135deg, #fff7ed, #fed7aa)",
  },
  {
    id: "nature_breeze",
    name: "숲속의 바람",
    badge: "자연과 치유",
    bgGradient: ["#f0fdf4", "#dcfce7", "#bbf7d0"],
    textColor: "#14532d",
    accentColor: "#4ade80",
    borderColor: "#86efac",
    subTextColor: "#166534",
    swatchBg: "linear-gradient(135deg, #f0fdf4, #bbf7d0)",
  },
  {
    id: "midnight_calm",
    name: "자정의 고요",
    badge: "깊은 은혜",
    bgGradient: ["#111827", "#1f2937", "#374151"],
    textColor: "#f9fafb",
    accentColor: "#9ca3af",
    borderColor: "#4b5563",
    subTextColor: "#d1d5db",
    swatchBg: "linear-gradient(135deg, #111827, #374151)",
  },
  {
    id: "ocean_depth",
    name: "바다의 깊이",
    badge: "무한한 사랑",
    bgGradient: ["#0f172a", "#1e293b", "#334155"],
    textColor: "#f8fafc",
    accentColor: "#60a5fa",
    borderColor: "#475569",
    subTextColor: "#94a3b8",
    swatchBg: "linear-gradient(135deg, #0f172a, #334155)",
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

    // 2. Modern Minimalist Double Frame
    const padding = Math.min(width, height) * 0.05;
    
    // Function to draw rounded rectangles for smooth frames
    const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Outer subtle frame
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4;
    drawRoundRect(ctx, padding, padding, width - padding * 2, height - padding * 2, Math.min(width, height) * 0.03);
    ctx.stroke();

    // Inner detailed frame
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.75;
    const innerPadding = padding + 14;
    drawRoundRect(ctx, innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2, Math.min(width, height) * 0.02);
    ctx.stroke();

    // 3. Immersive Quotes Background
    ctx.globalAlpha = 0.035;
    const quoteSize = Math.floor(Math.min(width, height) * 0.35);
    ctx.font = `italic 400 ${quoteSize}px Georgia, serif`;
    ctx.fillStyle = selectedTheme.textColor;
    ctx.textAlign = "left";
    ctx.fillText("“", padding * 2, padding + quoteSize * 0.85);
    ctx.textAlign = "right";
    ctx.fillText("”", width - padding * 2, height - padding - quoteSize * 0.1);
    ctx.globalAlpha = 1.0;

    // 4. Header Emblem Badge
    const headerFontSize = Math.floor(Math.min(width, height) * 0.022);
    const headerY = innerPadding + headerFontSize * 2.5;
    ctx.font = `bold ${headerFontSize}px sans-serif`;
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.textAlign = "center";
    ctx.fillText(`— ${selectedTheme.badge} —`, width / 2, headerY);

    // 5. Intelligent Text Layout & Auto-Scaling
    const fullText = word.text.trim();
    const maxWidth = width - innerPadding * 3.5;
    
    let baseFontSize = aspectRatio === "16:9" ? width * 0.025 : Math.min(width, height) * 0.035;
    if (fullText.length > 350) baseFontSize *= 0.65;
    else if (fullText.length > 250) baseFontSize *= 0.75;
    else if (fullText.length > 150) baseFontSize *= 0.85;
    else if (fullText.length > 80) baseFontSize *= 0.95;

    let fontSize = Math.floor(baseFontSize);
    let lineHeight = fontSize * 1.7;

    const getWrappedLines = (text: string, currentFontSize: number): string[] => {
      ctx.font = `600 ${currentFontSize}px sans-serif`;
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

    let lines = getWrappedLines(fullText, fontSize);
    const availableHeight = height - (headerY + innerPadding * 2);
    
    while (lines.length * lineHeight > availableHeight * 0.7 && fontSize > 20) {
      fontSize -= 2;
      lineHeight = fontSize * 1.7;
      lines = getWrappedLines(fullText, fontSize);
    }

    // Measure speaker & source height
    const speakerFontSize = Math.floor(fontSize * 0.65);
    const sourceFontSize = Math.floor(fontSize * 0.55);
    
    let attributionHeight = 0;
    if (word.speaker) attributionHeight += speakerFontSize * 1.5 + (fontSize * 0.8);
    if (word.source) attributionHeight += sourceFontSize * 1.5 + (fontSize * 0.3);
    
    // Perfect vertical centering math
    const totalContentHeight = (lines.length * lineHeight) + attributionHeight;
    const startY = headerY + (height - headerY - innerPadding - totalContentHeight) / 2 + fontSize * 0.8;
    
    // Draw Main Word Text
    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.fillStyle = selectedTheme.textColor;
    ctx.textAlign = "center";
    
    // Soft elegant drop shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    let currentY = startY;
    for (const l of lines) {
      ctx.fillText(l, width / 2, currentY);
      currentY += lineHeight;
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw Attribution
    if (word.speaker || word.source) {
      currentY += (fontSize * 0.4); 
      
      if (word.speaker) {
        ctx.font = `bold ${speakerFontSize}px sans-serif`;
        ctx.fillStyle = selectedTheme.accentColor;
        ctx.fillText(`— ${word.speaker} —`, width / 2, currentY);
        currentY += speakerFontSize * 1.5;
      }
      
      if (word.source) {
        ctx.font = `400 ${sourceFontSize}px sans-serif`;
        ctx.fillStyle = selectedTheme.subTextColor;
        ctx.globalAlpha = 0.85;
        ctx.fillText(word.source, width / 2, currentY);
        ctx.globalAlpha = 1.0;
      }
    }

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
