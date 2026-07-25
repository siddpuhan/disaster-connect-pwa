"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LogoHorizontal } from "../ui/Logo";

const navLinks = [
  { label: "Product", href: "#" },
  { label: "Superpowers", href: "#ai-superpowers" },
  { label: "How it works", href: "#how-thinkroom-thinks" },
  { label: "FAQ", href: "#faq" },
];

const resourceLinks = [
  { label: "Documentation", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Contact", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookies", href: "#" },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="group relative text-[13px] font-semibold text-ink-soft hover:text-ink transition-colors duration-200 w-fit py-0.5"
    >
      {label}
      <span className="absolute -bottom-0 left-0 w-0 h-[2px] bg-accent-purple rounded-full group-hover:w-full transition-all duration-250" />
    </a>
  );
}

function SocialIcon({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="w-9 h-9 rounded-xl border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-pastel-purple hover:shadow-[0_2px_0_0_#1A1A1A] transition-all duration-200"
      aria-label={label}
    >
      {icon}
    </motion.a>
  );
}

function ColumnHeader({ label }: { label: string }) {
  return (
    <h4 className="text-[10px] font-extrabold text-ink-muted mb-3 uppercase tracking-[0.12em]">
      {label}
    </h4>
  );
}

export default function Footer() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-40px" });

  return (
    <footer ref={sectionRef} className="overflow-hidden" style={{ background: "#F2E29F" }}>
      <div className="tr-container-wide px-6 md:px-10 py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Top Row ── */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoHorizontal size="md" />
              <p className="text-[15px] font-bold text-ink mt-2 leading-snug max-w-xs">
                Where conversations become organized work.
              </p>
              <p className="text-[13px] font-medium text-ink-muted mt-1 max-w-xs">
                AI that quietly organizes every conversation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-[clamp(24px,4vw,40px)] font-black leading-[1.0] tracking-[-0.03em] text-ink">
                Build better.
                <br />
                Collaborate smarter.
              </h2>
            </motion.div>
          </div>

          {/* ── Middle Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ColumnHeader label="Navigation" />
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ColumnHeader label="Resources" />
              <div className="flex flex-col gap-0.5">
                {resourceLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ColumnHeader label="Legal" />
              <div className="flex flex-col gap-0.5">
                {legalLinks.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ColumnHeader label="Connect" />
              <div className="flex gap-2 mb-3">
                {socialLinks.map((s) => (
                  <SocialIcon key={s.label} icon={s.icon} label={s.label} href={s.href} />
                ))}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-ink bg-white/60">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-accent-green"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="text-[10px] font-bold text-ink">All systems operational</span>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Row ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="pt-4 border-t-2 border-ink/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-ink-muted">
                &copy; {new Date().getFullYear()} ThinkRoom AI. All rights reserved.
              </p>
              <p className="text-[11px] font-medium text-ink-muted text-center">
                Made with <motion.span
                  className="inline-block"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  &#9829;
                </motion.span> for modern teams.
              </p>
              <div className="flex items-center gap-3">
                {["GitHub", "Documentation", "Status"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-[11px] font-bold text-ink-muted hover:text-ink transition-colors duration-200 group relative"
                  >
                    {item}
                    <span className="absolute -bottom-0 left-0 w-0 h-[2px] bg-accent-purple rounded-full group-hover:w-full transition-all duration-250" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
