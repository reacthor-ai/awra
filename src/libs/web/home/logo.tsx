import { motion } from "framer-motion"
import Image from "next/image"
import awra from "../../../../public/awra-logo.png"

export function Logo() {
  return (
    <motion.div
      className="relative w-60 h-20"
      initial={{opacity: 0, y: -20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5, ease: "easeOut"}}
    >
      <Image
        src={awra}
        alt="PolicyAI Logo"
        layout="fill"
        objectFit="contain"
      />
    </motion.div>
  )
}
