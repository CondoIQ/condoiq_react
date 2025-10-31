import React from "react";
import { Card, CardContent, Typography, Box, Fade } from "@mui/material";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description, image, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
  >
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        textAlign: "center",
        p: 3,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 8px 20px rgba(123, 31, 162, 0.25)",
        },
      }}
    >
      <Box sx={{ mb: 2, color: "primary.main" }}>{icon}</Box>
      {image && (
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            width: "100%",
            borderRadius: 3,
            mb: 2,
            maxHeight: 150,
            objectFit: "cover",
          }}
        />
      )}
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "primary.main",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default FeatureCard;
