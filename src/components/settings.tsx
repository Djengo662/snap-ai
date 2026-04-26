import { useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Snackbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faGear,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { GradientButton, StyledTextField } from "./snap-box";
import {
  saveApiKey,
  loadApyKey,
  clearApiKey,
  saveSelectedProvider,
  loadSelectedProvider,
} from "../firebase-config";

export default function Settings() {
  const [showKey, setShowKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => loadApyKey("gemini"));
  const [provider, setProvider] = useState<"claude" | "gpt" | "gemini">(() =>
    loadSelectedProvider(),
  );
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSave = () => {
    if (!geminiKey.trim()) {
      setToast({
        open: true,
        message: "Bitte einen API-Key eingeben.",
        severity: "error",
      });
      return;
    }
    saveApiKey("gemini", geminiKey.trim());
    saveSelectedProvider("gemini");
    setToast({
      open: true,
      message: "API-Key gespeichert! ✓",
      severity: "success",
    });
  };

  const handleClear = () => {
    clearApiKey("gemini");
    setGeminiKey("");
    setToast({ open: true, message: "API-Key gelöscht.", severity: "success" });
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
          sx={{
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ p: 2.5 }}>
        {/* ─── Header ────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "rgba(108,92,231,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={faGear} color="#6C5CE7" />
          </Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#EEEEF2",
              fontSize: 20,
            }}
          >
            KI-Einstellungen
          </Typography>
        </Box>

        {/* ─── Provider Auswahl ──────────────────────────────────────── */}
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#6B6E7F",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          KI-Anbieter
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
          {(
            [
              {
                value: "gemini",
                label: "Gemini Flash",
                desc: "Google · Schnell & günstig",
                available: true,
              },
              {
                value: "claude",
                label: "Claude Vision",
                desc: "Anthropic · Sehr präzise",
                available: true,
              },
              {
                value: "gpt",
                label: "GPT-4o",
                desc: "OpenAI · Weit verbreitet",
                available: true,
              },
            ] as const
          ).map((p) => (
            <Box
              key={p.value}
              onClick={() => {
                setProvider(p.value);
                saveSelectedProvider(p.value);
              }}
              sx={{
                border: "1px solid",
                borderColor: provider === p.value ? "#6C5CE7" : "#272A38",
                borderRadius: 3,
                p: 1.5,
                cursor: "pointer",
                background:
                  provider === p.value
                    ? "rgba(108,92,231,0.08)"
                    : "transparent",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: provider === p.value ? "#A29BFE" : "#EEEEF2",
                    fontSize: 14,
                  }}
                >
                  {p.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "#6B6E7F",
                  }}
                >
                  {p.desc}
                </Typography>
              </Box>
              {provider === p.value && (
                <FontAwesomeIcon icon={faCheck} color="#6C5CE7" />
              )}
            </Box>
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#6B6E7F",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Gemini API-Key
        </Typography>

        <StyledTextField
          fullWidth
          label="API-Key"
          type={showKey ? "text" : "password"}
          placeholder="AIza..."
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowKey((v) => !v)}
                    sx={{ color: "#6B6E7F" }}
                    size="small"
                  >
                    <FontAwesomeIcon
                      icon={showKey ? faEyeSlash : faEye}
                      size="sm"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1.5 }}
        />

        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: "#6B6E7F",
            mb: 2.5,
          }}
        >
          🔒 Der Key wird verschlüsselt nur auf deinem Gerät gespeichert —
          niemals auf unseren Servern.
        </Typography>

        <GradientButton onClick={handleSave} sx={{ mb: 1.5 }}>
          <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />
          Speichern
        </GradientButton>

        {geminiKey && (
          <Box
            onClick={handleClear}
            sx={{
              textAlign: "center",
              cursor: "pointer",
              mt: 1,
              color: "#FF6B6B",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            API-Key löschen
          </Box>
        )}
      </Box>
    </>
  );
}
