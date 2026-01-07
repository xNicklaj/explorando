/*
console.log('API key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('Project ID:', getApp().options.projectId);


const addTestEntry = async () => {
try {
await addDoc(collection(db, 'test-entries'), {
    timestamp: serverTimestamp(),
    message: 'Test entry from page load',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
});
console.log('✓ Test entry added to Firestore');
} catch (error) {
console.error('✗ Error adding test entry:', error);
}

addTestEntry();
*/