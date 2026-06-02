import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Calendar, User, Tag, ArrowRight, Search, X } from 'lucide-react';
import SEO from '../../components/SEO';

// Image map
const assetImages: Record<string, string> = {
  'spiritual-growth.jpg':       'src/assets/images/youth/pray.jpg',
  'career-guidance.jpg':        'src/assets/images/youth/dad.jpg',
  'outreach-impact.jpg':        'src/assets/images/youth/young.jpg',
  'divine-purpose.jpg':         'src/assets/images/youth/flan.jpg',
  'financial-stewardship.jpg':  'src/assets/images/youth/money.jpg',
  'testimony-feature.jpg':      'src/assets/images/youth/mic.jpg',
  'leadership-guide.jpg':       'src/assets/images/youth/zoom.jpg',
};

const BLOG_POSTS = [
  { id: 1, title: '5 Keys to Spiritual Growth in University',
    excerpt: 'Balancing faith and academia can be tough. We break down five practical steps to keep your spirit strong.',
    author: 'Michelle Ajik', date: 'Oct 15, 2025', category: 'Spiritual Life',
    tags: ['#FaithJourney','#YouthDevo','#University'], imageUrl: 'spiritual-growth.jpg' },
  { id: 2, title: 'Navigating Career Choices: A Youth Perspective',
    excerpt: 'Feeling uncertain about your future? Our mentorship team shares actionable advice on identifying your passion.',
    author: 'GFM Media Team', date: 'Oct 8, 2025', category: 'Career & Leadership',
    tags: ['#Leadership','#Mentorship','#Career'], imageUrl: 'career-guidance.jpg' },
  { id: 3, title: 'Community Outreach: The Power of Service',
    excerpt: 'Highlights from our recent outreach initiative and reflections on how serving others deepens our faith.',
    author: 'Pam Victory', date: 'Sept 30, 2025', category: 'Community & Service',
    tags: ['#Community','#Service','#Outreach'], imageUrl: 'outreach-impact.jpg' },
  { id: 4, title: 'Understanding Divine Purpose in Your Twenties',
    excerpt: 'It\'s never too early or too late to seek God\'s direction. Scriptural guidance on discovering your calling.',
    author: 'Ezekiel Isaiah', date: 'Sept 22, 2025', category: 'Spiritual Life',
    tags: ['#FaithJourney','#DivinePurpose'], imageUrl: 'divine-purpose.jpg' },
  { id: 5, title: 'Financial Stewardship for Young Professionals',
    excerpt: 'Faith-based principles for managing your money and preparing for future opportunities.',
    author: 'GFM Mentorship', date: 'Sept 15, 2025', category: 'Financial Literacy',
    tags: ['#FinancialLiteracy','#Stewardship'], imageUrl: 'financial-stewardship.jpg' },
  { id: 6, title: 'A Member\'s Inspiring Story of Resilience',
    excerpt: 'Read the powerful testimony of one of our members who overcame significant obstacles through faith.',
    author: 'Testimonies Dept.', date: 'Sept 1, 2025', category: 'Testimonies',
    tags: ['#Testimony','#Resilience'], imageUrl: 'testimony-feature.jpg' },
  { id: 7, title: 'Advanced Leadership Strategies for Youth Directors',
    excerpt: 'Essential skills required to lead and mentor the next generation of church and community leaders.',
    author: 'GFM Leadership', date: 'Aug 20, 2025', category: 'Career & Leadership',
    tags: ['#Leadership','#Mentorship','#AfricaYouth'], imageUrl: 'leadership-guide.jpg' },
];

const ALL_TAGS = ['#FaithJourney','#YouthDevo','#Leadership','#Mentorship',
                  '#AfricaYouth','#Community','#Career'];
const CATEGORIES = [
  { name: 'Spiritual Life', count: 2 },
  { name: 'Career & Leadership', count: 2 },
  { name: 'Community & Service', count: 1 },
  { name: 'Financial Literacy', count: 1 },
  { name: 'Testimonies', count: 1 },
];

const PostCard: FC<{ post: typeof BLOG_POSTS[0]; isFeatured: boolean }> = ({
  post, isFeatured,
}) => {
  const imgSrc = assetImages[post.imageUrl] ?? post.imageUrl;
  return (
    <article className={isFeatured
      ? 'lg:col-span-2 flex flex-col md:flex-row bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-fuchsia-600'
      : 'bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow'}>
      <img src={imgSrc} alt={post.title} loading="lazy"
        className={isFeatured
          ? 'w-full md:w-1/2 h-64 md:h-auto object-cover'
          : 'w-full h-48 object-cover'} />
      <div className={isFeatured ? 'p-8 w-full md:w-1/2 flex flex-col justify-center' : 'p-6 flex flex-col flex-grow'}>
        <div className="flex items-center space-x-3 mb-2 text-sm
                        text-fuchsia-600 font-semibold">
          <Tag className="w-4 h-4" /><span>{post.category}</span>
        </div>
        <h3 className={`font-bold text-gray-900 ${isFeatured ? 'text-3xl mb-4' : 'text-xl mb-2'}`}>
          {post.title}
        </h3>
        <p className={`text-gray-600 ${isFeatured ? 'text-lg mb-6' : 'mb-4'}`}>
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-500">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />{post.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />{post.date}
            </span>
          </div>
          <span className="inline-flex items-center text-fuchsia-700
                           font-bold hover:text-purple-800 transition-colors
                           cursor-pointer">
            Read Article <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </article>
  );
};

