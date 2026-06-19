// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import loginBg from "@/assets/logging.jpeg";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            navigate("/home"); // Redirect to home after login
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Remove the white overlay - only show background image */}

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-orange-200 bg-white/95 backdrop-blur-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-700">
                        Welcome to Lanka Vacations
                        <br />
                        <span className="text-orange-600 font-bold">Your Best Travel Partner</span>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6 animate-fade-in">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-orange-500" />
                                Email Address
                            </label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 border-orange-200 focus:border-orange-500 focus:ring-orange-500 transition-all"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-orange-500" />
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 border-orange-200 focus:border-orange-500 focus:ring-orange-500 pr-10 transition-all"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Password must be at least 6 characters with letters and numbers
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="h-5 w-5" />
                                    Sign In to Your Account
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">New to Lanka Vacations?</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            <span>Create your personalized travel profile</span>
                            <Sparkles className="h-4 w-4 text-orange-500" />
                        </div>

                        <Link to="/register">
                            <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-orange-400 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-500 font-semibold transition-all duration-300"
                            >
                                Create New Account
                            </Button>
                        </Link>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 text-center text-sm text-gray-600">
                    <div className="space-y-2">
                        <p className="font-medium">Need help signing in?</p>
                        <a
                            href="tel:+94777325515"
                            className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1"
                        >
                            Contact Support: +94 777 325 515
                        </a>
                    </div>
                    <p className="text-xs">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;