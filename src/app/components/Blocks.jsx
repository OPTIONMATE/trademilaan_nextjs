"use client"
import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FiArrowRight, FiMail, FiMapPin } from "react-icons/fi";

export const RevealBento = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#f7f9ff] to-white px-4 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden>
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-[#9BE749]/30" />
        <div className="absolute right-12 bottom-28 h-72 w-72 rounded-full bg-[#6d5bff]/25" />
      </div>
      <motion.div
        initial="initial"
        animate="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        className="relative mx-auto grid max-w-5xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <SocialsBlock />
        <LocationBlock />
        <EmailListBlock />
      </motion.div>
    </div>
  );
};

const Block = ({ className, ...rest }) => {
  return (
    <motion.div
      variants={{
        initial: {
          scale: 0.5,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "col-span-4 rounded-xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)] backdrop-blur",
        className
      )}
      {...rest}
    />
  );
};

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <div className="mb-4 size-14 rounded-full bg-gradient-to-br from-[#9BE749] to-[#6d5bff] text-neutral-900 flex items-center justify-center text-3xl shadow-lg shadow-[#9BE749]/35">
      📊
    </div>
    <h1 className="mb-12 text-4xl font-semibold leading-tight text-neutral-900">
      Trademilaan. {" "}
      <span className="text-slate-500 font-normal">
        AI-Powered Market Insights for Smarter Trading.
      </span>
    </h1>
    <a
      href="/contact"
      className="flex items-center gap-2 text-[#6d5bff] font-semibold hover:underline"
    >
      Contact us <FiArrowRight />
    </a>
  </Block>
);

const HoverLiftBlock = ({ title, description }) => {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: {y: 0},
        hover: {y: -4},
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="relative col-span-6 md:col-span-3 h-48 cursor-pointer rounded-xl"
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#9BE749] hover:shadow-[0_18px_40px_rgba(109,91,255,0.22)]">
        
        {/* Title (always visible) */}
        <motion.h3
          variants={{
            rest: { opacity: 1, y: 0 },
            hover: { opacity: 0, y: -8 },
          }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center text-center text-lg font-semibold text-neutral-900"
        >
          {title}
        </motion.h3>

        {/* Description (reveals on hover) */}
        <motion.p
          variants={{
            rest: { opacity: 0, y: 8 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-relaxed text-slate-600"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

const SocialsBlock = () => (
  <>
    <HoverLiftBlock
      title="SEBI-Registered Expertise"
      description="Backed by trusted regulatory recognition and over nine years of market experience."
    />

    <HoverLiftBlock
      title="Data Driven Insights"
      description="Actionable research that empowers smarter and faster decision-making."
    />

    <HoverLiftBlock
      title="Transparency & Trust"
      description="A commitment to accuracy, reliability, and investor confidence."
    />

    <HoverLiftBlock
      title="Sustainable Growth"
      description="Focused on long-term consistency, not short-term gains."
    />
  </>
);



const AboutBlock = () => (
  <Block className="col-span-12 text-3xl leading-snug text-neutral-900">
    <p>
      Our mission is empowering traders.{" "}
      <span className="text-slate-500">
        Sasikumar Peyyala leverages advanced AI and machine learning to simplify complex market data into actionable insights. With nine years of financial expertise, we develop research-driven models that help traders and investors make smarter, faster, and more confident decisions in dynamic markets.
      </span>
    </p>
  </Block>
);

const LocationBlock = () => (
  <Block className="col-span-12 flex flex-col items-center gap-4 md:col-span-3">
    <FiMapPin className="text-3xl text-[#6d5bff]" />
    <p className="text-center text-lg text-slate-600">Vijayawada, Andhra Pradesh</p>
  </Block>
);

const EmailListBlock = () => (
  <Block className="col-span-12 md:col-span-9">
    <p className="mb-3 text-lg text-neutral-900">Get Market Insights & Updates</p>
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner shadow-slate-100 transition-colors placeholder:text-slate-400 focus:border-[#6d5bff] focus:ring-2 focus:ring-[#6d5bff]/25 focus:outline-0"
      />
      <button
        type="submit"
        className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#9BE749] via-[#7ed957] to-[#6d5bff] px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:shadow-[0_12px_30px_rgba(109,91,255,0.28)]"
      >
        <FiMail /> Subscribe
      </button>
    </form>
  </Block>
);

const Logo = () => {
  // Temp logo from https://logoipsum.com/
  return (
    <svg
      width="40"
      height="auto"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-12 fill-zinc-50"
    >
      <path
        d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        stopColor="#000000"
      ></path>
      <path
        d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        stopColor="#000000"
      ></path>
    </svg>
  );
};
