import { useCallback, useEffect, useState } from 'react';
import { getUserVoicePreference, updateUserVoicePreference } from '@/lib/guestDb';
import type { VoiceType } from '@/types/ai';

export function useVoicePreference(guestId: string) {
  const [voice, setVoice] = useState<VoiceType>('uncleSam');

  const loadVoicePreference = useCallback(async () => {
    if (!guestId) return;

    try {
      const voicePref = await getUserVoicePreference(guestId);
      setVoice(voicePref);
    } catch (error) {
      setVoice('analyst')
    }
  }, [guestId]);

  useEffect(() => {
    loadVoicePreference();
  }, [loadVoicePreference]);

  const handleVoiceChange = useCallback(async (newVoice: VoiceType) => {
    if (guestId) {
      try {
        await updateUserVoicePreference(guestId, newVoice);
        setVoice(newVoice)
      } catch (error) {
        setVoice('analyst')
      }
    }
  }, [guestId]);

  return {
    voice,
    setVoice: handleVoiceChange
  };
}