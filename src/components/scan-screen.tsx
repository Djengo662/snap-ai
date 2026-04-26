import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Skeleton,
  Snackbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faRotateLeft,
  faFloppyDisk,
  faLeaf,
  faDrumstickBite,
  faBreadSlice,
  faDroplet,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { GradientButton, SocialButton } from "./snap-box";
import { saveMealEntry } from "../firebase-config";
import { Timestamp } from "firebase/firestore";

interface ScanScreenProps {
  uid: string;
}

interface AnalysisResult {
  foods: { name: string; calories: number; amount: string }[];
  totalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
}

type ScanState = "idle" | "analyzing" | "result" | "saving";

export default function ScanScreen({ uid }: ScanScreenProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const showToast = (
    message: string,
    severity: "error" | "success" = "error",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Bitte ein Bild auswählen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result.split(",")[1]);
      analyzeImage(result.split(",")[1], file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string, mimeType: string) => {
    // const apiKey = loadApyKey("gemini");

    // if (!apiKey) {
    //   showToast(
    //     "Bitte zuerst einen Gemini API-Key in den Einstellungen eingeben.",
    //   );
    //   return;
    // }

    setScanState("analyzing");

    const apiKey = import.meta.env.VITE_GEMINI_KEY;

    const prompt = `Analysiere dieses Bild einer Mahlzeit. Gib mir eine JSON-Antwort mit folgender Struktur, OHNE Markdown-Backticks, NUR reines JSON:
{
  "foods": [
    { "name": "Lebensmittelname", "calories": 123, "amount": "100g" }
  ],
  "totalCalories": 456,
  "macros": {
    "protein": 20,
    "carbs": 50,
    "fat": 15
  }
}
Schätze die Portionsgrößen realistisch. Alle Werte in Gramm für Makros und kcal für Kalorien.`;

    try {
      console.log("Sending fetch...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              },
            ],
          }),
        },
      );
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data));
      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Gemini API Fehler");
      }

      console.log("Response status:", response.status);
      console.log("Response body:", JSON.stringify(data));

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed: AnalysisResult = JSON.parse(text.trim());
      setResult(parsed);
      setScanState("result");
    } catch (err: any) {
      console.log("Fetch error:", err);
      showToast(
        err.message?.includes("API")
          ? "API-Key ungültig oder Limit erreicht."
          : "Analyse fehlgeschlagen. Bitte erneut versuchen.",
      );
      setScanState("idle");
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setScanState("saving");
    try {
      const today = new Date().toISOString().split("T")[0];
      await saveMealEntry({
        uid,
        imageBase64,
        foods: result.foods,
        totalCalories: result.totalCalories,
        macros: result.macros,
        aiProvider: "gemini",
        createdAt: Timestamp.now(),
        date: today,
      });
      showToast("Mahlzeit gespeichert! 🎉", "success");
      setTimeout(() => {
        setScanState("idle");
        setImagePreview("");
        setImageBase64("");
        setResult(null);
      }, 1000);
    } catch {
      showToast("Fehler beim Speichern.");
      setScanState("result");
    }
  };

  const handleReset = () => {
    setScanState("idle");
    setImageBase64("");
    setResult(null);
  };

  const renderIdle = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 2,
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C5CE7, #00C9A7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(108,92,231,0.3)",
          mb: 1,
        }}
      >
        <FontAwesomeIcon icon={faCamera} color="white" size="2x" />
      </Box>

      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          color: "#EEEEF2",
          fontSize: 20,
          letterSpacing: "-0.3px",
        }}
      >
        Mahlzeit scannen
      </Typography>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#6B6E7F",
          textAlign: "center",
        }}
      >
        Fotografiere deine Mahlzeit und KI analysiert Kalorien & Nährwerte
        automatisch
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 2 }}>
        <SocialButton fullWidth onClick={() => cameraInputRef.current?.click()}>
          <FontAwesomeIcon icon={faCamera} />
          Kamera
        </SocialButton>
        <SocialButton fullWidth onClick={() => fileInputRef.current?.click()}>
          <FontAwesomeIcon icon={faImage} />
          Galerie
        </SocialButton>
      </Box>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </Box>
  );

  const renderAnalyzing = () => (
    <Box sx={{ p: 2.5 }}>
      {/* Bild Preview */}
      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          mb: 2.5,
          position: "relative",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt="Mahlzeit"
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "rgba(13,14,22,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <CircularProgress size={36} sx={{ color: "#6C5CE7" }} />
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            KI analysiert deine Mahlzeit...
          </Typography>
        </Box>
      </Box>

      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            background: "#1A1B26",
            borderRadius: 3,
            p: 2,
            mb: 1.5,
            border: "0.5px solid #272A38",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{ bgcolor: "#272A38", flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" sx={{ bgcolor: "#272A38" }} />
            <Skeleton variant="text" width="40%" sx={{ bgcolor: "#272A38" }} />
          </Box>
          <Skeleton variant="text" width={50} sx={{ bgcolor: "#272A38" }} />
        </Box>
      ))}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 1,
          mt: 2,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={60}
            sx={{ bgcolor: "#272A38", borderRadius: 2 }}
          />
        ))}
      </Box>
    </Box>
  );

  const renderResult = () => (
    <Box sx={{ p: 2.5 }}>
      {/* Bild */}
      <Box sx={{ borderRadius: 4, overflow: "hidden", mb: 2.5 }}>
        <img
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt="Mahlzeit"
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>

      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,201,167,0.1))",
          borderRadius: 3,
          p: 2,
          mb: 2,
          border: "0.5px solid rgba(108,92,231,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#6B6E7F",
              fontSize: 11,
            }}
          >
            Gesamt
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#EEEEF2",
              fontSize: 28,
              letterSpacing: "-0.5px",
            }}
          >
            {result?.totalCalories}
            <Typography
              component="span"
              sx={{ fontSize: 14, color: "#6B6E7F", ml: 0.5 }}
            >
              kcal
            </Typography>
          </Typography>
        </Box>
        <FontAwesomeIcon icon={faFire} color="#FF6B6B" size="2x" />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        <Chip
          icon={<FontAwesomeIcon icon={faDrumstickBite} size="sm" />}
          label={`${result?.macros.protein}g Protein`}
          sx={{
            background: "rgba(108,92,231,0.15)",
            color: "#A29BFE",
            border: "0.5px solid rgba(108,92,231,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
          }}
        />
        <Chip
          icon={<FontAwesomeIcon icon={faBreadSlice} size="sm" />}
          label={`${result?.macros.carbs}g Kohlenhydrate`}
          sx={{
            background: "rgba(0,201,167,0.1)",
            color: "#00C9A7",
            border: "0.5px solid rgba(0,201,167,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
          }}
        />
        <Chip
          icon={<FontAwesomeIcon icon={faDroplet} size="sm" />}
          label={`${result?.macros.fat}g Fett`}
          sx={{
            background: "rgba(253,203,110,0.1)",
            color: "#FDCB6E",
            border: "0.5px solid rgba(253,203,110,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          color: "#EEEEF2",
          fontSize: 14,
          mb: 1.5,
        }}
      >
        Erkannte Lebensmittel
      </Typography>
      {result?.foods.map((food, i) => (
        <Box
          key={i}
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
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: "rgba(108,92,231,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faLeaf} color="#6C5CE7" size="sm" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: "#EEEEF2",
                fontSize: 13,
              }}
            >
              {food.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#6B6E7F",
                fontSize: 11,
              }}
            >
              {food.amount}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: "#A29BFE",
              fontSize: 13,
            }}
          >
            {food.calories} kcal
          </Typography>
        </Box>
      ))}

      <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
        <SocialButton fullWidth onClick={handleReset}>
          <FontAwesomeIcon icon={faRotateLeft} />
          Neu scannen
        </SocialButton>
        <GradientButton
          onClick={handleSave}
          disabled={scanState === "saving"}
          sx={{ flex: 1 }}
        >
          {scanState === "saving" ? (
            <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
          ) : (
            <FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: 8 }} />
          )}
          {scanState === "saving" ? "Speichern..." : "Speichern"}
        </GradientButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {scanState === "idle" && renderIdle()}
        {scanState === "analyzing" && renderAnalyzing()}
        {(scanState === "result" || scanState === "saving") && renderResult()}
      </Box>
    </>
  );
}
