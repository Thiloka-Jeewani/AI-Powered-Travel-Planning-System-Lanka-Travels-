import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Shield, Loader2 } from "lucide-react";

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        console.log('🔐 Admin login attempt started...');
        console.log('Username:', formData.username);

        // Use the correct backend URL - port 5001
        const API_BASE_URL = 'http://localhost:5001';
        const loginUrl = `${API_BASE_URL}/api/admin/login`;

        try {
            console.log('📤 Sending request to:', loginUrl);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            console.log('📥 Response status:', response.status);

            // Check if response is OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Login response data:', data);

            if (data.success) {
                // Store admin session
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_username', data.username);
                localStorage.setItem('admin_role', data.role);

                console.log('✅ Login successful! Redirecting to /admin-dashboard');
                console.log('Stored token:', data.token);
                console.log('Stored username:', data.username);
                console.log('Stored role:', data.role);

                toast.success('Login successful');

                // Force a small delay to ensure toast shows
                setTimeout(() => {
                    navigate('/admin-dashboard');
                }, 500);

            } else {
                toast.error(data.error || 'Login failed');
            }
        } catch (error: any) {
            console.error('❌ Login error details:', error);
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24">
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto">
                    <Card className="border-gray-800 bg-gray-900 text-white">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full">
                                    <Shield className="h-8 w-8" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Admin Portal</CardTitle>
                            <CardDescription className="text-gray-400">
                                Lanka Vacations Administration System
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Alert className="bg-blue-900/20 border-blue-800">
                                    <AlertDescription className="text-sm">
                                        Use credentials: sliit/sliit123 or admin/admin123
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="bg-gray-800 border-gray-700 text-white"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="bg-gray-800 border-gray-700 text-white pr-10"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4 mr-2" />
                                            Login as Admin
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <p className="text-sm text-gray-400 text-center">
                                    This portal is for authorized administrators only.
                                    <br />
                                    Unauthorized access is strictly prohibited.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;