"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import WavySeparator from "../ui/WavySeparator";

function ContextMemoryVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="tr-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-ink bg-white">
        <div className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#FFD93D] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#6BCB77] border border-ink" />
        <span className="ml-2 text-[8px] font-bold text-ink-muted">thinkroom.ai/team</span>
      </div>
      <div className="p-4 bg-white space-y-3">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0">R</div>
          <div className="flex-1">
            <div className="text-[7px] font-bold text-ink-muted mb-0.5">Rahul · 2h ago</div>
            <div className="px-2.5 py-1.5 rounded-xl border border-[#E8E6E1] bg-[#D6E8FF]/40 text-[9px] font-medium text-ink">
              Remember we decided to use PostGIS for location data?
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="ml-8 pl-3 border-l-2 border-accent-purple"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
            <span className="text-[7px] font-bold text-accent-purple uppercase tracking-wider">Context Retrieved</span>
          </div>
          <div className="bg-accent-purple/[0.04] rounded-xl px-3 py-2 border border-accent-purple/20">
            <p className="text-[9px] font-semibold text-ink">PostGIS Integration</p>
            <p className="text-[8px] text-ink-muted mt-0.5">Decision made on Mar 12 — Using PostGIS for geospatial queries</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex items-center gap-1.5 text-[8px] font-semibold text-ink-muted"
        >
          <motion.div
            className="w-1 h-1 rounded-full bg-accent-green"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span>AI recalled 3 related decisions</span>
        </motion.div>
      </div>
    </div>
  );
}

function TaskExtractionVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="tr-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-ink bg-white">
        <div className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#FFD93D] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#6BCB77] border border-ink" />
        <span className="ml-2 text-[8px] font-bold text-ink-muted">thinkroom.ai/chat</span>
      </div>
      <div className="p-4 bg-white space-y-3">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FF8A47] flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0">A</div>
          <div>
            <div className="text-[7px] font-bold text-ink-muted mb-0.5">Alex</div>
            <div className="px-2.5 py-1.5 rounded-xl border border-[#E8E6E1] bg-[#FFE4CC]/40 text-[9px] font-medium text-ink">
              Someone needs to update the API docs before Friday
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          className="ml-8"
        >
          <div className="flex items-center gap-1 mb-1.5">
            <motion.div
              className="w-4 h-4 rounded-md bg-accent-purple border border-ink flex items-center justify-center text-white text-[6px] font-bold flex-shrink-0"
              animate={{ rotate: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              ✓
            </motion.div>
            <span className="text-[7px] font-bold text-accent-purple uppercase tracking-wider">Task Extracted</span>
          </div>
          <div className="border-2 border-ink rounded-xl bg-pastel-orange/60 p-3 shadow-[0_2px_0_0_#1A1A1A]">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-3 h-3 rounded-full border border-ink bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              </div>
              <span className="text-[9px] font-bold text-ink">Update API Documentation</span>
            </div>
            <p className="text-[8px] font-medium text-ink-soft">Due Friday · Assigned to team</p>
            <motion.div
              className="mt-1.5 h-1 rounded-full bg-ink/10 overflow-hidden"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.div
                className="h-full rounded-full bg-accent-purple"
                initial={{ width: "0%" }}
                animate={isInView ? { width: "65%" } : {}}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MeetingSummaryVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="tr-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-ink bg-white">
        <div className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#FFD93D] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#6BCB77] border border-ink" />
        <span className="ml-2 text-[8px] font-bold text-ink-muted">thinkroom.ai/summary</span>
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-lg bg-accent-purple border border-ink flex items-center justify-center text-white text-[7px] font-bold">AI</div>
          <div>
            <div className="text-[9px] font-bold text-ink">Sprint Planning Summary</div>
            <div className="text-[7px] font-medium text-ink-muted">Generated automatically · 12m ago</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Key Decisions", items: ["Migrate to Supabase", "Use PostGIS for location"], color: "bg-pastel-purple" },
            { label: "Action Items", items: ["Update API docs (Alex)", "Deploy backend (Rahul)"], color: "bg-pastel-orange" },
            { label: "Topics Covered", items: ["Database migration", "API architecture v2"], color: "bg-pastel-blue" },
          ].map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
              className={`${section.color} rounded-xl border-2 border-ink p-2.5`}
            >
              <div className="text-[8px] font-extrabold text-ink-muted mb-1 uppercase tracking-wider">{section.label}</div>
              {section.items.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[9px] font-semibold text-ink">
                  <div className="w-1 h-1 rounded-full bg-ink/30" />
                  {item}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.3 }}
          className="mt-3 pt-2 border-t border-ink/10 flex items-center gap-2 text-[8px] font-semibold text-ink-muted"
        >
          <motion.div
            className="w-1 h-1 rounded-full bg-accent-green"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span>Shared with team · 4 people notified</span>
        </motion.div>
      </div>
    </div>
  );
}

function DecisionTimelineVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const decisions = [
    { date: "Mar 10", title: "Supabase Migration", desc: "Move from current DB to Supabase", color: "bg-pastel-blue" },
    { date: "Mar 12", title: "PostGIS Integration", desc: "Use PostGIS for geospatial queries", color: "bg-pastel-purple" },
    { date: "Mar 14", title: "Tailwind for Dashboard", desc: "Use Tailwind + Radix UI for admin panel", color: "bg-pastel-green" },
    { date: "Mar 16", title: "API Architecture v2", desc: "Finalized endpoint structure", color: "bg-pastel-orange" },
  ];

  return (
    <div ref={ref} className="tr-card overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-ink bg-white">
        <div className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#FFD93D] border border-ink" />
        <div className="w-2 h-2 rounded-full bg-[#6BCB77] border border-ink" />
        <span className="ml-2 text-[8px] font-bold text-ink-muted">thinkroom.ai/decisions</span>
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-lg bg-ink border border-ink flex items-center justify-center text-white text-[7px] font-bold">T</div>
          <span className="text-[9px] font-bold text-ink">Decision Timeline</span>
          <span className="text-[7px] font-medium text-ink-muted ml-auto">4 decisions this week</span>
        </div>
        <div className="space-y-1">
          {decisions.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.3 }}
              className="relative flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 border-ink ${d.color} z-10`}
                  animate={isInView ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                />
                {i < decisions.length - 1 && (
                  <motion.div
                    className="w-0.5 flex-1 min-h-[32px] bg-ink/10"
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.3 }}
                    style={{ transformOrigin: "top" }}
                  />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="text-[7px] font-bold text-ink-muted">{d.date}</div>
                <div className="text-[9px] font-bold text-ink">{d.title}</div>
                <div className="text-[8px] font-medium text-ink-soft">{d.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const showcases = [
  {
    id: "memory",
    title: "Context Memory",
    description:
      "ThinkRoom remembers every conversation. Reference past discussions, decisions, and context without scrolling through endless chat history.",
    visual: ContextMemoryVisual,
  },
  {
    id: "tasks",
    title: "Auto Task Extraction",
    description:
      "Tasks appear the moment someone says 'let's do this.' No commands, no manual entry, no forgotten action items.",
    visual: TaskExtractionVisual,
  },
  {
    id: "summaries",
    title: "Meeting Summaries",
    description:
      "Every meeting generates a structured summary with decisions, action items, and key discussion points — ready to share instantly.",
    visual: MeetingSummaryVisual,
  },
  {
    id: "decisions",
    title: "Decision Timeline",
    description:
      "Every decision is logged automatically. See who decided what and why, with full context from the original conversation.",
    visual: DecisionTimelineVisual,
  },
];

function ShowcaseRow({
  showcase,
  index,
}: {
  showcase: (typeof showcases)[0];
  index: number;
}) {
  const isReversed = index % 2 === 1;
  const Visual = showcase.visual;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center ${
        index > 0 ? "mt-16 md:mt-24" : ""
      }`}
    >
      <div className={isReversed ? "md:order-2" : ""}>
        <span className="inline-block px-3 py-1 rounded-full border-2 border-ink bg-white text-[10px] font-extrabold text-ink-muted mb-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="tr-heading-md mb-3">{showcase.title}</h3>
        <p className="text-[15px] font-medium text-ink-soft leading-relaxed max-w-md">
          {showcase.description}
        </p>
      </div>
      <div className={isReversed ? "md:order-1" : ""}>
        <Visual />
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <>
      <WavySeparator color="#FFFFFF" />
      <section id="ai-superpowers" className="tr-section-padding overflow-hidden" style={{ background: "#FFF7F8" }}>
        <div className="tr-container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border-2 border-ink bg-pastel-purple text-[12px] font-bold mb-4">
              AI Superpowers
            </span>
            <h2 className="tr-heading-lg">
              Four capabilities.
              <br />
              Infinite possibilities.
            </h2>
            <p className="tr-text-body mt-4 max-w-lg mx-auto text-ink-soft">
              ThinkRoom doesn't just log your chats. It understands, organizes, and remembers everything that matters.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {showcases.map((showcase, i) => (
              <ShowcaseRow key={showcase.id} showcase={showcase} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
