import { useState } from "react";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { getUserProfile } from "./firebase-config";
import AppShell from "./components/app-shell";
import Onboarding from "./components/auth/onboarding";

type Screen = "login" | "register" | "onboarding" | "app";

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [uid, setUid] = useState<string>("");

  const handleAuth = async (userId: string) => {
    setUid(userId);
    try {
      const profile = await getUserProfile(userId);
      if (!profile || !profile.onboardingComplete) {
        setScreen("onboarding");
      } else {
        setScreen("app");
      }
    } catch {
      setScreen("onboarding");
    }
  };

  const handleLogout = () => {
    setUid("");
    setScreen("login");
  };

  return (
    <>
      {screen === "login" && (
        <Login
          onLogin={(userId) => handleAuth(userId)}
          onSwitch={() => setScreen("register")}
        />
      )}
      {screen === "register" && (
        <Register
          onRegister={(userId) => handleAuth(userId)}
          onSwitch={() => setScreen("login")}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding onComplete={() => setScreen("app")} />
      )}
      {screen === "app" && <AppShell uid={uid} onLogout={handleLogout} />}
    </>
  );
}

export default App;
