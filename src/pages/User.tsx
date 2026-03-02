"use client"
import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Paper, Stack, CircularProgress, Avatar, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

import { useAuth } from '../context/AuthContext';

type Message = { id: string | number; role: 'assistant' | 'user'; content: string };
type OutletContextType = { 
  currentChatTitle: string; 
  selectedRoomId: string | null;
  selectedApiKey: string;
  newChatToken: number;
};

export default function ChatArea() {
  const { currentChatTitle, selectedRoomId, selectedApiKey, newChatToken } = useOutletContext<OutletContextType>();
  const auth = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const conversationByRoomRef = useRef<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const defaultWelcome = 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับหลักสูตรไหมครับ?';
  
  // Room-specific suggested questions
  const roomQuestionsMap: Record<string, { welcome: string; questions: string[] }> = {
    'cs2564-advisor': {
      welcome: 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับหลักสูตร CS2546 ไหมครับ?',
      questions: [
        'หลักสูตร CS ประกอบด้วยวิชาอะไรบ้าง?',
        'ต้องใช้เวลากี่ปีในการจบหลักสูตร CS?',
        'วิชาพื้นฐานของ CS คืออะไร?',
        'มีการฝึกงานหรือ internship ไหม?'
      ]
    },
    'cs2559-advisor': {
      welcome: 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับหลักสูตร CS2559 ไหมครับ?',
      questions: [
        'คุณสามารถช่วยอะไรให้ฉันบ้าง?',
        'มีคำถามทั่วไปอะไรที่ฉันอยากถามได้บ้าง?',
        'บริการของคุณมีอะไรบ้าง?',
        'ฉันจะเริ่มต้นอย่างไร?'
      ]
    }
  };

  // Get suggested questions based on room ID
  const getSuggestedQuestions = () => {
    if (selectedRoomId && roomQuestionsMap[selectedRoomId]) {
      return roomQuestionsMap[selectedRoomId].questions;
    }
    return [
      'หลักสูตรหลักคืออะไร?',
      'ต้องใช้เวลาเท่าไรในการจบ?',
      'วิชาที่สำคัญคืออะไร?',
      'มีสิ่งอำนวยความสะดวกไหม?'
    ];
  };

  // Get welcome message based on room ID
  const getWelcomeMessage = () => {
    if (selectedRoomId && roomQuestionsMap[selectedRoomId]) {
      return roomQuestionsMap[selectedRoomId].welcome;
    }
    return defaultWelcome;
  };

  useEffect(() => {
    setMessages([{ id: `welcome-${selectedRoomId || 'default'}`, role: 'assistant', content: getWelcomeMessage() }]);
  }, [selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId) {
      delete conversationByRoomRef.current[selectedRoomId];
    }
    setMessages([{ id: `welcome-${selectedRoomId || 'default'}-${newChatToken}`, role: 'assistant', content: getWelcomeMessage() }]);
  }, [newChatToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSendMessage(question);
    }, 0);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    handleSendMessage(input);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (!selectedApiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: `no-key-${Date.now()}`,
          role: 'assistant',
          content: 'ยังไม่ได้ตั้งค่า API Key สำหรับห้องนี้ กรุณาเพิ่มค่าใน .env ก่อนใช้งาน',
        },
      ]);
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', content: messageText };
    const botMsgId = Date.now() + 1;
    
    setMessages((prev) => [...prev, userMsg, { id: botMsgId, role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);

    const userIdentifier = auth.user?.email || "guest_user";
    const activeConversationId = selectedRoomId ? conversationByRoomRef.current[selectedRoomId] : '';

    try {
      const response = await fetch('http://localhost/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${selectedApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: messageText,
          response_mode: "streaming",
          user: userIdentifier,
          conversation_id: activeConversationId || null,
        })
      });

      if (!response.ok) throw new Error('Network response error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponse = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;
              try {
                const data = JSON.parse(dataStr);
                
                if (data.event === 'message' || data.event === 'agent_message') {
                  botResponse += data.answer;
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId ? { ...msg, content: botResponse } : msg
                  ));
                  
                  if (selectedRoomId && data.conversation_id && !conversationByRoomRef.current[selectedRoomId]) {
                    conversationByRoomRef.current[selectedRoomId] = data.conversation_id;
                  }
                }
              } catch (e) { /* chunk parsing error */ }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, content: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">{currentChatTitle || "ถาม-ตอบหลักสูตร CS"}</Typography>
      </Box>

      {/* Message List */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: 'background.paper' }}>
        <Stack spacing={3} maxWidth="md" mx="auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <Box key={msg.id} sx={{ display: 'flex', gap: 2, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ bgcolor: isUser ? 'secondary.main' : 'primary.main', width: 32, height: 32 }}>
                  {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Paper elevation={0} sx={{ p: 2, maxWidth: '80%', borderRadius: 3, bgcolor: isUser ? 'action.hover' : 'background.default', border: isUser ? 'none' : '1px solid', borderColor: isUser ? 'transparent' : 'divider' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>

        {messages.length === 1 && messages[0].role === 'assistant' && (
            <Box sx={{ mt: 4, pt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                เลือกจากคำถามที่แนะนำ
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                {getSuggestedQuestions().map((question, idx) => (
                  <Chip
                    key={idx}
                    label={question}
                    onClick={() => handleSendSuggestedQuestion(question)}
                    disabled={isLoading}
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  />
                ))}
              </Stack>
            </Box>
          )}

      </Box>


      {/* Input Area */}
      <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box maxWidth="md" mx="auto">
          <Paper component="form" elevation={0} sx={{ p: '4px 8px', display: 'flex', alignItems: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider' }} 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <TextField
              fullWidth multiline maxRows={4} placeholder="พิมพ์คำถามของคุณที่นี่..." variant="standard" 
              InputProps={{ disableUnderline: true }} sx={{ ml: 1, flex: 1 }}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              disabled={isLoading}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
