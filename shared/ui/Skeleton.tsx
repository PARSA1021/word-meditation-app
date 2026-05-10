"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={`relative overflow-hidden bg-slate-200 rounded-lg ${className}`} 
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export function QuoteSkeleton() {
  return (
    <div className="w-full bg-white rounded-[40px] md:rounded-[56px] p-10 md:p-14 lg:p-20 shadow-premium border border-white relative overflow-hidden">
      {/* Decorative pulse background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 animate-pulse" />
      
      <div className="flex flex-col gap-10 md:gap-14">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-5/6 h-8" />
          <Skeleton className="w-4/6 h-8" />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100" />

        {/* Footer Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
