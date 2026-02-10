import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Stack,
  Alert,
} from "@mui/material";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"; // เปลี่ยน Icon ให้สื่อถึงการสมัครสมาชิก

// --- FIREBASE IMPORTS ---
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/utils";

export default function RegisterPage() {
  const navigate = useNavigate();

  // --- State ---
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // --- Logic ---
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => event.preventDefault();

  // ฟังก์ชันสมัครสมาชิก
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // 1. ตรวจสอบเบื้องต้น (Client Side Validation)
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      // 2. เรียก Firebase Create User
      await createUserWithEmailAndPassword(auth, email, password);

      // สมัครสำเร็จ -> ไปหน้าแรก (Firebase จะ Auto Login ให้ทันทีหลังสมัครเสร็จ)
      navigate("/");
    } catch (err: any) {
      console.error("Signup Error:", err.code);

      // จัดการ Error Message
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("อีเมลนี้ถูกใช้งานแล้ว");
          break;
        case "auth/invalid-email":
          setError("รูปแบบอีเมลไม่ถูกต้อง");
          break;
        case "auth/weak-password":
          setError("รหัสผ่านง่ายเกินไป");
          break;
        default:
          setError("เกิดข้อผิดพลาด: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("ไม่สามารถสมัครด้วย Google ได้");
      setLoading(false);
    }
  };

  return (
    // 1. Wrapper หลัก: ใช้ Box + Flexbox เพื่อจัดกึ่งกลางหน้าจอ (ดีกว่า Grid ในเคสนี้)
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 2, // padding กันขอบสำหรับมือถือ
      }}
    >
      {/* 2. กล่อง Card: กำหนดความกว้างสูงสุดไว้ที่ 450px */}
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          borderRadius: 2,
          width: "100%",
          maxWidth: 450,
        }}
      >
        {/* Header Icon */}
        <Box
          sx={{ m: 1, bgcolor: "primary.main", p: 1.5, borderRadius: "50%" }}
        >
          <PersonAddAltIcon sx={{ color: "white" }} />
        </Box>

        <Typography
          component="h1"
          variant="h5"
          fontWeight="bold"
          sx={{ mt: 1 }}
        >
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign up to get started with AI Chat
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSignUp}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword !== "" && password !== confirmPassword}
            helperText={
              confirmPassword !== "" && password !== confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1rem", borderRadius: 2 }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              OR SIGN UP WITH
            </Typography>
          </Divider>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              fullWidth
              sx={{ borderRadius: 2 }}
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              Google
            </Button>
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                fontWeight="bold"
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
