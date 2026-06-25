"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { GLOSSARY, GLOSSARY_PATTERN } from "@/lib/glossary";

type GlossContextValue = { open: (term: string) => void };
const GlossContext = createContext<GlossContextValue>({ open: () => {} });

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const open = useCallback((term: string) => setActive(term), []);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  return (
    <GlossContext.Provider value={{ open }}>
      {children}
      {active && GLOSSARY[active] && (
        <GlossModal term={active} definition={GLOSSARY[active]} onClose={close} />
      )}
    </GlossContext.Provider>
  );
}

function useGloss() {
  return useContext(GlossContext);
}

type Piece = { kind: "text"; value: string } | { kind: "term"; value: string };

function tokenize(text: string): Piece[] {
  if (!GLOSSARY_PATTERN) return [{ kind: "text", value: text }];
  const re = new RegExp(GLOSSARY_PATTERN, "g");
  const out: Piece[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ kind: "text", value: text.slice(last, m.index) });
    out.push({ kind: "term", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}

export function GlossText({ text }: { text: string }) {
  const { open } = useGloss();
  const pieces = useMemo(() => tokenize(text), [text]);
  return (
    <>
      {pieces.map((p, i) =>
        p.kind === "text" ? (
          <Fragment key={i}>{p.value}</Fragment>
        ) : (
          <button
            key={i}
            type="button"
            className="gloss-term"
            onClick={() => open(p.value)}
            aria-label={`${p.value} — 뜻 보기`}
          >
            {p.value}
          </button>
        ),
      )}
    </>
  );
}

function GlossModal({
  term,
  definition,
  onClose,
}: {
  term: string;
  definition: string;
  onClose: () => void;
}) {
  return (
    <div className="gloss-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="gloss-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gloss-modal-term"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="gloss-modal-close"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="gloss-modal-tag">어린이 사전</span>
        <h2 id="gloss-modal-term" className="gloss-modal-term">
          {term}
        </h2>
        <p className="gloss-modal-def">{definition}</p>
      </div>
    </div>
  );
}
