// app/components/ui/Skeleton.tsx
"use client";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

// Card skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg mb-1" />
      <Skeleton className="h-4 w-20 rounded-lg" />
    </div>
  );
}

// Stats card skeleton
export function SkeletonStatsCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
      <Skeleton className="w-9 h-9 rounded-xl" />
      <div>
        <Skeleton className="h-4 w-24 rounded-lg mb-1" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
}

// Activity item skeleton
export function SkeletonActivityItem() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-40 rounded-lg mb-1.5" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-4 w-16 rounded-lg" />
    </div>
  );
}

// Header skeleton
export function SkeletonHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div>
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg mt-1.5" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-44 h-10 rounded-xl" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
    </div>
  );
}

// Quick module skeleton
export function SkeletonQuickModule() {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-xl mx-auto mb-2" />
      <Skeleton className="h-3 w-12 rounded-lg mx-auto" />
    </div>
  );
}