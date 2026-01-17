import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right'); // 'left' or 'right'
  const [timerKey, setTimerKey] = useState(0); // Key to reset timer

  const testimonials = [
    {
      name: "Arnav Deora",
      role: "Music Composer",
      company: "Thapar University",
      avatar: "Reviews/1REVIEW.jpg.jpg",
      content: "Aether has revolutionized my workflow. The AI understands musical nuance in ways I never thought possible.",
      rating: 5,
      verified: true
    },

    {
      name: "Aditi Sood",
      role: "Groover",
      company: "Thapar University",
      avatar: "Reviews/3REVIEW.jpg.jpg",
      content: "As an indie artist, Aether levels the playing field. My latest album, created entirely with AI assistance.",
      rating: 4,
      verified: true
    },
    {
      name: "Krish Kumar",
      role: "Vibe Curator",
      company: "Thapar University",
      avatar: "Reviews/4REVIEW.jpg.jpg",
      content: "The technical precision and creative possibilities are astounding. I'm integrating Aether into our curriculum.",
      rating: 4,
      verified: true
    },
    {
      name: "Meharpreet Singh",
      role: "Beat Boxer",
      company: "Punjab Engineering College",
      avatar: "Reviews/2REVIEW.jpg.jpg",
      content: "From concept to final mix, Aether delivers professional-grade results. I've used it for three major film scores this year.",
      rating: 4,
      verified: true
    },
    {
      name: "Naman Sharma",
      role: "Sonic Explorer",
      company: "Thapar University",
      avatar: "Reviews/5REVIEW.jpg.jpg",
      content: "For rapid prototyping and creative exploration, nothing comes close. It's become essential for our pre-production process.",
      rating: 5,
      verified: true
    },
    {
      name: "Palak Sharma",
      role: "Playlist Enthusiast",
      company: "Delhi Techinical University",
      avatar: "Reviews/6REVIEW.jpg.jpg",
      content: "The electronic music generation capabilities are insane. It understands every subgenre and creates authentic tracks.",
      rating: 4,
      verified: true
    },
    {
      name: "Kanav Kumar",
      role: "Electronic Music Producer",
      company: "University of Queensland",
      avatar: "Reviews/7REVIEW.jpg.jpg",
      content: "Aether has transformed my creative process. The AI comprehends musical subtleties with remarkable precision.",
      rating: 5,
      verified: true
    },
    {
      name: "Aryan Malik",
      role: "Upcoming Music Producer",
      company: "Thapar University",
      avatar: "Reviews/8REVIEW.jpg.jpg",
      content: "The AI collaboration is extraordinary. It's like having a brilliant partner available 24/7 for artistic innovation.",
      rating: 4,
      verified: true
    },
    {
      name: "Kashish Mehra",
      role: "Chill Guy",
      company: "Thapar University",
      avatar: "Reviews/9REVIEW.jpg.jpg",
      content: "Exceptional for rapid prototyping and creative exploration. Indispensable tool for every music producer.",
      rating: 5,
      verified: true
    }
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, timerKey]);

  // Get current 3 testimonials
  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  // Handle navigation with direction and timer reset
  const handleSlideChange = (direction: 'left' | 'right') => {
    setSlideDirection(direction);
    if (direction === 'right') {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
    } else {
      setCurrentSlide((prev) => (prev - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3));
    }

    // Reset the auto-slide timer
    setTimerKey(prev => prev + 1);
  };

  return (
    <section id="testimonials" className="py-16 bg-background relative overflow-hidden scroll-mt-40">
      {/* Background effects - removed to fix purple spots */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-premium text-white border-0 px-6 py-2 mb-6 text-sm font-medium">
            Trusted by Professionals
          </Badge>
          <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">
            What Users
            <br />
            <span className="bg-gradient-warm bg-clip-text text-transparent relative isolate bg-background">
              Are Saying
            </span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Join thousands of musicians, producers, and creators who trust Aether for their musical journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
          {/* Left Arrow */}
          <button
            onClick={() => handleSlideChange('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-500 ease-out group"
          >
            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => handleSlideChange('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-500 ease-out group"
          >
            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {getCurrentTestimonials().map((testimonial, index) => (
            <Card
              key={`${currentSlide}-${index}`}
              className={`group transition-all duration-1000 ease-out hover:scale-105 hover:shadow-glass-hover hover:bg-glass-hover animate-in fade-in-0 h-[273px] ${slideDirection === 'left' ? 'slide-in-from-right-8' : 'slide-in-from-left-8'
                }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-6 flex-1">
                  <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed text-lg">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-premium text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </p>
                    <p className="text-primary text-sm font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(Math.ceil(testimonials.length / 3))].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;