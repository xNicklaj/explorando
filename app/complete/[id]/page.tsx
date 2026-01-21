import { db, rtdb } from '@/lib/firebase';
import { QuizWrapper } from '@/components/quiz-wrapper';
import { doc, getDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

export default async function CompletePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const activityDoc = await getDoc(doc(db, 'Activity', id));
    const activityData = activityDoc.exists() ? activityDoc.data() : null;
    
    if (!activityData) {
        return <div>Activity not found</div>;
    }

    const quizData = activityData["Quiz"] || [];
    const totalXP = activityData["XP"] || 0;
    
    // Fetch current user's XP and Points from Firebase
    let currentXp = 0;
    let currentPoints = 0;
    try {
        const userIdSnapshot = await get(ref(rtdb, 'userid'));
        if (userIdSnapshot.exists()) {
            const userId = userIdSnapshot.val();
            const userDoc = await getDoc(doc(db, 'User', userId));
            if (userDoc.exists()) {
                currentXp = userDoc.data()["XP"] || 0;
                currentPoints = userDoc.data()["Points"] || 0;
            }
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
    
    return <QuizWrapper quizData={quizData} totalXP={totalXP} currentXp={currentXp} currentPoints={currentPoints} activityId={id} />;
}