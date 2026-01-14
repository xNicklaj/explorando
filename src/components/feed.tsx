import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

type FeedData = {
    Date: any,
    Username: string,
    UserAvatar: string,
    FeedIcon: string,
    FeedTitle: string,
    FeedContext: string,
    FeedContent: string,
    ActivityId: string,
}

const Feed = (data: FeedData) => {
    const formatDate = (date: any) => {
        let jsDate: Date;
        
        // Handle Firestore Timestamp
        if (date?.toDate && typeof date.toDate === 'function') {
            jsDate = date.toDate();
        } else if (typeof date === 'number') {
            jsDate = new Date(date);
        } else if (date instanceof Date) {
            jsDate = date;
        } else {
            return 'Invalid Date';
        }
        
        const day = jsDate.getDate();
        const month = jsDate.toLocaleDateString('it-IT', { month: 'long' });
        const year = jsDate.getFullYear();
        
        // Capitalize first letter, lowercase the rest (camel-case)
        const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
        
        return `${day} ${formattedMonth} ${false ? year.toString().substring(2) : ""}`;
    };

    return (
        <motion.div className="flex flex-col w-full p-3 text-black" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}>
            <div className="flex flex-row px-3">
                <div className="mr-1">
                    <Image 
                        src={data.UserAvatar}
                        alt="User Avatar"
                        width={20}
                        height={20}
                        className="rounded-full flex-shrink-0"
                    />
                </div>
                <span className="text-accent-500 mr-1">{data.Username}</span>
                <span className="text-gray-600">{data.FeedContext}</span>
                <span className="ml-auto">{formatDate(data.Date)}</span>
            </div>
            <Link className="flex flex-row p-2 bg-gray-300 rounded mt-2" href={`/activity/${data.ActivityId}`}>
                <Image 
                    src={data.FeedIcon}
                    alt="Feed Icon"
                    width={100}
                    height={100}
                    className="rounded-lg mr-2 flex-shrink-0 object-cover"
                />
                <div className="flex flex-col">
                    <h2 className="text-xl">{data.FeedTitle}</h2>
                    <p className="text-gray-700 ">{data.FeedContent}</p>
                </div>
            </Link>
        </motion.div>
    )
}

export default Feed;