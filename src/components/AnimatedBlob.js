import React from "react";
import { motion } from "framer-motion";

const AnimatedBlob = ({
  size = 300,
  color = "#BB86FC",
  top = "10%",
  left = "10%",
  opacity = 0.15,
}) => {
  return (
    <motion.div
      animate={{ y: [0, 20, 0], x: [0, 10, 0], rotate: [0, 20, 0] }}
      transition={{ duration: 10, repeat: Infinity, repeatType: "loop" }}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        opacity,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default AnimatedBlob;
