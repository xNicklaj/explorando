'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OrganizedSessionData } from '@/models/organized-session';
import { ActivityData, getActivityByRef } from '@/models/activity';
import { useEffect, useState } from 'react';

import { FiMessageSquare } from "react-icons/fi";
import { FaUserFriends } from "react-icons/fa";
import { useHaptic } from "react-haptic";
import OrganizedSessionCardSkeleton from '@/components/organized-session-card-skeleton';

interface OrganizedSessionCardProps {
  session: OrganizedSessionData;
}

export default function OrganizedSessionCard({ session }: OrganizedSessionCardProps) {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const { vibrate } = useHaptic();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const activityData = await getActivityByRef(session.Activity);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [session.Activity]);

  if (loading) {
    return <OrganizedSessionCardSkeleton />;
  }

  if (!activity) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md p-4 text-center text-gray-600">
        Unable to load event
      </div>
    );
  }

  const subscribersCount = session.Subscribers?.length || 0;
  const messagesCount = session.Chat?.length || 0;
  const eventDate = session.Datetime?.toDate() || new Date();
  const formattedDate = eventDate.toLocaleDateString('it-IT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/event/${session.id}`} onClick={() => vibrate()} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative w-full h-48">
          <Image
            src={activity.Imgsrc}
            alt={activity.Title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{activity.Title}</h3>
          <p className="text-sm text-gray-600 mb-3">{formattedDate}</p>
          
          <div className="flex justify-between text-sm text-black">
            <div className="flex items-center gap-2">
              <span className="text-gray-600"><FaUserFriends /></span>
              <span className="font-medium">{subscribersCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600"><FiMessageSquare /></span>
              <span className="font-medium">{messagesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
