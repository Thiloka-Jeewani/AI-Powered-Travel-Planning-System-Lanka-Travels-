// src/pages/UpdateProfilePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, User, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        country: "",
        city: "",
        whatsapp_number: "",
        passport_number: "",
        emergency_contact: "",
        date_of_birth: "",
        gender: "prefer_not_to_say",
        travel_preferences: "",
        dietary_restrictions: "",
        profile_image_url: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                phone: user.phone || "",
                country: user.country || "",
                city: user.city || "",
                whatsapp_number: user.whatsapp_number || "",
                passport_number: user.passport_number || "",
                emergency_contact: user.emergency_contact || "",
                date_of_birth: user.date_of_birth?.split('T')[0] || "",
                gender: user.gender || "prefer_not_to_say",
                travel_preferences: user.travel_preferences || "",
                dietary_restrictions: user.dietary_restrictions || "",
                profile_image_url: user.profile_image_url || ""
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.full_name || !formData.phone || !formData.country || !formData.city) {
                throw new Error("Please fill in all required fields");
            }

            // Validate full name (should have at least 2 parts)
            const nameParts = formData.full_name.trim().split(/\s+/);
            if (nameParts.length < 2) {
                throw new Error("Full name should contain at least first name and last name");
            }

            await updateProfile(formData);

            toast({
                title: "Success",
                description: "Profile updated successfully"
            });

            navigate('/');

        } catch (error: any) {
            console.error('Profile update error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <Card className="max-w-md border-orange-200">
                    <CardHeader>
                        <CardTitle className="text-orange-600">Access Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Please log in to update your profile.</p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600"
                        >
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard?tab=settings')}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <Card className="border-orange-200">
                        <CardHeader>
                            <CardTitle className="text-2xl text-gray-900">Update Profile</CardTitle>
                            <CardDescription>
                                Update your personal information and travel preferences
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="md:w-1/3 space-y-4">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="relative">
                                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-4xl font-bold">
                                                    {user?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="absolute bottom-0 right-0 rounded-full border-orange-400 text-orange-600"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium text-gray-900">{user.email}</p>
                                                <p className="text-sm text-gray-600">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-2/3 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="full_name" className="text-gray-700">
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="full_name"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-700">
                                                    Phone Number *
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter your phone number"
                                                    required
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="whatsapp_number" className="text-gray-700">
                                                    WhatsApp Number
                                                </Label>
                                                <Input
                                                    id="whatsapp_number"
                                                    name="whatsapp_number"
                                                    value={formData.whatsapp_number}
                                                    onChange={handleChange}
                                                    placeholder="Enter your WhatsApp number"
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact" className="text-gray-700">
                                                    Emergency Contact
                                                </Label>
                                                <Input
                                                    id="emergency_contact"
                                                    name="emergency_contact"
                                                    value={formData.emergency_contact}
                                                    onChange={handleChange}
                                                    placeholder="Enter emergency contact"
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-gray-700">
                                                    Country *
                                                </Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    placeholder="Enter your country"
                                                    required
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-gray-700">
                                                    City *
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="Enter your city"
                                                    required
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="passport_number" className="text-gray-700">
                                                    Passport Number
                                                </Label>
                                                <Input
                                                    id="passport_number"
                                                    name="passport_number"
                                                    value={formData.passport_number}
                                                    onChange={handleChange}
                                                    placeholder="Enter your passport number"
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth" className="text-gray-700">
                                                    Date of Birth
                                                </Label>
                                                <Input
                                                    id="date_of_birth"
                                                    name="date_of_birth"
                                                    type="date"
                                                    value={formData.date_of_birth}
                                                    onChange={handleChange}
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gender" className="text-gray-700">
                                                    Gender
                                                </Label>
                                                <Select
                                                    value={formData.gender}
                                                    onValueChange={(value) => handleSelectChange("gender", value)}
                                                >
                                                    <SelectTrigger className="border-orange-200 focus:border-orange-500">
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

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="travel_preferences" className="text-gray-700">
                                                    Travel Preferences
                                                </Label>
                                                <Textarea
                                                    id="travel_preferences"
                                                    name="travel_preferences"
                                                    value={formData.travel_preferences}
                                                    onChange={handleChange}
                                                    placeholder="Tell us about your travel preferences (e.g., adventure, luxury, budget, cultural)"
                                                    rows={3}
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="dietary_restrictions" className="text-gray-700">
                                                    Dietary Restrictions
                                                </Label>
                                                <Textarea
                                                    id="dietary_restrictions"
                                                    name="dietary_restrictions"
                                                    value={formData.dietary_restrictions}
                                                    onChange={handleChange}
                                                    placeholder="Any dietary restrictions or allergies?"
                                                    rows={2}
                                                    className="border-orange-200 focus:border-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between border-t pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/dashboard?tab=settings')}
                                    className="border-orange-400 text-orange-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfilePage;