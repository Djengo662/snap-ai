import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faDrumstickBite,
  faBreadSlice,
  faDroplet,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import {
  getMealsForDate,
  getUserProfile,
  type MealEntry,
  type UserProfile,
} from "../../firebase-config";

interface DashboardProps {
  uid: string;
}
const today = new Date().toISOString().split("T")[0];

export default function Dashboard({ uid }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m] = await Promise.all([
          getUserProfile(uid),
          getMealsForDate(uid, today),
        ]);
        setProfile(p);
        setMeals(m);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const totalCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.macros.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.macros.fat, 0);
  const target = profile?.dailyCalorieTarget ?? 2000;
  const progress = Math.min((totalCalories / target) * 100, 100);
  const remaining = Math.max(target - totalCalories, 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#6C5CE7" }} />
      </Box>
    );

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
        {greeting()}, {profile?.displayName?.split(" ")[0] ?? ""} 👋
      </Typography>

      <Box
        sx={{
          background: "#1A1B26",
          borderRadius: 3,
          p: 2.5,
          mb: 2,
          border: "0.5px solid #272A38",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#6B6E7F",
                fontSize: 11,
                mb: 0.3,
              }}
            >
              Heute gegessen
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#EEEEF2",
                fontSize: 28,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              {totalCalories}
              <Typography
                component="span"
                sx={{ fontSize: 13, color: "#6B6E7F", ml: 0.5 }}
              >
                kcal
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#6B6E7F",
                fontSize: 11,
                mb: 0.3,
              }}
            >
              Tagesziel
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#6C5CE7",
                fontSize: 18,
              }}
            >
              {target} kcal
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            background: "#272A38",
            "& .MuiLinearProgress-bar": {
              background:
                progress >= 100
                  ? "linear-gradient(90deg, #FF6B6B, #FF8E53)"
                  : "linear-gradient(90deg, #6C5CE7, #00C9A7)",
              borderRadius: 4,
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#6B6E7F",
            }}
          >
            {Math.round(progress)}% erreicht
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: progress >= 100 ? "#FF6B6B" : "#6B6E7F",
            }}
          >
            {progress >= 100 ? "Ziel erreicht! 🎉" : `${remaining} kcal übrig`}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1.5,
          mb: 3,
        }}
      >
        {[
          {
            icon: faDrumstickBite,
            label: "Protein",
            value: totalProtein,
            unit: "g",
            color: "#A29BFE",
            bg: "rgba(108,92,231,0.1)",
          },
          {
            icon: faBreadSlice,
            label: "Kohlenhydrate",
            value: totalCarbs,
            unit: "g",
            color: "#00C9A7",
            bg: "rgba(0,201,167,0.1)",
          },
          {
            icon: faDroplet,
            label: "Fett",
            value: totalFat,
            unit: "g",
            color: "#FDCB6E",
            bg: "rgba(253,203,110,0.1)",
          },
        ].map((m) => (
          <Box
            key={m.label}
            sx={{
              background: "#1A1B26",
              borderRadius: 3,
              p: 1.5,
              border: "0.5px solid #272A38",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: m.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <FontAwesomeIcon icon={m.icon} color={m.color} size="sm" />
            </Box>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#EEEEF2",
                fontSize: 16,
              }}
            >
              {m.value}
              {m.unit}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: "#6B6E7F",
              }}
            >
              {m.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          color: "#EEEEF2",
          fontSize: 15,
          mb: 1.5,
        }}
      >
        Heutige Mahlzeiten
      </Typography>

      {meals.length === 0 ? (
        <Box
          sx={{
            background: "#1A1B26",
            borderRadius: 3,
            p: 3,
            border: "0.5px solid #272A38",
            textAlign: "center",
          }}
        >
          <FontAwesomeIcon icon={faLeaf} color="#3D4055" size="2x" />
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#3D4055",
              fontSize: 13,
              mt: 1.5,
            }}
          >
            Noch keine Mahlzeiten heute.{"\n"}Scanne deine erste Mahlzeit! 📸
          </Typography>
        </Box>
      ) : (
        meals.map((meal, i) => (
          <Box
            key={meal.id ?? i}
            sx={{
              background: "#1A1B26",
              borderRadius: 3,
              p: 1.5,
              mb: 1,
              border: "0.5px solid #272A38",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {meal.imageBase64 ? (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`data:image/jpeg;base64,${meal.imageBase64}`}
                  alt="Mahlzeit"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: "rgba(108,92,231,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faLeaf} color="#6C5CE7" />
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: "#EEEEF2",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {meal.foods.map((f) => f.name).join(", ")}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#6B6E7F",
                  fontSize: 11,
                  mt: 0.3,
                }}
              >
                {meal.createdAt?.toDate?.()?.toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                Uhr
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faFire} color="#FF6B6B" size="sm" />
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: "#A29BFE",
                  fontSize: 13,
                }}
              >
                {meal.totalCalories}
              </Typography>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}
