// ReviewsPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Filter, ChevronRight } from "lucide-react";
import ReviewSystem from "@/components/ReviewSystem";
import { useNavigate } from "react-router-dom";

const ReviewsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'my-reviews'>('all');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#2d5f4d] to-[#1e4a3a] text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            size="sm"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold">
                                Customer Reviews & Ratings
                            </h1>
                            <p className="text-white/90 mt-2">
                                Read genuine reviews from our travelers
                            </p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="text-yellow-400" size={20} />
                                <span className="text-2xl font-bold">4.8</span>
                            </div>
                            <p className="text-sm text-white/80">Overall Rating</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl font-bold mb-2">1,250+</div>
                            <p className="text-sm text-white/80">Verified Reviews</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl font-bold mb-2">98%</div>
                            <p className="text-sm text-white/80">Recommend Us</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-2xl font-bold mb-2">4.9</div>
                            <p className="text-sm text-white/80">Service Rating</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <Button
                        onClick={() => setActiveTab('all')}
                        variant={activeTab === 'all' ? 'default' : 'outline'}
                        className={activeTab === 'all'
                            ? 'bg-[#f97a1f] hover:bg-[#e66a0f]'
                            : 'border-gray-300 text-gray-700'
                        }
                    >
                        <Filter size={18} className="mr-2" />
                        All Reviews
                    </Button>
                    <Button
                        onClick={() => setActiveTab('my-reviews')}
                        variant={activeTab === 'my-reviews' ? 'default' : 'outline'}
                        className={activeTab === 'my-reviews'
                            ? 'bg-[#2d5f4d] hover:bg-[#1e4a3a]'
                            : 'border-gray-300 text-gray-700'
                        }
                    >
                        <Star size={18} className="mr-2" />
                        My Reviews
                    </Button>
                </div>

                {/* Review System Component */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <ReviewSystem />
                </div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Why Our Reviews Are Trustworthy
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Star className="text-green-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Verified Bookings Only</h4>
                            <p className="text-gray-600 text-sm">
                                Reviews only from customers with confirmed bookings
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <Filter className="text-blue-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">AI Moderation</h4>
                            <p className="text-gray-600 text-sm">
                                Advanced filtering for genuine, helpful content
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <ChevronRight className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Real-time Updates</h4>
                            <p className="text-gray-600 text-sm">
                                Reviews are published immediately after moderation
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ReviewsPage;