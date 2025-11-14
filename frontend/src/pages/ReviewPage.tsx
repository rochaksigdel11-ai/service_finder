import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Service {
  id: number;
  title: string;
  freelancer: { name: string };
}

export default function ReviewsPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, notify, setShowLogin } = useApp();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (serviceId) {
      axios.get(`/api/services/${serviceId}/`)  // Fetch service
        .then(res => setService(res.data));
      
      axios.get(`/api/reviews/${serviceId}/`)  // Fetch reviews
        .then(res => setReviews(res.data))
        .catch(() => notify('Failed to load reviews', 'error'));
      
      setLoading(false);
    }
  }, [serviceId]);

  const handleAddReview = () => {
    if (newReview.comment.trim()) {
      // TODO: POST to /api/reviews/
      notify('Review submitted!', 'success');
      setNewReview({ rating: 5, comment: '' });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-8 h-8 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  if (loading || !service) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">Please log in to add a review.</div>;
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
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${i < newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddReview}
              className="flex-1 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-medium"
            >
              Submit Review
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 border border-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

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