"use client";
import { motion } from "framer-motion";

const rights = [
    "Right to Privacy and Confidentiality",
    "Right to Transparent Practices",
    "Right to fair and Equitable Treatment",
    "Right to Adequate Information",
    "Right to Initial and Continuing Disclosure",
    "Right to receive information about all the statutory and regulatory disclosures",
    "Right to Fair & True Advertisement",
    "Right to Awareness about Service Parameters and Turnaround Times",
    "Right to be informed of the timelines for each service",
    "Right to be Heard and Satisfactory Grievance Redressal",
    "Right to Exit from Financial product or service in accordance with the terms and conditions agreed with the research analyst",
    "Right to receive clear guidance and caution notice when dealing in Complex and High-Risk Financial Products and Services",
    "Additional Rights to vulnerable consumers",
    "Right to get access to services in a suitable manner even if differently abled",
    "Right to provide feedback on the financial products and services used",
    "Right against coercive, unfair, and one-sided clauses in financial agreements",
  ];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};
  
  export default function RightsOfInvestors() {
    return (
      <section className="w-full py-20 md:py-24 px-5 sm:px-8 bg-gradient-to-b from-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto mb-14 md:mb-16"
        >
          <p className="text-md md:text-md tracking-[0.35em] text-lime-600 font-semibold uppercase mb-4">
            Investor Protection
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
            Rights of Investors
          </h2>
        </motion.div>
  
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto"
        >
          {rights.map((text, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{
                y: -4,
                transition: {
                  duration: 0.3,
                },
              }}
              className="relative bg-white border-2 border-gray-200 rounded-lg p-6 md:p-7 min-h-[160px] flex flex-col items-center justify-baseline text-center transition-all duration-300 hover:border-lime-500/70 hover:shadow-[0_8px_24px_rgba(13,148,136,0.12)]"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                className="w-10 h-10 mb-3 rounded-full bg-purple-500/50 flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">{i + 1}</span>
              </motion.div>
              
              <p className="text-sm md:text-base font-medium text-neutral-700 leading-relaxed">
                {text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }
  