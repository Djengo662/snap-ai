import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLeaf } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  GradientButton,
  LogoCircle,
  SocialButton,
  StyledTextField,
  Wrap,
} from "../snap-box";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
// await signInWithEmailAndPassword(auth, email, password);

interface LoginProps {
  onLogin: () => void;
  onSwitch: () => void;
}

export default function Login({ onLogin, onSwitch }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "error" | "success",
  });

  const showToast = (
    message: string,
    severity: "info" | "error" | "success" = "info",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Bitte alle Felder ausfüllen.", "error");
      return;
    }

    setLoading(true);

    try {
      // import { auth } from "./firebase";
      // import { signInWithEmailAndPassword } from "firebase/auth";
      // await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const msg =
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password"
          ? "E-Mail oder Passwort falsch."
          : "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // --- Firebase Google Auth (uncomment to activate) ---
    // import { auth } from "./firebase";
    // import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
    // const provider = new GoogleAuthProvider();
    // await signInWithPopup(auth, provider);
    showToast("Google-Login kommt bald!", "info");
  };

  const handleAppleLogin = async () => {
    showToast("Apple-Login kommt bald!", "info");
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
            ...(toast.severity === "info" && {
              backgroundColor: "#6C5CE7",
            }),
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
            SnapAi
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6B6E7F",
              mb: 4,
            }}
          >
            Dein KI-Ernährungscoach
          </Typography>

          <StyledTextField
            fullWidth
            label={"E-Mail"}
            type="email"
            placeholder="max@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            sx={{ mb: 1.5 }}
          />

          <StyledTextField
            fullWidth
            label="password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw(!showPw)}
                      sx={{ color: "#6B6E7F" }}
                    />
                    <FontAwesomeIcon
                      icon={showPw ? faEyeSlash : faEye}
                      size="sm"
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              width: "100%",
              textAlign: "right",
              mb: 3,
            }}
          >
            <Typography
              component={"span"}
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#6C5CE7",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Passwort vergessen?
            </Typography>
          </Box>

          <GradientButton>
            {loading && (
              <CircularProgress size={18} sx={{ color: "white", mr: 1 }} />
            )}

            {loading ? "Anmelden..." : "Anmelden"}
          </GradientButton>

          <Divider
            sx={{
              width: "100%",
              my: 2.5,
              "&::before, &::after": { borderColor: "#272A38" },
              color: "#3D4055",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
            }}
          >
            oder weiter mit
          </Divider>

          <Box sx={{ display: "flex", gap: 1.5, width: "100%", mb: 3 }}>
            <SocialButton onClick={handleGoogleLogin} fullWidth>
              <FontAwesomeIcon icon={faGoogle} />
            </SocialButton>

            <SocialButton onClick={handleAppleLogin} fullWidth>
              <FontAwesomeIcon icon={faApple} />
              Apple
            </SocialButton>
          </Box>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6B6E7F",
            }}
          >
            Noch kein Konto?{" "}
            <Typography
              component="span"
              onClick={onSwitch}
              sx={{
                color: "#A29BFE",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Registrieren
            </Typography>
          </Typography>
        </Card>
      </Wrap>
    </>
  );
}
