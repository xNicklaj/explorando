"use client";

import { Button } from "./custom-button";
import { useState } from "react";
import { motion } from "motion/react";

type QuizData = {
    "Question": string,
    "Ans0": string,
    "Ans1": string,
    "Ans2": string,
    "Correct": number
}

type QuizProps = QuizData & {
    onSubmit: (selectedAnswer: number) => void;
}

export const Quiz = ({ Question, Ans0, Ans1, Ans2, Correct, onSubmit }: QuizProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const handleBackgroundColor = (answerIndex: number) : string => {
        if (selectedAnswer === null) return "";
        
        if(answerIndex !== selectedAnswer) return "bg-gray-300";
        
        return answerIndex === Correct ? "bg-green-500" : "bg-red-500";
    }

    const handleAnswerClick = (answer: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answer);
        onSubmit(answer);
    }

    return (
        <motion.div 
            className="flex flex-col w-full max-w-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-2xl font-bold mb-4 text-center">{Question}</h1>
            <div className="flex flex-col gap-2 w-full">
                <Button 
                    className={handleBackgroundColor(0)} 
                    overrideBg={selectedAnswer !== null} 
                    enabled={selectedAnswer === null} 
                    onClick={() => handleAnswerClick(0)}>{Ans0}
                </Button>
                <Button 
                    className={handleBackgroundColor(1)} 
                    overrideBg={selectedAnswer !== null} 
                    enabled={selectedAnswer === null} 
                    onClick={() => handleAnswerClick(1)}>{Ans1}
                </Button>
                <Button 
                    className={handleBackgroundColor(2)} 
                    overrideBg={selectedAnswer !== null} 
                    enabled={selectedAnswer === null} 
                    onClick={() => handleAnswerClick(2)}>{Ans2}
                </Button>
            </div>
        </motion.div>
    )
}

export default Quiz;