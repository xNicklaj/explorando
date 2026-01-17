'use client';

import { FeedData, getFeedByUserRef } from '@/models/feed';
import { getCurrentUser, getUserData, UserData } from '@/models/user';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActivityById, getActivityByRef } from '@/models/activity';
import Feed from '@/components/feed';
import { FeedSkeleton } from '@/components/feed-skeleton';
import { useEffect, useState } from 'react';

interface EnrichedFeedData {
  feedItem: FeedData;
  user: UserData;
  activity: any;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [enrichedFeed, setEnrichedFeed] = useState<EnrichedFeedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUserData(currentUser);

        if (currentUser) {
          try {
            // Always include current user's feed
            const selfFeedPromise = getFeedByUserRef(doc(db, 'User', currentUser.id));

            // Fetch friend feeds (if any) in parallel
            const friendFeedPromises = (currentUser.Friends || []).map((friendRef) =>
              getFeedByUserRef(friendRef)
            );

            const allFeedArrays = await Promise.all([selfFeedPromise, ...friendFeedPromises]);

            // Flatten all feed arrays into one
            const allFeed = allFeedArrays.flat();

            // Sort by datetime descending
            allFeed.sort((a, b) => {
              const timeA = a.Datetime.toMillis?.() ?? 0;
              const timeB = b.Datetime.toMillis?.() ?? 0;
              return timeB - timeA;
            });

            // Fetch user and activity data for each feed item
            const enrichedData = await Promise.all(
              allFeed.map(async (feedItem) => {
                const feedUser = await getUserData(feedItem.User.id);
                const feedActivity = await getActivityByRef(feedItem.Activity);
                return {
                  feedItem,
                  user: feedUser,
                  activity: feedActivity,
                };
              })
            );

            setEnrichedFeed(enrichedData);
          } catch (err: any) {
            console.error('Failed to fetch feeds:', err);
            setError(err.message || 'Failed to fetch feeds');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full flex-col h-full text-black bg-zinc-50">
        {[...Array(5)].map((_, i) => (
          <FeedSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-full text-black">
      {error && <p className="text-red-500">{error}</p>}
      {enrichedFeed.length > 0 ? (
        enrichedFeed.map((item) => (
          <Feed
            key={item.feedItem.id}
            Date={item.feedItem.Datetime}
            Username={item.user.Username}
            UserAvatar={item.user.Avatar ? item.user.Avatar[1] : '/default-avatar.png'}
            FeedIcon={item.activity.Imgsrc}
            FeedTitle={item.activity.Title}
            FeedContext="ha completato"
            FeedContent={item.feedItem.Comment}
            ActivityId={item.activity.id}
          />
        ))
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          No feed items yet
        </div>
      )}
    </div>
  );
}
