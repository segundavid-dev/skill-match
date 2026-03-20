export interface Opportunity {
    id: number;
    org: string;
    role: string;
    skills: string[];
    location: string;
    impact: string;
    match: number;
    color: string;
    emoji: string;
    desc: string;
}

export interface MatchItem {
    id: number;
    name: string;
    role: string;
    avatar: string;
    color: string;
    time: string;
    lastMsg: string;
}

export interface Message {
    from: string;
    text: string;
    time: string;
}

export const SKILLS: string[] = [
    "Teaching", "Graphic Design", "Coding", "Fundraising", "Event Planning",
    "Translation", "Photography", "Writing", "Legal Aid", "Medical",
    "Mentoring", "Social Media", "Data Analysis", "Music", "Sports Coaching",
];

export const CAUSES: string[] = [
    "Education", "Environment", "Health", "Poverty", "Animal Welfare",
    "Arts & Culture", "Community", "Disaster Relief", "Human Rights", "Youth",
];

export const OPPORTUNITIES: Opportunity[] = [
    {
        id: 1,
        org: "Green Earth Foundation",
        role: "Web Developer",
        skills: ["Coding", "Data Analysis"],
        location: "Remote",
        impact: "8,400 people",
        match: 94,
        color: "#10B981",
        emoji: "🌍",
        desc: "Build a dashboard tracking deforestation across 3 continents.",
    },
    {
        id: 2,
        org: "Bright Minds Academy",
        role: "STEM Tutor",
        skills: ["Teaching", "Mentoring"],
        location: "Lagos, NG",
        impact: "200 students",
        match: 87,
        color: "#F59E0B",
        emoji: "📚",
        desc: "Weekly after-school coding workshops for underserved youth.",
    },
    {
        id: 3,
        org: "Health Bridge NGO",
        role: "Graphic Designer",
        skills: ["Graphic Design", "Social Media"],
        location: "Remote",
        impact: "50,000 reach",
        match: 81,
        color: "#14B8A6",
        emoji: "💊",
        desc: "Design health awareness campaign materials for rural clinics.",
    },
    {
        id: 4,
        org: "Community Harvest",
        role: "Event Coordinator",
        skills: ["Event Planning", "Fundraising"],
        location: "Abuja, NG",
        impact: "1,200 families",
        match: 76,
        color: "#8B5CF6",
        emoji: "🌾",
        desc: "Organize quarterly food distribution and volunteer meetups.",
    },
];

export const MATCHES: MatchItem[] = [
    {
        id: 1,
        name: "Green Earth Foundation",
        role: "Web Developer",
        avatar: "GE",
        color: "#10B981",
        time: "2h ago",
        lastMsg: "Excited to have you on board!",
    },
    {
        id: 2,
        name: "Bright Minds Academy",
        role: "STEM Tutor",
        avatar: "BM",
        color: "#F59E0B",
        time: "1d ago",
        lastMsg: "Can we schedule a quick call?",
    },
    {
        id: 3,
        name: "Health Bridge NGO",
        role: "Designer",
        avatar: "HB",
        color: "#14B8A6",
        time: "3d ago",
        lastMsg: "Please review the brief we sent",
    },
];

export const MESSAGES: Record<number, Message[]> = {
    1: [
        { from: "them", text: "Hi! We're so thrilled you matched with us.", time: "10:02" },
        { from: "me", text: "Thanks! I'm really excited about the deforestation project.", time: "10:05" },
        { from: "them", text: "Excited to have you on board! Can you start next week?", time: "10:06" },
    ],
    2: [
        { from: "them", text: "Hello! Your profile looks perfect for our STEM program.", time: "Yesterday" },
        { from: "me", text: "I'd love to help! What days work best?", time: "Yesterday" },
        { from: "them", text: "Can we schedule a quick call?", time: "Yesterday" },
    ],
    3: [
        { from: "them", text: "We loved your portfolio.", time: "3 days ago" },
        { from: "them", text: "Please review the brief we sent", time: "3 days ago" },
    ],
};