const YouthBlogPage: FC = () => {
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return BLOG_POSTS.filter(p => {
      const catMatch = selectedCategory ? p.category === selectedCategory : true;
      const searchMatch = !term ||
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term));
      return catMatch && searchMatch;
    });
  }, [searchTerm, selectedCategory]);

  const featured  = filtered[0] ?? null;
  const gridPosts = filtered.slice(1);
  const isFiltered = !!selectedCategory || !!searchTerm;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <SEO title="Youth Blog" description="Stories, insights, and updates from the Global Flame Ministry Youth Community." url="https://globalflameministry.org/youth/blog" />

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-800 to-fuchsia-900
                          text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="block text-fuchsia-300 text-lg uppercase
                             tracking-widest mb-2">GFM Insights</span>
            Empowerment, Faith, and Youth Leadership
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto">
            Articles, devotionals, and resources designed to guide and
            inspire young Christians on their journey.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-12">
            {isFiltered && (
              <div className="p-4 bg-fuchsia-100 rounded-lg flex items-center
                              justify-between text-fuchsia-800">
                <span className="font-medium">
                  {selectedCategory
                    ? `Category: ${selectedCategory}`
                    : `Keyword: "${searchTerm}"`}
                </span>
                <button onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
                  className="flex items-center text-sm font-semibold
                             hover:text-fuchsia-900">
                  Clear <X className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 border-b pb-4
                           border-fuchsia-100">
              {filtered.length === 0 ? 'No Articles Found' : 'Featured Article'}
            </h2>
            {featured && <PostCard post={featured} isFeatured={true} />}

            {gridPosts.length > 0 && (
              <>
                <h2 className="text-3xl font-bold text-gray-900 border-b pb-4
                               border-fuchsia-100 mt-12">
                  Other Articles
                </h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                  {gridPosts.map(p => (
                    <PostCard key={p.id} post={p} isFeatured={false} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="p-6 bg-white rounded-xl shadow-lg
                            border-t-4 border-fuchsia-600">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Search Content
              </h3>
              <div className="relative">
                <input type="text" placeholder="Keywords..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="w-full py-2 pl-4 pr-10 border border-gray-300
                             rounded-lg focus:ring-fuchsia-500
                             focus:border-fuchsia-500" />
                <Search className="w-5 h-5 text-gray-400 absolute right-3
                                   top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg
                            border-t-4 border-purple-600">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Categories
              </h3>
              <ul className="space-y-2">
                <li className="border-b border-gray-100 py-1">
                  <button onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
                    className={`w-full flex justify-between items-center text-left
                      ${!selectedCategory && !searchTerm
                        ? 'text-fuchsia-700 font-bold'
                        : 'text-gray-700 hover:text-fuchsia-700'}`}>
                    <span>All Posts</span>
                    <span className="text-sm px-2 py-0.5 rounded-full
                                     bg-fuchsia-100 text-fuchsia-700">
                      {BLOG_POSTS.length}
                    </span>
                  </button>
                </li>
                {CATEGORIES.map((c, i) => (
                  <li key={i} className="border-b border-gray-100 last:border-0 py-1">
                    <button onClick={() => setSelectedCategory(
                      c.name === selectedCategory ? null : c.name
                    )}
                      className={`w-full flex justify-between items-center text-left
                        ${selectedCategory === c.name
                          ? 'text-fuchsia-700 font-bold'
                          : 'text-gray-700 hover:text-fuchsia-700'}`}>
                      <span>{c.name}</span>
                      <span className="text-sm px-2 py-0.5 rounded-full
                                       bg-fuchsia-100 text-fuchsia-700">
                        {c.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg
                            border-t-4 border-fuchsia-600">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => {
                  const clean = tag.replace(/#/g, '').toLowerCase();
                  const active = searchTerm.toLowerCase() === clean;
                  return (
                    <button key={tag}
                      onClick={() => {
                        setSearchTerm(active ? '' : clean);
                        setSelectedCategory(null);
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition
                        ${active
                          ? 'bg-fuchsia-600 text-white font-semibold'
                          : 'bg-gray-200 text-gray-700 hover:bg-fuchsia-200 hover:text-fuchsia-800'}`}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default YouthBlogPage;