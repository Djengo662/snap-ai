import { Box, Typography } from "@mui/material";

interface HistoryProps {
  uid: string;
}

export default function ProfileHistory({ uid }: HistoryProps) {
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          color: "#EEEEF2",
          fontSize: 22,
          letterSpacing: "-0.3px",
          mb: 3,
        }}
      >
        Verlauf
      </Typography>

      <Box
        sx={{
          background: "#1A1B26",
          borderRadius: 3,
          p: 2.5,
          border: "0.5px solid #272A38",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#3D4055",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Noch keine Mahlzeiten erfasst 🍽️
        </Typography>
      </Box>
    </Box>
  );
}
