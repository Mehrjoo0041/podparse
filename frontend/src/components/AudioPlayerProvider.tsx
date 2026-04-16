import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { AudioPlayerContext, type AudioPlayerState } from '../hooks/useAudioPlayer';

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<AudioPlayerState['currentEpisode']>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((episode: { id: number; title: string; audioUrl: string }) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentEpisode?.id === episode.id) {
      audio.play();
      return;
    }

    audio.src = episode.audioUrl;
    audio.playbackRate = playbackRate;
    audio.play();
    setCurrentEpisode(episode);
  }, [currentEpisode, playbackRate]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  return (
    <AudioPlayerContext.Provider value={{
      currentEpisode, isPlaying, currentTime, duration, playbackRate,
      play, pause, resume, seek, setRate,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
