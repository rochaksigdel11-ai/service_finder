import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronLeft, Heart, Share2, MapPin, Clock, DollarSign, CheckCircle, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  freelancer: {
    name: string;
    avatar: string;
    skills: string[];
  };
}

interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  serviceId: number;
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, notify, setShowLogin } = useApp();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (id) {
      axios.get(`/api/services/${id}/`)  // Fetch single service
        .then(res => setService(res.data))
        .catch(() => notify('Failed to load service', 'error'));
      
      axios.get(`/api/reviews/${id}/`)  // Fetch reviews
        .then(res => setReviews(res.data))
        .catch(() => notify('Failed to load reviews', 'error'));
      
      setLoading(false);
    }
  }, [id]);

  const handleStartChat = () => {
    if (user) {
      notify('Chat initiated!', 'success');
      // TODO: Navigate to /chat
    } else {
      setShowLogin(true);
    }
  };

  const handleAddReview = () => {
    if (newReview.comment.trim()) {
      // TODO: POST to /api/reviews/
      notify('Review submitted!', 'success');
      setNewReview({ rating: 5, comment: '' });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  if (loading || !service) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">Loading...</div>;
  }

  const serviceReviews = reviews.filter(r => r.serviceId === parseInt(id || ''));

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/services" className="flex items-center text-slate-300 hover:text-white">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Services
            </Link>
            <h1 className="text-xl font-bold text-white">Service Details</h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-300 hover:text-white">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-300 hover:text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Service Info */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{service.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {service.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      3-5 days delivery
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
                      Verified
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-white mb-1">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="text-2xl font-bold">Rs. {service.price}</span>
                  </div>
                  <p className="text-sm text-slate-400">Per project</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">{service.description}</p>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="font-semibold text-white mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {service.freelancer.skills.map((skill, index) => (
                    <span key={index} className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Reviews & Ratings</h3>
                <Link to={`/reviews/${service.id}`} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">
                  Add Review
                </Link>
              </div>

              <div className="space-y-4">
                {serviceReviews.map(review => (
                  <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{review.clientName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">{review.date}</span>
                    </div>
                    <p className="text-slate-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">About the Freelancer</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {service.freelancer.avatar}
                </div>
                <div>
                  <p className="font-medium text-white">{service.freelancer.name}</p>
                  <p className="text-sm text-slate-400">{service.category} Expert</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{service.rating}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(service.rating)}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">({service.reviews} reviews)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">127</p>
                  <p className="text-sm text-slate-400">Projects</p>
                </div>
              </div>

              <button 
                onClick={handleStartChat}
                className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 flex items-center justify-center space-x-2 mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Freelancer</span>
              </button>
              
              <button className="w-full border border-violet-600 text-violet-600 py-3 rounded-lg hover:bg-violet-600 hover:text-white">
                Book Service
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Service Guarantees</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-300">Money Back Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-300">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-300">24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-300">Quality Work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}