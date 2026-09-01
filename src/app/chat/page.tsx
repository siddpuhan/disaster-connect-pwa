'use client';
import dynamic from 'next/dynamic';

const ChatPage = dynamic(() => import('../../components/ChatPage'), {
  ssr: false,
});

// Route protection is handled exclusively by the middleware (the single guard).
// By the time this client page is reached, the session is already
// validated, so the client does not need to re-check authentication.
export default function Chat() {
  return <ChatPage />;
}
