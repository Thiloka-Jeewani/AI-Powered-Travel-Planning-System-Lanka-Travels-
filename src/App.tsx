import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PlanYourTravel from "./pages/PlanYourTravel";
import MapTest from "./pages/MapTest";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

// Import package components
import PackageList from "./components/PackageList";
import PackageDetail from "./components/PackageDetail";
import BookingForm from "./components/BookingForm";

// Import authentication pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import View Dashboard component
import ViewDashboard from "./pages/ViewDashboard";

// Import hotel booking components
import HotelBooking from "./pages/HotelBooking";
import HotelDetails from "./pages/HotelDetails";

// Import Review System components
import ReviewSystem from "@/components/ReviewSystem";
import ReviewsPage from "@/pages/ReviewsPage";

// Import new IT Support and Admin Panel components
import ITSupportPage from "./pages/ITSupportPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="lanka-vacations-theme">
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <Routes>
                            {/* ========== DEFAULT ROUTE TO LOGIN ========== */}
                            <Route path="/" element={<Navigate to="/login" replace />} />

                            {/* ========== AUTHENTICATION ROUTES ========== */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/ap" element={<AdminLoginPage />} />

                            {/* ========== PROTECTED ROUTES (USER) ========== */}
                            <Route path="/home" element={
                                <ProtectedRoute>
                                    <Index />
                                </ProtectedRoute>
                            } />

                            <Route path="/update-profile" element={
                                <ProtectedRoute>
                                    <UpdateProfilePage />
                                </ProtectedRoute>
                            } />

                            <Route path="/view" element={
                                <ProtectedRoute>
                                    <ViewDashboard />
                                </ProtectedRoute>
                            } />

                            {/* ========== IT SUPPORT ROUTES ========== */}
                            <Route path="/it-support" element={
                                <ProtectedRoute>
                                    <ITSupportPage />
                                </ProtectedRoute>
                            } />

                            {/* ========== ADMIN PROTECTED ROUTES ========== */}
                            <Route path="/admin-dashboard" element={
                                <AdminProtectedRoute>
                                    <AdminDashboard />
                                </AdminProtectedRoute>
                            } />

                            {/* ========== REVIEW SYSTEM ROUTES ========== */}
                            <Route path="/reviews" element={
                                <ProtectedRoute>
                                    <ReviewsPage />
                                </ProtectedRoute>
                            } />

                            {/* ========== HOTEL BOOKING ROUTES ========== */}
                            <Route path="/book-hotel" element={
                                <ProtectedRoute>
                                    <HotelBooking />
                                </ProtectedRoute>
                            } />

                            <Route path="/hotel/:hotelId" element={
                                <ProtectedRoute>
                                    <HotelDetails />
                                </ProtectedRoute>
                            } />

                            {/* ========== TRAVEL PLANNING ROUTES ========== */}
                            <Route path="/plan-your-travel" element={<PlanYourTravel />} />
                            <Route path="/map-test" element={<MapTest />} />

                            {/* ========== PACKAGE ROUTES ========== */}
                            <Route path="/packages" element={<PackageList />} />
                            <Route path="/package/:packageId" element={<PackageDetail />} />
                            <Route path="/book/:packageId" element={<BookingForm />} />

                            {/* ========== LEGACY/OTHER ROUTES ========== */}
                            <Route path="/auth" element={<Auth />} />

                            {/* ========== 404 ROUTE ========== */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                    <Chatbot />
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;