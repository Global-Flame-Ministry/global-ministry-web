// src/BlogPage.tsx
import { useState, useMemo } from 'react';
import type { FC } from 'react';
import {
    Calendar, 
    User,
    Tag,
    ArrowRight, 
    Search,
    X, 
} from 'lucide-react';

// Import images for blog posts
import imagePray     from '../../assets/images/pray.jpg';
import imageDad      from '../../assets/images/dad.jpg';
import imageYoung    from '../../assets/images/young.jpg';
import imageFlan     from '../../assets/images/flan.jpg';
import imagePresence from '../../assets/images/presence.jpg';
import imageDance    from '../../assets/images/dance.jpg';
import imageZoom     from '../../assets/images/zoom.jpg';


// 2. **FIXED MAPPING:** Map the file name keys to the actual imported image variables.
const assetImages = {
    'spiritual-growth.jpg': imagePray, 
    'career-guidance.jpg': imageDad,
    'outreach-impact.jpg': imageYoung,
    'divine-purpose.jpg': imageFlan,
    'financial-stewardship.jpg': imagePresence,
    'testimony-feature.jpg': imageDance,
    'leadership-guide.jpg': imageZoom,
};
// --------------------------

// --- PLACEHOLDER COMPONENTS ---
const Footer: FC = () => (
    <footer className="bg-gray-900 text-gray-400 text-center py-8 px-6 text-sm">
        <div className="max-w-7xl mx-auto">
            <p>© {new Date().getFullYear()} GFM Youth Community. All rights reserved.</p>
        </div>
    </footer>
);


// --- STATIC DATA FOR BLOG POSTS (UNCHANGED) ---

const BLOG_POSTS = [
    {
        id: 1,
        title: "5 Keys to Spiritual Growth in University",
        excerpt: "Balancing faith and academia can be tough. We break down five practical steps to keep your spirit strong during your university years.",
        author: "Patience Okoro",
        date: "Oct 15, 2025",
        category: "Spiritual Life",
        tags: ["#FaithJourney", "#YouthDevo", "#University"],
        imageUrl: 'spiritual-growth.jpg', 
    },
    {
        id: 2,
        title: "Navigating Career Choices: A Youth Perspective",
        excerpt: "Feeling uncertain about your future? Our mentorship team shares actionable advice on identifying your passion and pursuing purpose-driven work.",
        author: "GFM Media Team",
        date: "Oct 8, 2025",
        category: "Career & Leadership",
        tags: ["#Leadership", "#Mentorship", "#Career"],
        imageUrl: 'career-guidance.jpg',
    },
    {
        id: 3,
        title: "Community Outreach: The Power of Service",
        excerpt: "Highlights from our recent outreach initiative and reflections on how serving others deepens our sense of community and faith.",
        author: "Femi Adebayo",
        date: "Sept 30, 2025",
        category: "Community & Service",
        tags: ["#Community", "#Service", "#Outreach"],
        imageUrl: 'outreach-impact.jpg',
    },
    {
        id: 4,
        title: "Understanding Divine Purpose in Your Twenties",
        excerpt: "It's never too early or too late to seek God's direction. This post provides scriptural guidance on discovering your unique calling.",
        author: "Patience Okoro",
        date: "Sept 22, 2025",
        category: "Spiritual Life",
        tags: ["#FaithJourney", "#DivinePurpose", "#YouthDevo"],
        imageUrl: 'divine-purpose.jpg',
    },
    {
        id: 5,
        title: "Financial Stewardship for Young Professionals",
        excerpt: "Learn practical, faith-based principles for managing your money, budgeting effectively, and preparing for future opportunities.",
        author: "GFM Mentorship",
        date: "Sept 15, 2025",
        category: "Financial Literacy",
        tags: ["#FinancialLiteracy", "#Stewardship"],
        imageUrl: 'financial-stewardship.jpg',
    },
    {
        id: 6,
        title: "A Member's Inspiring Story of Resilience",
        excerpt: "Read the powerful testimony of one of our members who overcame significant obstacles through faith and community support.",
        author: "Testimonies Editor",
        date: "Sept 1, 2025",
        category: "Testimonies",
        tags: ["#Testimony", "#Resilience"],
        imageUrl: 'testimony-feature.jpg',
    },
    {
        id: 7,
        title: "Advanced Leadership Strategies for Youth Directors",
        excerpt: "A deep dive into essential skills required to lead and mentor the next generation of church and community leaders effectively.",
        author: "GFM Leadership",
        date: "Aug 20, 2025",
        category: "Career & Leadership",
        tags: ["#Leadership", "#Mentorship", "#AfricaYouth"],
        imageUrl: 'leadership-guide.jpg',
    },
];

