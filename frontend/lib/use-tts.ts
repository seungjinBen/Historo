"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 브라우저 SpeechSynthesis 래핑 — 한국어 음성 자동 선택, 발화/중단/말하는 중 상태.
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const koVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // 한국어 음성 로드: getVoices()는 비동기로 채워지므로 voiceschanged를 기다림
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const vs = window.speechSynthesis.getVoices();
      koVoiceRef.current =
        vs.find((v) => v.lang === "ko-KR") ??
        vs.find((v) => v.lang.startsWith("ko")) ??
        null;
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.95;
    if (koVoiceRef.current) u.voice = koVoiceRef.current;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
