import { useCallback } from 'react';
import { useWorldStore } from '../store/worldStore';
import type { WorldBook } from '../types';

export function useWorldState(worldId?: number) {
  const store = useWorldStore();
  const world = store.currentWorldBook;

  const setVariable = useCallback(
    (varName: string, value: number) => {
      if (!world) return false;
      return true;
    },
    [world]
  );

  const changeVariable = useCallback(
    (varName: string, delta: number) => {
      if (!world) return false;
      return true;
    },
    [world]
  );

  const getWorldStateForPrompt = useCallback(() => {
    if (!world) return '';
    const parts: string[] = [];
    return parts.join('，');
  }, [world]);

  return {
    world,
    setVariable,
    changeVariable,
    getWorldStateForPrompt,
    setCurrentWorldBook: store.setCurrentWorldBook,
  };
}
