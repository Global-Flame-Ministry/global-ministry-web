import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import AdminRoute from './components/guards/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookStore from './pages/BookStore';
import ConfirmEmailChange from './pages/auth/ConfirmEmailChange';

// MINISTRY PAGES 
import Home              from './pages/Home';
import Sermons           from './pages/Sermons';
import SermonDetail      from './pages/SermonDetail';
import SeriesDetail      from './pages/SeriesDetail';
import Events            from './pages/Events';
import EventDetails      from './pages/EventDetails';
import Ministries        from './pages/Ministries';
import Give              from './pages/Give';
import Announcements     from './pages/AnnouncementsPage';
import Contact           from './pages/Contact';
import PrayerRequestPage from './pages/PrayerRequestPage';
import MinistryDetail    from './pages/MinistryDetail';
import CounsellingPage   from './pages/CounsellingPage';
import PlanYourVisit from './pages/PlanYourVisit';

// ABOUT PAGES 
import About from './pages/About';
import OurStory    from './pages/OurStory';
import OurMission  from './pages/OurMission';
import SeniorPastor from './pages/SeniorPastor';
import CoPastor    from './pages/CoPastor';
import CoreBeliefs from './pages/CoreBeliefs';

// AUTH PAGES 
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';
import ResendConfirmPage  from './pages/auth/ResendConfirmPage';

// PROTECTED PAGES 
import UserDashboard from './pages/UserDashboard';

// ADMIN PAGES 
import Admin               from './pages/Admin/Admin';
import AdminContacts       from './pages/Admin/AdminContacts';
import AdminAnnouncements  from './pages/Admin/AdminAnnouncements';
import AdminEvents         from './pages/Admin/AdminEvents';
import AdminSermons        from './pages/Admin/AdminSermons';
import AdminPrayerRequests from './pages/Admin/AdminPrayerRequests';
import AdminTestimonies    from './pages/Admin/AdminTestimonies';
import AdminUsers          from './pages/Admin/AdminUsers';
import AdminBooks          from './pages/Admin/AdminBooks';
import AdminDonations      from './pages/Admin/AdminDonations';
import AdminBulkEmail      from './pages/Admin/AdminBulkEmail';
import AdminMinistries     from './pages/Admin/AdminMinistries';
import AdminCounselling    from './pages/Admin/AdminCounselling';
import AdminBlog           from './pages/Admin/AdminBlog';
import BlogPage            from './pages/BlogPage';
import BlogPostDetail      from './pages/BlogPostDetail';

// Add these imports at the top of your existing App.tsx
import YouthLayout            from './components/Youth/YouthLayout';
import YouthHomePage          from './pages/Youth/YouthHomePage';
import YouthAboutPage         from './pages/Youth/YouthAboutPage';
import YouthServicesPage      from './pages/Youth/YouthServicesPage';
import YouthActivitiesPage    from './pages/Youth/YouthActivitiesPage';
import YouthTeamPage          from './pages/Youth/YouthTeamPage';
import YouthBlogPage          from './pages/Youth/YouthBlogPage';
import YouthReviewPage        from './pages/Youth/YouthReviewPage';
import YouthContactPage       from './pages/Youth/YouthContactPage';
import YouthEventsPage        from './pages/Youth/YouthEventsPage';
import YouthAnnouncementsPage from './pages/Youth/YouthAnnouncementsPage';
import JoinYouthPage          from './pages/Youth/JoinYouthPage';

//  SCROLL TO TOP 
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// LAYOUTS 
const PublicLayout = ({ children, fullBleed }: { children: React.ReactNode; fullBleed?: boolean }) => {
  if (fullBleed) {
    return (
      <>
        <Navbar />
        <main className="flex flex-col min-h-screen bg-[#f9f9ff]">
          {children}
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />
      <main className="grow bg-white text-[#111827]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
    <div className="mx-auto w-full max-w-md">{children}</div>
  </div>
);

// 404 
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold text-purple-700 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page not found.</p>
      <a href="/" className="px-6 py-2 bg-purple-700 text-white rounded-lg">
        Go Back Home
      </a>
    </div>
  );
}

