"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Github, Mail, Send } from "lucide-react";
import MagneticButton from "../MagneticButton";

const SOCIALS = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: Linkedin,
    handle: "/in/hamza",
  },
  {
    name: "GitHub",
    href: "https://github.com/",
    icon: Github,
    handle: "@hamza",
  },
  {
    name: "Email",
    href: "mailto:hello@example.com",
    icon: Mail,
    handle: "hello@example.com",
  },
];

/**
 * ContactSection — DOM overlay for Scene 6.
 *
 * Centered rotating 3D logo behind, foreground has social cards and a
 * contact form.
 */
export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend — simulate success.
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section
      className="relative min-h-screen w-full px-6 py-24 sm:py-32"
      data-section="contact"
      aria-label="Contact"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-col items-center text-center gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
            06 · Contact
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">Let's Build Something.</span>
          </h2>
          <p className="max-w-xl text-sm text-white/50 sm:text-base">
            Open to freelance projects, full-time roles, and conversations
            about craft. The fastest way to reach me is the form below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left — socials */}
          <div className="lg:col-span-5 space-y-3">
            {SOCIALS.map((s, i) => (
              <motion.a
                key={s.name}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md transition-all duration-300 hover:border-[#810172]/40 hover:bg-[#810172]/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 transition-colors group-hover:border-[#810172]/50">
                  <s.icon className="h-5 w-5 text-white/70 group-hover:text-[#b14aa0]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm text-white">
                    {s.name}
                  </div>
                  <div className="truncate font-mono text-[11px] text-white/40">
                    {s.handle}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/30 transition-colors group-hover:text-[#810172]">
                  →
                </span>
              </motion.a>
            ))}

            {/* Status block */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#810172] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#810172]" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Available for new work
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">
                Currently taking on freelance frontend projects and open to
                full-time roles. Based remotely — open to relocation for the
                right opportunity.
              </p>
            </div>
          </div>

          {/* Right — contact form */}
          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              onSubmit={handleSubmit}
              className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Your Name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Ada Lovelace"
                />
                <Field
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="ada@analytical.engine"
                />
              </div>
              <Field
                label="Message"
                type="textarea"
                required
                value={form.message}
                onChange={(v) => setForm({ ...form, message: v })}
                placeholder="Tell me about the project, the team, or the idea…"
                className="mt-4"
              />

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                  {sent ? "Message sent" : "Encrypted · End-to-end"}
                </span>
                <MagneticButton
                  variant="primary"
                  ariaLabel="Send message"
                  onClick={() => {}}
                >
                  <span
                    className="inline-flex items-center gap-2"
                    onClick={() =>
                      (
                        document.getElementById(
                          "contact-form-submit"
                        ) as HTMLButtonElement
                      )?.click()
                    }
                  >
                    <Send className="h-4 w-4" />
                    {sent ? "Sent" : "Send Message"}
                  </span>
                </MagneticButton>
                <button
                  id="contact-form-submit"
                  type="submit"
                  className="sr-only"
                  aria-hidden
                >
                  Submit
                </button>
              </div>

              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg border border-[#810172]/30 bg-[#810172]/10 px-4 py-3 text-[13px] text-[#b14aa0]"
                >
                  Thanks — your message has been queued. I'll get back to you
                  shortly.
                </motion.div>
              )}
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  type: "text" | "email" | "textarea";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  className,
}: FieldProps) {
  const base =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-sans text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#810172]/60 focus:ring-1 focus:ring-[#810172]/40";
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={5}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
    </label>
  );
}
