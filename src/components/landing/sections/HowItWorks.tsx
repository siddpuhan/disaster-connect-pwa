"use client";
import { motion } from "framer-motion";
import WavySeparator from "../ui/WavySeparator";

const flowSteps = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Conversation",
    desc: "Your team chats naturally in ThinkRoom.",
    color: "bg-pastel-blue",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    title: "AI Understands",
    desc: "Context, intent, and decisions are analyzed in realtime.",
    color: "bg-pastel-purple",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Tasks Extracted",
    desc: "Action items appear as structured tasks.",
    color: "bg-pastel-orange",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Decisions Saved",
    desc: "Every decision is recorded with full context.",
    color: "bg-pastel-green",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Workspace Updated",
    desc: "Everything organized — instantly accessible.",
    color: "bg-pastel-pink",
  },
];

function FlowCard({
  step,
  index,
}: {
  step: (typeof flowSteps)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        className={`w-12 h-12 rounded-2xl border-2 border-ink ${step.color} flex items-center justify-center shadow-[0_2px_0_0_#1A1A1A]`}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
      >
        {step.icon}
      </motion.div>
      <h3 className="text-[13px] font-bold text-ink mt-3">{step.title}</h3>
      <p className="text-[11px] font-medium text-ink-muted mt-1 max-w-[140px] leading-snug">
        {step.desc}
      </p>
    </motion.div>
  );
}

function FlowArrow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex items-center justify-center w-8 flex-shrink-0"
      style={{ transformOrigin: "left" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </motion.div>
  );
}

function MobileDivider({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
      className="md:hidden w-0.5 h-6 bg-ink/10 mx-auto"
      style={{ transformOrigin: "top" }}
    />
  );
}

export default function HowItWorks() {
  return (
    <>
      <WavySeparator color="#FEFCF3" />
      <section id="how-thinkroom-thinks" className="tr-section-padding bg-ivory">
        <div className="tr-container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border-2 border-ink bg-pastel-orange text-[12px] font-bold mb-4">
              How ThinkRoom Thinks
            </span>
            <h2 className="tr-heading-lg">
              From chat to clarity
              <br />
              in five steps.
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 max-w-5xl mx-auto">
            {flowSteps.map((step, i) => (
              <div key={step.title} className="flex flex-col md:flex-row items-center">
                <FlowCard step={step} index={i} />
                {i < flowSteps.length - 1 && <FlowArrow index={i} />}
                {i < flowSteps.length - 1 && <MobileDivider index={i} />}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-center mt-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-ink bg-pastel-yellow/60 shadow-[0_2px_0_0_#1A1A1A]">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-accent-green"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-[11px] font-bold text-ink">
                Fully automatic · No setup required
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
