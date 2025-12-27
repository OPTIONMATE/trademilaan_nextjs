"use client";
import React from "react";
import { Link } from "react-router-dom";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { motion } from "framer-motion";

const heading = "Empowering Traders With AI-Powered Market Insights";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function BackgroundRipple() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-40">
        <BackgroundRippleEffect />
      </div>

      {/* Arch */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-56">
        <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="archGradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6b7280" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M 50 380 Q 500 150 950 380"
            stroke="url(#archGradient)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="mt-32 md:mt-48 lg:mt-60 w-full relative z-10 px-4">
        <p className="text-center text-xs md:text-sm font-bold tracking-wider">
          TRADEMILAAN
        </p>

        {/* Animated Heading */}
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-neutral-800 dark:text-neutral-100 mt-4 px-4"
        >
          {heading.split(" ").map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Buttons */}
        <div className="text-center mt-8 md:mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          <motion.button
            whileHover={{ y: -4, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#9BE749] text-base md:text-xl cursor-pointer px-6 md:px-8 py-2 md:py-3 rounded-full w-full sm:w-auto max-w-xs"
          >
            Explore Now
          </motion.button>

          <Link to="/contact">
            <motion.button
              whileHover={{ y: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[#9BE749] border-2 border-[#9BE749] cursor-pointer text-base md:text-xl px-6 md:px-8 py-2 md:py-3 rounded-full hover:bg-[#9BE749] hover:text-black w-full sm:w-auto max-w-xs"
            >
              Contact Us
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Scroll Down – magnetic feel */}
      <motion.div
        whileHover={{ y: 6 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center w-full mt-16 md:mt-24 lg:mt-32 flex flex-col items-center cursor-pointer z-10"
      >
        <p className="text-sm md:text-base">Scroll Down</p>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
          <path d="M480-200 240-440l56-56 184 183 184-183 56 56-240 240Zm0-240L240-680l56-56 184 183 184-183 56 56-240 240Z" />
        </svg>
      </motion.div>
    </div>
  );
}