const ALL_TAGS = ["#FaithJourney", "#YouthDevo", "#Leadership", "#Mentorship", "#AfricaYouth", "#Community", "#Career"];
const CATEGORIES = [
    { name: "Spiritual Life", count: 2 }, 
    { name: "Career & Leadership", count: 2 }, 
    { name: "Community & Service", count: 1 }, 
    { name: "Financial Literacy", count: 1 }, 
    { name: "Testimonies", count: 1 }
];


// --- POST GRID COMPONENT (MODIFIED to use assetImages) ---

interface PostCardProps {
    post: typeof BLOG_POSTS[0];
    isFeatured: boolean;
}

const PostCard: FC<PostCardProps> = ({ post, isFeatured }) => {
    
    // **MODIFICATION HERE: Get the correct imported image URL from the map**
    const imageSource = assetImages[post.imageUrl as keyof typeof assetImages];


    const cardClasses = isFeatured
        ? "lg:col-span-2 flex flex-col md:flex-row bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-fuchsia-600"
        : "bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300";
    
    const imageClasses = isFeatured
        ? "w-full md:w-1/2 h-64 md:h-auto object-cover"
        : "w-full h-48 object-cover";

    const contentClasses = isFeatured
        ? "p-8 w-full md:w-1/2 flex flex-col justify-center"
        : "p-6 flex flex-col flex-grow";

    return (
        <article className={cardClasses}>
            {/* **MODIFICATION HERE: Use the dynamically resolved imageSource** */}
            {/* If the imageSource is undefined, the image tag will fail gracefully. */}
            <img 
                src={imageSource} 
                alt={post.title} 
                className={imageClasses} 
            />
            <div className={contentClasses}>
                <div className="flex items-center space-x-3 mb-2 text-sm text-fuchsia-600 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>{post.category}</span>
                </div>
                <h3 className={`font-bold text-gray-900 ${isFeatured ? 'text-3xl mb-4' : 'text-xl mb-2'}`}>
                    {post.title}
                </h3>
                <p className={`text-gray-600 ${isFeatured ? 'text-lg mb-6' : 'mb-4'}`}>
                    {post.excerpt}
                </p>
                <div className={`mt-auto ${isFeatured ? 'flex flex-col space-y-2' : 'flex items-center justify-between text-sm'}`}>
                    <div className="flex items-center space-x-4 text-gray-500">
                        <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {post.author}</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {post.date}</span>
                    </div>
                    <a href={`/blog/${post.id}`} className="inline-flex items-center text-fuchsia-700 font-bold hover:text-purple-800 transition-colors">
                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>
            </div>
        </article>
    );
};


