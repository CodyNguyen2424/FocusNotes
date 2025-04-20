
import { useState, useRef } from 'react';
import { Music, Pause } from 'lucide-react';
import { Button } from './button';
import { CustomTooltip } from './custom-tooltip';

// Import audio files directly
import lofiHipHop80 from '@assets/Lofi_Hip_Hop__BPM80.mp3';
import lofiHipHop90 from '@assets/Lofi_Hip_Hop__BPM90.mp3';
import lofiHipHop95 from '@assets/Lofi_Hip_Hop__BPM95.mp3';

const musicFiles = [
  lofiHipHop80,
  lofiHipHop90,
  lofiHipHop95
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const togglePlay = () => {
    if (!audioRef.current) {
      const randomTrack = musicFiles[Math.floor(Math.random() * musicFiles.length)];
      audioRef.current = new Audio(randomTrack);
      audioRef.current.loop = true;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <CustomTooltip
      content={isPlaying ? "Pause music" : "Play music"}
      trigger={
        <Button
          onClick={togglePlay}
          variant="ghost"
          size="icon"
          className="text-gray-700 dark:text-gray-200"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </Button>
      }
    />
  );
}
