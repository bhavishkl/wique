import React from 'react';

const QueueIdSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-4 sm:p-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueIdSkeleton;