// --- MAIN BLOG PAGE COMPONENT (Unchanged Logic) ---
const BlogPage: FC = () => {
    // 1. STATE FOR FILTERING
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // 2. FILTERING LOGIC 
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    const filteredPosts = useMemo(() => {
        return BLOG_POSTS.filter(post => {
            // Filter by Category
            const categoryMatch = selectedCategory
                ? post.category === selectedCategory
                : true;

            // Filter by Search Term (Title, Excerpt, Author, Category, AND Tags)
            const searchMatch = normalizedSearchTerm === '' ||
                post.title.toLowerCase().includes(normalizedSearchTerm) ||
                post.excerpt.toLowerCase().includes(normalizedSearchTerm) ||
                post.author.toLowerCase().includes(normalizedSearchTerm) ||
                post.category.toLowerCase().includes(normalizedSearchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm)); // Check against the tags array

            return categoryMatch && searchMatch;
        });
    }, [normalizedSearchTerm, selectedCategory]);
    
    // 3. POSTS DISPLAY LOGIC
    const postsToDisplay = filteredPosts;
    const featuredPost = postsToDisplay.length > 0 ? postsToDisplay[0] : null;
    const gridPosts = postsToDisplay.slice(1);

    // Handlers
    const handleCategoryClick = (categoryName: string) => {
        // Toggle the category filter
        setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
        setSearchTerm(''); // Clear search/tag filter when category is selected
    };

    const handleTagClick = (tag: string) => {
        const normalizedTag = tag.replace(/#/g, '').trim(); // Remove '#' for cleaner search
        
        // If the tag is already the current search term (acting as a filter), clear it.
        if (normalizedTag.toLowerCase() === searchTerm.toLowerCase()) {
            setSearchTerm('');
        } else {
            setSearchTerm(normalizedTag);
        }
        setSelectedCategory(null); // Clear category filter
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSearchTerm('');
    };

    const isFilterActive = selectedCategory !== null || searchTerm !== '';
    const currentFilterLabel = selectedCategory 
        ? `Viewing Category: ${selectedCategory}` 
        : searchTerm
        ? `Filtered by Keyword/Tag: "${searchTerm}"`
        : '';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* 1. Hero Section */}
            <section className="bg-linear-to-r from-purple-800 to-fuchsia-900 text-white py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                        <span className="block text-fuchsia-300 text-lg uppercase tracking-widest mb-2">GFM Insights</span>
                        Empowerment, Faith, and Youth Leadership
                    </h1>
                    <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto">
                        Explore our latest articles, devotionals, and resources designed to guide and inspire young Christians in their journey.
                    </p>
                </div>
            </section>

            {/* 2. Main Content Area (Featured Post, Grid, and Sidebar) */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-12">
                    
                    {/* Left/Main Column: Filtered Posts */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Current Filter Display */}
                        {isFilterActive && (
                            <div className="p-4 bg-fuchsia-100 rounded-lg flex items-center justify-between text-fuchsia-800">
                                <span className="font-medium">
                                    {currentFilterLabel}
                                </span>
                                <button onClick={handleClearFilters} className="flex items-center text-sm font-semibold hover:text-fuchsia-900 transition-colors">
                                    Clear Filters <X className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        )}

                        {/* Title and Featured Post */}
                        <h2 className="text-3xl font-bold text-gray-900 border-b pb-4 border-fuchsia-100">
                            {postsToDisplay.length === 0 ? "No Articles Found" : "Featured Article"}
                        </h2>
                        
                        {featuredPost && (
                            <PostCard post={featuredPost} isFeatured={true} />
                        )}

                        {/* Post Grid */}
                        <h2 className="text-3xl font-bold text-gray-900 border-b pb-4 border-fuchsia-100 mt-12">
                             {postsToDisplay.length > 1 ? "Other Results" : ""}
                        </h2>
                        
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                            {gridPosts.map((post) => (
                                <PostCard key={post.id} post={post} isFeatured={false} />
                            ))}
                        </div>

                        {/* Pagination/Load More */}
                        {postsToDisplay.length > 0 && (
                            <div className="text-center mt-10">
                                <button className="px-8 py-3 bg-fuchsia-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors shadow-md">
                                    Load More Articles
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <aside className="lg:col-span-1 space-y-8">
                        
                        {/* Search Bar (UPDATED) */}
                        <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-fuchsia-600">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Search Content</h3>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Keywords..." 
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedCategory(null); // Clear category filter when searching
                                    }}
                                    className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                        </div>

                        {/* Categories List (Unchanged Logic) */}
                        <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-purple-600">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Categories</h3>
                            <ul className="space-y-2">
                                {/* 'All Posts' Option */}
                                <li className="border-b border-gray-100 py-1">
                                    <button 
                                        onClick={handleClearFilters}
                                        className={`w-full flex justify-between items-center text-left transition-colors ${selectedCategory === null && searchTerm === '' ? 'text-fuchsia-700 font-bold' : 'text-gray-700 hover:text-fuchsia-700'}`}
                                    >
                                        <span>All Posts</span>
                                        <span className={`text-sm px-2 py-0.5 rounded-full ${selectedCategory === null && searchTerm === '' ? 'bg-fuchsia-600 text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>{BLOG_POSTS.length}</span>
                                    </button>
                                </li>
                                {/* Category Options */}
                                {CATEGORIES.map((category, index) => {
                                    const isActive = selectedCategory === category.name;
                                    return (
                                        <li key={index} className="border-b border-gray-100 last:border-b-0 py-1">
                                            <button 
                                                onClick={() => handleCategoryClick(category.name)}
                                                className={`w-full flex justify-between items-center text-left transition-colors ${isActive ? 'text-fuchsia-700 font-bold' : 'text-gray-700 hover:text-fuchsia-700'}`}
                                            >
                                                <span>{category.name}</span>
                                                <span className={`text-sm px-2 py-0.5 rounded-full ${isActive ? 'bg-fuchsia-600 text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>{category.count}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        
                        {/* Popular Tags (UPDATED) */}
                           <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-fuchsia-600">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">Popular Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_TAGS.map(tag => {
                                        const isTagActive = searchTerm.toLowerCase() === tag.replace(/#/g, '').toLowerCase();

                                        return (
                                            <button 
                                                key={tag} 
                                                onClick={() => handleTagClick(tag)}
                                                className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer 
                                                    ${isTagActive 
                                                        ? 'bg-fuchsia-600 text-white font-semibold' 
                                                        : 'bg-gray-200 text-gray-700 hover:bg-fuchsia-200 hover:text-fuchsia-800'}`
                                                    }
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                    </aside>

                </div>
            </section>


            {/* Footer Placeholder */}
            <Footer />
        </div>
    );
};

export default BlogPage;