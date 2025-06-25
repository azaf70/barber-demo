"use client";

import React from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "./ui/aurora-background";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4 py-32">
        <div className="text-4xl md:text-7xl font-extrabold dark:text-white text-center drop-shadow-lg">
          BarberHub: Elevate Your Grooming Experience
        </div>
        <div className="font-light text-lg md:text-2xl dark:text-neutral-200 text-center max-w-2xl">
          Book top-rated barbers and premium shops in your city. For clients and professionals who demand the best.
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button asChild size="lg" className="text-lg px-8 py-4 shadow-lg">
            <Link to="/shops">Book a Barber</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 shadow-lg">
            <Link to="/register">For Barbers & Shops</Link>
          </Button>
        </div>
      </motion.div>
    </AuroraBackground>
  );
} 