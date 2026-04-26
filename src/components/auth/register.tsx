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
import {
  faEye,
  faEyeSlash,
  faLeaf,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
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
import {
  registerWithEmail,
  loginWithGoogle,
  createUserProfile,
} from "../../firebase-config";
import { sendEmailVerification } from "firebase/auth";

interface RegisterProps {
  onRegister: (uid: string) => void;
  onSwitch: () => void;
}

export default function Register({ onRegister, onSwitch }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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

  const validate = (): boolean => {
    if (!email || !password || !passwordConfirm) {
      showToast("Bitte alle Felder ausfüllen.", "error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Ungültige E-Mail-Adresse.", "error");
      return false;
    }
    if (password.length < 6) {
      showToast("Passwort muss mindestens 6 Zeichen haben.", "error");
      return false;
    }
    if (password !== passwordConfirm) {
      showToast("Passwörter stimmen nicht überein.", "error");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await registerWithEmail(email, password);
      await createUserProfile(result.user.uid, result.user.email ?? email);
      await sendEmailVerification(result.user);
      setEmailSent(true);
    } catch (err: any) {
      const code = err?.code ?? "";
      const msg =
        code === "auth/email-already-in-use"
          ? "Diese E-Mail wird bereits verwendet."
          : code === "auth/invalid-email"
            ? "Ungültige E-Mail-Adresse."
            : code === "auth/weak-password"
              ? "Passwort ist zu schwach."
              : "Registrierung fehlgeschlagen. Bitte erneut versuchen.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      await createUserProfile(result.user.uid, result.user.email ?? "");
      onRegister(result.user.uid);
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        showToast("Google-Registrierung fehlgeschlagen.", "error");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Bestätigungsscreen ───────────────────────────────────────────────────
  if (emailSent) {
    return (
      <Wrap>
        <Card>
          <LogoCircle>
            <FontAwesomeIcon icon={faEnvelope} color="white" size="2x" />
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
            E-Mail bestätigen
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6B6E7F",
              mb: 4,
              textAlign: "center",
            }}
          >
            Wir haben eine Bestätigungs-E-Mail an{" "}
            <Typography
              component="span"
              sx={{ color: "#A29BFE", fontWeight: 600 }}
            >
              {email}
            </Typography>{" "}
            gesendet. Bitte bestätige deine E-Mail und melde dich dann an.
          </Typography>

          <GradientButton onClick={onSwitch}>Zur Anmeldung</GradientButton>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#6B6E7F",
              mt: 2,
              cursor: "pointer",
              "&:hover": { color: "#A29BFE" },
            }}
            onClick={() =>
              showToast(
                "Bitte melde dich an um die E-Mail erneut zu senden.",
                "info",
              )
            }
          >
            E-Mail nicht erhalten? Erneut senden
          </Typography>
        </Card>
      </Wrap>
    );
  }

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
            ...(toast.severity === "info" && { backgroundColor: "#6C5CE7" }),
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
            Konto erstellen
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6B6E7F",
              mb: 4,
            }}
          >
            Starte deine Ernährungsreise
          </Typography>

          <StyledTextField
            fullWidth
            label="E-Mail"
            type="email"
            placeholder="max@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            sx={{ mb: 1.5 }}
          />

          <StyledTextField
            fullWidth
            label="Passwort"
            type={showPw ? "text" : "password"}
            placeholder="Min. 6 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((v) => !v)}
                      sx={{ color: "#6B6E7F" }}
                      size="small"
                    >
                      <FontAwesomeIcon
                        icon={showPw ? faEyeSlash : faEye}
                        size="sm"
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 1.5 }}
          />

          <StyledTextField
            fullWidth
            label="Passwort bestätigen"
            type={showPwConfirm ? "text" : "password"}
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwConfirm((v) => !v)}
                      sx={{ color: "#6B6E7F" }}
                      size="small"
                    >
                      <FontAwesomeIcon
                        icon={showPwConfirm ? faEyeSlash : faEye}
                        size="sm"
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
          />

          <GradientButton onClick={handleRegister} disabled={loading}>
            {loading && (
              <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
            )}
            {loading ? "Wird erstellt..." : "Konto erstellen"}
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
            <SocialButton
              onClick={handleGoogleRegister}
              fullWidth
              disabled={googleLoading}
            >
              {googleLoading ? (
                <CircularProgress size={14} sx={{ color: "#6B6E7F" }} />
              ) : (
                <FontAwesomeIcon icon={faGoogle} />
              )}
              Google
            </SocialButton>

            <SocialButton fullWidth disabled>
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
            Bereits ein Konto?
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
              Anmelden
            </Typography>
          </Typography>
        </Card>
      </Wrap>
    </>
  );
}
