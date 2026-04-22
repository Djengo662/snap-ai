import { Box, Button, styled, TextField } from "@mui/material";

export const Wrap = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0E1016",
  padding: "24px",
});

export const LogoCircle = styled(Box)({
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6C5CE7, #00C9A7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
  boxShadow: "0 0 40px rgba(108, 92, 231, 0.35)",
});

export const Card = styled(Box)({
  width: "100%",
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 14,
    backgroundColor: "#171A24",
    color: "#E8E9ED",
    fontFamily: "'DM Sans', sans-serif",
    "& fieldset": { borderColor: "#272A38" },
    "&:hover fieldset": { borderColor: "#3D4055" },
    "&.Mui-focused fieldset": { borderColor: "#6C5CE7" },
  },
  "& .MuiInputLabel-root": {
    color: "#6B6E7F",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    "&.Mui-focused": { color: "#6C5CE7" },
  },
  "& input": {
    color: "#E8E9ED",
    fontFamily: "'DM Sans', sans-serif",
  },
  "& input::placeholder": {
    color: "#3D4055",
  },
});

export const GradientButton = styled(Button)({
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #6C5CE7, #00B894)",
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  fontWeight: 700,
  color: "white",
  textTransform: "none",
  letterSpacing: "0.02em",
  "&:hover": {
    opacity: 0.9,
    background: "linear-gradient(135deg, #6C5CE7, #00B894)",
  },
  "&:active": { transform: "scale(0.97)" },
  "&.Mui-disabled": { opacity: 0.6, color: "white" },
});

export const SocialButton = styled(Button)({
  flex: 1,
  padding: "11px 0",
  background: "#171A24",
  border: "1px solid #272A38",
  borderRadius: 12,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  color: "#A0A3B0",
  textTransform: "none",
  gap: 8,
  "&:hover": {
    background: "#1E2130",
    borderColor: "#3D4055",
  },
});
