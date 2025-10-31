import React from "react";
import { Box } from "@mui/material";

const WaveDivider = ({ flip = false, color = "#f8f2ff" }) => (
  <Box
    component="svg"
    viewBox="0 0 1440 320"
    xmlns="http://www.w3.org/2000/svg"
    sx={{
      transform: flip ? "rotate(180deg)" : "none",
      width: "100%",
      height: "auto",
      display: "block",
    }}
  >
    <path
      fill={color}
      fillOpacity="1"
      d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,112C672,128,768,192,864,213.3C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
    />
  </Box>
);

export default WaveDivider;
