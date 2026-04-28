import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';
import App from './App.tsx';
import './index.css';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connected successfully.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    } else {
      console.warn("Initial connection test note:", error);
    }
  }
}

testConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
