import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Stack,
  Alert
} from '@mui/material';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// --- FIREBASE IMPORTS ---
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();

  // --- State with Types ---
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // --- Logic ---
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // 1. ฟังก์ชัน Login ด้วย Email/Password
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // เรียกใช้ Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // ถ้า Login สำเร็จ จะข้ามมาบรรทัดนี้
      navigate('/'); // หรือ redirect ไปหน้าที่ต้องการ
    } catch (err: any) {
      console.error("Login Error:", err.code);
      
      // จัดการ Error Message ให้ user เข้าใจง่าย
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          break;
        case 'auth/too-many-requests':
          setError('ลองบ่อยเกินไป กรุณารอสักครู่');
          break;
        default:
          setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชัน Login ด้วย Google
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        navigate('/'); // Login สำเร็จ
    } catch (err: any) {
        console.error("Google Login Error:", err);
        setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: 2,
          width: '100%',
          maxWidth: 450,
        }}
      >
          
          {/* Logo / Header */}
          <Box sx={{ m: 1, bgcolor: 'secondary.main', p: 1.5, borderRadius: '50%' }}>
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email and password
          </Typography>

          {/* แสดง Error ถ้ามี */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              error={!!error}
              sx={{
                '& input::-ms-reveal, & input::-ms-clear': {
                  display: 'none',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
          
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', borderRadius: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR CONTINUE WITH
              </Typography>
            </Divider>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                fullWidth
                sx={{ borderRadius: 2 }}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Google
              </Button>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/register" variant="body2" fontWeight="bold">
                  Sign Up
                </Link>
              </Typography>
            </Box>

          </Box>
        </Paper>
      </Box>
  );
}