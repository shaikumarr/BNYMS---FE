// src/components/Layout.jsx
import { AppBar, Avatar, Box, Button, Chip, Container, Toolbar, Typography } from "@mui/material";
import Bolt from "@mui/icons-material/Bolt";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";

const MANAGER_LINKS = [
  { to: "/manager", label: "Dashboard", end: true },
  { to: "/manager/employees", label: "Team" },
  { to: "/manager/projects", label: "Projects" },
  { to: "/manager/approvals", label: "Approvals" },
];

const USER_LINKS = [
  { to: "/user", label: "My Tasks", end: true },
  { to: "/user/progress", label: "Project Progress" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user.role === "MANAGER" ? MANAGER_LINKS : USER_LINKS;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: palette.bg }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          color: palette.text,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", py: { xs: 1, md: 0.5 } }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mr: 3 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: "white",
                background: palette.gradient,
                boxShadow: "0 6px 14px rgba(16,185,129,0.35)",
              }}
            >
              <Bolt fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
              TaskPulse
            </Typography>
          </Box>

          {/* Navigation */}
          {links.map((l) => (
            <Button
              key={l.to}
              component={NavLink}
              to={l.to}
              end={l.end}
              sx={{
                color: palette.muted,
                fontWeight: 600,
                borderRadius: 99,
                px: 2,
                "&:hover": { bgcolor: palette.tint, color: palette.primaryDark },
                "&.active": {
                  bgcolor: "#D1FAE5",
                  color: palette.primaryDark,
                },
              }}
            >
              {l.label}
            </Button>
          ))}

          <Box sx={{ flexGrow: 1 }} />

          {/* User info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontWeight: 700,
                color: "white",
                background: palette.gradient,
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
              <Typography variant="body2" fontWeight={700}>
                {user.name}
              </Typography>
              <Chip
                size="small"
                label={user.role}
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: user.role === "MANAGER" ? "#FEF3C7" : "#D1FAE5",
                  color: user.role === "MANAGER" ? "#92400E" : "#065F46",
                }}
              />
            </Box>
          </Box>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutRounded />}
            sx={{
              ml: 1,
              color: "#E11D48",
              fontWeight: 600,
              borderRadius: 99,
              "&:hover": { bgcolor: "#FFE4E6" },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}