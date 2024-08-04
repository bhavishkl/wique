import React from 'react';

const ParticipantsCompoSkeleton = () => {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>

      {/* Table skeleton for larger screens */}
      <div className="hidden md:block">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="border-t border-gray-200">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="px-4 py-5 sm:p-6">
                <div className="flex space-x-4">
                  <div className="h-6 bg-gray-200 rounded w-1/12"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card skeleton for small screens */}
      <div className="md:hidden space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsCompoSkeleton;
