"use client"
import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FiArrowRight, FiMail, FiMapPin } from "react-icons/fi";

export const RevealBento = () => {
  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-12 text-zinc-50">
     
      <motion.div
        initial="initial"
        animate="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        className="mx-auto grid max-w-4xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <SocialsBlock />
        <AboutBlock />
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
        "col-span-4 rounded-lg border border-zinc-700 bg-zinc-800 p-6",
        className
      )}
      {...rest}
    />
  );
};

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <div className="mb-4 size-14 rounded-full bg-[#9BE749] flex items-center justify-center text-3xl">
      📊
    </div>
    <h1 className="mb-12 text-4xl font-medium leading-tight">
      Trademilaan.{" "}
      <span className="text-zinc-400">
        AI-Powered Market Insights for Smarter Trading.
      </span>
    </h1>
    <a
      href="/contact"
      className="flex items-center gap-1 text-[#9BE749] hover:underline"
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
        rest: { y: 0 },
        hover: { y: -12 },
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="relative col-span-6 md:col-span-3 h-48 cursor-pointer hover:border-2 hover:border-lime-200/40 rounded-xl "
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 p-5">
        
        {/* Title (always visible) */}
        <motion.h3
          variants={{
            rest: { opacity: 1 },
            hover: { opacity: 0 },
          }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center text-center text-lg font-semibold"
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
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-relaxed text-zinc-400"
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
  <Block className="col-span-12 text-3xl leading-snug">
    <p>
      Our mission is empowering traders.{" "}
      <span className="text-zinc-400">
        Sasikumar Peyyala leverages advanced AI and machine learning to simplify complex market data into actionable insights. With nine years of financial expertise, we develop research-driven models that help traders and investors make smarter, faster, and more confident decisions in dynamic markets.
      </span>
    </p>
  </Block>
);

const LocationBlock = () => (
  <Block className="col-span-12 flex flex-col items-center gap-4 md:col-span-3">
    <FiMapPin className="text-3xl" />
    <p className="text-center text-lg text-zinc-400">Vijayawada, Andhra Pradesh</p>
  </Block>
);

const EmailListBlock = () => (
  <Block className="col-span-12 md:col-span-9">
    <p className="mb-3 text-lg">Get Market Insights & Updates</p>
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 transition-colors focus:border-[#9BE749] focus:outline-0"
      />
      <button
        type="submit"
        className="flex items-center gap-2 whitespace-nowrap rounded bg-[#9BE749] px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-[#8BD639]"
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
