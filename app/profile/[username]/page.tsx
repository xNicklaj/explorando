'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { levelFromXp } from '@/lib/level';

interface UserData {
  username: string;
  id: string;
  [key: string]: any;
}

interface BadgeData {
  id: string;
  Name: string;
  Image: string;
}

export default function Profile({ params }: { params: Promise<{ username: string }> }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchUserData = async () => {
          try {
              const { username } = await params;

              // Query the User collection by username field
              const q = query(collection(db, 'User'), where('Username', '==', username));
              const snapshot = await getDocs(q);

              if (snapshot.empty) {
                  setError(`User "${username}" not found`);
                  return;
              }

              // Get the first (and should be only) document
              const userDoc = snapshot.docs[0];
              const userData = {
                  id: userDoc.id,
                  ...userDoc.data()
              } as UserData;
              setUserData(userData);

              // Fetch badge data if user has badges (DocumentReferences)
              if (userData["Badges"] && userData["Badges"].length > 0) {
                  const badgePromises = userData["Badges"].map((badgeRef: any) =>
                      getDoc(badgeRef)
                  );
                  const badgeDocs = await Promise.all(badgePromises);
                  const badgesData = badgeDocs
                      .filter(doc => doc.exists())
                      .map(doc => ({
                          id: doc.id,
                          ...doc.data()
                      } as BadgeData));
                  setBadges(badgesData);
              }

          } catch (err: any) {
              console.error('ProfilePage: Failed to fetch user data:', err);
              setError(err.message || 'Failed to fetch user data');
          } finally {
              setLoading(false);
          }
      };

      fetchUserData();
  }, [params]);

  return (
    <div className="flex h-full bg-white font-sans flex-col">
      {loading && <div className="flex items-center justify-center w-full h-screen">Loading...</div>}
      
      {error && (
        <div className="flex items-center justify-center w-full h-screen text-red-500">
          <p>{error}</p>
        </div>
      )}
      
      {userData && (
        <div className="flex flex-col w-full text-black">
          <div className="flex flex-row p-4">
            {userData["Avatar"] && userData["Avatar"][1] && (
              <Image 
                src={userData["Avatar"][1]} 
                alt="Avatar" 
                width={100} 
                height={100} 
                className="rounded-full m-4" 
              />
            )}
            <div className="flex flex-col flex-1">
              <div className="flex flex-row p-5 pl-1 pb-1">
                <div className="flex flex-col text-2xl">
                  <div>{userData["DisplayName"]}</div>
                  <div className="text-gray-600">{userData["Username"]}</div>
                </div>
                <div className="text-4xl pl-2">{levelFromXp(userData["XP"])}</div>
              </div>
              {badges && badges.length > 0 && (
                <div className="flex flex-row gap-4 flex-wrap">
                  {badges.map((badge: BadgeData) => (
                    <div key={badge.id} className="flex flex-col items-center">
                      <Image
                        src={badge.Image}
                        alt={badge.Name || "Badge"}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-black w-full h-1"></div>
    </div>
  );
}
