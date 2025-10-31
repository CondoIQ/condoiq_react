import React from "react";
import { Container, Grid, Box } from "@mui/material";
import HeroSection from "../components/HeroSection";
import SectionCard from "../components/SectionCard";
import FeatureCard from "../components/FeatureCard";
import WaveDivider from "../components/WaveDivider";
import AnimatedBlob from "../components/AnimatedBlob";
import ScrollTopFab from "../components/ScrollTopFab";

import { Speed, Security, Cloud } from "@mui/icons-material";
import building1 from "../assets/building1.png";
import building2 from "../assets/building2.png";

const LandingPage = () => {
  const scrollToSection = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const features = [
    {
      icon: <Speed fontSize="large" />,
      title: "Fast Performance",
      description: "Optimized React code ensures smooth, fast performance.",
      image: building1,
    },
    {
      icon: <Security fontSize="large" />,
      title: "Secure",
      description: "Built with best practices for reliability and safety.",
      image: building2,
    },
    {
      icon: <Cloud fontSize="large" />,
      title: "Cloud Ready",
      description: "Easily deployable on modern cloud platforms.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <HeroSection
        title="Welcome to CondoIQ"
        subtitle="A modern, scalable, and elegant solution for property management. Built on Material Design 3 principles."
        ctaLabel="Get Started"
        onCtaClick={() => scrollToSection("about")}
      />

      <WaveDivider color="#f8f2ff" />

      {/* About */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <SectionCard
          id="about"
          title="About CondoIQ"
          content="CondoIQ streamlines property management and building onboarding with an intuitive, responsive, and scalable interface built with Material UI 3."
        />
      </Container>

      <WaveDivider flip color="#faf6ff" />

      {/* Features */}
      <Box sx={{ py: 10, backgroundColor: "#faf6ff", position: "relative" }}>
        <AnimatedBlob
          top="10%"
          left="5%"
          size={250}
          color="#BB86FC"
          opacity={0.12}
        />
        <AnimatedBlob
          top="70%"
          left="80%"
          size={300}
          color="#7b1fa2"
          opacity={0.15}
        />
        <Container maxWidth="lg">
          <SectionCard id="features" title="Key Features" />
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <FeatureCard {...f} delay={i * 0.2} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <WaveDivider color="#ffffff" />

      {/* Contact */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <SectionCard
          id="contact"
          title="Contact Us"
          content="📧 hello@condoiq.com"
        />
      </Container>

      <ScrollTopFab />
    </>
  );
};

export default LandingPage;
