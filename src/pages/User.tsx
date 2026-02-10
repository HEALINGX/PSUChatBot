import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Paper, Stack, CircularProgress, Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Types
type Message = { id: number; role: 'assistant' | 'user'; content: string };

type OutletContextType = { currentChatTitle: string };

export default function ChatArea() {
  const { currentChatTitle } = useOutletContext<OutletContextType>();
  // --- State for Messages ---
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: 'สวัสดีครับ! ผมคือผู้ช่วย AI มีอะไรให้ผมช่วยวันนี้ไหมครับ?' }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset messages when chat changes (Optional: ถ้าอยากให้เปลี่ยนห้องแล้วแชทหายให้เปิดบรรทัดนี้)
  // useEffect(() => {
  //   setMessages([{ id: Date.now(), role: 'assistant', content: 'เริ่มการสนทนาใหม่...' }]);
  // }, [currentChatTitle]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Mock API Call
    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `นี่คือคำตอบจำลองสำหรับ: "${userMsg.content}" \n(ในอนาคตส่วนนี้จะเชื่อมกับ API ของ Dify)`,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#ffffff'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {currentChatTitle}
          </Typography>
          <Box sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
            GPT-4o
          </Box>
        </Box>
        <IconButton><MoreVertIcon /></IconButton>
      </Box>

      {/* Message List */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#fafafa' }}>
        <Stack spacing={3} maxWidth="md" mx="auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <Box key={msg.id} sx={{ display: 'flex', gap: 2, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ bgcolor: isUser ? '#9c27b0' : '#1976d2', width: 36, height: 36 }}>
                  {isUser ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: '75%',
                    borderRadius: 3,
                    bgcolor: isUser ? '#f3f4f6' : 'white',
                    color: 'text.primary',
                    border: isUser ? 'none' : '1px solid #eee'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            );
          })}

          {isLoading && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2' }}><SmartToyIcon /></Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', height: 40, pl: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>AI กำลังคิด...</Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #f0f0f0' }}>
        <Box maxWidth="md" mx="auto">
          <Paper
            component="form"
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="ส่งข้อความถึง AI..."
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ ml: 1, flex: 1 }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e as React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>)}
            />

            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{ p: '10px' }}
            >
              <SendIcon />
            </IconButton>
          </Paper>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 1, color: 'text.disabled' }}>
            AI อาจแสดงข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญ
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}