import { useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faCamera,
  faClockRotateLeft,
  faUser,
  faLeaf,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./auth/dshboard";
import ProfileHistory from "./profile-history";
import Profile from "./profile";
import ScanScreen from "./scan-screen";
import Settings from "./settings";

interface AppShellProps {
  uid: string;
  onLogout: () => void;
}

type Tab = "dashboard" | "scan" | "history" | "profile" | "settings";

export default function AppShell({ uid, onLogout }: AppShellProps) {
  const [tab, setTab] = useState<Tab>("dashboard");

  const renderContent = () => {
    switch (tab) {
      case "dashboard":
        return <Dashboard uid={uid} />;
      case "history":
        return <ProfileHistory uid={uid} />;
      case "profile":
        return <Profile uid={uid} onLogout={onLogout} />;
      case "scan":
        return <ScanScreen uid={uid} />;
      case "settings":
        return <Settings />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#13141D",
        maxWidth: 480,
        mx: "auto",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          background: "#1A1B26",
          borderBottom: "0.5px solid #272A38",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={faLeaf} color="white" size="sm" />
          </Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#EEEEF2",
              fontSize: 18,
              letterSpacing: "-0.3px",
            }}
          >
            SnapAi
          </Typography>
        </Box>

        <Box
          onClick={() => setTab("profile")}
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#272A38",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border:
              tab === "profile" ? "2px solid #6C5CE7" : "2px solid transparent",
            transition: "border 0.2s",
          }}
        >
          <FontAwesomeIcon icon={faUser} color="#6B6E7F" size="sm" />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>{renderContent()}</Box>

      <BottomNavigation
        value={tab}
        onChange={(_, newTab) => {
          if (newTab !== "scan") setTab(newTab);
        }}
        sx={{
          flexShrink: 0,
          width: "100%",
          overflow: "visible",
          background: "#1A1B26",
          borderTop: "0.5px solid #272A38",
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "#3D4055",
            minWidth: 0,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
          },
          "& .Mui-selected": {
            color: "#6C5CE7 !important",
          },
          "& .MuiBottomNavigationAction-label": {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px !important",
          },
        }}
      >
        <BottomNavigationAction
          value="dashboard"
          label="Dashboard"
          icon={<FontAwesomeIcon icon={faChartBar} size="lg" />}
        />

        <BottomNavigationAction
          value="history"
          label="Verlauf"
          icon={<FontAwesomeIcon icon={faClockRotateLeft} size="lg" />}
        />

        <BottomNavigationAction
          value="scan"
          label="Scan"
          onClick={() => setTab("scan")}
          icon={
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "-28px",
                border: "3px solid #0E1016",
                boxShadow: "0 4px 20px rgba(108,92,231,0.4)",
              }}
            >
              <FontAwesomeIcon icon={faCamera} color="white" size="lg" />
            </Box>
          }
        />

        <BottomNavigationAction
          value="profile"
          label="Profil"
          icon={<FontAwesomeIcon icon={faUser} size="lg" />}
        />

        <BottomNavigationAction
          value="settings"
          label="Einstellungen"
          icon={<FontAwesomeIcon icon={faGear} size="lg" />}
        />
      </BottomNavigation>
    </Box>
  );
}
