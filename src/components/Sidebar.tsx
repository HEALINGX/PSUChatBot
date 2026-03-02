"use client"
import React, { useState } from 'react';
import { styled, type Theme, type CSSObject } from '@mui/material/styles'; 
import {
  Box, List, CssBaseline, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Typography, Tooltip, Drawer as MuiDrawer,
  Button, Menu, MenuItem
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu'; 
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Outlet } from 'react-router-dom';

const drawerWidth = 280;

// --- 1. Mixins สำหรับ Animation ---
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(9)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(10)} + 1px)`,
  },
});

// --- 2. Styled Drawer Header ---
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between', 
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// --- 3. Styled Drawer Component ---
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

// Types
export type ChatRoom = { id: string; title: string; apiKey: string };

const fallbackApiKey = import.meta.env.VITE_DIFY_API_KEY || '';

const chatRooms: ChatRoom[] = [
  {
    id: 'cs2564-advisor',
    title: 'CS2564 Advisor',
    apiKey: import.meta.env.VITE_DIFY_API_KEY_CS_ADVISOR || fallbackApiKey,
  },
  {
    id: 'cs2559-advisor',
    title: 'CS2559 Advisor',
    apiKey: import.meta.env.VITE_DIFY_API_KEY_CAREER || fallbackApiKey,
  }
];

export default function Sidebar() {
  const [open, setOpen] = useState(true); 
  const [activeRoomId, setActiveRoomId] = useState<string>(chatRooms[0]?.id || '');
  const [newChatToken, setNewChatToken] = useState(0);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  
  const auth = useAuth();
  const { themeMode, setThemeMode } = useApp();

  const toggleDrawer = () => setOpen(!open);

  const onNewChat = () => {
    setNewChatToken((prev) => prev + 1);
  };

  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };

  const handleSetTheme = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    handleCloseSettings();
  };

  const handleLogout = async () => {
    handleCloseSettings();
    await auth.signOut();
  };

  const activeRoom = chatRooms.find((room) => room.id === activeRoomId) || chatRooms[0];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* --- DRAWER --- */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {open && (
             <Typography variant="h6" fontWeight="bold" color="primary" sx={{ ml: 2 }}>
                CS Assistant
             </Typography>
          )}
          <IconButton onClick={toggleDrawer}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        {/* ปุ่ม New Chat */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: open ? 'flex-start' : 'center' }}>
            {open ? (
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onNewChat}
                    sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        color: 'text.primary',
                        borderColor: 'divider',
                        py: 1.5,
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
                    }}
                >
                    New Chat
                </Button>
            ) : (
                <Tooltip title="New Chat" placement="right">
                    <IconButton 
                        onClick={onNewChat}
                        sx={{ 
                        border: '1px solid',
                        borderColor: 'divider', 
                            borderRadius: 2,
                            width: 48, height: 48 
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>

        {/* Chat Room List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {open && (
             <Typography variant="caption" sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 'bold', display: 'block' }}>
               Chat Rooms
             </Typography>
          )}

          {chatRooms.length > 0 ? (
             <List>
               {chatRooms.map((room) => (
                 <ListItem key={room.id} disablePadding sx={{ display: 'block' }}>
                   <Tooltip title={open ? "" : room.title} placement="right" arrow>
                       <ListItemButton
                       selected={activeRoomId === room.id}
                       onClick={() => setActiveRoomId(room.id)}
                       sx={{
                           minHeight: 48,
                           justifyContent: open ? 'initial' : 'center',
                           px: 2.5,
                           mx: 1,
                           borderRadius: 2,
                           mb: 0.5,
                             '&.Mui-selected': { bgcolor: 'action.selected' }
                       }}
                       >
                       <ListItemIcon
                           sx={{
                           minWidth: 0,
                           mr: open ? 2 : 'auto',
                           justifyContent: 'center',
                             color: activeRoomId === room.id ? 'primary.main' : 'inherit'
                           }}
                       >
                           <ChatBubbleOutlineIcon />
                       </ListItemIcon>
                       
                       <ListItemText 
                           primary={room.title} 
                           primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                           sx={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none' }} 
                       />
                       </ListItemButton>
                   </Tooltip>
                 </ListItem>
               ))}
             </List>
          ) : (
             open && (
                 <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                   No chat room configured
                 </Typography>
             )
          )}
        </Box>

        <Divider />

        {/* User Profile */}
        <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
                <Tooltip title={auth.user?.email || "abc-123"} arrow placement="right">
                    <ListItemButton
                  onClick={handleOpenSettings}
                        sx={{
                            minHeight: 56,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 2 : 'auto',
                                justifyContent: 'center',
                            }}
                        >
                             <Avatar 
                                sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    bgcolor: 'secondary.main',
                                    fontSize: '0.9rem' 
                                }}
                            >
                                {auth.user?.email?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                        </ListItemIcon>
                        
                        <ListItemText 
                            primary={auth.user?.email || "abc-123"} 
                            primaryTypographyProps={{ variant: 'body2', noWrap: true, fontWeight: 'medium' }}
                            sx={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none', mr: 1 }}
                        />

                        {open && <SettingsIcon color="action" fontSize="small" />}
                    </ListItemButton>
                </Tooltip>
            </ListItem>
        </List>

        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleCloseSettings}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem selected={themeMode === 'light'} onClick={() => handleSetTheme('light')}>
            <ListItemIcon>
              <LightModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Light theme</ListItemText>
          </MenuItem>

          <MenuItem selected={themeMode === 'dark'} onClick={() => handleSetTheme('dark')}>
            <ListItemIcon>
              <DarkModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dark theme</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Drawer>

      {/* --- MAIN CONTENT --- */}
      <Box component="main" sx={{ flexGrow: 1, p: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        <Outlet
          context={{
            currentChatTitle: activeRoom?.title || 'New Chat',
            selectedRoomId: activeRoom?.id || null,
            selectedApiKey: activeRoom?.apiKey || '',
            newChatToken,
          }}
        />
      </Box>
    </Box>
  );
}