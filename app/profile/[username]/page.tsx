'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { levelFromXp } from '@/lib/level';
import Feed from '@/components/feed';
import { FeedSkeleton } from '@/components/feed-skeleton';

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

interface FeedItemData {
  id: string;
  Activity: any;
  Comment: string;
  Datetime: any;
  User: any;
}

interface FeedItemData {
  id: string;
  Activity: any;
  Comment: string;
  Datetime: any;
  User: any;
}

export default function Profile({ params }: { params: Promise<{ username: string }> }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);

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

              // Fetch feed items for this user
              const feedQuery = query(
                  collection(db, 'Feed'),
                  where('User', '==', userDoc.ref),
                  orderBy('Datetime', 'desc')
              );
              const feedSnapshot = await getDocs(feedQuery);
              
              // Fetch the full data for each feed item (including User and Activity references)
              const feedDataPromises = feedSnapshot.docs.map(async (feedDoc) => {
                  const feedData = feedDoc.data();
                  
                  // Fetch the User document
                  const userDocData = feedData.User ? await getDoc(feedData.User) : null;
                  const userInfo = userDocData?.exists() ? userDocData.data() : null;
                  
                  // Fetch the Activity document
                  const activityDocData = feedData.Activity ? await getDoc(feedData.Activity) : null;
                  const activityInfo = activityDocData?.exists() ? {
                      id: activityDocData.id,
                      ...(activityDocData.data() || {})
                  } : null;
                  
                  return {
                      id: feedDoc.id,
                      ...feedData,
                      User: userInfo,
                      Activity: activityInfo
                  } as FeedItemData;
              });
              
              const feedData = await Promise.all(feedDataPromises);
              console.log(feedData);
              setFeedItems(feedData);

          } catch (err: any) {
              console.error('ProfilePage: Failed to fetch user data:', err);
              setError(err.message || 'Failed to fetch user data');
          } finally {
              setLoading(false);
          }
      };

      fetchUserData();
  }, [params]);

  console.log(badges);

  return (
    <div className="flex h-full bg-white font-sans flex-col">     
      <div className="flex flex-col w-full text-black">
        <div className="flex flex-row p-4 pt-0">
          {/* Avatar */}
          {loading ? (
            <div className="w-[6px] h-[60px] m-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          ) : (
            userData?.["Avatar"]?.[1] && (
              <div className="flex justify-center items-start m-4 ml-2">
                <Image 
                  src={userData["Avatar"][1]} 
                  alt="Avatar" 
                  width={60} 
                  height={60} 
                  className="rounded-full object-cover flex-shrink-0" 
                />
              </div>
            )
          )}
          
          <div className="flex flex-col flex-1">
            <div className="flex flex-row p-5 pl-1 pb-1">
              <div className="flex flex-col text-2xl">
                {/* Display Name and Username */}
                {loading ? (
                  <>
                    <div className="w-40 h-7 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
                  </>
                ) : (
                  <>
                    <div>{userData?.["DisplayName"]}</div>
                    <div className="text-gray-600 text-lg">{userData?.["Username"]}</div>
                  </>
                )}
              </div>
              
              {/* Level */}
              {loading ? (
                <div className="w-12 h-10 bg-gray-200 animate-pulse rounded ml-2" />
              ) : (
                <div className="text-4xl pl-2">{userData && levelFromXp(userData["XP"])}</div>
              )}
            </div>
            
            {/* Badges */}
            {loading ? (
              <div className="flex flex-row gap-4 flex-wrap">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              badges && badges.length > 0 && (
                <div className="flex flex-row gap-4 flex-wrap">
                  {badges.map((badge: BadgeData) => (
                    <div key={badge.id} className="flex flex-col items-center">
                      <Image
                        src={badge.Image}
                        alt={badge.Name || "Badge"}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-200 w-full h-1"></div>
      
      <div className="flex flex-col">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <FeedSkeleton key={i} />
            ))}
          </>
        ) : (
          feedItems.length > 0 ? (
            feedItems.map((item: FeedItemData) => {
              return <Feed 
                key={item.id}
                Date={item.Datetime}
                Username={item.User["Username"]}
                UserAvatar={item.User["Avatar"] ? item.User["Avatar"][1] : '/default-avatar.png'}
                FeedIcon={item.Activity["Imgsrc"]}
                FeedTitle={item.Activity["Title"]}
                FeedContext="ha completato"
                FeedContent={item.Comment}
                ActivityId={item.Activity.id}
              />
            })
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-500">
              No feed items yet
            </div>
          )
        )}
      </div>
    </div>
  );
}
