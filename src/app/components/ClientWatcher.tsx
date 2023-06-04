"use client";

import { useAuth } from '../hooks/auth.hooks';
import { useEffect } from 'react'

export function ClientWatcher() {
  
  const { subscribeToAuthStateChanges } = useAuth();

  useEffect(() => {
    subscribeToAuthStateChanges();
  }, []);

  return (
      // <div 
      //   className="splash-spinner" 
      //   style={{
      //     position: "fixed",
      //     width: "100vw",
      //     height: "100vh",
      //     backgroundColor: "rgba(0, 0, 0, 0.5)",
      //     display: "flex",
      //     justifyContent: "center",
      //     alignItems: "center",
      //   }}>
      //   <RemarcSpinner />
      // </div>
      <></>
  );
}