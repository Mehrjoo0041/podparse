import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { AudioPlayerContext, type AudioPlayerState } from '../hooks/useAudioPlayer';
import { recordListen } from '../api/client';

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<AudioPlayerState['currentEpisode']>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const listenRecordedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    // Track listen completion
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Record listen when user has listened for 10+ seconds or completed
  useEffect(() => {
    if (!currentEpisode || listenRecordedRef.current) return;

    if (currentTime >= 10) {
      listenRecordedRef.current = true;
      recordListen(currentEpisode.id, false, currentTime).catch(() => {});
    }
  }, [currentTime, currentEpisode]);

  // Record completion
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const handleEnded = () => {
      recordListen(currentEpisode.id, true, audio.duration).catch(() => {});
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentEpisode]);

  const play = useCallback((episode: { id: number; title: string; audioUrl: string }) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentEpisode?.id === episode.id) {
      audio.play();
      return;
    }

    listenRecordedRef.current = false;
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
