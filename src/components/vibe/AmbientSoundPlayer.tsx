'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Cloud, Coffee, Waves, Wind, Music } from 'lucide-react';

interface AmbientSound {
  id: string;
  name: string;
  icon: React.ReactNode;
  youtubeId: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: <Cloud className="h-4 w-4" />,
    youtubeId: 'q76bMs-NwRk', // 10 hours rain sounds
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: <Coffee className="h-4 w-4" />,
    youtubeId: 'gaGltwHXRK0', // Coffee shop ambience
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: <Waves className="h-4 w-4" />,
    youtubeId: 'WHPEKLQID4U', // Ocean waves
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: <Wind className="h-4 w-4" />,
    youtubeId: 'wzjWIxXBs_s', // Wind sounds
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    icon: <Music className="h-4 w-4" />,
    youtubeId: 'jfKfPfyJRdk', // Lofi hip hop radio
  },
];

export default function AmbientSoundPlayer() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    console.log('[AmbientSoundPlayer] Component mounted');

    // Set client-side flag
    setIsClient(true);

    // Only load YouTube API on client side
    if (typeof window === 'undefined') {
      console.log('[AmbientSoundPlayer] Window is undefined, skipping YouTube API load');
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      console.log('[AmbientSoundPlayer] YouTube API script already exists');
      return;
    }

    console.log('[AmbientSoundPlayer] Loading YouTube API script');
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      console.log('[AmbientSoundPlayer] YouTube API ready');
    };
  }, []);

  useEffect(() => {
    if (player && typeof player.setVolume === 'function') {
      if (isMuted) {
        player.setVolume(0);
      } else {
        player.setVolume(volume);
      }
    }
  }, [volume, isMuted, player]);

  const handleSoundToggle = (soundId: string) => {
    // Only work on client side
    if (typeof window === 'undefined') return;

    if (activeSound === soundId) {
      // Stop current sound
      if (player) {
        player.stopVideo();
      }
      setActiveSound(null);
      setPlayer(null);
    } else {
      // Play new sound
      const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
      if (sound) {
        if (player) {
          player.stopVideo();
        }

        // Check if YouTube API is loaded
        // @ts-ignore
        if (!window.YT || !window.YT.Player) {
          console.error('YouTube API not loaded yet');
          return;
        }

        // Create new player
        // @ts-ignore
        const newPlayer = new window.YT.Player(`youtube-player-${soundId}`, {
          height: '0',
          width: '0',
          videoId: sound.youtubeId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: sound.youtubeId,
            controls: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(isMuted ? 0 : volume);
              event.target.playVideo();
            },
          },
        });

        setPlayer(newPlayer);
        playerRef.current = newPlayer;
        setActiveSound(soundId);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Don't render on server
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Ambient Sounds</h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="text-sm text-white/40">Loading ambient sounds...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Ambient Sounds</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Hidden YouTube players */}
      <div className="hidden">
        {AMBIENT_SOUNDS.map((sound) => (
          <div key={sound.id} id={`youtube-player-${sound.id}`} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {AMBIENT_SOUNDS.map((sound) => (
          <Button
            key={sound.id}
            variant={activeSound === sound.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSoundToggle(sound.id)}
            className={`gap-2 rounded-xl ${
              activeSound === sound.id
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#38f8c7] text-white border-0'
                : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {sound.icon}
            {sound.name}
          </Button>
        ))}
      </div>

      {activeSound && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-white/40 w-10 text-right">{volume}%</span>
        </div>
      )}
    </div>
  );
}

