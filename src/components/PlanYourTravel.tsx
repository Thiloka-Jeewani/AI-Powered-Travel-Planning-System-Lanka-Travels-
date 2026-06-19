import { useState } from "react";
import Navbar from "@/components/Navbar";
import TravelQuestionnaire from "@/components/Hero";
import { Sparkles, MapPin, Calendar, Users } from "lucide-react";

// Background Images
import beachBg from "@/assets/beach-scene.jpg";
import darkBeachBg from "@/assets/hero-beach.jpg";

const PlanYourTravel = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  if (showQuestionnaire) {
    return (
      <div className="w-full min-h-screen bg-background">
        <Navbar />
        <TravelQuestionnaire onClose={() => setShowQuestionnaire(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 bg-cover bg-center bg-no-repeat">
        {/* Light mode background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 dark:opacity-0"
          style={{ backgroundImage: `url(${beachBg})` }}
        />

        {/* Dark mode background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 dark:opacity-100"
          style={{ backgroundImage: `url(${darkBeachBg})` }}
        />

        {/* Overlay (adjusts for dark mode) */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-colors duration-500" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Content */}
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-6">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Plan Your Perfect Sri Lankan Adventure
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Answer a few simple questions and let our experts craft a personalized itinerary tailored to your preferences, budget, and travel style.
            </p>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-accent hover:bg-accent/90 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              Start Planning Now <Sparkles size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-100 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">Flexible Planning</h3>
              <p className="text-gray-600 text-sm">Choose your travel dates, duration, and preferences at your own pace.</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-100 transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-accent" size={24} />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">Personalized Routes</h3>
              <p className="text-gray-600 text-sm">Get customized itineraries based on your interests and travel style.</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-100 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">Our local experts help you discover hidden gems and authentic experiences.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 dark:border-white/10 transition-colors duration-500">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="hover:scale-105 transition-transform duration-300">
                <p className="text-4xl font-bold text-white mb-2">2000+</p>
                <p className="text-white/80 font-medium">Happy Travelers</p>
              </div>
              <div className="hover:scale-105 transition-transform duration-300 border-x border-white/20 dark:border-white/10">
                <p className="text-4xl font-bold text-accent mb-2">50+</p>
                <p className="text-white/80 font-medium">Tour Packages</p>
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <p className="text-4xl font-bold text-white mb-2">15+</p>
                <p className="text-white/80 font-medium">Destinations</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanYourTravel;
