import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import SignInDialog from "./SignInDialog";

const HeroSection = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const prompts = [
    { genre: "Travis Scott", text: "Watering Plants" },
    { genre: "Drake", text: "Late Night" },
    { genre: "The Weeknd", text: "City Lights" },
    { genre: "Post Malone", text: "Summer Vibes" },
    { genre: "Billie Eilish", text: "Dark Thoughts" },
    { genre: "Dua Lipa", text: "Nostalgic Memories" },
    { genre: "Ariana Grande", text: "Heartbreak" },
    { genre: "Tyler", text: "Creative Freedom" },
    { genre: "Lana Del Rey", text: "Bad Energy" },
    { genre: "Kanye West", text: "Self Reflection" },
    { genre: "Taylor Swift", text: "Storytelling" },
    { genre: "Frank Ocean", text: "Ocean Waves" },
    { genre: "Doja Cat", text: "Fun And Playful" },
    { genre: "Bad Bunny", text: "Latin Rhythms" }
  ];

  // Suggestion system state
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showTemperatureInfo, setShowTemperatureInfo] = useState(false);
  const [showBalanceInfo, setShowBalanceInfo] = useState(false);
  const [showBpmInfo, setShowBpmInfo] = useState(false);
  const [temperatureValue, setTemperatureValue] = useState(0.8);
  const [balanceValue, setBalanceValue] = useState(0.8);
  const [bpmValue, setBpmValue] = useState(120);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle temperature value change
  const handleTemperatureChange = (increment: boolean) => {
    if (increment) {
      setTemperatureValue(prev => Math.min(1, prev + 0.1));
    } else {
      setTemperatureValue(prev => Math.max(0, prev - 0.1));
    }
  };

  // Handle balance value change
  const handleBalanceChange = (increment: boolean) => {
    if (increment) {
      setBalanceValue(prev => Math.min(1, prev + 0.1));
    } else {
      setBalanceValue(prev => Math.max(0, prev - 0.1));
    }
  };

  // Handle BPM value change
  const handleBpmChange = (increment: boolean) => {
    if (increment) {
      setBpmValue(prev => Math.min(300, prev + 1));
    } else {
      setBpmValue(prev => Math.max(120, prev - 1));
    }
  };

  // Generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Show all suggestions at once instead of filtering
    const allSuggestions: string[] = [];

    // Add artist suggestions
    prompts.forEach(prompt => {
      allSuggestions.push(`${prompt.genre} song about ${prompt.text}`);
    });

    // Add genre suggestions
    const genres = ["Hip Hop", "Pop", "R&B", "Rock", "Electronic", "Jazz", "Country", "Latin", "Indie", "Alternative"];
    genres.forEach(genre => {
      allSuggestions.push(`${genre} song`);
    });

    // Add mood/theme suggestions
    const themes = ["love", "heartbreak", "party", "chill", "energetic", "melancholy", "uplifting", "dark", "romantic", "nostalgic"];
    themes.forEach(theme => {
      allSuggestions.push(`${theme} song`);
    });

    // Add instrument suggestions
    const instruments = ["piano", "guitar", "drums", "synth", "strings", "brass", "acoustic", "electric"];
    instruments.forEach(instrument => {
      allSuggestions.push(`${instrument} song`);
    });

    // Show all suggestions
    setSuggestions(allSuggestions);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    generateSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions and info boxes when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }

      // Close info boxes when clicking outside
      const target = event.target as Element;
      if (!target.closest('.info-button') && !target.closest('.info-popup')) {
        setShowTemperatureInfo(false);
        setShowBalanceInfo(false);
        setShowBpmInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input when coming from Start Creating button or URL parameter
  useEffect(() => {
    const handleFocusPromptBar = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Listen for custom event from Start Creating button
    window.addEventListener('focusPromptBar', handleFocusPromptBar);

    // Check for URL parameter from Create Another/Create New Song buttons
    const urlParams = new URLSearchParams(window.location.search);
    const shouldFocus = urlParams.get('focus');

    if (shouldFocus === 'true' && inputRef.current) {
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Remove the focus parameter from URL after using it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    return () => {
      window.removeEventListener('focusPromptBar', handleFocusPromptBar);
    };
  }, []);

  // Auto-typing effect for initial prompt
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [displayArtist, setDisplayArtist] = useState("");
  const [displayMiddle, setDisplayMiddle] = useState("");
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const [displayInitialText, setDisplayInitialText] = useState("");

  useEffect(() => {
    // Show initial prompt for 8 seconds
    if (showInitialPrompt) {
      const initialText = "Make any song you can imagine";

      if (displayInitialText.length < initialText.length) {
        // Type the initial text letter by letter
        const timer = setTimeout(() => {
          setDisplayInitialText(initialText.slice(0, displayInitialText.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Wait 8 seconds after typing is complete
        const timer = setTimeout(() => {
          setShowInitialPrompt(false);
          setDisplayText("");
          setDisplayArtist("");
          setDisplayMiddle("");
          setIsTyping(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [showInitialPrompt, displayInitialText]);

  useEffect(() => {
    if (showInitialPrompt) return; // Don't run the prompt loop while showing initial prompt

    const currentPrompt = prompts[currentPromptIndex];
    const fullText = currentPrompt.text;
    const artistName = currentPrompt.genre;
    const middleText = " song about ";

    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (displayArtist.length < artistName.length) {
        // Type artist name first
        timeoutId = setTimeout(() => {
          setDisplayArtist(artistName.slice(0, displayArtist.length + 1));
        }, 50);
      } else if (displayMiddle.length < middleText.length) {
        // Then type middle text
        timeoutId = setTimeout(() => {
          setDisplayMiddle(middleText.slice(0, displayMiddle.length + 1));
        }, 50);
      } else if (displayText.length < fullText.length) {
        // Finally type the prompt text
        timeoutId = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 500);
      }
    } else {
      if (displayText.length > 0) {
        // Delete prompt text first
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else if (displayMiddle.length > 0) {
        // Then delete middle text
        timeoutId = setTimeout(() => {
          setDisplayMiddle(displayMiddle.slice(0, -1));
        }, 50);
      } else if (displayArtist.length > 0) {
        // Then delete artist name
        timeoutId = setTimeout(() => {
          setDisplayArtist(displayArtist.slice(0, -1));
        }, 50);
      } else {
        // Move to next prompt and reset state
        timeoutId = setTimeout(() => {
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
          setIsTyping(true);
          setDisplayText("");
          setDisplayArtist("");
          setDisplayMiddle("");
        }, 100);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, displayArtist, displayMiddle, isTyping, currentPromptIndex, prompts, showInitialPrompt]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Handle song generation
  const handleGenerateSong = async () => {
    if (!inputValue.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (!isSignedIn) {
      setIsSignInDialogOpen(true);
      return;
    }

    // Navigate to generate page with the prompt and start generation
    navigate('/generate', {
      state: {
        prompt: inputValue,
        temperature: temperatureValue,
        balance: balanceValue,
        bpm: bpmValue,
        isGenerating: true
      }
    });
  };

  return (
    <section className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center pt-14">
      {/* Background decorative elements */}
      <div className="absolute inset-0 dark:bg-black/20" />
      <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none mix-blend-plus-lighter" style={{ background: 'radial-gradient(circle at center, #f472b6 0%, transparent 50%)' }} />

      {/* Main content */}
      <div className="container mx-auto px-12 text-center relative z-10">
        <div className="h-48 flex items-center justify-center mb-9">
          <h1 className="font-sans text-6xl md:text-[79px] font-bold text-foreground leading-tight max-w-6xl mx-auto">
            {showInitialPrompt ? (
              <>
                {displayInitialText}
                <span className={`${showCursor ? 'opacity-60' : 'opacity-0'} transition-opacity duration-100 text-4xl md:text-[66px] font-extralight inline-block leading-none text-foreground`}>|</span>
              </>
            ) : (
              <>
                Create a {displayArtist || ""} {displayMiddle || ""} {displayText || ""}
                <span className={`${showCursor ? 'opacity-70' : 'opacity-0'} transition-opacity duration-100 text-4xl md:text-[66px] font-extralight inline-block leading-none text-foreground`}>|</span>
              </>
            )}
          </h1>
        </div>

        <p className="text-foreground/80 text-xl md:text-xl mb-16 max-w-2xl mx-auto font-normal leading-relaxed mt-12">
          The world's most advanced AI music creation platform. Transform any idea into professional-quality music in seconds.
        </p>

        {/* Premium Search Input */}
        <div className="max-w-[55rem] mx-auto mb-12 relative">
          <div className="relative flex items-center gap-4 bg-foreground/5 backdrop-blur-glass border border-foreground/10 rounded-2xl p-4 shadow-glass hover:border-foreground/20 transition-all duration-300">
            <Music className="text-foreground/80 w-6 h-6 ml-3" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your musical vision as a creative prompt... "
              className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-xl font-light"
            />

            {/* Info Boxes - Only show when there's text */}
            {inputValue.trim() && (
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="px-3 py-2 bg-foreground/5 rounded-lg text-foreground/80 text-xs font-medium border border-foreground/5 flex items-center gap-1">
                    Temperature
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-foreground/80 transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setShowTemperatureInfo(true)}
                      onMouseLeave={() => setShowTemperatureInfo(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1.5 bg-foreground/5 rounded text-foreground/80 text-xs">{temperatureValue.toFixed(1)}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleTemperatureChange(true)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-t-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleTemperatureChange(false)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-b-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-3 py-2 bg-foreground/5 rounded-lg text-foreground/80 text-xs font-medium border border-foreground/5 flex items-center gap-1">
                    Balance
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-foreground/80 transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setShowBalanceInfo(true)}
                      onMouseLeave={() => setShowBalanceInfo(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1.5 bg-white/10 rounded text-white/80 text-xs">{balanceValue.toFixed(1)}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleBalanceChange(true)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-t-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleBalanceChange(false)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-b-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-3 py-2 bg-foreground/5 rounded-lg text-foreground/80 text-xs font-medium border border-foreground/5 flex items-center gap-1">
                    BPM
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-foreground/80 transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setShowBpmInfo(true)}
                      onMouseLeave={() => setShowBpmInfo(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1.5 bg-foreground/5 rounded text-foreground/80 text-xs">{bpmValue}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleBpmChange(true)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-t-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleBpmChange(false)}
                        className="w-3 h-3 bg-foreground/10 hover:bg-foreground/20 rounded-b-sm flex items-center justify-center text-foreground/70 hover:text-foreground/90 transition-all duration-200 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="create"
              size="default"
              className="px-6 rounded-xl font-semibold text-base shadow-glow hover:scale-100 active:scale-100 transform-none"
              onClick={handleGenerateSong}
            >
              Generate
            </Button>
          </div>

          {/* Error Message */}
          {showError && (
            <div className="mt-3 text-center">
              <p className="text-red-400 text-sm font-medium">
                Please enter a prompt before generating
              </p>
            </div>
          )}

          {/* Info Popups */}
          {showTemperatureInfo && (
            <div className="absolute bottom-full left-1/4 mb-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-glass p-2 z-50 w-64 h-24 info-popup flex flex-col items-center justify-center text-center">
              <h4 className="text-white font-semibold text-sm mb-1">Temperature</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Controls how strongly your prompt influences the output. We recommend 0.8 for balanced output.
              </p>
            </div>
          )}

          {showBalanceInfo && (
            <div className="absolute bottom-full right-60 mb-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-glass p-1.5 z-50 w-64 h-24 info-popup flex flex-col items-center justify-center text-center">
              <h4 className="text-white font-semibold text-sm mb-0.5">Balance</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Greater means more natural vocals. We recommend 0.7 for balanced vocals.
              </p>
            </div>
          )}

          {showBpmInfo && (
            <div className="absolute bottom-full right-24 mb-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-glass p-1.5 z-50 w-64 h-24 info-popup flex flex-col items-center justify-center text-center">
              <h4 className="text-white font-semibold text-sm mb-0.5">BPM</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Determines beats per minute you need in your song. We recommend 120 for a balanced feel.
              </p>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 -mt-10 bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-xl shadow-glass overflow-hidden z-50 max-h-36 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-foreground/5 ${index === selectedSuggestionIndex ? 'bg-foreground/10' : ''
                    } ${index < suggestions.length - 1 ? 'border-b border-foreground/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground/90 text-sm font-medium">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-8 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              9 songs created today
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              30s average generation time
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            variant="secondary"
            className="rounded-full px-8 py-4 text-lg font-medium"
            onClick={() => {
              const element = document.getElementById('showcase');
              if (element) {
                const headerHeight = 80; // Height of the fixed header (h-20 = 80px)
                const extraOffset = -70; // Much more negative offset for showcase

                const elementPosition = element.offsetTop - headerHeight - extraOffset;

                window.scrollTo({
                  top: elementPosition,
                  behavior: 'smooth'
                });
              }
            }}
          >
            🎧 Show Me Examples
          </Button>
        </div>
      </div>

      {/* Sign In Dialog */}
      <SignInDialog
        isOpen={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
        onAuthSuccess={() => setIsSignInDialogOpen(false)}
      />
    </section>
  );
};

export default HeroSection;