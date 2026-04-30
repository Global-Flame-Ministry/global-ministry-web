import React, { useState } from 'react';
// 1. Import Lucide Icons
import { 
    X, Mail, Send, // Existing imports
    Lightbulb, Music, Heart, // Icons from the provided image
    BookOpen, Mic2, Clapperboard, Shirt, Shield, // Icons for the remaining items
    Users, // A general icon for the new programs in the image (Everything Tech)
} from 'lucide-react'; 


// 2. Define the IconMap to map titles to Lucide React components
// This allows you to dynamically select the right icon.
const IconMap: { [key: string]: React.ElementType } = {
    // Icons from the original image (assuming these are new programs)
    "EVERYTHING TECH": Lightbulb, // Assuming 'Tech' maps to Lightbulb or similar
    "EVERYTHING MUSIC": Music, // Directly maps to Music
    "GODLY DATING": Heart, // Directly maps to Heart
    
    // Icons for the existing list of items in HomeAbout
    "EVERYTHING EDUCATION": BookOpen,
    "EVERYTHING POETRY": Mic2, // Using a microphone/performance icon for poetry
    "EVERYTHING SPORTS": Shield, // Using a shield/protection/sports badge icon
    "EVERYTHING MOVIES": Clapperboard,
    "EVERYTHING FASHION": Shirt,
    "EVERYTHING POLITICS": Users, // Using a 'people/community' icon for politics
};

// 3. New component to dynamically render the Lucide icon
// The icon is passed as a prop from the IconMap
interface ProgramIconProps {
    title: string;
    className?: string; // For Tailwind classes
}

const ProgramIcon: React.FC<ProgramIconProps> = ({ title, className }) => {
    // Get the icon component from the map, default to Lightbulb (or another fallback)
    const IconComponent = IconMap[title] || Lightbulb; 
    
    // Use the component as a JSX element
    return <IconComponent className={className} />;
};


// ----------------------------------------------------
// Component Interfaces (Modified)
// ----------------------------------------------------
interface ProgramItem {
    title: string;
    // icon: string; // **REMOVED: Icon is now handled by the title map**
    desc: string; // Added desc to ProgramItem for clarity
}
interface ProgramModalProps {
    item: ProgramItem | null;
    onClose: () => void;
}

// Contact Admin Form Component (No change needed)
const ContactAdminForm = ({ programTitle }: { programTitle: string }) => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 1. You would integrate your actual API call here (e.g., Axios, Fetch)
        console.log("Admin contact form submitted for:", programTitle, formState);
        
        // 2. Mock submission success for UI
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormState({ name: '', email: '', message: '' });
        }, 3000); // Reset form state after 3 seconds
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Mail className="w-4 h-4 text-fuchsia-600 mr-2" />
                Contact Admin About {programTitle}
            </h4>
            
            {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center justify-center">
                    <Send className="w-3 h-3 mr-2" />
                    Message Sent! We'll get back to you shortly.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    />
                    <textarea
                        name="message"
                        placeholder="Your specific question or request..."
                        value={formState.message}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 resize-none"
                    />
                    <button
                        type="submit"
                        className="w-full py-2 flex items-center justify-center bg-fuchsia-600 text-white font-semibold rounded-xl hover:bg-fuchsia-700 transition duration-150 shadow-lg shadow-fuchsia-200/50"
                    >
                        Send Inquiry
                    </button>
                </form>
            )}
        </div>
    );
};


