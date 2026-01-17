import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Menu, Sparkles, Music, Star } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import SignInDialog from "./SignInDialog";
import UserProfileDropdown from "./UserProfileDropdown";

const Header = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);

  // Update user profile visibility when authentication state changes
  useEffect(() => {
    console.log("Header - Auth state changed:", { isSignedIn, isLoaded, hasUser: !!user });
    if (isLoaded) {
      const shouldShowProfile = isSignedIn && !!user;
      setShowUserProfile(shouldShowProfile);
      console.log("Header - Setting showUserProfile to:", shouldShowProfile);

      // Clear temporary email when real user data is loaded
      if (user && tempUserEmail) {
        setTempUserEmail(null);
      }
    }
  }, [isSignedIn, isLoaded, user, tempUserEmail]);

  // Show user profile immediately when signed in (for instant reload experience)
  const shouldShowUserProfile = isLoaded && (isSignedIn || showUserProfile);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      let extraOffset = -25;

      if (sectionId === 'showcase') {
        extraOffset = -70;
      }

      if (sectionId === 'testimonials') {
        extraOffset = -36;
      }

      if (sectionId === 'my-songs') {
        extraOffset = -40;
      }

      const elementPosition = element.offsetTop - headerHeight - extraOffset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Dispatch custom event to trigger autofocus on prompt bar
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('focusPromptBar'));
    }, 500);
  };

  const scrollToCreate = () => {
    const element = document.getElementById('create');
    if (element) {
      const headerHeight = 10;
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Force refresh when dialog closes
  const handleSignInDialogClose = () => {
    console.log("Header - Sign in dialog closed");
    setIsSignInDialogOpen(false);
    setTimeout(() => {
      console.log("Header - Checking auth state after dialog close:", { isSignedIn, isLoaded });
    }, 100);
  };

  // Handle successful authentication
  const handleAuthSuccess = (email?: string) => {
    console.log("Header - Authentication attempt started, showing user profile immediately");
    setIsSignInDialogOpen(false);
    if (email) {
      setTempUserEmail(email);
    }
    setShowUserProfile(true);
    setTimeout(() => {
      console.log("Header - Auth success - checking state:", { isSignedIn, isLoaded, hasUser: !!user });
    }, 50);
  };

  const navigate = (path: string) => {
    if (path === '/') {
      scrollToTop();
    }
  };

  // Theme Toggle Logic
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/10 blur-lg rounded-full" />
            <img
              src="/aether-logo.png"
              alt="Aether Logo"
              className="relative w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-2xl font-bold text-foreground font-display tracking-tight group-hover:tracking-wide transition-all duration-300">
            Aether
          </span>
        </div>

        {/* Centered Capsule Navigation */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 backdrop-blur-md border border-foreground/10 rounded-full p-1.5">
          <button
            onClick={() => scrollToSection('features')}
            className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-foreground/10 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-foreground/80 group-hover:text-primary transition-colors" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs text-sm font-medium text-foreground/90 whitespace-nowrap transition-all duration-300 ease-in-out">
              Features
            </span>
          </button>

          <div className="w-px h-4 bg-foreground/10" />

          <button
            onClick={() => scrollToSection('showcase')}
            className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-foreground/10 transition-all duration-300"
          >
            <Music className="w-4 h-4 text-foreground/80 group-hover:text-primary transition-colors" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs text-sm font-medium text-foreground/90 whitespace-nowrap transition-all duration-300 ease-in-out">
              Showcase
            </span>
          </button>

          <div className="w-px h-4 bg-foreground/10" />

          <button
            onClick={() => scrollToSection('testimonials')}
            className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-foreground/10 transition-all duration-300"
          >
            <Star className="w-4 h-4 text-foreground/80 group-hover:text-primary transition-colors" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs text-sm font-medium text-foreground/90 whitespace-nowrap transition-all duration-300 ease-in-out">
              Reviews
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/10 transition-all duration-300"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {shouldShowUserProfile ? (
            <UserProfileDropdown tempEmail={tempUserEmail} />
          ) : (
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-black dark:text-white font-medium px-3.5 h-11 border border-border/50 backdrop-blur-sm transition-all duration-300 rounded-md focus:outline-none focus:ring-0 focus-visible:ring-0 hover:border-[#667eea] hover:bg-transparent hover:text-black dark:hover:text-white"
              onClick={() => setIsSignInDialogOpen(true)}
            >
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            className="font-semibold px-3.5 h-11 border border-border/50 backdrop-blur-sm transition-all duration-300 rounded-md focus:outline-none focus:ring-0 focus-visible:ring-0 text-black dark:text-white hover:border-[#667eea] hover:bg-transparent hover:text-black dark:hover:text-white"
            onClick={() => {
              if (isSignedIn) {
                scrollToTop();
              } else {
                setIsSignInDialogOpen(true);
              }
            }}
          >
            Start Creating
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <SignInDialog
          isOpen={isSignInDialogOpen}
          onClose={handleSignInDialogClose}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </header >
  );
};

export default Header;