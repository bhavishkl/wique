import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiStar, FiMessageCircle, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const QueueReviews = ({ queueId }) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    fetchReviews();
  }, [queueId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/queue/reviews?queueId=${queueId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else if (response.status === 400) {
        console.error('Invalid queue ID');
        // You might want to show an error message to the user here
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/queue/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReview, queueId }),
      });
      if (response.ok) {
        setNewReview({ rating: 0, comment: '' });
        fetchReviews();
        setShowAddReviewForm(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mt-12 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Reviews</h2>
          {session && !showAddReviewForm && (
            <button
              onClick={() => setShowAddReviewForm(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <FiPlus className="mr-2" />
              Add Review
            </button>
          )}
        </div>
        {session && showAddReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Your Rating</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors duration-200 ${
                      star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-lg font-semibold text-gray-700 mb-2">
                Your Comment
              </label>
              <textarea
                id="comment"
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
                placeholder="Share your experience..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || newReview.rating === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
        <div className="space-y-6">
          {currentReviews.map((review, index) => (
            <div key={review._id}>
              <div className="flex items-start">
                <img
                  src={review.author.image}
                  alt={review.author.name}
                  className="w-10 h-10 rounded-full mr-3 border border-blue-500"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800">{review.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              </div>
              {index < currentReviews.length - 1 && (
                <hr className="my-4 border-t border-gray-200" />
              )}
            </div>
          ))}
        </div>
        {reviews.length > reviewsPerPage && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === index + 1
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueReviews;