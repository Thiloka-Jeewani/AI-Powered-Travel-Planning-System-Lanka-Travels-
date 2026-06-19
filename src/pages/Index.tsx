// Index.tsx
import { useState } from "react";
import Navbar from "@/components/Navbar";
import PlanYourTravel from "@/components/PlanYourTravel";
import AboutUs from "@/components/AboutUs";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import PackageList from "@/components/PackageList";
import PackageDetail from "@/components/PackageDetail";
import BookingModal from "@/components/BookingModal";
import WhySriLanka from "@/components/WhySriLanka";
import Destinations from "@/components/Destinations";
import ReviewSystem from "@/components/ReviewSystem"; // ADD THIS IMPORT
import { Package } from "@/types";

const Index = () => {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<Package | null>(null);

    const handlePackageSelect = (pkg: Package) => {
        setSelectedPackage(pkg);
    };

    const handleBookNow = (pkg: Package) => {
        setSelectedPackageForBooking(pkg);
        setShowBookingModal(true);
    };

    const handleBackToList = () => {
        setSelectedPackage(null);
    };

    const handleBookingComplete = () => {
        setShowBookingModal(false);
        setSelectedPackageForBooking(null);
    };

    if (selectedPackage) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <PackageDetail
                    packageId={selectedPackage.package_id}
                    onBookNow={handleBookNow}
                    onBack={handleBackToList}
                />
                <Footer />
                {selectedPackageForBooking && (
                    <BookingModal
                        package={selectedPackageForBooking}
                        isOpen={showBookingModal}
                        onClose={() => setShowBookingModal(false)}
                        onBookingComplete={handleBookingComplete}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <section id="home">
                <PlanYourTravel />
            </section>

            {/* PACKAGES NOW COME RIGHT AFTER QUESTIONNAIRE */}
            <section id="tours">
                <PackageList
                    onPackageSelect={handlePackageSelect}
                    onBookNow={handleBookNow}
                />
            </section>

            {/* OTHER SECTIONS */}
            <section id="whysrilanka">
                <WhySriLanka />
            </section>

            <section id="destinations">
                <Destinations />
            </section>

            {/* ADD REVIEWS SECTION HERE */}
            <section id="reviews" className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <ReviewSystem /> {/* ADD THIS COMPONENT */}
                </div>
            </section>

            <section id="populartours">
                {/* This is currently empty */}
            </section>

            <section id="about">
                <AboutUs />
            </section>

            <section id="contact">
                <ContactSection />
            </section>

            <Footer />
            {selectedPackageForBooking && (
                <BookingModal
                    package={selectedPackageForBooking}
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    onBookingComplete={handleBookingComplete}
                />
            )}
        </div>
    );
};

export default Index;