import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, MapPin, Calendar, Users, Sparkles, ArrowLeft, Clock, DollarSign, Car, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import images
import questionBeach from "@/assets/question-beach.jpg";
import travelerSolo from "@/assets/traveler-solo.jpg";
import travelerCouple from "@/assets/traveler-couple.jpg";
import travelerFamily from "@/assets/traveler-family.jpg";
import travelerFriends from "@/assets/traveler-friends.jpg";
import accommodationLuxury from "@/assets/accommodation-luxury.jpg";
import accommodationBoutique from "@/assets/accommodation-boutique.jpg";
import accommodationEco from "@/assets/accommodation-eco.jpg";
import interestWildlife from "@/assets/interest-wildlife.jpg";
import interestCulture from "@/assets/interest-culture.jpg";
import interestAdventure from "@/assets/interest-adventure.jpg";
import interestFood from "@/assets/interest-food.jpg";
import transportPrivate from "@/assets/transport-private.jpg";


interface Answer {
  question: string;
  answer: string;
}

interface QuestionOption {
  label: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
}

interface Question {
  id: number;
  question: string;
  subtitle: string;
  icon: React.ReactNode;
  options: QuestionOption[];
  backgroundImage?: string;
}

const Questionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [showItinerary, setShowItinerary] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "When are you planning to visit Sri Lanka?",
      subtitle: "Let us know your travel timeline so we can suggest the best experiences",
      icon: <Calendar className="w-6 h-6" />,
      backgroundImage: questionBeach,
      options: [
        { label: "Within the next month", description: "Ready for an adventure soon", icon: <Clock className="w-5 h-5" /> },
        { label: "1-3 months", description: "Planning ahead for the perfect trip", icon: <Clock className="w-5 h-5" /> },
        { label: "3-6 months", description: "Taking time to plan it right", icon: <Clock className="w-5 h-5" /> },
        { label: "6-12 months", description: "Looking forward to next year", icon: <Clock className="w-5 h-5" /> },
        { label: "Just exploring options", description: "Curious about what's possible", icon: <Sparkles className="w-5 h-5" /> },
      ]
    },
    {
      id: 2,
      question: "How long do you plan to stay?",
      subtitle: "The duration helps us craft the perfect itinerary length",
      icon: <Calendar className="w-6 h-6" />,
      options: [
        { label: "3-5 days", description: "A quick getaway to experience highlights", icon: <Clock className="w-5 h-5" /> },
        { label: "5-7 days", description: "Perfect for a well-rounded experience", icon: <Clock className="w-5 h-5" /> },
        { label: "7-10 days", description: "Explore multiple regions comfortably", icon: <Clock className="w-5 h-5" /> },
        { label: "10-14 days", description: "Deep dive into Sri Lankan culture", icon: <Clock className="w-5 h-5" /> },
        { label: "More than 2 weeks", description: "The ultimate comprehensive journey", icon: <Clock className="w-5 h-5" /> },
      ]
    },
    {
      id: 3,
      question: "What type of traveler are you?",
      subtitle: "Understanding your travel style helps us personalize your experience",
      icon: <Users className="w-6 h-6" />,
      options: [
        { label: "Solo traveler", description: "Freedom to explore at your own pace", image: travelerSolo },
        { label: "Couple", description: "Romantic escapes and shared adventures", image: travelerCouple },
        { label: "Family with kids", description: "Fun-filled activities for all ages", image: travelerFamily },
        { label: "Group of friends", description: "Unforgettable memories together", image: travelerFriends },
        { label: "Business traveler", description: "Efficient with time for leisure", icon: <Users className="w-5 h-5" /> },
      ]
    },
    {
      id: 4,
      question: "What interests you most?",
      subtitle: "Select your passion and we'll curate experiences around it",
      icon: <Sparkles className="w-6 h-6" />,
      options: [
        { label: "Beaches & Relaxation", description: "Sun, sand, and tranquil waters", image: questionBeach },
        { label: "Wildlife & Nature", description: "Safari adventures and natural wonders", image: interestWildlife },
        { label: "Cultural & Historical Sites", description: "Ancient temples and heritage sites", image: interestCulture },
        { label: "Adventure & Sports", description: "Surfing, hiking, and thrilling activities", image: interestAdventure },
        { label: "Food & Local Experiences", description: "Culinary journeys and authentic tastes", image: interestFood },
      ]
    },
    {
      id: 5,
      question: "What's your accommodation preference?",
      subtitle: "From luxury resorts to eco-retreats, we have options for every style",
      icon: <MapPin className="w-6 h-6" />,
      options: [
        { label: "Luxury Hotels & Resorts", description: "5-star amenities and world-class service", image: accommodationLuxury },
        { label: "Mid-range Hotels", description: "Comfort and value combined", icon: <MapPin className="w-5 h-5" /> },
        { label: "Boutique Guesthouses", description: "Unique charm and personal touch", image: accommodationBoutique },
        { label: "Eco-lodges", description: "Sustainable stays in nature", image: accommodationEco },
        { label: "Budget-friendly options", description: "Great experiences at great prices", icon: <DollarSign className="w-5 h-5" /> },
      ]
    },
    {
      id: 6,
      question: "What's your budget per person?",
      subtitle: "Help us recommend experiences that match your investment",
      icon: <DollarSign className="w-6 h-6" />,
      options: [
        { label: "Under $1,000", description: "Budget-conscious adventures", icon: <DollarSign className="w-5 h-5" /> },
        { label: "$1,000 - $2,000", description: "Great value with quality experiences", icon: <DollarSign className="w-5 h-5" /> },
        { label: "$2,000 - $3,500", description: "Premium experiences and comfort", icon: <DollarSign className="w-5 h-5" /> },
        { label: "$3,500 - $5,000", description: "Luxury touches throughout", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Above $5,000", description: "No limits, ultimate luxury", icon: <DollarSign className="w-5 h-5" /> },
      ]
    },
    {
      id: 7,
      question: "Do you need transportation services?",
      subtitle: "We can arrange seamless travel throughout your journey",
      icon: <Car className="w-6 h-6" />,
      options: [
        { label: "Yes, private car with driver", description: "Maximum comfort and flexibility", image: transportPrivate },
        { label: "Yes, shared tours", description: "Meet fellow travelers along the way", icon: <Users className="w-5 h-5" /> },
        { label: "Yes, airport transfers only", description: "Start and end smoothly", icon: <Car className="w-5 h-5" /> },
        { label: "No, I'll arrange my own", description: "Independent exploration", icon: <Car className="w-5 h-5" /> },
        { label: "Not sure yet", description: "Let's discuss the options", icon: <Sparkles className="w-5 h-5" /> },
      ]
    }
  ];

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = [...answers];
      newAnswers[currentStep] = {
        question: questions[currentStep].question,
        answer: selectedOption
      };
      setAnswers(newAnswers);
      
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(newAnswers[currentStep + 1]?.answer || "");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOption(answers[currentStep - 1]?.answer || "");
    }
  };
  const downloadPDF = () => {
  const itinerary = generateItinerary();
  const interests = answers.find(a => a.question.includes("interests you"))?.answer || "Cultural & Historical Sites";
  
  // Create HTML content for PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sri Lanka Travel Itinerary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #f97316;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #134e4a;
          font-size: 32px;
          margin: 0 0 10px 0;
        }
        .header p {
          color: #666;
          font-size: 18px;
          margin: 5px 0;
        }
        .preferences {
          background: #f0fdfa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .preferences h2 {
          color: #134e4a;
          margin-top: 0;
          font-size: 20px;
        }
        .pref-item {
          margin: 10px 0;
          padding: 10px;
          background: white;
          border-left: 4px solid #f97316;
          border-radius: 5px;
        }
        .pref-question {
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 5px;
        }
        .pref-answer {
          font-weight: bold;
          color: #134e4a;
        }
        .itinerary {
          margin-top: 30px;
        }
        .itinerary h2 {
          color: #134e4a;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .day {
          margin: 20px 0;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          page-break-inside: avoid;
        }
        .day-number {
          background: #f97316;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          margin-bottom: 10px;
        }
        .day-title {
          color: #134e4a;
          font-size: 20px;
          font-weight: bold;
          margin: 10px 0;
        }
        .day-description {
          color: #666;
          margin: 10px 0;
          line-height: 1.6;
        }
        .day-location {
          color: #f97316;
          font-weight: bold;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌴 Lanka Vacations</h1>
        <p>Your Personalized Sri Lanka Journey</p>
        <p>${itinerary.length}-Day ${interests} Adventure</p>
      </div>

      <div class="preferences">
        <h2>✨ Your Travel Preferences</h2>
        ${answers.map(answer => `
          <div class="pref-item">
            <div class="pref-question">${answer.question}</div>
            <div class="pref-answer">${answer.answer}</div>
          </div>
        `).join('')}
      </div>

      <div class="itinerary">
        <h2>📅 Day-by-Day Itinerary</h2>
        ${itinerary.map(day => `
          <div class="day">
            <div class="day-number">Day ${day.day}</div>
            <div class="day-title">${day.title}</div>
            <div class="day-description">${day.description}</div>
            <div class="day-location">📍 ${day.location}</div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p><strong>Lanka Vacations</strong> - Luxury Travel Since 2020</p>
        <p>📧 info@lankavacations.com | 📞 +94 77 123 4567</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };

    toast({
      title: "PDF Ready!",
      description: "Your itinerary is ready to download. The print dialog will open automatically.",
    });
  } else {
    toast({
      title: "Pop-up Blocked",
      description: "Please allow pop-ups for this site to download the PDF.",
      variant: "destructive",
    });
  }
};

  const handleSubmit = () => {
    if (selectedOption) {
      const newAnswers = [...answers];
      newAnswers[currentStep] = {
        question: questions[currentStep].question,
        answer: selectedOption
      };
      setAnswers(newAnswers);
      setCurrentStep(questions.length);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  const generateItinerary = () => {
    const interests = answers.find(a => a.question.includes("interests you"))?.answer || "Cultural & Historical Sites";
    
    const itineraries: { [key: string]: any[] } = {
      "Beaches & Relaxation": [
        { day: 1, title: "Arrival in Colombo", description: "Transfer to Negombo beach resort, relax and acclimatize", location: "Negombo" },
        { day: 2, title: "Negombo Beach Day", description: "Water sports, beach activities, and sunset cruise", location: "Negombo" },
        { day: 3, title: "Transfer to Bentota", description: "Explore pristine Bentota beaches and water activities", location: "Bentota" },
        { day: 4, title: "Bentota Beach Activities", description: "Surfing, snorkeling, jet skiing, and spa treatments", location: "Bentota" },
        { day: 5, title: "Galle Fort Exploration", description: "Historic Galle Fort, colonial architecture, cafes", location: "Galle" },
        { day: 6, title: "Mirissa Whale Watching", description: "Early morning whale watching and beach relaxation", location: "Mirissa" },
        { day: 7, title: "Return to Colombo", description: "Shopping, city tour, and departure", location: "Colombo" }
      ],
      "Cultural & Historical Sites": [
        { day: 1, title: "Colombo Heritage Tour", description: "Colonial architecture, temples, and local markets", location: "Colombo" },
        { day: 2, title: "Anuradhapura Ancient City", description: "Sacred city with ancient stupas and monasteries", location: "Anuradhapura" },
        { day: 3, title: "Sigiriya & Dambulla", description: "Rock fortress and UNESCO cave temple complex", location: "Sigiriya" },
        { day: 4, title: "Polonnaruwa Ruins", description: "Medieval capital with palace and Buddha statues", location: "Polonnaruwa" },
        { day: 5, title: "Kandy Sacred City", description: "Temple of the Tooth, cultural dance show", location: "Kandy" },
        { day: 6, title: "Galle Dutch Fort", description: "UNESCO World Heritage colonial architecture", location: "Galle" },
        { day: 7, title: "Colombo & Departure", description: "National Museum, Gangaramaya Temple, shopping", location: "Colombo" }
      ],
      "Wildlife & Nature": [
        { day: 1, title: "Arrival & Transfer", description: "Colombo to Habarana, nature resort check-in", location: "Habarana" },
        { day: 2, title: "Minneriya Safari", description: "Famous elephant gathering, bird watching", location: "Minneriya" },
        { day: 3, title: "Sigiriya & Pidurangala", description: "Ancient rock fortress and sunrise hike", location: "Sigiriya" },
        { day: 4, title: "Knuckles Range Trek", description: "Cloud forests and endemic wildlife", location: "Knuckles" },
        { day: 5, title: "Yala National Park", description: "Leopard safari and coastal wildlife", location: "Yala" },
        { day: 6, title: "Udawalawe Safari", description: "Elephant herds and grassland ecosystem", location: "Udawalawe" },
        { day: 7, title: "Return to Colombo", description: "Wetland bird sanctuary and departure", location: "Colombo" }
      ],
      "Adventure & Sports": [
        { day: 1, title: "Arrival & Adventure Base", description: "Colombo to Kitulgala adventure camp", location: "Kitulgala" },
        { day: 2, title: "White Water Rafting", description: "Grade 3-4 rapids on Kelani River", location: "Kitulgala" },
        { day: 3, title: "Ella Rock Trek", description: "Scenic hike with stunning valley views", location: "Ella" },
        { day: 4, title: "Nine Arch Bridge Trek", description: "Famous railway bridge and tea plantations", location: "Ella" },
        { day: 5, title: "Arugam Bay Surfing", description: "World-class surf breaks and lessons", location: "Arugam Bay" },
        { day: 6, title: "Mirissa Beach Activities", description: "Snorkeling, diving, and whale watching", location: "Mirissa" },
        { day: 7, title: "Return to Colombo", description: "Final adventure activities and departure", location: "Colombo" }
      ],
      "Food & Local Experiences": [
        { day: 1, title: "Colombo Food Tour", description: "Street food, local markets, cooking class", location: "Colombo" },
        { day: 2, title: "Negombo Fish Market", description: "Fresh seafood, local fishing traditions", location: "Negombo" },
        { day: 3, title: "Kandy Culinary Journey", description: "Traditional Kandyan cuisine, spice gardens", location: "Kandy" },
        { day: 4, title: "Tea Country Experience", description: "Tea tasting, plantation visit, farm-to-table", location: "Nuwara Eliya" },
        { day: 5, title: "Village Cooking Class", description: "Traditional recipes with local families", location: "Sigiriya" },
        { day: 6, title: "Galle Food Heritage", description: "Colonial influences and coastal flavors", location: "Galle" },
        { day: 7, title: "Colombo Farewell Dinner", description: "Fine dining and food souvenirs", location: "Colombo" }
      ],
    };

    return itineraries[interests] || itineraries["Cultural & Historical Sites"];
  };

  // Thank you page
  if (currentStep === questions.length && !showItinerary) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-3xl shadow-elegant p-8 md:p-12">
              <div className="text-center mb-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="text-accent" size={48} />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                  Thank You!
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  We've received your preferences and are excited to help plan your Sri Lankan adventure!
                </p>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-6 text-foreground flex items-center gap-2">
                  <Sparkles className="text-accent" size={20} />
                  Your Preferences Summary
                </h3>
                <div className="grid gap-3">
                  {answers.map((answer, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl p-4 border-l-4 border-accent shadow-soft"
                    >
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{answer.question}</p>
                      <p className="font-semibold text-foreground">{answer.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowItinerary(true)}
                  variant="accent"
                  size="xl"
                  className="flex-1"
                >
                  <Sparkles size={20} />
                  Generate Itinerary
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                  size="xl"
                  className="flex-1"
                >
                  Return Home
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Itinerary display
  if (currentStep === questions.length && showItinerary) {
    const itinerary = generateItinerary();

    return (
      <div className="min-h-screen bg-gradient-dark py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4"
              >
                Your Personalized Journey
              </motion.h2>
              <p className="text-primary-foreground/80 text-lg">
                {itinerary.length}-day adventure crafted just for you
              </p>
            </div>

            <div className="bg-card rounded-3xl shadow-elegant p-8 mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Calendar className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Day-by-Day Itinerary</h3>
                  <p className="text-muted-foreground text-sm">Your complete travel plan</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {itinerary.map((day, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground font-bold text-lg shadow-accent group-hover:scale-110 transition-transform">
                        {day.day}
                      </div>
                    </div>
                    <div className="flex-grow bg-secondary/50 rounded-2xl p-5 hover:shadow-soft transition-all border border-border/50">
                      <h4 className="font-bold text-lg text-foreground mb-2">{day.title}</h4>
                      <p className="text-muted-foreground mb-3">{day.description}</p>
                      <div className="flex items-center gap-2 text-accent text-sm font-medium">
                        <MapPin size={14} />
                        <span>{day.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="accent" 
                size="xl"
                onClick={downloadPDF}
                className="gap-2"
              >
                <Download size={20} />
                Download PDF
              </Button>
              <Button 
                variant="glass" 
                size="xl"
                onClick={() => navigate("/")}
              >
                Return Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const hasImages = currentQuestion.options.some(opt => opt.image);

  // Questionnaire
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      
      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          onClick={() => navigate("/")}
          variant="glass"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.p 
              key={`subtitle-${currentStep}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-accent font-medium mb-3 tracking-widest text-sm uppercase"
            >
              Plan Your Trip
            </motion.p>
            <motion.h1 
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-4"
            >
              Create Your Perfect Journey
            </motion.h1>
          </div>

          {/* Progress */}
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-primary-foreground/80 text-sm font-medium">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-accent font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-3xl shadow-elegant overflow-hidden"
            >
              {/* Question Header with Background Image */}
              {currentQuestion.backgroundImage && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={currentQuestion.backgroundImage} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-foreground">
                        {currentQuestion.icon}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Question {currentStep + 1}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-10">
                {!currentQuestion.backgroundImage && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      {currentQuestion.icon}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Question {currentStep + 1}
                    </span>
                  </div>
                )}

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                  {currentQuestion.question}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {currentQuestion.subtitle}
                </p>

                {/* Options Grid */}
                <div className={`grid gap-4 ${hasImages ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {currentQuestion.options.map((option, idx) => (
                    <motion.button
                      key={option.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedOption(option.label)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left ${
                        selectedOption === option.label
                          ? "border-accent bg-accent/5 shadow-accent scale-[1.02]"
                          : "border-border hover:border-accent/50 hover:bg-secondary/50"
                      }`}
                    >
                      {option.image ? (
                        <>
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={option.image} 
                              alt={option.label}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="font-bold text-primary-foreground mb-1">{option.label}</p>
                            <p className="text-primary-foreground/80 text-sm">{option.description}</p>
                          </div>
                          {selectedOption === option.label && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-glow">
                              <Check className="text-accent-foreground" size={16} />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-5 flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedOption === option.label 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-secondary text-secondary-foreground"
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground mb-1">{option.label}</p>
                            <p className="text-muted-foreground text-sm">{option.description}</p>
                          </div>
                          {selectedOption === option.label && (
                            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="text-accent-foreground" size={14} />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4 mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="glass"
              size="lg"
              className="gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </Button>

            {currentStep === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption}
                variant="accent"
                size="lg"
                className="gap-2"
              >
                Submit
                <Check size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                variant="accent"
                size="lg"
                className="gap-2"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
