import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle }) => (
  <div className="bg-white dark:bg-slate-900 border-b">
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        )}
      </motion.div>
    </div>
  </div>
);

export default PageHeader; 