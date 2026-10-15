// src/pages/Login.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TaskAlt from "@mui/icons-material/TaskAlt";
import Insights from "@mui/icons-material/Insights";
import FactCheck from "@mui/icons-material/FactCheck";
import Bolt from "@mui/icons-material/Bolt";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/axios";
import { palette } from "../theme";

const FONT = '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif';

const highlights = [
  { icon: <TaskAlt />, title: "Clear weekly goals", text: "Know exactly what is assigned and when it is due." },
  { icon: <Insights />, title: "Live progress", text: "Watch project completion grow as work gets done." },
  { icon: <FactCheck />, title: "Easy approvals", text: "Submit, review and approve with comments in one place." },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "#F8FFFB",
    "& fieldset": { borderColor: palette.border, borderWidth: 2 },
    "&:hover fieldset": { borderColor: palette.primary },
    "&.Mui-focused fieldset": { borderColor: palette.primary },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: palette.primaryDark },
  "& .MuiSvgIcon-root": { color: palette.primary },
  // removes Chrome's blue/lavender autofill background
  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 100px #F8FFFB inset",
    WebkitTextFillColor: palette.text,
    caretColor: palette.text,
    borderRadius: "12px",
    transition: "background-color 9999s ease-in-out 0s",
  },
};

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in: go straight to the right dashboard
  if (user) {
    return <Navigate to={user.role === "MANAGER" ? "/manager" : "/user"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password); // on success, `user` is set and the redirect above happens
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: palette.bg,
        color: palette.text,
        fontFamily: FONT,
        "& .MuiTypography-root": { fontFamily: FONT },
      }}
    >
      {/* LEFT: green hero panel (hidden on small screens) */}
      <Box
        sx={{
          flex: 1.1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          color: "white",
          px: { md: 6, lg: 10 },
          background: palette.heroGradient,
        }}
      >
        {/* decorative shapes: kept in the corners, behind the text */}
        <Box sx={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", top: -130, right: -100, bgcolor: "rgba(255,255,255,0.14)" }} />
        <Box sx={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", top: 110, right: 70, bgcolor: palette.accent, opacity: 0.85 }} />
        <Box sx={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", bottom: -70, right: -60, bgcolor: palette.sun, opacity: 0.9 }} />
        <Box sx={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", bottom: -130, left: -90, bgcolor: "rgba(255,255,255,0.10)" }} />

        {/* all content sits above the shapes */}
        <Stack spacing={4} sx={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "white",
                color: palette.primary,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <Bolt />
            </Box>
            <Typography variant="h5" fontWeight={800}>
              TaskPulse
            </Typography>
          </Stack>

          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.15 }}>
              Plan it. Track it.{" "}
              <Box component="span" sx={{ color: palette.sun }}>
                Nail it.
              </Box>
            </Typography>
            <Typography sx={{ mt: 2, opacity: 0.92 }}>
              Daily updates, weekly plans and approvals, all in one simple workspace for your team.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {highlights.map((h) => (
              <Stack key={h.title} direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ p: 1, borderRadius: 2.5, display: "flex", bgcolor: "rgba(255,255,255,0.22)" }}>{h.icon}</Box>
                <Box>
                  <Typography fontWeight={700}>{h.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.92 }}>
                    {h.text}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* RIGHT: white form card on mint background */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, sm: 5 },
            borderRadius: 5,
            bgcolor: palette.surface,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 20px 50px rgba(16,185,129,0.15)",
          }}
        >
          {/* logo shown only on mobile */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "flex", md: "none" }, mb: 3 }}>
            <Bolt sx={{ color: palette.primary }} />
            <Typography variant="h6" fontWeight={800}>
              TaskPulse
            </Typography>
          </Stack>

          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back 👋
          </Typography>
          <Typography sx={{ mb: 4, color: palette.muted }}>
            Sign in to update and track your tasks
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              fullWidth
              sx={fieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={fieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 16,
                color: "white",
                background: palette.gradient,
                boxShadow: "0 10px 24px rgba(16,185,129,0.40)",
                "&:hover": { background: palette.primaryDark },
                "&.Mui-disabled": { color: "white", opacity: 0.7, background: palette.gradient },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: "block", mt: 4, textAlign: "center", color: palette.muted }}>
            Having trouble signing in? Contact your manager.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}