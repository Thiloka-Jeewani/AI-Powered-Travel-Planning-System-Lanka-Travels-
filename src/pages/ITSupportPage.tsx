import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Search,
    Filter,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Edit,
    Trash2,
    RefreshCw,
    ChevronRight,
    User,
    Calendar,
    Tag,
    AlertCircle,
    X
} from "lucide-react";

interface ITTicket {
    ticket_id: string;
    title: string;
    description: string;
    issue_category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
    message_count: number;
    unread_messages?: number;
    user_email: string;
}

interface TicketMessage {
    message_id: string;
    message_text: string;
    sender_type: 'user' | 'admin';
    sender_name: string;
    created_at: string;
}

// Simple fix: Add your Node.js server URL here
const API_BASE = 'http://localhost:5001';

const ITSupportPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("my-tickets");
    const [tickets, setTickets] = useState<ITTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
    const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });

    // New ticket form
    const [newTicket, setNewTicket] = useState({
        issue_category: '',
        title: '',
        description: '',
        priority: 'medium' as const
    });

    const issueCategories = [
        { value: 'website_bug', label: 'Website Bug' },
        { value: 'booking_issue', label: 'Booking Issue' },
        { value: 'payment_problem', label: 'Payment Problem' },
        { value: 'account_issue', label: 'Account Issue' },
        { value: 'technical_error', label: 'Technical Error' },
        { value: 'feature_request', label: 'Feature Request' },
        { value: 'other', label: 'Other' }
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
    ];

    const statusOptions = [
        { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4" /> },
        { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: <Clock className="h-4 w-4" /> },
        { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
        { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-4 w-4" /> }
    ];

    useEffect(() => {
        if (user?.email) {
            fetchTickets();
        }
    }, [user, filters]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            console.log('Fetching tickets for email:', user?.email);
            // FIXED: Added http://localhost:5001
            const response = await fetch(`${API_BASE}/api/it-support/tickets/by-email/${user?.email}?status=${filters.status}&search=${filters.search}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Tickets data:', data);

            if (data.success) {
                setTickets(data.tickets || []);
            } else {
                toast.error(data.error || 'Failed to load tickets');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketMessages = async (ticketId: string) => {
        try {
            // FIXED: Added http://localhost:5001
            const response = await fetch(`${API_BASE}/api/it-support/tickets/${ticketId}?email=${user?.email}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTicketMessages(data.messages || []);
            } else {
                toast.error(data.error || 'Failed to load messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title || !newTicket.description || !newTicket.issue_category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // FIXED: Added http://localhost:5001
            const response = await fetch(`${API_BASE}/api/it-support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.user_id,
                    user_email: user?.email,
                    user_name: user?.full_name,
                    ...newTicket
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Ticket created successfully');
                setNewTicket({
                    issue_category: '',
                    title: '',
                    description: '',
                    priority: 'medium'
                });
                setShowNewTicket(false);
                fetchTickets();
            } else {
                toast.error(data.error || 'Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            toast.error('Failed to create ticket');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            // FIXED: Added http://localhost:5001
            const response = await fetch(`${API_BASE}/api/it-support/tickets/${selectedTicket.ticket_id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user?.email,
                    message_text: newMessage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setNewMessage('');
                fetchTicketMessages(selectedTicket.ticket_id);
                fetchTickets(); // Refresh ticket list
                toast.success('Message sent');
            } else {
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleUpdateTicket = async (ticketId: string, updates: Partial<ITTicket>) => {
        try {
            // FIXED: Added http://localhost:5001
            const response = await fetch(`${API_BASE}/api/it-support/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user?.email,
                    ...updates
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Ticket updated');
                fetchTickets();
                if (selectedTicket?.ticket_id === ticketId) {
                    setSelectedTicket({ ...selectedTicket, ...updates });
                }
            } else {
                toast.error(data.error || 'Failed to update ticket');
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/it-support/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_email: user?.email  // Make sure this is correct
                })
            });

            console.log('Delete response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
            }

            const data = await response.json();
            console.log('Delete success response:', data);

            if (data.success) {
                toast.success('Ticket deleted');
                if (selectedTicket?.ticket_id === ticketId) {
                    setSelectedTicket(null);
                    setTicketMessages([]);
                }
                fetchTickets();
            } else {
                toast.error(data.error || 'Failed to delete ticket');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            toast.error('Failed to delete ticket: ' + (error as Error).message);
        }
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityBadge = (priority: string) => {
        const option = priorityOptions.find(p => p.value === priority);
        return (
            <Badge className={option?.color}>
                {option?.label}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const option = statusOptions.find(s => s.value === status);
        return (
            <Badge className={option?.color}>
                {option?.icon}
                <span className="ml-1">{option?.label}</span>
            </Badge>
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="container mx-auto px-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Please login to access IT Support
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        IT Support Center
                    </h1>
                    <p className="text-gray-600">
                        Get help with technical issues, report bugs, or request features
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Ticket List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>My Support Tickets</CardTitle>
                                        <CardDescription>
                                            Track and manage your support requests
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={fetchTickets}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh
                                        </Button>
                                        <Button
                                            onClick={() => setShowNewTicket(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Ticket
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="mb-6 space-y-4">
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search tickets..."
                                                value={filters.search}
                                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                                className="w-full"
                                            />
                                        </div>
                                        <Select
                                            value={filters.status}
                                            onValueChange={(value) => setFilters({...filters, status: value})}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                {statusOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Ticket List */}
                                {loading ? (
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Skeleton key={i} className="h-24 w-full" />
                                        ))}
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No tickets found
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {filters.status !== 'all' || filters.search
                                                ? 'No tickets match your filters'
                                                : 'You haven\'t created any support tickets yet'
                                            }
                                        </p>
                                        {(!filters.status || filters.status === 'all') && !filters.search && (
                                            <Button onClick={() => setShowNewTicket(true)}>
                                                Create your first ticket
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tickets.map(ticket => (
                                            <Card
                                                key={ticket.ticket_id}
                                                className={`cursor-pointer transition-all hover:shadow-md ${
                                                    selectedTicket?.ticket_id === ticket.ticket_id
                                                        ? 'border-orange-500 border-2'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    fetchTicketMessages(ticket.ticket_id);
                                                }}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {ticket.title}
                                                                </h4>
                                                                {ticket.unread_messages && ticket.unread_messages > 0 && (
                                                                    <Badge className="bg-orange-500 text-white">
                                                                        {ticket.unread_messages} new
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                                {ticket.description}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Tag className="h-3 w-3" />
                                                                    {issueCategories.find(c => c.value === ticket.issue_category)?.label}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(ticket.created_at)}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <MessageSquare className="h-3 w-3" />
                                                                    {ticket.message_count} messages
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 ml-4">
                                                            {getStatusBadge(ticket.status)}
                                                            {getPriorityBadge(ticket.priority)}
                                                            {ticket.status === 'open' && (
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedTicket(ticket);
                                                                            // Open edit modal
                                                                        }}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteTicket(ticket.ticket_id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Ticket Details */}
                    <div className="lg:col-span-1">
                        {selectedTicket ? (
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {selectedTicket.title}
                                            </CardTitle>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {getStatusBadge(selectedTicket.status)}
                                                {getPriorityBadge(selectedTicket.priority)}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedTicket(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Ticket Info */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {selectedTicket.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <Label className="text-xs text-gray-500">Category</Label>
                                                <p className="text-sm font-medium">
                                                    {issueCategories.find(c => c.value === selectedTicket.issue_category)?.label}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Created</Label>
                                                <p className="text-sm font-medium">
                                                    {formatDate(selectedTicket.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Messages */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Conversation</h4>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                            {ticketMessages.map(message => (
                                                <div
                                                    key={message.message_id}
                                                    className={`p-3 rounded-lg ${
                                                        message.sender_type === 'user'
                                                            ? 'bg-blue-50 ml-4'
                                                            : 'bg-orange-50 mr-4'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-semibold flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {message.sender_name}
                                                            {message.sender_type === 'admin' && (
                                                                <Badge variant="outline" className="ml-1 text-xs">
                                                                    Admin
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">
                                                        {message.message_text}
                                                    </p>
                                                </div>
                                            ))}
                                            {ticketMessages.length === 0 && (
                                                <p className="text-center text-gray-500 py-4">
                                                    No messages yet
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reply Form */}
                                    {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                        <>
                                            <Separator className="my-6" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Add Reply</h4>
                                                <Textarea
                                                    placeholder="Type your message here..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="mb-3"
                                                    rows={3}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage.trim()}
                                                    className="w-full"
                                                >
                                                    Send Message
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="sticky top-24">
                                <CardContent className="p-8 text-center">
                                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No ticket selected
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Select a ticket from the list to view details and conversation
                                    </p>
                                    {!showNewTicket && (
                                        <Button
                                            onClick={() => setShowNewTicket(true)}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Ticket
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* New Ticket Modal */}
                {showNewTicket && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Create New Support Ticket</CardTitle>
                                        <CardDescription>
                                            Describe your issue in detail for faster resolution
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowNewTicket(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="category">Issue Category *</Label>
                                        <Select
                                            value={newTicket.issue_category}
                                            onValueChange={(value) => setNewTicket({...newTicket, issue_category: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {issueCategories.map(category => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Brief description of your issue"
                                            value={newTicket.title}
                                            onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select
                                            value={newTicket.priority}
                                            onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorityOptions.map(priority => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <span className={priority.color}>{priority.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Please provide detailed information about your issue. Include steps to reproduce if applicable."
                                            value={newTicket.description}
                                            onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                            rows={6}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            The more details you provide, the faster we can help you.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewTicket(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateTicket}
                                    disabled={!newTicket.title || !newTicket.description || !newTicket.issue_category}
                                >
                                    Create Ticket
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ITSupportPage;