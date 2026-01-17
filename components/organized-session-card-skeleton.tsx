'use client';

export default function OrganizedSessionCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="flex justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-6 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
