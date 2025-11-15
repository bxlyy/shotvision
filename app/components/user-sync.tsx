// app/components/user-sync.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const [userCreated, setUserCreated] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !userCreated) {
      fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then(() => setUserCreated(true))
        .catch((err) => console.error(err));
    }
  }, [isLoaded, user, userCreated]);

  return null;
}
