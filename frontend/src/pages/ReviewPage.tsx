import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Review {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
}

interface Service {
  id: number;
  title: string;
  freelancer: { 
    id: number;
    name: string;
    username: string;
  };
  average_rating: number;
  review_count: number;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

export default function ReviewsPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user, notify, setShowLogin } = useApp();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState<ReviewFormData>({ 
    rating: 5, 
    comment: '' 
  });

  // Fetch service details and reviews
  useEffect(() => {
    if (!serviceId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch service details
        const serviceResponse = await axios.get(`http://127.0.0.1:8000/api/services/${serviceId}/`);
        setService(serviceResponse.data);
        
        // Fetch reviews for this service
        const reviewsResponse = await axios.get(`http://127.0.0.1:8000/api/reviews/${serviceId}/`);

        setReviews(reviewsResponse.data.reviews || []);
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        notify('Failed to load service details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, notify]);

  // Check if user has already reviewed this service
  const userHasReviewed = reviews.some(review => 
    review.user.id === user?.id
  );

  const handleAddReview = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!newReview.comment.trim()) {
      notify('Please write a review comment', 'error');
      return;
    }

    if (!serviceId) {
      notify('Service ID is missing', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Submit the review
      const response = await axios.post(
        `/api/services/${serviceId}/reviews/`,
        newReview,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add the new review to the list
      const createdReview: Review = response.data;
      setReviews(prevReviews => [createdReview, ...prevReviews]);
      
      // Update service rating stats
      if (service) {
        setService(prev => prev ? {
          ...prev,
          average_rating: (prev.average_rating * prev.review_count + newReview.rating) / (prev.review_count + 1),
          review_count: prev.review_count + 1
        } : null);
      }

      notify('Review submitted successfully!', 'success');
      setNewReview({ rating: 5, comment: '' });
      
      // Redirect back to service page after a short delay
      setTimeout(() => {
        navigate(`/service/${serviceId}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 401) {
        notify('Please log in to submit a review', 'error');
        setShowLogin(true);
      } else if (error.response?.data?.detail) {
        notify(error.response.data.detail, 'error');
      } else if (error.response?.data?.non_field_errors) {
        notify(error.response.data.non_field_errors[0], 'error');
      } else {
        notify('Failed to submit review. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 'w-8 h-8') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`${size} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} 
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Service not found</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Please log in to add a review</div>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (userHasReviewed) {
    const userReview = reviews.find(review => review.user.id === user.id);
    
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to={`/service/${serviceId}`} className="flex items-center text-slate-300 hover:text-white">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Service
              </Link>
              <h1 className="text-xl font-bold text-white">Your Review</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-yellow-400 mb-4">
                {renderStars(userReview?.rating || 0)}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                You've already reviewed this service
              </h2>
              <p className="text-slate-400 mb-4">
                You submitted a review on {userReview ? formatDate(userReview.created_at) : ''}
              </p>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                "{userReview?.comment}"
              </p>
              <Link 
                to={`/service/${serviceId}`}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 font-medium"
              >
                Back to Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/service/${serviceId}`} className="flex items-center text-slate-300 hover:text-white">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Service
            </Link>
            <h1 className="text-xl font-bold text-white">Add Review</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Rate Your Experience</h2>
          
          <div className="mb-6">
            <h3 className="font-medium text-white mb-2">{service.title}</h3>
            <p className="text-slate-400">by {service.freelancer.name}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Your Rating</label>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  disabled={submitting}
                >
                  <Star className={`w-8 h-8 ${i < newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} ${submitting ? 'opacity-50' : ''}`} />
                </button>
              ))}
              <span className="ml-3 text-lg font-medium text-slate-300">
                {newReview.rating} {newReview.rating === 1 ? 'star' : 'stars'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-slate-300 mb-3">
              Your Review
            </label>
            <textarea
              id="comment"
              rows={6}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this service..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
              disabled={submitting}
              maxLength={1000}
            />
            <div className="text-right text-sm text-slate-400 mt-1">
              {newReview.comment.length}/1000 characters
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddReview}
              disabled={submitting || !newReview.comment.trim()}
              className="flex-1 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => navigate(`/service/${serviceId}`)}
              disabled={submitting}
              className="flex-1 border border-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-700 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Existing Reviews Preview */}
        {reviews.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Existing Reviews ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white">
                        {review.user_name || review.user.username}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {renderStars(review.rating, 'w-4 h-4')}
                        </div>
                        <span className="text-sm text-slate-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
            {reviews.length > 3 && (
              <div className="text-center mt-4">
                <Link 
                  to={`/service/${serviceId}`}
                  className="text-violet-400 hover:text-violet-300 text-sm"
                >
                  View all {reviews.length} reviews
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-slate-300 mb-2">Review Guidelines</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Be honest and specific about your experience</li>
            <li>• Focus on the quality of service delivered</li>
            <li>• Mention what you liked or what could be improved</li>
            <li>• Avoid personal attacks or offensive language</li>
          </ul>
        </div>
      </div>
    </div>
  );
}