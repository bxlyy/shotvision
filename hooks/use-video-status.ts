// hooks/useVideoStatus.ts
import { useState, useEffect } from 'react';

export function useVideoStatus(videoId: string | null) {
  const [status, setStatus] = useState<string>('pending');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!videoId) return;

    // Define the polling function
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/status`);
        const json = await res.json();

        setStatus(json.status);
        
        if (json.status === 'completed') {
          setData(json);
          return true; // Return true to signal we are done
        }
      } catch (err) {
        console.error("Polling error", err);
      }
      return false;
    };

    // 1. Check immediately on mount
    checkStatus();

    // 2. Set up the interval (poll every 2 seconds)
    const intervalId = setInterval(async () => {
      const isFinished = await checkStatus();
      if (isFinished) {
        clearInterval(intervalId); // Stop polling if completed
      }
    }, 2000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [videoId]);

  return { status, data, isComplete: status === 'completed' };
}