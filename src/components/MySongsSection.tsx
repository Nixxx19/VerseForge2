import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Play, Heart, Share2, Download } from "lucide-react";

const MySongsSection = () => {
  // Placeholder data for user's created songs
  const userSongs = [
    {
      id: 1,
      title: "My First Creation",
      genre: "Pop",
      duration: "3:24",
      likes: 42,
      createdAt: "2 days ago",
      isPublic: true
    },
    {
      id: 2,
      title: "Late Night Vibes",
      genre: "R&B",
      duration: "4:12",
      likes: 18,
      createdAt: "1 week ago",
      isPublic: false
    }
  ];

  return (
    <section id="my-songs" className="py-16 bg-background relative overflow-hidden scroll-mt-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-premium text-white border-0 px-6 py-2 mb-4 text-sm font-medium">
            Your Creations
          </Badge>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            VerseVault
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Access and manage all the songs you've created with Aether AI
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Create New Song Button */}
          <div className="text-center mb-12 py-8">
            <Button
              variant="create"
              size="lg"
              className="px-12 py-6 text-xl font-bold rounded-3xl shadow-glow hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/?focus=true'}
            >
              <Plus className="w-6 h-6 mr-3" />
              Create New Song
            </Button>
          </div>

          {/* User's Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSongs.map((song) => (
              <Card key={song.id} className="bg-glass-card backdrop-blur-xl border border-white/10 rounded-2xl hover:shadow-glass-hover transition-all duration-500 group">
                <CardContent className="p-6">
                  {/* Song Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-create rounded-xl flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant={song.isPublic ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {song.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  {/* Song Info */}
                  <div className="mb-4">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{song.genre}</span>
                      <span>•</span>
                      <span>{song.duration}</span>
                      <span>•</span>
                      <span>{song.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span>{song.likes} likes</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl p-2"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl p-2"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl p-2"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State Card */}
            <Card className="bg-glass-card/50 backdrop-blur-xl border border-white/5 rounded-2xl border-dashed hover:border-white/20 transition-all duration-500 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors duration-300">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  Create Your First Song
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start your musical journey with AI-powered creation
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:border-white/40 hover:bg-white/5"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MySongsSection;
