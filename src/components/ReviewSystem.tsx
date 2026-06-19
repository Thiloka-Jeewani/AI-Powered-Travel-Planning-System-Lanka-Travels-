// ReviewSystem.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Star,
    Filter,
    X,
    Edit,
    Trash2,
    Check,
    AlertCircle,
    ThumbsUp,
    Flag,
    Send,
    Calendar,
    User,
    ChevronDown,
    ChevronUp,
    Shield,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

// Review interface
interface Review {
    review_id: string;
    user_id: string;
    full_name: string;
    email?: string;
    rating: number;
    title: string;
    review_text: string;
    review_type: 'general' | 'package' | 'hotel' | 'service';
    entity_id?: string;
    entity_name?: string;
    review_date: string;
    status: 'pending' | 'approved' | 'rejected';
    is_verified: boolean;
    helpful_count: number;
    inappropriate_count: number;
    updated_at: string;
    can_edit?: boolean;
    can_delete?: boolean;
}

// Review form data interface
interface ReviewFormData {
    rating: number;
    title: string;
    review_text: string;
    review_type: 'general' | 'package' | 'hotel' | 'service';
    entity_id?: string;
    entity_name?: string;
}

const ReviewSystem = () => {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Filters
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Form state
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: 5,
        title: '',
        review_text: '',
        review_type: 'general',
        entity_id: '',
        entity_name: ''
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        average: 0,
        distribution: [0, 0, 0, 0, 0],
        verified: 0
    });

    const reviewFormRef = useRef<HTMLDivElement>(null);

    // Fetch reviews
    // ReviewSystem.tsx - Update the fetchReviews function
    const fetchReviews = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                sort: sortBy,
                ...(ratingFilter && { rating: ratingFilter.toString() }),
                ...(typeFilter !== 'all' && { type: typeFilter }),
                ...(user?.user_id && { user_id: user.user_id })
            });

            // CHANGE THIS: Use absolute URL to port 5001
            const url = `http://localhost:5001/api/reviews?${queryParams}`;

            console.log('🔍 Fetching reviews from:', url);

            const response = await fetch(url);

            console.log('📊 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Reviews fetched successfully:', data.reviews?.length || 0, 'reviews');
                setReviews(data.reviews || []);
                setStats(data.stats || stats);
            } else {
                const errorText = await response.text();
                console.error('❌ Server error:', errorText);
                toast.error('Failed to load reviews');
            }
        } catch (error) {
            console.error('❌ Error fetching reviews:', error);
            toast.error('Failed to load reviews. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Submit review
    const submitReview = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Please login to submit a review');
            return;
        }

        if (!formData.title.trim() || !formData.review_text.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.review_text.trim().length < 10) {
            toast.error('Review must be at least 10 characters long');
            return;
        }

        try {
            setSubmitting(true);

            const reviewData = {
                ...formData,
                user_id: user.user_id,
                full_name: user.full_name || 'Anonymous',
                email: user.email
            };

            // CHANGE THIS: Use absolute URL to port 5001
            const url = editingReview
                ? `http://localhost:5001/api/reviews/${editingReview.review_id}`
                : 'http://localhost:5001/api/reviews';

            const method = editingReview ? 'PUT' : 'POST';

            console.log('📤 Submitting review to:', url);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            console.log('📊 Submit response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Submit successful:', result);

                if (editingReview) {
                    toast.success('Review updated successfully!');
                } else {
                    toast.success('Review submitted! It will appear after moderation.');
                }

                resetForm();
                fetchReviews();
            } else {
                const errorText = await response.text();
                console.error('❌ Submit error:', errorText);
                toast.error(errorText || 'Failed to submit review');
            }
        } catch (error) {
            console.error('❌ Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete review
// Update deleteReview:
    const deleteReview = async (reviewId: string) => {
        if (!isAuthenticated || !user) {
            toast.error('Please login to delete review');
            return;
        }

        try {
            console.log('🗑️ Deleting review:', reviewId);

            const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id })
            });

            console.log('📊 Delete response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Delete successful:', result);

                // IMPORTANT: Remove the deleted review from state
                setReviews(prevReviews => prevReviews.filter(review => review.review_id !== reviewId));

                // Close the delete confirmation modal
                setShowDeleteConfirm(null);

                toast.success('Review deleted successfully!');

                // Also refresh stats
                fetchReviews();
            } else {
                const errorText = await response.text();
                console.error('❌ Delete error:', errorText);

                // If review not found, it might already be deleted
                if (response.status === 404) {
                    toast.error('Review not found. It may have already been deleted.');
                    // Still remove it from state if it doesn't exist
                    setReviews(prevReviews => prevReviews.filter(review => review.review_id !== reviewId));
                } else {
                    toast.error(errorText || 'Failed to delete review');
                }
            }
        } catch (error) {
            console.error('❌ Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    // Add this helper function
    const cleanupDeletedReviews = async () => {
        if (!user) return;

        try {
            // Get fresh list from server
            const response = await fetch(`http://localhost:5001/api/reviews?user_id=${user.user_id}&show_all=true`);
            if (response.ok) {
                const data = await response.json();
                const serverReviewIds = data.reviews?.map((r: Review) => r.review_id) || [];

                // Remove any reviews from state that don't exist on server
                setReviews(prevReviews =>
                    prevReviews.filter(review => serverReviewIds.includes(review.review_id))
                );
            }
        } catch (error) {
            console.log('⚠️ Error cleaning up reviews:', error);
        }
    };

// Call this when component mounts or user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            cleanupDeletedReviews();
        }
    }, [isAuthenticated, user]);



