import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6A0DAD",
      light: "#9b59b6",
      dark: "#4b0082",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#BB86FC",
      contrastText: "#ffffff",
    },
    background: {
      default: "#FDF6FF",
      paper: "#ffffff",
    },
    text: {
      primary: "#4b0082",
      secondary: "#6a0dad",
    },
  },
  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
    h2: { fontFamily: "Roboto Slab, Poppins, sans-serif", fontWeight: 800 },
    h4: { fontFamily: "Roboto Slab, Poppins, sans-serif", fontWeight: 700 },
    h5: { fontFamily: "Poppins, sans-serif", fontWeight: 600 },
    h6: { fontFamily: "Poppins, sans-serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
