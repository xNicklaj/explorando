'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { rtdb, db } from '@/lib/firebase';

export default function MePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        // Read the current user ID from RTDB
        const currentIdRef = ref(rtdb, 'userid');
        const snapshot = await get(currentIdRef);

        if (!snapshot.exists()) {
          setError('No current user ID found');
          setLoading(false);
          return;
        }

        const userId = snapshot.val();

        // Get the username from Firestore User collection
        const userDoc = await getDoc(doc(db, 'User', userId));

        if (!userDoc.exists()) {
          setError(`User with ID "${userId}" not found`);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const username = userData["Username"];

        if (!username) {
          setError('User has no username');
          setLoading(false);
          return;
        }

        // Redirect to the user's profile
        router.push(`/profile/${username}`);
      } catch (err: any) {
        console.error('MePage: Failed to fetch user:', err);
        setError(err.message || 'Failed to fetch user data');
        setLoading(false);
      }
    };

    fetchAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-zinc-50">
      {loading && <p className="text-gray-600"></p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
