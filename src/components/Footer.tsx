import Logo from "@/assets/lanka-vacation-official-logo.png";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary/95 dark:bg-black/90 text-primary-foreground dark:text-white border-t border-white/10 dark:border-white/20 transition-colors duration-500">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full overflow-hidden bg-white/10 dark:bg-white/20">
                <img
                  src={Logo}
                  alt="Lanka Vacations Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif font-bold">Lanka Vacations</span>
                <span className="text-xs text-accent">Since 1984</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 dark:text-white/70 text-sm leading-relaxed">
              Your trusted travel concierge for unforgettable Sri Lankan experiences.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              {["Explore Sri Lanka", "Getting Around", "Build Your Tour", "About Us", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-primary-foreground/70 dark:text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Discover</h3>
            <ul className="space-y-2">
              {["Home", "Accommodation", "Tours", "Events"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-primary-foreground/70 dark:text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect with Us */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect with Us</h3>
            <div className="space-y-3 text-sm">
              <p className="text-primary-foreground/70 dark:text-white/70">+94777325515</p>
              <p className="text-primary-foreground/70 dark:text-white/70">+94112577285</p>
              <p className="text-primary-foreground/70 dark:text-white/70">
                43 St Anthony's Mawatha,<br />Colombo 00300, Sri Lanka
              </p>
              <p className="text-primary-foreground/70 dark:text-white/70">clientservice@lanka-vacations.com</p>
            </div>
            <div className="flex space-x-3 mt-4">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/20 hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
              {/* YouTube custom icon */}
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/20 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 dark:border-white/20 pt-8 transition-colors duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/60 dark:text-white/60 text-sm">
              © Copyright {currentYear} Lanka Vacations. All Rights Reserved. Powered By Project-V
            </p>
            <div className="flex space-x-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-primary-foreground/60 dark:text-white/60 hover:text-accent transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
