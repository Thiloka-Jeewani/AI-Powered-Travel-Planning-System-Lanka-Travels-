// Navbar.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Phone, Mail, Eye, Cpu, Server,
  User, LogOut, Package, CalendarDays, Hotel,
  Settings, ChevronDown, Home, MapPin, Compass,
  Info, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/assets/lanka-vacation-official-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", href: "/home", icon: <Home size={14} /> },
    { label: "Explore Sri Lanka", href: "/#explore", icon: <Compass size={14} /> },
    { label: "Tours", href: "/#tours", icon: <MapPin size={14} /> },
    { label: "Book a Hotel", href: "/book-hotel", icon: <Hotel size={14} /> },
    { label: "IT Support", href: "/it-support", icon: <Server size={14} /> },
    { label: "View", href: "/view", icon: <Eye size={14} /> },
    { label: "AP", href: "/ap", icon: <Cpu size={14} /> },
    { label: "About Us", href: "/#about", icon: <Info size={14} /> },
    { label: "Contact", href: "/#contact", icon: <MessageSquare size={14} /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // If it's an internal page link, navigate normally
    if (!href.startsWith('#')) {
      navigate(href);
      setIsMenuOpen(false);
      return;
    }

    // Smooth scroll for anchor links
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  const handleViewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/view");
      setIsMenuOpen(false);
    } else {
      navigate("/login");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
      <>
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? "bg-background/95 backdrop-blur-md shadow-elegant"
                    : "bg-white/95 backdrop-blur-md border-b border-gray-100"
            }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <a href="/home" className="flex items-center space-x-3 group" onClick={(e) => {
                e.preventDefault();
                if (isAuthenticated) {
                  navigate("/home");
                } else {
                  navigate("/login");
                }
              }}>
                <div className="relative">
                  <img
                      src={Logo}
                      alt="Lanka Vacations Logo"
                      className="w-14 h-14 lg:w-16 lg:h-16 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col">
                <span
                    className={`text-2xl lg:text-3xl font-serif font-bold transition-colors duration-300 ${
                        isScrolled ? "text-orange-600" : "text-orange-600"
                    }`}
                >
                  Lanka Vacations
                </span>
                  <span
                      className={`text-xs font-medium tracking-widest uppercase ${
                          isScrolled ? "text-amber-600" : "text-amber-600"
                      }`}
                  >
                  AI-Powered Hotel Booking
                </span>
                </div>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        onClick={(e) => {
                          if (item.label === "View") {
                            handleViewClick(e);
                          } else if (item.label === "Home" && !isAuthenticated) {
                            e.preventDefault();
                            navigate("/login");
                          } else {
                            handleNavClick(e, item.href);
                          }
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                            isScrolled ? "text-gray-700 hover:text-orange-600" : "text-gray-700 hover:text-orange-600"
                        } hover:bg-orange-50`}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                ))}

                {/* User Profile Dropdown (only shown when logged in) */}
                {isAuthenticated && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={`ml-2 flex items-center gap-2 transition-colors duration-300 ${
                                isScrolled
                                    ? "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                            }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="hidden md:inline">{user.first_name}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/view')}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/view?tab=packages')}>
                          <Package className="mr-2 h-4 w-4" />
                          Package Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/view?tab=itinerary')}>
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Itinerary Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/view?tab=hotels')}>
                          <Hotel className="mr-2 h-4 w-4" />
                          Hotel Booking
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/update-profile')}>
                          <Settings className="mr-2 h-4 w-4" />
                          Update Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Don't show login/register buttons since login is the first page
                    <div className="ml-2 text-sm text-gray-500">
                      Please login to continue
                    </div>
                )}

                {/* Theme Toggle */}
                <ThemeToggle
                    isScrolled={isScrolled}
                    className={`ml-2 transition-colors duration-300 ${
                        isScrolled ? "text-gray-700 hover:text-orange-600" : "text-gray-700 hover:text-orange-600"
                    }`}
                />
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center lg:hidden gap-2">
                {/* User avatar for mobile (only when logged in) */}
                {isAuthenticated && user && (
                    <div className="md:hidden">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                    </div>
                )}

                <ThemeToggle
                    isScrolled={isScrolled}
                    className={`transition-colors duration-300 ${
                        isScrolled ? "text-gray-700 hover:text-orange-600" : "text-gray-700 hover:text-orange-600"
                    }`}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-colors duration-300 ${
                        isScrolled ? "text-gray-700 hover:text-orange-600" : "text-gray-700 hover:text-orange-600"
                    }`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
            className={`fixed inset-0 z-50 bg-gradient-to-b from-white via-white to-orange-50/50 transition-transform duration-500 lg:hidden ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 border-b border-orange-200 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <img src={Logo} alt="Lanka Vacations Logo" className="w-12 h-12 object-contain" />
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-bold text-orange-600">Lanka Vacations</span>
                  <span className="text-xs text-amber-600 font-medium tracking-wider">AI Hotel Booking</span>
                </div>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* User Profile Section (Mobile) */}
              {isAuthenticated && user ? (
                  <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigate('/update-profile');
                                setIsMenuOpen(false);
                              }}
                              className="text-xs border-orange-400 text-orange-600"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Profile
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={handleLogout}
                              className="text-xs border-red-400 text-red-600"
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
              ) : (
                  <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-700 font-medium">Welcome to Lanka Vacations</p>
                      <p className="text-sm text-gray-600">Please login to access all features</p>
                      <div className="flex gap-3">
                        <Button
                            onClick={() => {
                              navigate('/login');
                              setIsMenuOpen(false);
                            }}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600"
                        >
                          Sign In
                        </Button>
                        <Button
                            onClick={() => {
                              navigate('/register');
                              setIsMenuOpen(false);
                            }}
                            variant="outline"
                            className="flex-1 border-orange-400 text-orange-600"
                        >
                          Sign Up
                        </Button>
                      </div>
                    </div>
                  </div>
              )}

              <nav className="p-6 space-y-1">
                {navItems.map((item, idx) => (
                    <a
                        key={item.label}
                        href={item.href}
                        onClick={(e) => {
                          if (item.label === "View") {
                            handleViewClick(e);
                          } else if (item.label === "Home" && !isAuthenticated) {
                            e.preventDefault();
                            navigate("/login");
                            setIsMenuOpen(false);
                          } else {
                            handleNavClick(e, item.href);
                          }
                        }}
                        className="flex items-center justify-between text-lg font-medium text-gray-900 py-4 px-4 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 group cursor-pointer"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </a>
                ))}

                {/* Additional User Links for Mobile (only when logged in) */}
                {isAuthenticated && user && (
                    <>
                      <div className="pt-4 border-t border-orange-200">
                        <h4 className="text-sm font-medium text-gray-700 px-4 mb-2">Dashboard</h4>
                        <div className="space-y-1">
                          <button
                              onClick={() => {
                                navigate('/view?tab=packages');
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center justify-between text-lg font-medium text-gray-900 py-3 px-4 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Package size={18} />
                              <span>Package Bookings</span>
                            </div>
                            <span className="text-orange-600">→</span>
                          </button>
                          <button
                              onClick={() => {
                                navigate('/view?tab=itinerary');
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center justify-between text-lg font-medium text-gray-900 py-3 px-4 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <CalendarDays size={18} />
                              <span>Itinerary Booking</span>
                            </div>
                            <span className="text-orange-600">→</span>
                          </button>
                          <button
                              onClick={() => {
                                navigate('/view?tab=hotels');
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center justify-between text-lg font-medium text-gray-900 py-3 px-4 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Hotel size={18} />
                              <span>Hotel Booking</span>
                            </div>
                            <span className="text-orange-600">→</span>
                          </button>
                        </div>
                      </div>
                    </>
                )}
              </nav>

              {/* Company Info Section */}
              <div className="px-6 py-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">24/7 Customer Support</h3>
                  <p className="text-sm leading-relaxed text-gray-600 mb-4">
                    Our team is available round the clock to assist you with bookings and travel inquiries.
                  </p>
                  <div className="space-y-3">
                    <a
                        href="tel:+94777325515"
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                    >
                      <Phone size={18} className="text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">+94 777 325 515</span>
                    </a>
                    <a
                        href="mailto:clientservice@lanka-vacations.com"
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors"
                    >
                      <Mail size={18} className="text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Email Support</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t border-orange-200 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-6">
                <button
                    onClick={() => {
                      navigate('/book-hotel');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm"
                >
                  <Hotel size={16} />
                  <span>Book Hotel</span>
                </button>
                <span className="text-orange-300">|</span>
                <a
                    href="tel:+94777325515"
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm"
                >
                  <Phone size={16} />
                  <span>Call Support</span>
                </a>
                {isAuthenticated && (
                    <>
                      <span className="text-orange-300">|</span>
                      <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default Navbar;