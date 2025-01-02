import { motion } from 'framer-motion';

export function USALoadingIndicator() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <motion.div
        className="w-3 h-8 bg-red-500 rounded"
        animate={{
          height: ['32px', '16px', '32px'],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        }}
      />
      <motion.div
        className="w-3 h-8 bg-white rounded"
        animate={{
          height: ['16px', '32px', '16px'],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }
        }}
      />
      <motion.div
        className="w-3 h-8 bg-blue-500 rounded"
        animate={{
          height: ['32px', '16px', '32px'],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
        }}
      />
    </div>
  );
}

