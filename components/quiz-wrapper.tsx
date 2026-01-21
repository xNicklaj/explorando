'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Quiz from './quiz-component';
import { motion } from 'motion/react';
import { getLevelInfo } from '@/lib/level';
import { db, rtdb } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, addDoc, collection } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { useHaptic } from 'react-haptic';

type QuizData = {
    Question: string;
    Ans0: string;
    Ans1: string;
    Ans2: string;
    Correct: number;
}

export function QuizWrapper({ quizData, totalXP, currentXp = 0, currentPoints = 0, activityId }: { quizData: QuizData[], totalXP: number, currentXp?: number, currentPoints?: number, activityId: string }) {
    const router = useRouter();
    const { vibrate } = useHaptic();
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [passedQuizzes, setPassedQuizzes] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [xpSaved, setXpSaved] = useState(false);
    const [feedContent, setFeedContent] = useState('');
    const [isSubmittingFeed, setIsSubmittingFeed] = useState(false);
    const [showFeedForm, setShowFeedForm] = useState(false);
    const totalQuizzes = quizData.length || 1;

    const handleSubmit = (selectedAnswer: number) => {
        const isCorrect = selectedAnswer === quizData[currentQuiz].Correct;
        
        if (isCorrect) {
            setPassedQuizzes(passedQuizzes + 1);
        }

        // Wait 3 seconds before moving to next quiz
        setTimeout(() => {
            if (currentQuiz < quizData.length - 1) {
                setCurrentQuiz(currentQuiz + 1);
            } else {
                setIsComplete(true);
            }
        }, 3000);
    };

    // Save XP to database when quiz completes
    useEffect(() => {
        if (isComplete && !xpSaved) {
            const saveXP = async () => {
                try {
                    const earnedXP = Math.max(3, Math.round(totalXP * (passedQuizzes / totalQuizzes)));
                    const earnedPoints = earnedXP * 2; // Double the XP as points
                    const finalXp = currentXp + earnedXP;
                    const finalPoints = currentPoints + earnedPoints;
                    
                    const userIdSnapshot = await get(ref(rtdb, 'userid'));
                    if (userIdSnapshot.exists()) {
                        const userId = userIdSnapshot.val();
                        await updateDoc(doc(db, 'User', userId), {
                            XP: finalXp,
                            Points: finalPoints
                        });
                        setXpSaved(true);
                        console.log('XP and Points saved successfully:', { XP: finalXp, Points: finalPoints });
                    }
                } catch (error) {
                    console.error('Failed to save XP and Points:', error);
                }
            };
            
            saveXP();
        }
    }, [isComplete, xpSaved, totalXP, passedQuizzes, totalQuizzes, currentXp, currentPoints]);

    // Handle feed submission
    const handleFeedSubmit = async (e: FormEvent) => {
        e.preventDefault();
        vibrate();
        setIsSubmittingFeed(true);
        
        try {
            const userIdSnapshot = await get(ref(rtdb, 'userid'));
            if (!userIdSnapshot.exists()) {
                throw new Error('User ID not found');
            }
            
            const userId = userIdSnapshot.val();
            
            await addDoc(collection(db, 'Feed'), {
                Activity: doc(db, 'Activity', activityId),
                User: doc(db, 'User', userId),
                Datetime: Timestamp.now(),
                Comment: feedContent
            });
            
            console.log('Feed created successfully');
            router.push('/');
        } catch (error) {
            console.error('Failed to create feed:', error);
            setIsSubmittingFeed(false);
        }
    };

    if (isComplete) {
        const earnedXP = Math.max(3, Math.round(totalXP * (passedQuizzes / totalQuizzes)));
        const earnedPoints = earnedXP * 2;
        const finalXp = currentXp + earnedXP;
        const previousLevel = getLevelInfo(currentXp).level;
        const info = getLevelInfo(finalXp);
        const progressPct = Math.round(info.progress * 100);
        const leveledUp = info.level > previousLevel;
        
        return (
            <div className="flex flex-col items-center justify-start pt-[25vh] p-6 gap-4 text-black h-screen overflow-hidden">
                <motion.h2
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                >
                    Attività completata!
                </motion.h2>
                <div className="flex flex-col items-center gap-2">
                    <motion.p
                        className="text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    >
                        +{earnedXP} XP
                    </motion.p>
                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    >
                        <p className="text-xl">+{earnedPoints}</p><img src="/token.png" alt="Points" className="w-6 h-6" />
                    </motion.div>
                </div>
                <div className="w-full max-w-md flex flex-col items-center gap-3 mt-2">
                    <div className="w-full flex items-center gap-3 justify-center">
                        <span className="text-xl font-medium">{info.level}</span>
                        <div className="flex-1 h-6 rounded bg-gray-300 overflow-hidden max-w-1/2">
                            <motion.div
                                className="h-full bg-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: progressPct + '%' }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                            />
                        </div>
                        <span className="text-xl font-medium">{info.level + 1}</span>
                    </div>
                    {leveledUp && (
                        <motion.p
                            className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse"
                            style={{
                                backgroundSize: '200% 100%',
                                animation: 'gradientShift 3s ease infinite, pulse 1.5s ease-in-out infinite'
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: 1, 
                                scale: [1, 1.1, 1],
                                transition: { 
                                    delay: 1.8, 
                                    scale: {
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    }
                                }
                            }}
                        >
                            Nuovo livello raggiunto!
                        </motion.p>
                    )}
                </div>
                
                <motion.form
                    onSubmit={handleFeedSubmit}
                    className="w-full max-w-md mt-6 flex flex-col gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
                >
                    <label className="text-sm font-medium">Condividi la tua esperienza</label>
                    <div className="relative w-full">
                        <textarea
                            value={feedContent}
                            onChange={(e) => setFeedContent(e.target.value)}
                            placeholder="Scrivi qualcosa sulla tua esperienza..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
                            maxLength={90}
                            required
                        />
                        <div className="pointer-events-none absolute right-2 bottom-2 text-xs text-gray-500">
                            {feedContent.length}/90
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmittingFeed}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                        onClick={() => vibrate()}
                    >
                        {isSubmittingFeed ? 'Salvataggio...' : 'Condividi'}
                    </button>
                </motion.form>
            </div>
        );
    }

    return (
        <div className="flex flex-col text-black p-6 gap-2 h-screen justify-start pt-[25vh] items-center">
            <Quiz key={currentQuiz} {...quizData[currentQuiz]} onSubmit={handleSubmit} />
            <div className="border p-2 rounded self-end">
                {currentQuiz + 1}/{quizData.length}
            </div>
        </div>
    );
}
