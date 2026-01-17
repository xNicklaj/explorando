'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOrganizedSessionById } from '@/models/organized-session';
import { getActivityByRef, ActivityData } from '@/models/activity';
import { getCurrentUser, getUserData, UserData } from '@/models/user';
import { FaUserFriends, FaCalendarAlt, FaCheck, FaBell, FaChevronRight } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { useHaptic } from 'react-haptic';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ChatMessageData {
  User: UserData;
  Message: string;
  Datetime: Date;
}

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { vibrate } = useHaptic();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [datetime, setDatetime] = useState<Date | null>(null);
  const [subscribers, setSubscribers] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch current user
        const user = await getCurrentUser();
        setCurrentUser(user);

        // Fetch organized session
        const session = await getOrganizedSessionById(resolvedParams.id);
        
        // Fetch activity data
        const activityData = await getActivityByRef(session.Activity);
        setActivity(activityData);
        
        // Set datetime
        setDatetime(session.Datetime.toDate());
        
        // Set subscriber count
        setSubscribers(session.Subscribers?.length || 0);
        
        // Check if current user is subscribed
        const userDocRef = doc(db, 'User', user.id);
        const isUserSubscribed = session.Subscribers?.some(
          (sub) => sub.id === user.id
        ) || false;
        setIsSubscribed(isUserSubscribed);
        
        // Fetch chat messages with user data
        if (session.Chat && session.Chat.length > 0) {
          const messagesWithUsers = await Promise.all(
            session.Chat.map(async (msg) => {
              const userData = await getUserData(msg.User);
              return {
                User: userData,
                Message: msg.Message,
                Datetime: msg.Datetime.toDate(),
              };
            })
          );
          setChatMessages(messagesWithUsers);
        }
      } catch (err: any) {
        console.error('Failed to fetch event data:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [resolvedParams.id]);

  const handleToggleSubscription = async () => {
    if (!currentUser) return;
    
    try {
      const sessionRef = doc(db, 'OrganizedSession', resolvedParams.id);
      const userRef = doc(db, 'User', currentUser.id);
      
      if (isSubscribed) {
        // Unsubscribe
        await updateDoc(sessionRef, {
          Subscribers: arrayRemove(userRef),
        });
        setIsSubscribed(false);
        setSubscribers((prev) => prev - 1);
      } else {
        // Subscribe
        await updateDoc(sessionRef, {
          Subscribers: arrayUnion(userRef),
        });
        setIsSubscribed(true);
        setSubscribers((prev) => prev + 1);
        toast('Ti notificheremo poco prima dell\'evento!');
      }
    } catch (err: any) {
      console.error('Failed to toggle subscription:', err);
      alert('Failed to update subscription');
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !messageInput.trim() || sending) return;
    
    setSending(true);
    try {
      const sessionRef = doc(db, 'OrganizedSession', resolvedParams.id);
      const userRef = doc(db, 'User', currentUser.id);
      
      const newMessage = {
        User: userRef,
        Message: messageInput.trim(),
        Datetime: Timestamp.now(),
      };
      
      await updateDoc(sessionRef, {
        Chat: arrayUnion(newMessage),
      });
      
      // Add message to local state
      setChatMessages((prev) => [
        ...prev,
        {
          User: currentUser,
          Message: messageInput.trim(),
          Datetime: new Date(),
        },
      ]);
      
      setMessageInput('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded-lg" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-red-600 font-semibold">{error || 'Event not found'}</p>
      </div>
    );
  }

  const formattedDate = datetime?.toLocaleDateString('it-IT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Activity Card */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col gap-2">
        <Link href={`/activity/${activity.id}`} className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
          <div className="flex gap-4 items-center">
            <div className="relative w-20 h-20 min-h-[80px] min-w-[80px] flex-shrink-0">
              <Image
                src={activity.Imgsrc}
                alt={activity.Title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{activity.Title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaCalendarAlt />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUserFriends />
                  <span>{subscribers}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
                
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            vibrate();
            handleToggleSubscription();
          }}
          className={`w-full font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isSubscribed
              ? 'bg-green-600 text-white'
              : 'bg-orange-600 text-white'
          }`}
        >
          {isSubscribed ? (
            <>
              <FaCheck size={20} />
              <span>Interessato</span>
            </>
          ) : (
            <>
              <FaBell size={20} />
              <span>Sono interessato</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nessun messaggio ancora. Inizia la conversazione!
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} className="flex gap-3">
              <Link href={`/profile/${msg.User.Username}`} className="flex-shrink-0">
                <div className="relative w-10 h-10 min-h-[40px] min-w-[40px]">
                  {msg.User.Avatar?.[1] ? (
                    <Image
                      src={msg.User.Avatar[1]}
                      alt={msg.User.Username}
                      fill
                      className="object-cover rounded-full cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                  )}
                </div>
              </Link>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${msg.User.Username}`}>
                    <span className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-600">
                      {msg.User.Username}
                    </span>
                  </Link>
                  <span className="text-xs text-gray-500">
                    {msg.Datetime.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-800 mt-1">{msg.Message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input and Subscribe Button */}
      <div className="border-t border-gray-200 p-4 bg-white space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
            disabled={sending}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              vibrate();
              handleSendMessage();
            }}
            disabled={!messageInput.trim() || sending}
            className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <IoSend size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
