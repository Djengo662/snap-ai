import { useEffect, useState } from "react";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRightFromBracket,
  faWeightScale,
  faRulerVertical,
  faCakeCandles,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { getUserProfile, logout, type UserProfile } from "../firebase-config";

interface ProfileProps {
  uid: string;
  onLogout: () => void;
}

export default function Profile({ uid, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(uid).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [uid]);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#6C5CE7" }} />
      </Box>
    );

  const stats = [
    {
      icon: faCakeCandles,
      label: "Alter",
      value: profile?.age ? `${profile.age} Jahre` : "–",
    },
    {
      icon: faWeightScale,
      label: "Gewicht",
      value: profile?.weight ? `${profile.weight} kg` : "–",
    },
    {
      icon: faRulerVertical,
      label: "Größe",
      value: profile?.height ? `${profile.height} cm` : "–",
    },
    {
      icon: faFire,
      label: "Tagesziel",
      value: profile?.dailyCalorieTarget
        ? `${profile.dailyCalorieTarget} kcal`
        : "–",
    },
  ];

  const goalLabel =
    profile?.goal === "lose"
      ? "🔥 Abnehmen"
      : profile?.goal === "gain"
        ? "💪 Zunehmen"
        : profile?.goal === "maintain"
          ? "⚖️ Gewicht halten"
          : "–";

  return (
    <Box sx={{ p: 2.5 }}>
      {/* ─── Avatar & Name ───────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          mt: 1,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <FontAwesomeIcon icon={faUser} color="white" size="2x" />
        </Box>
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            color: "#EEEEF2",
            fontSize: 18,
          }}
        >
          {profile?.displayName ?? "Nutzer"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#6B6E7F",
            mt: 0.3,
          }}
        >
          {profile?.email}
        </Typography>
        <Box
          sx={{
            mt: 1,
            px: 1.5,
            py: 0.4,
            background: "rgba(108,92,231,0.12)",
            borderRadius: 10,
            border: "1px solid rgba(108,92,231,0.3)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#A29BFE",
              fontWeight: 600,
            }}
          >
            {goalLabel}
          </Typography>
        </Box>
      </Box>

      {/* ─── Stats Grid ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
          mb: 3,
        }}
      >
        {stats.map((s) => (
          <Box
            key={s.label}
            sx={{
              background: "#1A1B26",
              borderRadius: 3,
              p: 2,
              border: "0.5px solid #272A38",
            }}
          >
            <FontAwesomeIcon icon={s.icon} color="#6C5CE7" size="sm" />
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#EEEEF2",
                fontSize: 16,
                mt: 1,
              }}
            >
              {s.value}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: "#6B6E7F",
              }}
            >
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "#272A38", mb: 3 }} />

      {/* ─── Logout ──────────────────────────────────────────────────── */}
      <Box
        onClick={handleLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          borderRadius: 3,
          border: "0.5px solid #3D1A1A",
          background: "rgba(255,99,99,0.05)",
          cursor: "pointer",
          "&:hover": { background: "rgba(255,99,99,0.1)" },
          transition: "background 0.2s",
        }}
      >
        <FontAwesomeIcon icon={faRightFromBracket} color="#FF6B6B" />
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            color: "#FF6B6B",
            fontSize: 14,
          }}
        >
          Abmelden
        </Typography>
      </Box>
    </Box>
  );
}
