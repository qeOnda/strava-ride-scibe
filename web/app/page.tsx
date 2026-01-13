"use client";

import { ArrowRight, Check } from "lucide-react";

import { motion } from "framer-motion";

const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "";

const oauthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&approval_prompt=force&scope=activity:write,activity:read_all`;

// Refined animation variants - subtle and elegant
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const steps = [
  {
    title: "Connect once",
    desc: "Secure OAuth authentication with your Strava account. Takes 30 seconds.",
  },
  {
    title: "Ride as usual",
    desc: "No workflow changes needed. Just enjoy your rides.",
  },
  {
    title: "AI analyzes",
    desc: "Distance, elevation, pace, and conditions are processed automatically.",
  },
  {
    title: "Description updated`",
    desc: "A personalized description updates on Strava within seconds.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-pearl-white">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm-ivory/50 via-transparent to-transparent" />

        {/* Decorative elements - very subtle */}
        <div className="absolute top-20 right-[15%] w-[400px] h-[400px] rounded-full bg-sage/[0.03] blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-[300px] h-[300px] rounded-full bg-terracotta/[0.03] blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Eyebrow */}
            <motion.p variants={fadeIn} className="eyebrow mb-8">
              AI-Powered Activity Descriptions
            </motion.p>

            {/* Main Headline */}
            <motion.h1 variants={fadeInUp} className="mb-8">
              <span className="block font-display font-semibold text-5xl sm:text-6xl lg:text-7xl text-charcoal tracking-tight">
                Every ride deserves
              </span>
              <span className="block font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-sage mt-2">
                its story
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate max-w-xl mx-auto mb-12 leading-relaxed"
            >
              Ride Scribe uses AI to automatically create compelling,
              personalized descriptions for your Strava activities. Set it once,
              ride forever.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center gap-6"
            >
              <a
                href={oauthUrl}
                className="group inline-flex items-center gap-3 bg-sage text-white
                           font-medium text-base px-8 py-4 rounded-full
                           transition-all duration-300 hover:bg-sage-dark hover:shadow-sage"
              >
                Connect with Strava
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-pebble text-sm">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage" />
                  Free to use
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage" />
                  Secure OAuth
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage" />
                  Zero maintenance
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-mist flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full bg-sage"
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="bg-warm-ivory py-32 lg:py-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="font-display font-semibold text-4xl sm:text-5xl text-charcoal">
                Effortless automation
              </h2>
            </motion.div>

            {/* Two Column Layout: Image + Steps */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image */}
              <motion.div variants={scaleIn} className="order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-medium">
                  <img
                    src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80"
                    alt="Cyclists riding road bikes along a scenic coastal road"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent" />
                </div>
              </motion.div>

              {/* Steps */}
              <div className="order-1 lg:order-2 grid sm:grid-cols-2 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    variants={scaleIn}
                    className="text-left"
                  >
                    {/* Step Number */}
                    <span className="inline-block font-display font-bold text-5xl text-sage/20 mb-3">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Title */}
                    <h3 className="font-body font-semibold text-lg text-charcoal mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534146789009-76ed5060ec70?auto=format&fit=crop&w=1920&q=80"
            alt="Cyclist riding on a scenic mountain road"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/70" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeInUp}
              className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-8 leading-tight"
            >
              Ready to let your rides speak for themselves?
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-white/80 text-lg mb-12"
            >
              Join cyclists who have reclaimed their time without sacrificing
              their stories.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <a
                href={oauthUrl}
                className="group inline-flex items-center gap-3 bg-sage text-white
                           font-semibold text-base px-8 py-4 rounded-full
                           transition-all duration-300 hover:bg-sage-dark hover:shadow-lg"
              >
                Get started free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="text-center md:text-left">
              <p className="font-display font-bold text-2xl text-white">
                Ride Scribe
              </p>
              <p className="text-stone text-sm mt-2">
                AI-powered activity descriptions for Strava
              </p>
            </div>

            {/* Tech Stack & Disclaimer */}
            <div className="text-center md:text-right">
              <p className="text-stone text-sm">
                Built with AWS Bedrock, Lambda, and DynamoDB
              </p>
              <p className="text-pebble text-xs mt-2">
                Not affiliated with Strava, Inc.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
