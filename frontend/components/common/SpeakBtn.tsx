"use client";

export function SpeakBtn({
  text,
  speak,
  stop,
  speaking,
}: {
  text: string;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
}) {
  return (
    <button
      className={"btn-speak" + (speaking ? " playing" : "")}
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? "읽기 멈추기" : "텍스트 읽어주기"}
    >
      {speaking ? "멈추기" : "읽어주기"}
    </button>
  );
}
