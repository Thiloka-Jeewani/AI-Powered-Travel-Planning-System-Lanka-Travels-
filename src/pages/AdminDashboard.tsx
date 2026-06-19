import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    BarChart3,
    PieChart,
    Users,
    DollarSign,
    Package,
    Hotel,
    Calendar,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    Download,
    RefreshCw,
    LogOut,
    TrendingUp,
    CreditCard,
    Star,
    FileText,
    Send
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Define API base URL - CHANGE THIS TO YOUR BACKEND URL
const API_BASE_URL = 'http://localhost:5001'; // Your backend port

interface DashboardStats {
    total_bookings: number;
    total_revenue: number;
    active_users: number;
    total_reviews: number;
    open_tickets: number;
    in_progress_tickets: number;
    hotel_bookings: number;
    itinerary_requests: number;
    active_packages: number;
    active_hotels: number;
}

interface ITTicket {
    ticket_id: string;
    title: string;
    description: string;
    issue_category: string;
    priority: string;
    status: string;
    user_full_name: string;
    user_email: string;
    created_at: string;
    message_count: number;
    days_open: number;
    unread_messages?: number;
}

interface RevenueData {
    month: string;
    revenue: number;
}

interface BookingTrend {
    date: string;
    bookings: number;
}

interface PopularPackage {
    package_name: string;
    booking_count: number;
    revenue: number;
}

interface DashboardData {
    success: boolean;
    stats: DashboardStats;
    revenueData: RevenueData[];
    bookingTrends: BookingTrend[];
    popularPackages: PopularPackage[];
}

