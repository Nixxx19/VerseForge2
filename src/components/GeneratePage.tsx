import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Plus, ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Heart, Share2, Download, Volume2 } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import UserProfileDropdown from "./UserProfileDropdown";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import MySongsSection from "./MySongsSection";
import StatisticsSection from "./StatisticsSection";
import Footer from "./Footer";

const GeneratePage = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const navigate = useNavigate();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const location = useLocation();
  const [generationData, setGenerationData] = useState(location.state?.generationData || null);
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [temperature, setTemperature] = useState(location.state?.temperature || 1.7);
  const [balance, setBalance] = useState(location.state?.balance || 0.7);
  const [bpm, setBpm] = useState(location.state?.bpm || 120);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Initializing...');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [backendInfo, setBackendInfo] = useState('');
  const [currentVariant, setCurrentVariant] = useState(0);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lyrics, setLyrics] = useState<any[]>([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [songName, setSongName] = useState('Song Variant 1');
  const [isEditingName, setIsEditingName] = useState(false);
  const [customCoverImages, setCustomCoverImages] = useState<{ [key: number]: string }>({});
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio control functions
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        // Auto-hide lyrics when pausing
        setShowLyrics(false);
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      if (!isMuted) {
        audioRef.current.volume = clampedVolume;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle album cover upload
  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomCoverImages(prev => ({
          ...prev,
          [currentVariant]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update user profile visibility when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      const shouldShowProfile = isSignedIn && !!user;
      setShowUserProfile(shouldShowProfile);
    }
  }, [isSignedIn, isLoaded, user]);

  // Start generation when component mounts with generation state
  useEffect(() => {
    // Only start generating if we have a prompt and are coming from navigation with isGenerating: true
    // AND we don't already have generation data (to prevent regeneration on refresh)
    // AND we've already checked sessionStorage
    if (location.state?.isGenerating && prompt && !generationData && hasLoadedFromStorage) {
      setIsGenerating(true);
      startGeneration();
    }
  }, [prompt, generationData, hasLoadedFromStorage]);

  // Function to start backend generation with SSE
  const startGeneration = async () => {
    if (!prompt) return;

    try {
      setGenerationStatus('Initializing...');
      setProgressPercentage(5);

      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: prompt,
          temperature: temperature,
          bpm: bpm,
          balance: balance,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.complete) {
                // Generation complete
                if (data.error) {
                  console.error('Generation failed:', data.error);
                  alert('Generation failed: ' + data.error);
                  setIsGenerating(false);
                  return;
                } else {
                  setGenerationData(data);
                  setIsGenerating(false);

                  // Store result in sessionStorage for persistence
                  sessionStorage.setItem('generationResult', JSON.stringify({
                    generationData: data,
                    prompt: prompt
                  }));
                }
                break;
              } else {
                // Update status and progress
                setGenerationStatus(data.status);
                setProgressPercentage(data.progress);
                setBackendInfo(data.message);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error calling backend:', error);
      alert('Error connecting to server. Please try again.');
      setIsGenerating(false);
    }
  };

  // Check for generation result from sessionStorage
  useEffect(() => {
    const storedResult = sessionStorage.getItem('generationResult');
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setGenerationData(result.generationData);
      setPrompt(result.prompt);
      setIsGenerating(false); // Ensure we're not in generating state
      sessionStorage.removeItem('generationResult'); // Clear after reading
    }
    setHasLoadedFromStorage(true); // Mark that we've checked storage
  }, []);

  // Reset audio state when variant changes
  useEffect(() => {
    if (audioRef.current) {
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
    // Update song name when variant changes
    setSongName(`Song Variant ${currentVariant + 1}`);
  }, [currentVariant]);

  // If no generation data and not generating, show loading state
  if (!generationData && !isGenerating) {
    return (
      <section className="min-h-screen bg-gradient-hero relative overflow-hidden pt-14">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 pb-20">
          <div className="text-center max-w-4xl">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8">
              No Generation Data
            </h1>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Please go back and generate a song first.
            </p>
            <Button variant="create" className="rounded-full px-8 py-4 text-base" onClick={() => window.location.href = '/'}>
              Go Back
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-hero relative overflow-hidden pt-14">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Hidden audio element */}
      {generationData?.audioFiles && generationData.audioFiles.length > 0 && (
        <audio
          ref={audioRef}
          src={`http://localhost:3001/audio/${generationData.audioFiles[currentVariant]}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      {/* Header with navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.png"
                alt="Aether Logo"
                className="w-10 h-10 object-contain shadow-premium rounded-xl"
              />
              <span className="font-display text-2xl font-bold text-foreground">
                Aether
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              <button
                className="text-foreground font-medium cursor-pointer px-3 py-1 relative transition-all duration-300 focus:outline-none focus:ring-0 focus:visible:ring-0"
                onClick={() => window.location.href = '/'}
                onMouseEnter={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '80%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '0 4px 12px -2px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '0%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '';
                  }
                }}
              >
                Home
                <div className="underline absolute bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 ease-out" style={{ width: '0%', transform: 'translateX(-50%)' }}></div>
              </button>
              <button
                className="text-foreground font-medium cursor-pointer px-3 py-1 relative transition-all duration-300 focus:outline-none focus:ring-0 focus:visible:ring-0"
                onClick={() => {
                  setTimeout(() => {
                    const element = document.getElementById('my-songs');
                    if (element) {
                      const headerHeight = 80;
                      const elementPosition = element.offsetTop - headerHeight - -43;
                      window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }}
                onMouseEnter={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '83%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '0 4px 12px -2px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '0%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '';
                  }
                }}
              >
                AetherVault
                <div className="underline absolute bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 ease-out" style={{ width: '0%', transform: 'translateX(-50%)' }}></div>
              </button>
              <button
                className="text-foreground font-medium cursor-pointer px-3 py-1 relative transition-all duration-300 focus:outline-none focus:ring-0 focus:visible:ring-0"
                onMouseEnter={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '85%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '0 4px 12px -2px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  const button = e.currentTarget;
                  const underline = button.querySelector('.underline') as HTMLElement;
                  if (underline) {
                    underline.style.width = '0%';
                    underline.style.left = '50%';
                    underline.style.boxShadow = '';
                  }
                }}
              >
                Add Reviews
                <div className="underline absolute bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 ease-out" style={{ width: '0%', transform: 'translateX(-50%)' }}></div>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserProfileDropdown tempEmail={null} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-1 relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] pt-14 pb-20">
        <div className="text-center mx-auto">
          {isGenerating ? (
            <>
              <Badge className="bg-gradient-create text-white border-0 px-6 py-2 mb-8 text-sm font-medium">
                Generation in Progress
              </Badge>

              <h1 className="font-sans text-5xl md:text-7xl font-bold text-white mb-8">
                Creating Your
                <br />
                <span className="bg-gradient-warm bg-clip-text text-transparent">
                  Masterpiece
                </span>
              </h1>

              <p className="text-white/80 text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
                Our AI is working on your musical vision. This usually takes 15-30 seconds.
              </p>

              {/* Progress Section */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-2xl mx-auto mb-12">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-create rounded-full flex items-center justify-center animate-pulse">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {(() => {
                        switch (generationStatus) {
                          case 'GENERATING_LYRICS':
                            return 'Creating Lyrics';
                          case 'LYRICS_COMPLETE':
                            return 'Lyrics Complete';
                          case 'PREPARING_AUDIO':
                            return 'Preparing Audio';
                          case 'PROMPT':
                            return 'Processing Prompt';
                          case 'TASK_SENT':
                            return 'Sending to Audio Engine';
                          case 'GENERATING':
                            return 'Generating Audio';
                          case 'DECOMPRESSING':
                            return 'Processing Audio';
                          case 'SAVING':
                            return 'Saving Files';
                          case 'SUCCESS':
                            return 'Complete!';
                          case 'FAILURE':
                            return 'Generation Failed';
                          default:
                            return generationStatus;
                        }
                      })()}
                    </h3>
                    <p className="text-white/70 text-base">
                      {backendInfo || 'Working on your musical vision'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-4 mb-6">
                  <div
                    className="bg-gradient-create h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                <p className="text-white/60 text-base">Estimated time: {progressPercentage < 50 ? '20 seconds' : '10 seconds'}</p>
              </div>
            </>
          ) : (
            <>
              <Badge className="bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 px-6 py-2 mb-8 text-sm font-medium shadow-lg">
                Generation Complete
              </Badge>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8">
                Your Song is
                <br />
                <span className="bg-gradient-warm bg-clip-text text-transparent">
                  Ready!
                </span>
              </h1>

              <p className="text-white/80 text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
                Your AI-generated song has been created successfully!
              </p>

              {/* Audio Players Slider */}
              {generationData?.audioFiles && generationData.audioFiles.length > 0 && (
                <div className="mb-8">


                  <div className="max-w-5xl mx-auto relative">
                    {/* Left Arrow */}
                    <button
                      onClick={() => setCurrentVariant(prev => prev === 0 ? generationData.audioFiles.length - 1 : prev - 1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 z-20 group"
                      disabled={generationData.audioFiles.length <= 1}
                    >
                      <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={() => setCurrentVariant(prev => prev === generationData.audioFiles.length - 1 ? 0 : prev + 1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 z-20 group"
                      disabled={generationData.audioFiles.length <= 1}
                    >
                      <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Main Player - Apple Music Style */}
                    <div className="bg-glass-card backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-glass hover:shadow-glass-hover transition-all duration-500 relative">
                      {/* Warning when Show Lyrics is pressed but song is not playing */}
                      {showLyrics && !isPlaying && (
                        <div className="absolute -top-8 right-1.5 text-white/80 text-xs font-medium bg-black/20 px-2 py-1 rounded-md">
                          Play the track first*
                        </div>
                      )}
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Album Art */}
                        <div className="relative flex-shrink-0">
                          <div className="w-72 h-[308px] bg-gradient-hero rounded-3xl flex items-center justify-center mx-auto lg:mx-0 overflow-hidden border-2 border-primary/60 relative group">
                            {customCoverImages[currentVariant] ? (
                              <img
                                src={customCoverImages[currentVariant]}
                                alt={`Custom Cover for ${songName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : generationData?.coverImages && generationData.coverImages.length > 0 ? (
                              <img
                                src={`/generatecover/${generationData.coverImages[currentVariant]}`}
                                alt={`Song Variant ${currentVariant + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={`/generatecover/${currentVariant === 0 ? 'default-cover.png' : 'Street Rain Aesthetic.jpg'}`}
                                alt={`Song Variant ${currentVariant + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCoverUpload}
                                  className="hidden"
                                  id="cover-upload"
                                />
                                <label
                                  htmlFor="cover-upload"
                                  className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Upload Cover
                                </label>
                              </div>
                            </div>
                          </div>
                          <Badge className="absolute -top-2 -right-2 bg-gradient-premium text-white border-0 px-3 py-1 rounded-full shadow-premium text-xs">
                            AI Generated
                          </Badge>
                        </div>

                        {/* Track Info & Controls */}
                        <div className="flex-1 space-y-6">
                          <div className="relative">
                            <div className="flex items-baseline gap-3 mb-2">
                              {isEditingName ? (
                                <input
                                  type="text"
                                  value={songName}
                                  onChange={(e) => setSongName(e.target.value)}
                                  onBlur={() => setIsEditingName(false)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setIsEditingName(false);
                                    }
                                  }}
                                  className="text-3xl font-bold text-white bg-transparent border-none outline-none focus:outline-none"
                                  autoFocus
                                />
                              ) : (
                                <h3
                                  className="text-3xl font-bold text-white cursor-pointer hover:text-white/80 transition-colors"
                                  onClick={() => setIsEditingName(true)}
                                  title="Click to edit song name"
                                >
                                  {songName}
                                </h3>
                              )}
                              <button
                                onClick={() => setIsEditingName(!isEditingName)}
                                className="text-white/60 hover:text-white/80 transition-colors"
                                title={isEditingName ? "Save" : "Edit song name"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M13 21h8" />
                                  <path d="m15 5 4 4" />
                                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-white/80 text-sm mb-8 text-left">
                              Generated from: {prompt}
                            </p>

                            {/* Show Lyrics Toggle */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setShowLyrics(!showLyrics);
                              }}
                              className="absolute top-0 right-0 text-sm bg-white/10 px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/20 transition-all duration-200"
                            >
                              {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                            </button>

                          </div>

                          {/* Lyrics Display / Waveform */}
                          <div className="bg-glass-card/100 rounded-2xl pt-6 pb-0 px-2 h-20 -mt-6">
                            {showLyrics && isPlaying && lyrics.length > 0 ? (
                              // Show lyrics only when Show Lyrics button is pressed AND playing
                              <div className="text-center flex items-center justify-center h-full min-h-full relative overflow-hidden">
                                {(() => {
                                  const currentLineIndex = lyrics.findIndex((line, index) => {
                                    const nextLine = lyrics[index + 1];
                                    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
                                  });

                                  const currentLine = currentLineIndex >= 0 ? lyrics[currentLineIndex] : null;
                                  const prevLine = currentLineIndex > 0 ? lyrics[currentLineIndex - 1] : null;

                                  return currentLine ? (
                                    <p
                                      key={currentLineIndex}
                                      className="lyric-roller absolute text-foreground/90 text-3xl font-bold text-center leading-tight"
                                      style={{
                                        animation: 'rollerFlow 3s ease-out forwards'
                                      }}
                                    >
                                      {currentLine.text}
                                    </p>
                                  ) : null;
                                })()}
                              </div>
                            ) : (
                              // Show waveform when Hide Lyrics is pressed OR not playing
                              <div className="flex items-end justify-center gap-[4.3px] h-full">
                                {Array.from({ length: 75 }, (_, index) => {
                                  const height = Math.random() * 100;
                                  return (
                                    <div
                                      key={index}
                                      className="bg-gradient-create rounded-full transition-all duration-300"
                                      style={{
                                        height: `${height * 0.96}%`,
                                        width: '4.5px',
                                        opacity: 0.65
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div
                              className="w-full bg-white/10 rounded-full h-2 overflow-hidden cursor-pointer relative"
                              onClick={(e) => {
                                if (audioRef.current && duration > 0) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const clickX = e.clientX - rect.left;
                                  const clickPercent = clickX / rect.width;
                                  const newTime = clickPercent * duration;
                                  audioRef.current.currentTime = newTime;
                                  setCurrentTime(newTime);
                                }
                              }}
                            >
                              <div
                                className="h-full bg-gradient-create rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>

                          {/* Premium Controls */}
                          <div className="flex items-center justify-between -mt-8">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentVariant(prev => prev === 1 ? 0 : 1)}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                              >
                                <SkipBack className="w-5 h-5" />
                              </Button>

                              <Button
                                variant="create"
                                size="icon"
                                onClick={togglePlay}
                                className="w-12 h-12 rounded-full shadow-glow hover:scale-110 transition-all duration-300 backdrop-blur-sm"
                              >
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentVariant(prev => prev === 1 ? 0 : 1)}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                              >
                                <SkipForward className="w-5 h-5" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setIsLiked((prev) => !prev); setLikes((n) => (isLiked ? Math.max(0, n - 1) : n + 1)); }}
                                className={`gap-2 backdrop-blur-sm rounded-full px-3 py-2 transition-colors ${isLiked ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-white' : ''}`} />
                                {likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full p-2">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full p-2">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`backdrop-blur-sm rounded-full p-2 transition-all duration-300 ${isMuted
                                  ? "bg-red-600/60 hover:bg-red-700/70 text-white"
                                  : "bg-white/5 hover:bg-white/10"
                                  }`}
                                onClick={toggleMute}
                                title={isMuted ? "Unmute" : "Mute"}
                              >
                                {isMuted ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                  </svg>
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dots Indicator */}
                    {generationData.audioFiles.length > 1 && (
                      <div className="flex justify-center mt-4 gap-2">
                        {generationData.audioFiles.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentVariant(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentVariant
                              ? 'bg-white'
                              : 'bg-white/30 hover:bg-white/50'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Lyrics (including TTS lyrics if available) */}
              {showLyrics && (generationData?.lyrics || generationData?.ttsLyrics) && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <h4 className="text-white text-lg font-semibold mb-4 text-center">Generated Lyrics</h4>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-h-60 overflow-y-auto space-y-4">
                    {generationData?.lyrics && (
                      <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {generationData.lyrics}
                      </pre>
                    )}
                    {generationData?.ttsLyrics && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-2 text-center">TTS Lyrics</div>
                        <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {generationData.ttsLyrics}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TTS Lyrics section hidden - using generated lyrics box instead */}
              {/* {generationData?.ttsLyrics && (
                  <div>
                    <h4 className="text-white text-lg font-semibold mb-4 text-center">TTS Lyrics</h4>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-h-40 overflow-y-auto">
                      <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {generationData.ttsLyrics}
                      </pre>
                    </div>
                  </div>
                )} */}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 mt-2">
            {isGenerating ? (
              <Button variant="secondary" className="rounded-full px-8 py-4 text-base" onClick={() => {
                setIsGenerating(false);
                navigate('/');
              }}>
                Cancel Generation
              </Button>
            ) : (
              <Button variant="create" className="rounded-full px-8 py-4 text-base" onClick={() => window.location.href = '/?focus=true'}>
                <Plus className="w-5 h-5 mr-3" />
                Create Another
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* My Songs Section */}
      <MySongsSection />

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Footer */}
      <Footer />
    </section>
  );
};

export default GeneratePage;