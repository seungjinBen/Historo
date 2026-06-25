import { MeokdolMascot } from "@/components/mascots/MeokdolMascot";
import { HOW_STEPS } from "@/lib/home-content";

export function HowItWorks() {
  return (
    <section className="home-section how-section">
      <div className="section-header how-section-header" data-rv="up">
        <span className="section-header-eyebrow">어떻게 만들어요?</span>
        <h2 className="section-header-title">대화하고 고르면, 4컷 완성!</h2>
        <p className="section-header-sub">
          글을 못 써도 괜찮아요. 말하거나 고르기만 하면 됩니다.
        </p>
        <div className="how-mascot" aria-hidden="true">
          <MeokdolMascot />
          <span className="how-mascot-name">먹돌이</span>
        </div>
      </div>
      <ol className="how-steps" role="list">
        {HOW_STEPS.map((step, idx) => (
          <li
            key={step.num}
            className="how-step"
            role="listitem"
            data-rv="left"
            data-rv-d={String(idx * 80)}
          >
            <span className="how-step-num">{step.num}</span>
            <div className="how-step-title">{step.title}</div>
            <p className="how-step-desc">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
