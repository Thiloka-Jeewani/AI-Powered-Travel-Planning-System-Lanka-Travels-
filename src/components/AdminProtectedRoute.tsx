import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdminAuth();
    }, []);

    const checkAdminAuth = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const username = localStorage.getItem('admin_username');

            console.log('🔍 AdminProtectedRoute - Checking auth...');
            console.log('Token:', token);
            console.log('Username:', username);

            // SIMPLE CHECK - Just verify we have the items
            if (!token || !username) {
                console.log('❌ Missing token or username');
                setIsAuthenticated(false);
            } else {
                console.log('✅ Token and username found');

                // Try to validate with server (optional)
                try {
                    const response = await fetch(`http://localhost:5001/api/admin/check?token=${token}&username=${username}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Server validation:', data);
                        setIsAuthenticated(data.isAuthenticated);
                    } else {
                        console.log('⚠️ Using local validation (server check failed)');
                        setIsAuthenticated(true); // Fallback to local validation
                    }
                } catch (serverError) {
                    console.log('⚠️ Server unavailable, using local validation');
                    setIsAuthenticated(true); // Fallback to local validation
                }
            }
        } catch (error) {
            console.error('Admin auth check error:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    console.log(`🔐 AdminProtectedRoute result: isAuthenticated = ${isAuthenticated}`);

    if (!isAuthenticated) {
        console.log('🚫 Redirecting to /ap');
        return <Navigate to="/ap" replace />;
    }

    console.log('✅ Rendering admin dashboard');
    return <>{children}</>;
};

export default AdminProtectedRoute;