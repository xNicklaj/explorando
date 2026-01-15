export const FeedSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 bg-white animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="h-4 bg-gray-300 rounded w-24"></div>
      <div className="h-4 bg-gray-300 rounded w-20 ml-auto"></div>
    </div>
    <div className="flex gap-3 bg-gray-100 rounded-lg p-3">
      <div className="w-16 h-16 bg-gray-300 rounded"></div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);
