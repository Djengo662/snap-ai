import { useState } from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  MobileStepper,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faLeaf,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  GradientButton,
  LogoCircle,
  StyledTextField,
  Wrap,
} from "../snap-box";
import {
  auth,
  calcDailyCalories,
  updateUserProfile,
} from "../../firebase-config";
import { Timestamp } from "firebase/firestore";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = ["Über dich", "Körperdaten", "Dein Ziel"];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain" | "">("");

  const showToast = (
    message: string,
    severity: "error" | "success" = "error",
  ) => {
    setToast({ open: true, message, severity });
  };

  // ─── Validierung pro Schritt ──────────────────────────────────────────────
  const validateStep = (): boolean => {
    if (step === 0) {
      if (!name.trim()) {
        showToast("Bitte deinen Namen eingeben.");
        return false;
      }
      if (!age || +age < 10 || +age > 120) {
        showToast("Bitte ein gültiges Alter eingeben.");
        return false;
      }
      if (!gender) {
        showToast("Bitte dein Geschlecht auswählen.");
        return false;
      }
    }
    if (step === 1) {
      if (!weight || +weight < 20 || +weight > 300) {
        showToast("Bitte ein gültiges Gewicht eingeben.");
        return false;
      }
      if (!height || +height < 100 || +height > 250) {
        showToast("Bitte eine gültige Größe eingeben.");
        return false;
      }
    }
    if (step === 2) {
      if (!goal) {
        showToast("Bitte dein Ziel auswählen.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  // ─── Abschluss → Firestore speichern ─────────────────────────────────────
  const handleFinish = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      const dailyCalorieTarget = calcDailyCalories(
        +age,
        +weight,
        +height,
        gender as "male" | "female" | "other",
        goal as "lose" | "maintain" | "gain",
      );

      await updateUserProfile(uid, {
        displayName: name.trim(),
        age: +age,
        gender: gender as "male" | "female" | "other",
        weight: +weight,
        height: +height,
        goal: goal as "lose" | "maintain" | "gain",
        dailyCalorieTarget,
        onboardingComplete: true,
        updatedAt: Timestamp.now(),
      });

      showToast(`Dein Tagesziel: ${dailyCalorieTarget} kcal 🎯`, "success");
      setTimeout(onComplete, 1200);
    } catch {
      showToast("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Schritt-Inhalte ──────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 0)
      return (
        <>
          <StyledTextField
            fullWidth
            label="Dein Name"
            placeholder="Max"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <StyledTextField
            fullWidth
            label="Alter"
            type="number"
            placeholder="25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <StyledTextField
            fullWidth
            select
            label="Geschlecht"
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            sx={{ mb: 1.5 }}
          >
            <MenuItem value="male">Männlich</MenuItem>
            <MenuItem value="female">Weiblich</MenuItem>
            <MenuItem value="other">Divers</MenuItem>
          </StyledTextField>
        </>
      );

    if (step === 1)
      return (
        <>
          <StyledTextField
            fullWidth
            label="Gewicht (kg)"
            type="number"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <StyledTextField
            fullWidth
            label="Größe (cm)"
            type="number"
            placeholder="175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            sx={{ mb: 1.5 }}
          />
        </>
      );

    if (step === 2)
      return (
        <>
          {(["lose", "maintain", "gain"] as const).map((g) => (
            <Box
              key={g}
              onClick={() => setGoal(g)}
              sx={{
                border: "1px solid",
                borderColor: goal === g ? "#6C5CE7" : "#272A38",
                borderRadius: 3,
                p: 2,
                mb: 1.5,
                cursor: "pointer",
                background:
                  goal === g ? "rgba(108,92,231,0.08)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: goal === g ? "#A29BFE" : "#EEEEF2",
                  fontSize: 14,
                }}
              >
                {g === "lose" && "🔥 Abnehmen"}
                {g === "maintain" && "⚖️ Gewicht halten"}
                {g === "gain" && "💪 Zunehmen"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#6B6E7F",
                  mt: 0.3,
                }}
              >
                {g === "lose" && "500 kcal unter deinem Bedarf"}
                {g === "maintain" && "Genau dein Tagesbedarf"}
                {g === "gain" && "300 kcal über deinem Bedarf"}
              </Typography>
            </Box>
          ))}
        </>
      );
  };

  return (
    <>
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
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

      <Wrap>
        <Card>
          <LogoCircle>
            <FontAwesomeIcon icon={faLeaf} color="white" size="2x" />
          </LogoCircle>

          {/* ─── Titel ───────────────────────────────────── */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#EEEEF2",
              letterSpacing: "-0.5px",
              mb: 0.5,
            }}
          >
            {STEPS[step]}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6B6E7F",
              mb: 3,
            }}
          >
            Schritt {step + 1} von {STEPS.length}
          </Typography>

          {/* ─── Stepper Dots ─────────────────────────────── */}
          <MobileStepper
            variant="dots"
            steps={STEPS.length}
            position="static"
            activeStep={step}
            nextButton={null}
            backButton={null}
            sx={{
              background: "transparent",
              justifyContent: "center",
              mb: 3,
              "& .MuiMobileStepper-dot": { background: "#272A38" },
              "& .MuiMobileStepper-dotActive": { background: "#6C5CE7" },
            }}
          />

          {/* ─── Schritt-Inhalt ───────────────────────────── */}
          {renderStep()}

          {/* ─── Navigation ──────────────────────────────── */}
          <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 1 }}>
            {step > 0 && (
              <GradientButton
                onClick={() => setStep((s) => s - 1)}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  style={{ marginRight: 8 }}
                />
                Zurück
              </GradientButton>
            )}
            <GradientButton
              onClick={handleNext}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
              ) : step === STEPS.length - 1 ? (
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginRight: 8 }}
                />
              )}
              {loading
                ? "Wird gespeichert..."
                : step === STEPS.length - 1
                  ? "Fertig"
                  : "Weiter"}
            </GradientButton>
          </Box>
        </Card>
      </Wrap>
    </>
  );
}
