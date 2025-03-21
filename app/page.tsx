'use client';

import { Message, useChat } from '@ai-sdk/react';
import { UserCard } from '@/components/ui/userCard';
import { BotCard } from '@/components/ui/botCard';
import { FaPaperPlane, FaPlus, FaRobot, FaShareAlt } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from "motion/react"
import { useEffect, useState } from 'react';
import { TbFaceIdError } from "react-icons/tb";
import { generateId } from 'ai';
import { toast } from "sonner"
import { Button } from '@/components/ui/button';

interface ChatHistory {
  id: string;
  sessionId: string;
  response: string;
  question: string;
  createdAt: Date;
}

const ExampleQuestions = [
  'What are design files?',
  'How to use the toolbar?',
  'How to use the properties panel with edit access?',
  'How to use local fonts on Figma?',
]

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex space-x-2 opacity-80">
        <div className="w-6 h-6 bg-[#232323] rounded-full animate-bounce"></div>
        <div className="w-6 h-6 bg-[#232323] rounded-full animate-bounce200"></div>
        <div className="w-6 h-6 bg-[#232323] rounded-full animate-bounce400"></div>
      </div>
    </div>
  );
};

export default function Chat() {

  const [error, setError] = useState(false);
  const [chatId, setChatId] = useState('Default');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({ maxSteps: 5, onError: () => setError(true), body: { chatId } });

  const getChatHistory = async (chatId: string) => {
    const response = await fetch(`/api/chat?chatId=${chatId}`);
    const chatHistory = await response.json();
    setChatHistory(chatHistory);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('chatId');
    if (chatIdFromUrl) {
      getChatHistory(chatIdFromUrl);
    }
    setChatId(generateId());
  }, []);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}?chatId=${chatId}`;
    navigator.clipboard.writeText(shareUrl);
    toast("Share link copied to clipboard!")
  }

  return (
    <div className="flex flex-col w-screen h-screen stretch overflow-hidden bg-[url('/background_full.jpg')] bg-cover bg-center relative">
      <div className="flex items-center justify-center w-full space-y-1 backdrop-blur-md absolute top-0 right-0 left-0 z-10 bg-white/30">
        <div className='flex items-center justify-center w-full md:max-w-[850px] px-3 md:px-[10px]'>
          <div className='flex items-end justify-center pt-3'>
            <Image src='/robot.png' alt='logo' width={50} height={50} />
            <div className="flex flex-col ml-4 md:ml-2 pb-1">
              <h1 className="font-gabarito text-xl md:text-3xl font-bold text-black">Figma AI Assistant</h1>
              <p className="font-afacad text-sm md:text-base text-[#232323]">Ask Figma documentation and get answers in seconds.</p>
            </div>
          </div>
          {chatHistory.length === 0 && <div className='flex items-center justify-center w-[36px] h-[36px] rounded-full bg-white/30 cursor-pointer hover:bg-white/50 ml-auto' onClick={handleShare}>
            <FaShareAlt className="text-[#232323]" />
          </div>}
        </div>
      </div>
      <div className='flex flex-col justify-center items-start md:items-center bg-white bg-opacity-30 h-full'>
        <div className='overflow-y-auto flex-1 w-full flex items-start justify-center'>
          <div className="space-y-4 px-3 md:px-[10px] pb-24 z-2 pt-[110px] md:max-w-[850px] w-full">
            {chatHistory.length === 0 && <div className='bg-gray-200 rounded-md p-4 border border-gray-300 overflow-x-auto opacity-90'>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center"><Image src='/avatar.png' alt='logo' width={32} height={32} /></div>
                <div className="font-bold">AI</div>
              </div>
              <p className="font-afacad text-lg">Hello, I&apos;m your Figma AI Assistant. How can I help you today?</p>
            </div>}
            {chatHistory.map(m => {
              return <motion.div key={m.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                {/* <div className="whitespace-pre-wrap z-2 mb-4">
                  <UserCard message={{ id: m.id, content: m.question, experimental_attachments: [] }} />
                </div> */}
                <div className="whitespace-pre-wrap z-2">
                  <BotCard message={{ role: 'assistant', content: m.response, id: m.id, parts: [] }} />
                </div>
              </motion.div>
            })}
            {messages.map(m => (
              <motion.div key={m.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="whitespace-pre-wrap z-2">
                  {m.role === 'user' ? <UserCard message={m} /> : <BotCard message={m} />}
                </div>
              </motion.div>
            ))}
            {messages.length === 0 && chatHistory.length === 0 && ExampleQuestions.map(q => (
              <motion.div key={q} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="whitespace-pre-wrap z-2 bg-[#474d5dcc] rounded-md p-[10px] text-[#ababab] text-center shadow-md cursor-pointer hover:bg-[#474d5dcc]/90 hover:text-[#ababab]/90" onClick={() => append({ role: 'user', content: q })}>
                  {q}
                </div>
              </motion.div>
            ))}
            {error && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="whitespace-pre-wrap z-2 bg-red-400/90 rounded-md p-[10px] text-red-950 text-center shadow-md cursor-pointer flex flex-col items-center justify-center">
                <div className="flex items-center justify-center space-x-2">
                  <TbFaceIdError size={32} />
                  <div className="text-2xl font-bold">Oops!</div>
                </div>
                <div className="text-lg">I&apos;m sorry, something went wrong. Please try again.</div>
              </div>
            </motion.div>}
            {isLoading && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            </motion.div>}
          </div>
        </div>
        {chatHistory.length === 0 && <form onSubmit={(event) => { handleSubmit(event); }} className="fixed bottom-0 right-2 left-2 md:mx-auto md:max-w-screen-sm lg:max-w-screen-md p-2 mb-4 md:mb-8 border border-gray-300 bg-white rounded-md shadow-xl flex items-center">
          <input
            className="w-full p-2"
            value={input}
            placeholder="Type your question here..."
            onChange={handleInputChange}
          />
          <button type="submit" className="ml-2 p-2 bg-black text-white rounded hover:bg-gray-800">
            <FaPaperPlane />
          </button>
        </form>}
        {chatHistory.length > 0 && <div className="fixed bottom-0 right-2 left-2 md:mx-auto md:max-w-screen-sm lg:max-w-screen-md p-2 mb-4 md:mb-8 flex items-center justify-center">
          <Button 
            onClick={() => {
              setChatHistory([]);
              setChatId(generateId());
              window.history.pushState({}, '', '/');
            }}
            className="md:min-w-[180px] px-4 py-2 flex items-center justify-center space-x-2 animate-bounce hover:animate-none group"
          >
            <FaPlus />
            <span>New Chat</span>
          </Button>
        </div>}
      </div>
    </div>
  );
}
