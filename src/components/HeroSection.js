import React from "react";
import { Box, Button, Typography, Container, Stack } from "@mui/material";
import { motion } from "framer-motion";

const HeroSection = ({ title, subtitle, ctaLabel, onCtaClick }) => {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #ffffff 0%, #faf6ff 40%, #f8f2ff 100%)",
        overflow: "hidden",
      }}
    >
      {/* Decorative violet gradient circles */}
      <motion.div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, #9b59b6 0%, transparent 70%)",
          top: "-120px",
          right: "-150px",
          opacity: 0.25,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, #7b1fa2 0%, transparent 70%)",
          bottom: "-120px",
          left: "-120px",
          opacity: 0.2,
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Hero Content */}
      <Container maxWidth="md" sx={{ textAlign: "center", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              mb: 2,
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "2.4rem", md: "3.8rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              lineHeight: 1.6,
              fontFamily: "'Poppins', sans-serif",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {subtitle}
          </Typography>

          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={onCtaClick}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: "30px",
                fontWeight: 600,
                fontSize: "1.1rem",
                textTransform: "none",
                color: "white",
                background: "linear-gradient(135deg, #8e24aa, #7b1fa2)",
                boxShadow: "0px 8px 20px rgba(123, 31, 162, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #9c27b0, #8e24aa)",
                  boxShadow: "0px 10px 24px rgba(123, 31, 162, 0.4)",
                },
              }}
            >
              {ctaLabel}
            </Button>
          </Stack>
        </motion.div>
      </Container>

      {/* Parallax Image (optional) */}
      <motion.img
        src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80"
        alt="Modern building"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "40%",
          opacity: 0.15,
          objectFit: "cover",
        }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </Box>
  );
};

export default HeroSection;
