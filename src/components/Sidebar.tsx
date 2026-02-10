"use client"
import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Button, Box, Divider, Avatar, Typography, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง
import { Outlet } from 'react-router-dom';

// Types
export type ChatItem = { id: string; title: string };

export default function Sidebar() {
  const drawerWidth = 280;
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');

  const auth = useAuth(); // เรียกใช้ Auth Context ในนี้ได้เลย

  const handleDeleteChat = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    if (window.confirm('ต้องการลบแชทนี้ใช่ไหม?')) {
      setHistory((prev) => prev.filter(h => h.id !== id));
      if (activeChatId === id) setActiveChatId('');
    }
  };

  const onNewChat = () => {
    const newChat: ChatItem = { id: String(Date.now()), title: `New Chat ${history.length + 1}` };
    setHistory((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
      <Box sx={{ p: 2, fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>
        PheJha
      </Box>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            color: 'text.primary',
            borderColor: '#e0e0e0',
            py: 1.5,
            borderRadius: 2,
            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' },
          }}
        >
          New Chat
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 'bold' }}>
          Recent
        </Typography>
        <List>
          {history.map((chat) => (
            <ListItem
              key={chat.id}
              disablePadding
              sx={{ mb: 0.5 }}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                const btn = (e.currentTarget.querySelector('.delete-btn') as HTMLElement | null);
                if (btn) btn.style.opacity = '1';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                const btn = (e.currentTarget.querySelector('.delete-btn') as HTMLElement | null);
                if (btn) btn.style.opacity = '0';
              }}
            >
              <ListItemButton
                selected={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor: '#e3f2fd' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: activeChatId === chat.id ? '#1976d2' : 'inherit' }}>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={chat.title}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                />
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  sx={{ opacity: 0, transition: '0.2s', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
                {/* แสดง Avatar จาก Auth หรือ Default */}
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {auth.user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
            </ListItemIcon>
            <ListItemText primary={auth.user?.email || "Guest User"} />
            <SettingsIcon color="action" />
          </ListItemButton>
        </ListItem>
      </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, height: '100vh' }}>
        <Outlet context={{ currentChatTitle: history.find(h => h.id === activeChatId)?.title || 'New Chat' }} />
      </Box>
    </Box>
  );
}