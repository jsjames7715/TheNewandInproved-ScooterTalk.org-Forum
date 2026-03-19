import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ForumLayout } from './components/forum/layout.tsx';
import { ForumHome } from './components/forum/home.tsx';
import { ForumLogin } from './components/forum/auth/login.tsx';
import { ForumRegister } from './components/forum/auth/register.tsx';
import { ForumBoard } from './components/forum/board.tsx';
import { ForumThread } from './components/forum/thread.tsx';
import { ForumCreateThread } from './components/forum/create-thread.tsx';
import { ForumSearch } from './components/forum/search.tsx';
import { ForumProfile } from './components/forum/profile.tsx';

export default function ForumApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/forum" replace />} />
        <Route path="/forum" element={
          <ForumLayout>
            <ForumHome />
          </ForumLayout>
        }>
          <Route index element={<ForumHome />} />
          <Route path="login" element={<ForumLogin />} />
          <Route path="register" element={<ForumRegister />} />
          <Route path="board/:boardId" element={<ForumBoard />} />
          <Route path="thread/:threadId" element={<ForumThread />} />
          <Route path="create" element={<ForumCreateThread />} />
          <Route path="search" element={<ForumSearch />} />
          <Route path="profile" element={<ForumProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}