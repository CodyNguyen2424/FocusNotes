
import { useState, useRef } from 'react';
import { Music, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './button';
import { CustomTooltip } from './custom-tooltip';
import { Slider } from './slider';

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
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrackIndex(index);
    const newTrack = musicFiles[index];
    audioRef.current = new Audio(newTrack);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.play();
  };

  const handlePrevious = () => {
    const newIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    playTrack(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentTrackIndex + 1) % musicFiles.length;
    playTrack(newIndex);
  };
  
  const togglePlay = () => {
    if (!audioRef.current) {
      playTrack(currentTrackIndex);
    } else if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="flex items-center gap-2">
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
      {isPlaying && (
        <div className="flex items-center gap-2">
          <CustomTooltip content="Previous song" trigger={
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="text-gray-700 dark:text-gray-200"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          } />
          <div className="w-24">
            <Slider
              defaultValue={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
            />
          </div>
          <CustomTooltip content="Next song" trigger={
            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="text-gray-700 dark:text-gray-200"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          } />
        </div>
      )}
    </div>
  );
}
