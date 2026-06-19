// src/pages/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Mail, Lock, User, Phone, MapPin, Globe, Eye, EyeOff, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import loginBg from "@/assets/logging.jpeg";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        phone: "",
        country: "",
        city: "",
        whatsapp_number: "",
        passport_number: "",
        emergency_contact: "",
        date_of_birth: "",
        gender: "",
        travel_preferences: "",
        dietary_restrictions: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Password must be at least 6 characters with letters and numbers";
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Full name validation (at least 2 parts)
        const nameParts = formData.full_name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            newErrors.full_name = "Please enter both first and last name";
        }

        // Phone validation
        const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        // Required fields
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.city) newErrors.city = "City is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Prepare data for API
            const userData = {
                ...formData,
                whatsapp_number: formData.whatsapp_number || formData.phone,
                emergency_contact: formData.emergency_contact || formData.phone,
                gender: formData.gender || "prefer_not_to_say"
            };

            // Remove confirmPassword from data sent to API
            delete (userData as any).confirmPassword;

            await register(userData);
            navigate("/home");
        } catch (err: any) {
            setSubmitError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const countries = [
        "Sri Lanka", "India", "United States", "United Kingdom", "Canada",
        "Australia", "Germany", "France", "Japan", "China", "Singapore", "Malaysia"
    ];

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 py-8"
            style={{
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-orange-50/70 backdrop-blur-sm"></div>

            <Card className="w-full max-w-4xl relative z-10 shadow-2xl border-orange-200 bg-white/95 backdrop-blur-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        Create Your Travel Profile
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-700">
                        Welcome to Lanka Vacations
                        <br />
                        <span className="text-orange-600 font-bold">Your Best Travel Partner</span>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {submitError && (
                        <Alert variant="destructive" className="mb-6 animate-fade-in">
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>
                                    <Input
                                        name="full_name"
                                        placeholder="John Smith"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className={`h-12 ${errors.full_name ? 'border-red-500' : 'border-orange-200'}`}
                                        required
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-500">{errors.full_name}</p>
                                    )}
                                    <p className="text-xs text-gray-500">Enter both first and last name</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Email Address *
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`h-12 ${errors.email ? 'border-red-500' : 'border-orange-200'}`}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Phone Number *
                                        </label>
                                        <Input
                                            name="phone"
                                            placeholder="+94 777 123 456"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`h-12 ${errors.phone ? 'border-red-500' : 'border-orange-200'}`}
                                            required
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            WhatsApp Number
                                        </label>
                                        <Input
                                            name="whatsapp_number"
                                            placeholder="Same as phone"
                                            value={formData.whatsapp_number}
                                            onChange={handleChange}
                                            className="h-12 border-orange-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Passport Number
                                    </label>
                                    <Input
                                        name="passport_number"
                                        placeholder="AB1234567"
                                        value={formData.passport_number}
                                        onChange={handleChange}
                                        className="h-12 border-orange-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Date of Birth
                                        </label>
                                        <Input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="h-12 border-orange-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Gender
                                        </label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, gender: value }))
                                            }
                                        >
                                            <SelectTrigger className={`h-12 ${errors.gender ? 'border-red-500' : 'border-orange-200'}`}>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Security */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Location & Security
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Country *
                                        </label>
                                        <Select
                                            value={formData.country}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, country: value }))
                                            }
                                        >
                                            <SelectTrigger className={`h-12 ${errors.country ? 'border-red-500' : 'border-orange-200'}`}>
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map(country => (
                                                    <SelectItem key={country} value={country}>
                                                        {country}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.country && (
                                            <p className="text-sm text-red-500">{errors.country}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            City *
                                        </label>
                                        <Input
                                            name="city"
                                            placeholder="Colombo"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className={`h-12 ${errors.city ? 'border-red-500' : 'border-orange-200'}`}
                                            required
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Emergency Contact *
                                    </label>
                                    <Input
                                        name="emergency_contact"
                                        placeholder="+94 777 123 456"
                                        value={formData.emergency_contact}
                                        onChange={handleChange}
                                        className="h-12 border-orange-200"
                                    />
                                    <p className="text-xs text-gray-500">Will be used in case of emergencies</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Create Password *
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="At least 6 characters with letters & numbers"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`h-12 pr-10 ${errors.password ? 'border-red-500' : 'border-orange-200'}`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Re-enter your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`h-12 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-orange-200'}`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Travel Preferences */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Travel Preferences
                                    </label>
                                    <Textarea
                                        name="travel_preferences"
                                        placeholder="e.g., Beach vacations, Cultural tours, Adventure activities..."
                                        value={formData.travel_preferences}
                                        onChange={handleChange}
                                        className="min-h-[80px] border-orange-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Dietary Restrictions
                                    </label>
                                    <Textarea
                                        name="dietary_restrictions"
                                        placeholder="e.g., Vegetarian, Allergies, Halal..."
                                        value={formData.dietary_restrictions}
                                        onChange={handleChange}
                                        className="min-h-[80px] border-orange-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                            <Shield className="h-6 w-6 text-orange-600" />
                            <p className="text-sm text-gray-700">
                                Your information is secure with us. We use encryption to protect your data and
                                never share your personal details with third parties.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link to="/login" className="w-1/3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 border-orange-400 text-orange-600 hover:bg-orange-50"
                                >
                                    Back to Login
                                </Button>
                            </Link>

                            <Button
                                type="submit"
                                className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Create My Travel Profile
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center text-center text-sm text-gray-600">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                            Sign in here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;