interface TicketsData {
    success: boolean;
    tickets: ITTicket[];
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<ITTicket[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
    const [popularPackages, setPopularPackages] = useState<PopularPackage[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
    const [adminMessage, setAdminMessage] = useState("");
    const [ticketMessages, setTicketMessages] = useState<any[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const adminUsername = localStorage.getItem('admin_username');
    const adminRole = localStorage.getItem('admin_role');
    const adminToken = localStorage.getItem('admin_token');

    useEffect(() => {
        if (!adminUsername || !adminToken) {
            toast.error('Please login as admin first');
            navigate('/admin-login');
            return;
        }
        loadDashboardData();
    }, [adminUsername, adminToken, navigate]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load dashboard stats
            const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`);

            if (!statsResponse.ok) {
                throw new Error(`Dashboard stats failed: ${statsResponse.status}`);
            }

            const statsData: DashboardData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
                setRevenueData(statsData.revenueData || []);
                setBookingTrends(statsData.bookingTrends || []);
                setPopularPackages(statsData.popularPackages || []);
            } else {
                toast.error('Failed to load dashboard stats');
            }

            // Load tickets
            const ticketsResponse = await fetch(`${API_BASE_URL}/api/admin/it-tickets?limit=10`);

            if (ticketsResponse.ok) {
                const ticketsData: TicketsData = await ticketsResponse.json();
                if (ticketsData.success) {
                    setTickets(ticketsData.tickets || []);
                }
            }


        } finally {
            setLoading(false);
        }
    };

    const loadTicketMessages = async (ticketId: string) => {
        if (!ticketId) return;

        setMessagesLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/it-support/tickets/${ticketId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTicketMessages(data.messages || []);
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleSelectTicket = async (ticket: ITTicket) => {
        setSelectedTicket(ticket);
        await loadTicketMessages(ticket.ticket_id);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_role');
        toast.success('Logged out successfully');
        navigate('/admin-login');
    };

    const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/it-tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    admin_username: adminUsername,
                    status: status
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Ticket status updated');
                loadDashboardData(); // Refresh the list
                if (selectedTicket?.ticket_id === ticketId) {
                    setSelectedTicket(prev => prev ? { ...prev, status } : null);
                }
            } else {
                toast.error(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket status');
        }
    };

    const handleSendAdminMessage = async () => {
        if (!selectedTicket || !adminMessage.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/it-tickets/${selectedTicket.ticket_id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    admin_username: adminUsername,
                    message_text: adminMessage
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Message sent');
                setAdminMessage("");
                // Refresh messages
                await loadTicketMessages(selectedTicket.ticket_id);
                // Refresh tickets list
                loadDashboardData();
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Welcome back, <span className="font-semibold">{adminUsername}</span> ({adminRole})
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            onClick={loadDashboardData}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.info('Export feature coming soon')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <h3 className="text-2xl font-bold mt-2">
                                        {formatCurrency(stats?.total_revenue || 0)}
                                    </h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        <TrendingUp className="inline h-4 w-4 mr-1" />
                                        +12.5% from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                    <h3 className="text-2xl font-bold mt-2">
                                        {stats?.total_bookings?.toLocaleString() || 0}
                                    </h3>
                                    <p className="text-sm text-blue-600 mt-1">
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Package & Hotel bookings
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <h3 className="text-2xl font-bold mt-2">
                                        {stats?.active_users?.toLocaleString() || 0}
                                    </h3>
                                    <p className="text-sm text-purple-600 mt-1">
                                        <Users className="inline h-4 w-4 mr-1" />
                                        Registered accounts
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                                    <h3 className="text-2xl font-bold mt-2">
                                        {(stats?.open_tickets || 0) + (stats?.in_progress_tickets || 0)}
                                    </h3>
                                    <p className="text-sm text-orange-600 mt-1">
                                        <AlertTriangle className="inline h-4 w-4 mr-1" />
                                        Need attention
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Tickets */}
                <Tabs defaultValue="overview" className="mb-8">
                    <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        <TabsTrigger value="tickets">IT Tickets</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Trend</CardTitle>
                                    <CardDescription>Last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                                                    labelFormatter={(label) => `Month: ${label}`}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#f97316"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Distribution</CardTitle>
                                    <CardDescription>By service type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Packages', value: stats?.total_bookings || 0, color: '#f97316' },
                                                        { name: 'Hotels', value: stats?.hotel_bookings || 0, color: '#3b82f6' },
                                                        { name: 'Itineraries', value: stats?.itinerary_requests || 0, color: '#8b5cf6' }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Packages', value: stats?.total_bookings || 0, color: '#f97316' },
                                                        { name: 'Hotels', value: stats?.hotel_bookings || 0, color: '#3b82f6' },
                                                        { name: 'Itineraries', value: stats?.itinerary_requests || 0, color: '#8b5cf6' }
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="revenue">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Analytics</CardTitle>
                                <CardDescription>Detailed revenue breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#f97316"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Trends</CardTitle>
                                <CardDescription>Daily booking activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={bookingTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="bookings"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tickets">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>IT Support Tickets</CardTitle>
                                                <CardDescription>
                                                    Manage user support requests ({tickets.length} total)
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={loadDashboardData}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {tickets.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        No Tickets Found
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        There are currently no support tickets.
                                                    </p>
                                                </div>
                                            ) : (
                                                tickets.map(ticket => (
                                                    <Card
                                                        key={ticket.ticket_id}
                                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                                            selectedTicket?.ticket_id === ticket.ticket_id
                                                                ? 'border-orange-500 border-2'
                                                                : ''
                                                        }`}
                                                        onClick={() => handleSelectTicket(ticket)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h4 className="font-semibold text-gray-900">
                                                                            {ticket.title}
                                                                        </h4>
                                                                        <Badge className={getPriorityColor(ticket.priority)}>
                                                                            {ticket.priority}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                                        {ticket.description}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />
                                                                            {ticket.user_full_name || 'User'}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <MessageSquare className="h-3 w-3" />
                                                                            {ticket.message_count || 0} messages
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            {ticket.days_open || 0} days open
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4 flex flex-col items-end gap-2">
                                                                    <Badge className={getStatusColor(ticket.status)}>
                                                                        {ticket.status.replace('_', ' ')}
                                                                    </Badge>
                                                                    {ticket.unread_messages && ticket.unread_messages > 0 && (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            {ticket.unread_messages} new
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                {selectedTicket ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Ticket Details</CardTitle>
                                            <CardDescription>
                                                {selectedTicket.ticket_id} • Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{selectedTicket.title}</h4>
                                                <p className="text-sm text-gray-600 mt-2">{selectedTicket.description}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">User</p>
                                                    <p className="text-sm font-medium">{selectedTicket.user_full_name}</p>
                                                    <p className="text-xs text-gray-600">{selectedTicket.user_email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Category</p>
                                                    <p className="text-sm font-medium">{selectedTicket.issue_category}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Priority</p>
                                                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                                                        {selectedTicket.priority}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Messages Section */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Conversation</h4>
                                                {messagesLoading ? (
                                                    <div className="text-center py-4">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                                    </div>
                                                ) : ticketMessages.length > 0 ? (
                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                        {ticketMessages.map((msg, index) => (
                                                            <div
                                                                key={index}
                                                                className={`p-3 rounded-lg ${
                                                                    msg.sender_type === 'admin'
                                                                        ? 'bg-orange-50 border border-orange-100'
                                                                        : 'bg-gray-50 border border-gray-100'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-xs font-medium">
                                                                        {msg.sender_type === 'admin' ? 'Admin' : 'User'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm mt-1">{msg.message_text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">
                                                        No messages yet
                                                    </p>
                                                )}
                                            </div>

                                            <Separator />

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedTicket.status === 'in_progress' ? "default" : "outline"}
                                                        onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_id, 'in_progress')}
                                                        disabled={selectedTicket.status === 'in_progress'}
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        In Progress
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={selectedTicket.status === 'resolved' ? "default" : "outline"}
                                                        onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_id, 'resolved')}
                                                        disabled={selectedTicket.status === 'resolved'}
                                                    >
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Resolved
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="col-span-2"
                                                        onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_id, 'closed')}
                                                        disabled={selectedTicket.status === 'closed'}
                                                    >
                                                        Close Ticket
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Send Response</h4>
                                                <textarea
                                                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    rows={3}
                                                    placeholder="Type your response here..."
                                                    value={adminMessage}
                                                    onChange={(e) => setAdminMessage(e.target.value)}
                                                />
                                                <Button
                                                    className="w-full mt-2"
                                                    onClick={handleSendAdminMessage}
                                                    disabled={!adminMessage.trim()}
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Response
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Select a Ticket
                                            </h3>
                                            <p className="text-gray-600">
                                                Click on a ticket to view details and respond
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full mr-4">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Packages</p>
                                    <h3 className="text-xl font-bold mt-1">{stats?.active_packages || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mr-4">
                                    <Hotel className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Hotels</p>
                                    <h3 className="text-xl font-bold mt-1">{stats?.active_hotels || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mr-4">
                                    <Star className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                                    <h3 className="text-xl font-bold mt-1">{stats?.total_reviews || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Popular Packages Table */}
                {popularPackages.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Most Popular Packages</CardTitle>
                            <CardDescription>Top 5 packages by bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Package Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Bookings</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Avg per Booking</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {popularPackages.map((pkg, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{pkg.package_name}</td>
                                            <td className="py-3 px-4">{pkg.booking_count}</td>
                                            <td className="py-3 px-4">{formatCurrency(pkg.revenue)}</td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(pkg.revenue / (pkg.booking_count || 1))}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;