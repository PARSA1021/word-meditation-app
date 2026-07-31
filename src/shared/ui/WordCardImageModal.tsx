"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Word } from "@/shared/types/word";
import { Download, Share2, ArrowLeft, Check, Sparkles } from "lucide-react";

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
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedTheme = CARD_STUDIO_THEMES[themeIndex];

  // Lock body scroll and set up ESC key listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Instant High-DPI 1200x1200 Canvas Studio Renderer with Zero Overlap Auto-Fit Engine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 1200;
    canvas.width = size;
    canvas.height = size;

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, selectedTheme.bgGradient[0]);
    grad.addColorStop(0.5, selectedTheme.bgGradient[1]);
    grad.addColorStop(1, selectedTheme.bgGradient[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 2. Outer & Inner Gold Frame Borders
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(50, 50, size - 100, size - 100);
    ctx.strokeRect(62, 62, size - 124, size - 124);
    ctx.globalAlpha = 1.0;

    // Corner Ornaments
    const drawCorner = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fill();
    };
    drawCorner(56, 56);
    drawCorner(size - 56, 56);
    drawCorner(56, size - 56);
    drawCorner(size - 56, size - 56);

    // 3. Header Emblem Title (Clean & Dignified, No Logo Image)
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.textAlign = "center";
    ctx.fillText(`❖ ${selectedTheme.badge} ❖`, size / 2, 145);

    // 4. Zero-Overlap Iterative Auto-Fit Text Wrapping Algorithm
    const fullText = word.text.trim();
    const maxWidth = size - 220;
    const maxTextHeight = 580; // Maximum allowed space for body text block

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

    let fontSize = 48;
    if (fullText.length > 350) fontSize = 28;
    else if (fullText.length > 250) fontSize = 32;
    else if (fullText.length > 150) fontSize = 38;
    else if (fullText.length > 80) fontSize = 44;
    else if (fullText.length < 40) fontSize = 54;

    let lines = getWrappedLines(fullText, fontSize);
    let lineHeight = fontSize * 1.65;

    // Iteratively scale down font if text height exceeds maximum bound
    while (lines.length * lineHeight > maxTextHeight && fontSize > 18) {
      fontSize -= 2;
      lineHeight = fontSize * 1.65;
      lines = getWrappedLines(fullText, fontSize);
    }

    const textStartY = 240;
    ctx.font = `500 ${fontSize}px sans-serif`;
    ctx.fillStyle = selectedTheme.textColor;
    ctx.textAlign = "center";

    let currentY = textStartY;
    for (const l of lines) {
      ctx.fillText(l, size / 2, currentY);
      currentY += lineHeight;
    }

    const textEndY = currentY - lineHeight;

    // 5. Speaker / Source Attribution (Zero Overlap Guaranteed)
    let attrY = textEndY + 60;
    if (attrY < 860) attrY = 860;
    if (attrY > 970) attrY = 970;

    if (word.speaker) {
      ctx.font = "bold 30px sans-serif";
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fillText(`— ${word.speaker} —`, size / 2, attrY);
      attrY += 46;
    }

    if (word.source) {
      ctx.font = "normal 24px sans-serif";
      ctx.fillStyle = selectedTheme.subTextColor;
      ctx.fillText(word.source, size / 2, attrY);
    }

    // 6. Footer Watermark
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = selectedTheme.subTextColor;
    ctx.globalAlpha = 0.65;
    ctx.fillText("세계평화통일가정연합 말씀 묵상", size / 2, size - 80);
    ctx.globalAlpha = 1.0;

    // Export Data URL for instant live preview
    try {
      setPreviewDataUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Canvas dataUrl export error", err);
    }
  }, [word, selectedTheme]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        renderCanvas();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedTheme, renderCanvas]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `TruePath_Word_${word.id || Date.now()}.png`;
    link.click();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "TruePath_Word_Card.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: "TruePath 말씀 묵상",
            text: word.text.slice(0, 60),
            files: [file],
          });
        } catch (err) {
          console.log("Share skipped", err);
        }
      } else {
        handleDownload(e);
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Tap anywhere outside to close instantly) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100]"
          />

          {/* Revolutionary Floating Word Card Studio Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-[620px] md:max-w-[700px] lg:max-w-[760px] h-[92vh] max-h-[860px] bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden border border-slate-200 flex flex-col p-4 sm:p-6 space-y-4"
          >
            {/* Header: Prominent 1-Tap Back Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs"
                aria-label="이전 목록으로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4 text-brand-primary" />
                <span>← 묵상 목록으로 돌아가기</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-200/60 text-amber-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>말씀 스튜디오</span>
              </div>
            </div>

            {/* Offscreen High-Res Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live High-Resolution Card Display Studio */}
            <div className="flex-1 relative overflow-hidden min-h-0 bg-slate-950/90 rounded-2xl p-3 sm:p-5 flex items-center justify-center border border-slate-800 shadow-inner">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="말씀 카드 스튜디오 미리보기"
                  className="w-full h-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700/40 select-none"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-bold gap-2">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <span>스튜디오 카드 생성 중...</span>
                </div>
              )}
            </div>

            {/* 1-Tap Color Swatch Toolbar (Direct Color Selection) */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                원하는 카드 분위기 색상을 누르면 즉시 변환됩니다
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 overflow-x-auto no-scrollbar">
                {CARD_STUDIO_THEMES.map((t, idx) => {
                  const isSelected = idx === themeIndex;
                  return (
                    <button
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemeIndex(idx);
                      }}
                      title={t.name}
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

            {/* Action Bar: 1-Click Save & Share */}
            <div className="grid grid-cols-2 gap-3 pt-1 shrink-0">
              <button
                onClick={handleDownload}
                className="py-3.5 px-5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-brand-primary transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>🖼️ 갤러리에 저장</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3.5 px-5 rounded-2xl bg-brand-primary text-white text-xs sm:text-sm font-bold hover:bg-brand-deep transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>💬 카톡 / SNS 공유</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
