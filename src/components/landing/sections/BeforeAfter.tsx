"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import AnimatedCounter from "../ui/AnimatedCounter";
import WavySeparator from "../ui/WavySeparator";

const beforeRows = [
  { emoji: "😵", label: "Messages everywhere" },
  { emoji: "📌", label: "Tasks forgotten" },
  { emoji: "📄", label: "Decisions disappear" },
  { emoji: "🔁", label: "Meetings repeated" },
  { emoji: "⏰", label: "Manual follow-ups" },
];

const afterRows = [
  { emoji: "🤖", label: "AI organizes chats" },
  { emoji: "✅", label: "Tasks extracted automatically" },
  { emoji: "🧠", label: "Decisions saved forever" },
  { emoji: "📝", label: "Meeting summaries generated" },
  { emoji: "🚀", label: "AI follows up automatically" },
];

const inputTools = [
  { emoji: "💬", label: "Slack" },
  { emoji: "🎮", label: "Discord" },
  { emoji: "✉️", label: "Email" },
  { emoji: "📓", label: "Notion" },
  { emoji: "🎥", label: "Meet" },
];

const outputItems = [
  { emoji: "✅", label: "Tasks" },
  { emoji: "📝", label: "Summary" },
  { emoji: "🧠", label: "Memory" },
  { emoji: "⚡", label: "Action Items" },
];

function ComparisonRow({
  emoji,
  label,
  index,
  isInView,
  bgColor,
}: {
  emoji: string;
  label: string;
  index: number;
  isInView: boolean;
  bgColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.08,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center gap-4 p-3 rounded-2xl border-2 border-ink bg-white hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div
        className={`w-9 h-9 rounded-xl border-2 border-ink ${bgColor} flex items-center justify-center text-base flex-shrink-0`}
      >
        <motion.span
          animate={{ y: [0, -2, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.span>
      </div>
      <span className="text-[13px] font-bold text-ink">{label}</span>
    </motion.div>
  );
}

function ComparisonCard({
  title,
  subtitle,
  rows,
  headerBg,
  rowBg,
  headerEmoji,
}: {
  title: string;
  subtitle: string;
  rows: { emoji: string; label: string }[];
  headerBg: string;
  rowBg: string;
  headerEmoji: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="tr-card overflow-hidden"
    >
      <div className={`px-6 py-5 border-b-3 border-ink ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border-3 border-ink bg-white flex items-center justify-center text-lg flex-shrink-0">
            {headerEmoji}
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-ink">{title}</h3>
            <p className="text-[12px] font-medium text-ink-muted">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        {rows.map((row, i) => (
          <ComparisonRow
            key={row.label}
            emoji={row.emoji}
            label={row.label}
            index={i}
            isInView={isInView}
            bgColor={rowBg}
          />
        ))}
      </div>
    </motion.div>
  );
}

function CenterPipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-4 md:py-10">
      <div className="flex flex-wrap justify-center gap-1.5 max-w-[180px]">
        {inputTools.map((tool, i) => (
          <motion.div
            key={tool.label}
            initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16, y: 10 }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
              delay: 0.25 + i * 0.07,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="px-2.5 py-1 rounded-xl border-2 border-ink bg-white text-[10px] font-bold flex items-center gap-1"
          >
            <span className="text-[12px]">{tool.emoji}</span>
            <span className="text-ink">{tool.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
        transition={{ delay: 0.65, duration: 0.3 }}
        className="w-0.5 h-5 bg-ink"
        style={{ transformOrigin: "top" }}
      />
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.7, duration: 0.2 }}
        className="text-[10px] font-bold text-ink-muted"
      >
        ↓
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{
          delay: 0.8,
          type: "spring",
          stiffness: 250,
          damping: 12,
        }}
        className="px-4 py-2 rounded-2xl border-3 border-ink bg-accent-purple text-white text-[12px] font-extrabold flex items-center gap-1.5 shadow-[0_3px_0_0_#1A1A1A]"
      >
        <span className="text-[14px]">✨</span>
        <span>ThinkRoom AI</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.0, duration: 0.2 }}
        className="text-[10px] font-bold text-ink-muted"
      >
        ↓
      </motion.div>

      <div className="flex flex-col gap-1.5">
        {outputItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 12, y: 8 }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
              delay: 1.1 + i * 0.08,
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="px-3 py-1.5 rounded-xl border-2 border-ink bg-pastel-green/60 text-[10px] font-bold flex items-center gap-1.5"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: 1.1 + i * 0.2,
                ease: "easeInOut",
              }}
            >
              {item.emoji}
            </motion.span>
            <span className="text-ink">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  return (
    <>
      <WavySeparator color="#FAF8F3" />
      <section
        id="comparison"
        className="tr-section-padding overflow-hidden relative"
        style={{ background: "#FFF3F5" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-32 left-10 w-72 h-72 rounded-full bg-accent-purple/6 pointer-events-none" />
        <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-pastel-pink/40 pointer-events-none" />

        <div className="tr-container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border-2 border-ink bg-pastel-purple text-[12px] font-bold mb-4">
              The Difference
            </span>
            <h2 className="tr-heading-lg mb-4">
              Before vs
              <br />
              After ThinkRoom.
            </h2>
            <p className="text-[17px] font-medium text-ink-soft max-w-lg mx-auto leading-relaxed">
              Stop juggling tools.
              <br />
              Let AI organize everything automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
            <div className="md:col-span-4">
              <ComparisonCard
                title="Without ThinkRoom"
                subtitle="Scattered. Manual. Forgotten."
                rows={beforeRows}
                headerBg="bg-pastel-pink/40"
                rowBg="bg-pastel-pink/30"
                headerEmoji="😵"
              />
            </div>

            <div className="md:col-span-4 flex justify-center">
              <CenterPipeline />
            </div>

            <div className="md:col-span-4">
              <ComparisonCard
                title="With ThinkRoom"
                subtitle="Organized. Automatic. AI-powered."
                rows={afterRows}
                headerBg="bg-pastel-green/40"
                rowBg="bg-pastel-green/30"
                headerEmoji="✨"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-ink bg-pastel-green/40">
              <motion.div
                className="w-2 h-2 rounded-full bg-accent-green"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-[12px] font-bold text-ink">
                Teams save <AnimatedCounter value={8} suffix="+" /> hours every
                week
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
