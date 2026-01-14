'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Quiz from './quiz-component';
import { motion } from 'motion/react';
import { getLevelInfo } from '@/lib/level';
import { db, rtdb } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

type QuizData = {
    Question: string;
    Ans0: string;
    Ans1: string;
    Ans2: string;
    Correct: number;
}

export function QuizWrapper({ quizData, totalXP, currentXp = 0 }: { quizData: QuizData[], totalXP: number, currentXp?: number }) {
    const router = useRouter();
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [passedQuizzes, setPassedQuizzes] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [xpSaved, setXpSaved] = useState(false);
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
                    const finalXp = currentXp + earnedXP;
                    
                    const userIdSnapshot = await get(ref(rtdb, 'userid'));
                    if (userIdSnapshot.exists()) {
                        const userId = userIdSnapshot.val();
                        await updateDoc(doc(db, 'User', userId), {
                            XP: finalXp
                        });
                        setXpSaved(true);
                        console.log('XP saved successfully:', finalXp);
                    }
                } catch (error) {
                    console.error('Failed to save XP:', error);
                }
            };
            
            saveXP();
        }
    }, [isComplete, xpSaved, totalXP, passedQuizzes, totalQuizzes, currentXp]);

    // Navigate to home after 7 seconds
    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 7000);
            
            return () => clearTimeout(timer);
        }
    }, [isComplete, router]);

    if (isComplete) {
        const earnedXP = Math.max(3, Math.round(totalXP * (passedQuizzes / totalQuizzes)));
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
                <motion.p
                    className="text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                >
                    +{earnedXP} XP
                </motion.p>
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