// Update voteHelpful:
    const voteHelpful = async (reviewId: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}/helpful`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.user_id })
            });
            // ... rest of code
        } catch (error) {
            console.error('❌ Error voting:', error);
        }
    };

// Update reportReview:
    const reportReview = async (reviewId: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to report');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.user_id })
            });
            // ... rest of code
        } catch (error) {
            console.error('❌ Error reporting review:', error);
            toast.error('Failed to report review');
        }
    };


    // Helpful vote


    // Reset form
    const resetForm = () => {
        setFormData({
            rating: 5,
            title: '',
            review_text: '',
            review_type: 'general',
            entity_id: '',
            entity_name: ''
        });
        setEditingReview(null);
        setShowReviewForm(false);
    };

    // Edit review
    const handleEdit = (review: Review) => {
        setFormData({
            rating: review.rating,
            title: review.title,
            review_text: review.review_text,
            review_type: review.review_type,
            entity_id: review.entity_id,
            entity_name: review.entity_name
        });
        setEditingReview(review);
        setShowReviewForm(true);

        // Scroll to form
        setTimeout(() => {
            reviewFormRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Initialize form with user data
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                review_type: 'general'
            }));
        }
    }, [isAuthenticated, user]);

    // Fetch reviews on mount and when filters change
    useEffect(() => {
        fetchReviews();
    }, [sortBy, ratingFilter, typeFilter]);

    // Render stars
    const renderStars = (rating: number, interactive = false) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? "button" : "div"}
                    onClick={interactive ? () => setFormData({...formData, rating: star}) : undefined}
                    className={`transition-transform hover:scale-110 ${interactive ? 'cursor-pointer' : ''}`}
                >
                    <Star
                        size={interactive ? 28 : 20}
                        className={`${
                            star <= rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "fill-gray-300 text-gray-300"
                        }`}
                    />
                </button>
            ))}
        </div>
    );

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
        if (ratingFilter && review.rating !== ratingFilter) return false;
        if (typeFilter !== 'all' && review.review_type !== typeFilter) return false;
        return true;
    });

    // Sort reviews
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
            case 'oldest':
                return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
            case 'rating_high':
                return b.rating - a.rating;
            case 'rating_low':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });

    return (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mb-4">
                        <Star className="text-white" size={32} />
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Customer Reviews
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        See what our travelers are saying about their experiences with Lanka Vacations
                    </p>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Star className="text-yellow-500" size={20} />
                                <span className="text-3xl font-bold text-gray-800">{stats.average.toFixed(1)}</span>
                            </div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-lg">
                            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total}</div>
                            <p className="text-sm text-gray-600">Total Reviews</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-lg">
                            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.verified}</div>
                            <p className="text-sm text-gray-600">Verified Reviews</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-lg">
                            <div className="text-3xl font-bold text-gray-800 mb-2">4.8</div>
                            <p className="text-sm text-gray-600">Service Rating</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Filter size={20} />
                                <span className="font-medium">Filters</span>
                                {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="newest">Most Recent</option>
                                <option value="oldest">Oldest</option>
                                <option value="rating_high">Highest Rated</option>
                                <option value="rating_low">Lowest Rated</option>
                            </select>

                            <Button
                                onClick={() => {
                                    setShowReviewForm(true);
                                    setTimeout(() => {
                                        reviewFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                            >
                                <Star size={20} className="mr-2" />
                                Write a Review
                            </Button>
                        </div>
                    </div>

                    {/* Expanded filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-6 mt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Filter by Type
                                            </label>
                                            <select
                                                value={typeFilter}
                                                onChange={(e) => setTypeFilter(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="all">All Reviews</option>
                                                <option value="general">General Experience</option>
                                                <option value="package">Tour Packages</option>
                                                <option value="hotel">Hotels</option>
                                                <option value="service">Customer Service</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating Distribution
                                            </label>
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((rating) => (
                                                    <button
                                                        key={rating}
                                                        onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                                                            ratingFilter === rating
                                                                ? 'bg-yellow-50 border border-yellow-200'
                                                                : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={16}
                                                                        className={`${
                                                                            i < rating
                                                                                ? "fill-yellow-400 text-yellow-400"
                                                                                : "fill-gray-300 text-gray-300"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-600">{rating}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {stats.distribution[rating - 1] || 0}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Shield size={16} />
                                                <span>All reviews are moderated for quality</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✓ Verified Bookings
                        </span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          🛡️ Protected Content
                        </span>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          🤖 AI Moderation
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Review Form */}
                <AnimatePresence>
                    {showReviewForm && (
                        <motion.div
                            ref={reviewFormRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-orange-200"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {editingReview ? 'Edit Your Review' : 'Share Your Experience'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Rating */}
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-3">
                                        How would you rate your experience?
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {renderStars(formData.rating, true)}
                                        <span className="text-2xl font-bold text-gray-800 ml-4">
                      {formData.rating}/5
                    </span>
                                    </div>
                                </div>

                                {/* Review Type */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            What are you reviewing?
                                        </label>
                                        <select
                                            value={formData.review_type}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                review_type: e.target.value as any
                                            })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="general">General Experience</option>
                                            <option value="package">Tour Package</option>
                                            <option value="hotel">Hotel Stay</option>
                                            <option value="service">Customer Service</option>
                                        </select>
                                    </div>

                                    {formData.review_type !== 'general' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {formData.review_type === 'package' ? 'Package Name' :
                                                    formData.review_type === 'hotel' ? 'Hotel Name' : 'Service Type'}
                                            </label>
                                            <Input
                                                value={formData.entity_name || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    entity_name: e.target.value
                                                })}
                                                placeholder={`Enter ${formData.review_type} name`}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Review Title *
                                    </label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Summarize your experience"
                                        maxLength={100}
                                        className="w-full text-lg"
                                    />
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                        {formData.title.length}/100 characters
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Review *
                                    </label>
                                    <Textarea
                                        value={formData.review_text}
                                        onChange={(e) => setFormData({...formData, review_text: e.target.value})}
                                        placeholder="Share details of your experience..."
                                        rows={6}
                                        className="w-full resize-none"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-500">
                                            Minimum 10 characters. {formData.review_text.length} characters
                                        </div>
                                        {formData.review_text.length < 10 && (
                                            <div className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                Too short
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* User Info (if not logged in) */}
                                {!isAuthenticated && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="text-blue-600 mt-1" size={20} />
                                            <div>
                                                <p className="font-medium text-blue-800">
                                                    Please login to submit a review
                                                </p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Your review will be linked to your account and marked as verified.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={resetForm}
                                        variant="outline"
                                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={submitReview}
                                        disabled={!isAuthenticated || !formData.title.trim() || !formData.review_text.trim() || formData.review_text.length < 10 || submitting}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {editingReview ? 'Updating...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} className="mr-2" />
                                                {editingReview ? 'Update Review' : 'Submit Review'}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Info Note */}
                                <div className="text-xs text-gray-500 text-center">
                                    <p>All reviews are moderated. Reviews containing inappropriate language will be rejected.</p>
                                    <p>Verified bookings receive a "Verified" badge.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading reviews...</p>
                        </div>
                    ) : sortedReviews.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <Star className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No reviews yet</h3>
                            <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                            <Button
                                onClick={() => setShowReviewForm(true)}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                            >
                                Write First Review
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-gray-600 mb-4">
                                Showing {sortedReviews.length} of {stats.total} reviews
                            </div>

                            {sortedReviews.map((review) => (
                                <motion.div
                                    key={review.review_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    {/* Review Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center">
                                                <User className="text-orange-600" size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-800">{review.full_name}</h4>
                                                    {review.is_verified && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                              <Check size={10} />
                              Verified
                            </span>
                                                    )}
                                                    {review.review_type !== 'general' && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {review.review_type.charAt(0).toUpperCase() + review.review_type.slice(1)}
                            </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        {renderStars(review.rating)}
                                                        <span className="ml-2 font-medium">{review.rating}.0</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        <span>{format(new Date(review.review_date), 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {(review.can_edit || review.can_delete) && (
                                                <>
                                                    {review.can_edit && (
                                                        <button
                                                            onClick={() => handleEdit(review)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit review"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    )}
                                                    {review.can_delete && (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(review.review_id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete review"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => reportReview(review.review_id)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Report review"
                                            >
                                                <Flag size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Review Title & Content */}
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                        {review.title}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {review.review_text}
                                    </p>

                                    {/* Entity Info */}
                                    {review.entity_name && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Reviewing: <span className="font-medium text-gray-800">{review.entity_name}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Review Footer */}
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={() => voteHelpful(review.review_id)}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ThumbsUp size={18} />
                                            <span>Helpful ({review.helpful_count})</span>
                                        </button>

                                        <div className="text-sm text-gray-500">
                                            {review.status === 'pending' && (
                                                <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle size={14} />
                          Pending moderation
                        </span>
                                            )}
                                            {review.status === 'approved' && review.updated_at !== review.review_date && (
                                                <span className="text-gray-500">
                          Edited on {format(new Date(review.updated_at), 'MMM d, yyyy')}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </>
                    )}
                </div>

                {/* Load More Button */}
                {sortedReviews.length > 0 && sortedReviews.length < stats.total && (
                    <div className="text-center mt-8">
                        <Button
                            variant="outline"
                            onClick={fetchReviews}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
                        >
                            Load More Reviews
                        </Button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowDeleteConfirm(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="text-red-600" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Delete Review?
                                    </h3>
                                    <p className="text-gray-600">
                                        Are you sure you want to delete this review? This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        variant="outline"
                                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => deleteReview(showDeleteConfirm)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Delete Review
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default ReviewSystem;