// APP 
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />

        <Toaster
          position="top-right"
          toastOptions={{
            success: { style: { background: '#a21caf', color: 'white' } },
            error:   { style: { background: '#dc2626', color: 'white' } },
          }}
        />

        <div className="flex flex-col min-h-screen">
          <Routes>

            {/* ── YOUTH COMMUNITY ROUTES ────────────────────────────────── */}
          <Route path="/youth" element={<YouthLayout />}>
            <Route index element={<YouthHomePage />} />
            <Route path="about"         element={<YouthAboutPage />} />
            <Route path="services"      element={<YouthServicesPage />} />
            <Route path="activities"    element={<YouthActivitiesPage />} />
            <Route path="team"          element={<YouthTeamPage />} />
            <Route path="blog"          element={<YouthBlogPage />} />
            <Route path="reviews"       element={<YouthReviewPage />} />
            <Route path="contact"       element={<YouthContactPage />} />
            <Route path="events"        element={<YouthEventsPage />} />
            <Route path="announcements" element={<YouthAnnouncementsPage />} />

            {/* Join Youth — only for logged-in Ministry members */}
            <Route element={<ProtectedRoute />}>
              <Route path="join" element={<JoinYouthPage />} />
            </Route>
          </Route>

            {/* PUBLIC ROUTES */}
            <Route path="/"
              element={<PublicLayout><Home /></PublicLayout>} />

            <Route path="/about"
              element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/our-story"
              element={<PublicLayout><OurStory /></PublicLayout>} />
            <Route path="/our-mission"
              element={<PublicLayout><OurMission /></PublicLayout>} />
            <Route path="/senior-pastor"
              element={<PublicLayout><SeniorPastor /></PublicLayout>} />
            <Route path="/co-pastor"
              element={<PublicLayout><CoPastor /></PublicLayout>} />
            <Route path="/core-beliefs"
              element={<PublicLayout><CoreBeliefs /></PublicLayout>} />

              <Route path="/plan-your-visit" element={<PublicLayout><PlanYourVisit /></PublicLayout>} />

            <Route path="/prayer-request"
              element={<PublicLayout><PrayerRequestPage /></PublicLayout>} />
            <Route path="/books"
              element={<PublicLayout><BookStore /></PublicLayout>} />
            <Route path="/sermons"
              element={<PublicLayout fullBleed><Sermons /></PublicLayout>} />
            <Route path="/sermons/series/:seriesSlug"
              element={<PublicLayout fullBleed><SeriesDetail /></PublicLayout>} />
            <Route path="/sermons/:slug"
              element={<PublicLayout fullBleed><SermonDetail /></PublicLayout>} />
            <Route path="/events"
              element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/events/:slug"
              element={<PublicLayout><EventDetails /></PublicLayout>} />
            <Route path="/ministries"
              element={<PublicLayout><Ministries /></PublicLayout>} />
            <Route path="/ministries/:slug"
              element={<PublicLayout><MinistryDetail /></PublicLayout>} />
            <Route path="/give"
              element={<PublicLayout><Give /></PublicLayout>} />
            <Route path="/blog"
              element={<PublicLayout><BlogPage /></PublicLayout>} />
            <Route path="/blog/:slug"
              element={<PublicLayout><BlogPostDetail /></PublicLayout>} />
            <Route path="/contact"
              element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/announcements"
              element={<PublicLayout><Announcements /></PublicLayout>} />
              <Route path="/confirm-email-change"
              element={<PublicLayout><ConfirmEmailChange/></PublicLayout>}
            />
            <Route path="/counselling"
              element={<PublicLayout><CounsellingPage /></PublicLayout>} />

            {/* AUTH ROUTES */}
            <Route path="/login"
              element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register"
              element={<AuthLayout><RegisterPage /></AuthLayout>} />
            <Route path="/forgot-password"
              element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
            <Route path="/reset-password/:token"
              element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
            <Route path="/reset-password"
              element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
            <Route path="/resend-confirmation"
              element={<AuthLayout><ResendConfirmPage /></AuthLayout>} />

            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"
                element={<PublicLayout><UserDashboard /></PublicLayout>} />
            </Route>


            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminLayout><Admin /></AdminLayout>} />
              <Route path="contacts"
                element={<AdminLayout><AdminContacts /></AdminLayout>} />
              <Route path="announcements"
                element={<AdminLayout><AdminAnnouncements /></AdminLayout>} />
              <Route path="events"
                element={<AdminLayout><AdminEvents /></AdminLayout>} />
              <Route path="sermons"
                element={<AdminLayout><AdminSermons /></AdminLayout>} />
              <Route path="prayer-requests"
                element={<AdminLayout><AdminPrayerRequests /></AdminLayout>} />
              <Route path="testimonies"
                element={<AdminLayout><AdminTestimonies /></AdminLayout>} />
              <Route path="users"
                element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="donations"
                element={<AdminLayout><AdminDonations /></AdminLayout>} />
              <Route path="books"
                element={<AdminLayout><AdminBooks /></AdminLayout>} />
              <Route path="bulk-email"
                element={<AdminLayout><AdminBulkEmail /></AdminLayout>} />
              <Route path="ministries"
                element={<AdminLayout><AdminMinistries /></AdminLayout>} />
              <Route path="counselling"
                element={<AdminLayout><AdminCounselling /></AdminLayout>} />
              <Route path="blog"
                element={<AdminLayout><AdminBlog /></AdminLayout>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;