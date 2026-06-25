"use client";

import { useCallback, useRef, useState } from "react";

const EL_KEY    = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? "";
// Jessica — 젊고 친근한 톤, 아동 콘텐츠에 적합
const VOICE_ID  = "cgSgspJ2msm6clMCkdW9";
const MODEL_ID  = "eleven_multilingual_v2";
const EL_URL    = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const abortRef  = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    stop();

    // ElevenLabs 키 없으면 브라우저 TTS fallback
    if (!EL_KEY) {
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR"; u.rate = 0.95;
      u.onstart = () => setSpeaking(true);
      u.onend   = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSpeaking(true);

    try {
      const res = await fetch(EL_URL, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": EL_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setSpeaking(false);
    }
  }, [stop]);

  return { speak, stop, speaking };
}
