import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faLeaf,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { getRecentMeals, type MealEntry } from "../firebase-config";

interface HistoryProps {
  uid: string;
}

export default function History({ uid }: HistoryProps) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const yesterday = useMemo(
    () => new Date(new Date().getTime() - 86400000).toISOString().split("T")[0],
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const m = await getRecentMeals(uid, 7);
        setMeals(m);
      } catch (err) {
        console.error("History load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  // ─── Nach Datum gruppieren ────────────────────────────────────────────────
  const grouped = meals.reduce(
    (acc, meal) => {
      const date = meal.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(meal);
      return acc;
    },
    {} as Record<string, MealEntry[]>,
  );

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    if (dateStr === today) return "Heute";
    if (dateStr === yesterday) return "Gestern";
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const dayCalories = (meals: MealEntry[]) =>
    meals.reduce((sum, m) => sum + m.totalCalories, 0);

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
          fontWeight: 700,
          color: "#EEEEF2",
          fontSize: 22,
          letterSpacing: "-0.3px",
          mb: 0.5,
        }}
      >
        Verlauf
      </Typography>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#6B6E7F",
          mb: 3,
        }}
      >
        Letzte 7 Tage
      </Typography>

      {sortedDates.length === 0 ? (
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
            Noch keine Mahlzeiten erfasst.{"\n"}Scanne deine erste Mahlzeit! 📸
          </Typography>
        </Box>
      ) : (
        sortedDates.map((date) => (
          <Box key={date} sx={{ mb: 2 }}>
            {/* ─── Tag Header ──────────────────────────────────────── */}
            <Box
              onClick={() => setExpanded(expanded === date ? null : date)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#1A1B26",
                borderRadius: expanded === date ? "12px 12px 0 0" : 3,
                p: 2,
                border: "0.5px solid #272A38",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    color: "#EEEEF2",
                    fontSize: 15,
                  }}
                >
                  {formatDate(date)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "#6B6E7F",
                    mt: 0.3,
                  }}
                >
                  {grouped[date].length} Mahlzeit
                  {grouped[date].length !== 1 ? "en" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FontAwesomeIcon icon={faFire} color="#FF6B6B" size="sm" />
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      color: "#A29BFE",
                      fontSize: 15,
                    }}
                  >
                    {dayCalories(grouped[date])}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      color: "#6B6E7F",
                    }}
                  >
                    kcal
                  </Typography>
                </Box>
                <FontAwesomeIcon
                  icon={expanded === date ? faChevronUp : faChevronDown}
                  color="#3D4055"
                  size="sm"
                />
              </Box>
            </Box>

            {/* ─── Mahlzeiten Liste ─────────────────────────────────── */}
            {expanded === date &&
              grouped[date].map((meal, i) => (
                <Box
                  key={meal.id ?? i}
                  sx={{
                    background: "#13141D",
                    borderLeft: "0.5px solid #272A38",
                    borderRight: "0.5px solid #272A38",
                    borderBottom:
                      i === grouped[date].length - 1
                        ? "0.5px solid #272A38"
                        : "none",
                    borderRadius:
                      i === grouped[date].length - 1 ? "0 0 12px 12px" : 0,
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {meal.imageBase64 ? (
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${meal.imageBase64}`}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: "rgba(108,92,231,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faLeaf}
                        color="#6C5CE7"
                        size="sm"
                      />
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
                        fontSize: 11,
                        color: "#6B6E7F",
                        mt: 0.3,
                      }}
                    >
                      {meal.createdAt?.toDate?.()?.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      Uhr · P: {meal.macros.protein}g · K: {meal.macros.carbs}g
                      · F: {meal.macros.fat}g
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      color: "#A29BFE",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {meal.totalCalories} kcal
                  </Typography>
                </Box>
              ))}
          </Box>
        ))
      )}
    </Box>
  );
}
