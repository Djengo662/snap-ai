import { Box, Typography } from "@mui/material";

interface DashboardProps {
  uid: string;
}

export default function Dashboard({ uid }: DashboardProps) {
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#6B6E7F",
          mb: 0.5,
        }}
      >
        {new Date().toLocaleDateString("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Typography>
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
        Guten Tag 👋
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
          Dashboard wird gleich gebaut 🚀
        </Typography>
      </Box>
    </Box>
  );
}
