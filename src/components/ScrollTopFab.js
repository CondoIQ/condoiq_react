import React from "react";
import { Fab } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";

const ScrollTopFab = () => (
  <Fab
    color="primary"
    aria-label="scroll to top"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    sx={{ position: "fixed", bottom: 20, right: 20 }}
  >
    <ArrowUpward />
  </Fab>
);

export default ScrollTopFab;
