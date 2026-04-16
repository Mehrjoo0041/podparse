import { createContext, useContext } from 'react';

export interface AudioPlayerState {
  currentEpisode: { id: number; title: string; audioUrl: string } | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  play: (episode: { id: number; title: string; audioUrl: string }) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setRate: (rate: number) => void;
}

export const AudioPlayerContext = createContext<AudioPlayerState>({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  play: () => {},
  pause: () => {},
  resume: () => {},
  seek: () => {},
  setRate: () => {},
});

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
