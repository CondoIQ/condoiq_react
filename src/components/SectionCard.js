import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const SectionCard = ({ id, title, content, delay = 0 }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
  >
    <Card
      elevation={4}
      sx={{
        mb: 5,
        textAlign: "left",
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        backgroundColor: "#f3e5ff",
        width: { xs: "100%", sm: "90%", md: "80%" },
        minHeight: { xs: 180, sm: 220, md: 260 },
        mx: "auto",
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "1.2rem" }}>{content}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default SectionCard;