const ProgramModal: React.FC<ProgramModalProps> = ({ item, onClose }) => {
    if (!item) return null;

    // Detailed explanations (Added placeholders for the programs from the image)
    const modalDescription = {
        "EVERYTHING EDUCATION": {
            title: "Academic Excellence and Future Readiness",
            desc: "Our **Education** pillar offers comprehensive academic support designed to close achievement gaps and prepare youth for post-secondary success. We focus on developing critical thinking, study skills, and fostering a lifelong love for learning, ensuring every participant has the resources to excel academically.",
            focus: ["Tutoring on involving God in academics", "Admissions Counseling"],
            color: "blue-500",
        },
        "EVERYTHING POETRY": {
            title: "Spoken Word, Creative Writing, and Performance",
            desc: "The **Poetry** program is a powerful platform for self-expression and vocal empowerment. This program builds confidence, strengthens literary skills, and helps participants explore complex emotions and social issues through the art of poetry.",
            focus: ["Spoken Word Workshops", "Poetry", "Creative Writing Development", "Emotional Intelligence"],
            color: "pink-500", 
        },
        "EVERYTHING SPORTS": {
            title: "Character and Faith Building Through Athletics and Fitness",
            desc: "More than just games, our **Sports** pillar uses athletic activities—including basketball, soccer, and fitness training—as a vehicle for holistic development. Participants learn crucial life skills such as teamwork, discipline, leadership, and resilience.",
            focus: ["Organized Leagues","Teamwork & Leadership Skills", "Mentorship from Coaches"],
            color: "green-500",
        },
        "EVERYTHING MOVIES": {
            title: "The Art and Craft of Youth Revival & Discipleship via media",
            desc: "The **Movies** program is a hands-on exploration of cinematic arts. They learn industry-standard technical skills while collaborating to produce short films and documentaries, giving them practical experience and a creative outlet for visual storytelling.",
            focus: ["Scriptwriting & Storyboarding", "Video Editing Software", "Youth-Led Film Productions"],
            color: "red-500",
        },
        "EVERYTHING FASHION": {
            title: "Design, Style, and Entrepreneurship",
            desc: "The **Fashion** program introduces youth to the diverse world of design, style, and merchandising. We offer guidance on portfolio development and branding, culminating in annual youth fashion shows where members model and display their creations.",
            focus: ["Design Sketching & Theory", "Sustainable Fashion Projects", "Portfolio Development"],
            color: "amber-500",
        },
        "EVERYTHING POLITICS": {
            title: "Civic Literacy and Community Advocacy",
            desc: "Our **Politics** program is dedicated to fostering informed and active citizens. The program connects participants with local leaders and encourages them to initiate and advocate for community change, turning theoretical knowledge into real-world impact.",
            focus: ["Debate & Public Speaking", "Voter Education & Civic Literacy", "Community Advocacy Projects"],
            color: "indigo-500",
        },
        // Placeholder details for the programs in the original image (you can complete these)
        "EVERYTHING TECH": { 
            title: "Innovative Technology and Digital Skills", 
            desc: "The **Tech** program equips youth with cutting-edge digital and technological skills for the modern world. Focus is on coding, design, and innovative problem-solving.",
            focus: ["Coding Workshops", "UI/UX Design", "Digital Ethics"],
            color: "purple-500",
        },
        "EVERYTHING MUSIC": { 
            title: "Worship, Sound Engineering, and Creative Expression", 
            desc: "Our **Music** program fosters both performance and technical skills, covering everything from vocal training to sound engineering and production, all centered on worship.",
            focus: ["Vocal & Instrument Training", "Music Production", "Worship Team Skills"],
            color: "teal-500",
        },
        "GODLY DATING": { 
            title: "Relationship Building and Biblical Principles", 
            desc: "The **Godly Dating** program provides foundational principles for healthy, Christ-centered relationships, focusing on communication, self-respect, and spiritual alignment.",
            focus: ["Communication Skills", "Biblical Relationship Models", "Self-Worth and Identity"],
            color: "rose-500",
        },
    };

    const programDetails = modalDescription[item.title as keyof typeof modalDescription];
    // **IMPORTANT: The modal hero still uses an image source (item.icon) which no longer exists on the ProgramItem interface.**
    // **I will modify this to use the dynamic icon component as a placeholder background instead of an image.**
    const HeroIcon = IconMap[item.title as keyof typeof IconMap] || Lightbulb;


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity"
            onClick={onClose} 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white rounded-1xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Modal Header: Icon Hero Section - REPLACED IMG WITH ICON */}
                <div 
                    className={`h-40 relative bg-linear-to-br from-${programDetails.color} to-fuchsia-600`}
                >
                    {/* Placeholder Icon for Visual effect */}
                    <HeroIcon 
                        className="absolute inset-0 w-full h-full object-cover opacity-10 p-5 text-white/50" 
                        strokeWidth={1}
                    /> 
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                        <h3 id="modal-title" className="text-3xl font-black mb-1 uppercase tracking-wider drop-shadow-lg">
                            {item.title}
                        </h3>
                        <p className="text-lg font-medium drop-shadow-md">
                            {programDetails.title}
                        </p>
                    </div>
                    
                    {/* Close Button on the Hero */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-4 p-2 text-white/90 hover:text-white transition rounded-full bg-black/20 hover:bg-black/40 z-12"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body: Content */}
                <div className="p-6 sm:p-8">
                    
                    {/* Detailed Explanation */}
                    <div className="mb-6">
                        <p className="text-gray-700 text-base leading-relaxed" 
                            dangerouslySetInnerHTML={{ __html: programDetails.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                        />
                    </div>
                    
                    {/* Key Focus Areas (Creative Checklist) */}
                    <div className="mt-4 border-t border-gray-200 pt-5">
                        <h4 className="text-xl font-bold text-gray-800 mb-4 text-left border-l-4 border-fuchsia-500 pl-3">
                            Key Focus Areas
                        </h4>
                        <ul className="grid grid-cols-1 gap-y-3 text-base text-gray-700 text-left list-none pl-0">
                            {programDetails.focus.map((f: string, index: number) => (
                                <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-${programDetails.color} mr-3 shrink-0 mt-0.5`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 010-16 8 8 010 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Admin Form Integration */}
                    <ContactAdminForm programTitle={item.title} />

                </div>
                
                {/* Call to action button */}
                <div className="p-7 pt-0">
                    <button
                        onClick={onClose}
                        className={`w-full py-2 bg-fuchsia-600 text-white font-semibold rounded-xl hover:bg-fuchsia-700 transition duration-150 shadow-lg shadow-fuchsia-200/50`}
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// HomeAbout Component (Updated to use Icons)
// ----------------------------------------------------
const HomeAbout = () => {
    const [selectedItem, setSelectedItem] = useState<ProgramItem | null>(null);

    // 4. Removed 'icon' property and added the new programs from the image
    const items: ProgramItem[] = [
        // Programs from the user's image
        {
            title: "EVERYTHING TECH",
            desc: "We help youths locate and birth forth high intellect of technology around their daily life.",
        },
        {
            title: "EVERYTHING MUSIC",
            desc: "We locate and birth forth youths with high intellect of music and creative expression.",
        },
        {
            title: "GODLY DATING",
            desc: "We guide youths on principles for healthy, Christ-centered relationships.",
        },
        // Existing programs
        {
            title: "EVERYTHING EDUCATION",
            desc: "We provide educational support and resources to help youth excel academically.",
        },
        {
            title: "EVERYTHING POETRY",
            desc: "Express yourself through spoken word and explore the power of poetry.",
        },
        {
            title: "EVERYTHING SPORTS",
            desc: "Build character and teamwork through various sports activities.",
        },
        {
            title: "EVERYTHING MOVIES",
            desc: "Perform in youth-led movie productions and explore the art of filmmaking.",
        },
        {
            title: "EVERYTHING FASHION",
            desc: "Explore fashion design and develop an appreciation for style and creativity.",
        },
        {
            title: "EVERYTHING POLITICS",
            desc: "Comprehend key political concepts and learn how to make a difference.",
        },
    ];

    const openModal = (item: ProgramItem) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    return (
        <section id="about" className="py-14 px-5 text-center bg-gray-50 font-sans-serif">
            <h2 className="text-3xl font-bold text-fuchsia-700 mb-3 tracking-tight">
                WANT TO KNOW MORE ABOUT THE GLOBAL FLAME YOUTH COMMUNITY?
            </h2>
            <p className="max-w-4xl mx-auto text-gray-600 text-lg mb-12">
                The Global Flame Youth Community is a youth-focused organization dedicated to discipling nations into the measure
                of the stature of the fullness of christ through comprehensive programs in arts,
                education, sports, and community engagement. We empower young persons
                who can inspire talents waiting to be discovered and nurtured. 
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {items.map((item, i) => (
                    // Card component
                    <div
                        key={i}
                        onClick={() => openModal(item)}
                        className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer border border-fuchsia-100 group"
                        tabIndex={0} 
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal(item)} 
                    >
                        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-fuchsia-200 mb-4 overflow-hidden shadow-inner group-hover:shadow-fuchsia-400/50 group-hover:shadow-lg transition">
                            {/* Card ICON Display - REPLACED IMG TAG */}
                            <ProgramIcon title={item.title} className="w-8 h-8 text-fuchsia-600 group-hover:text-fuchsia-800 transition" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                            {item.title}
                        </h3>
                        <p className="text-gray-500 text-base">{item.desc}</p>
                        <div className="mt-4 text-fuchsia-600 font-semibold text-sm group-hover:text-fuchsia-700 group-hover:translate-x-1 transition duration-200 flex items-center justify-center">
                            Click for Detailed Explanation <span className="ml-1">→</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Render the Modal component */}
            <ProgramModal item={selectedItem} onClose={closeModal} />
        </section>
    );
};

export default HomeAbout;