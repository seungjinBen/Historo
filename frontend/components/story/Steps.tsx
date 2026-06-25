export function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="steps" aria-label={`${total}단계 중 ${current + 1}번째`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={"dot" + (i < current ? " on" : i === current ? " now" : "")} />
      ))}
    </div>
  );
}
