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

// ─── MINISTRY PAGES ───────────────────────────────────────────────────────────
import Home            from './pages/Home';
import Sermons         from './pages/Sermons';
import SermonDetail    from './pages/SermonDetail';
import Events          from './pages/Events';
import Ministries      from './pages/Ministries';
import Give            from './pages/Give';
import Announcements   from './pages/AnnouncementsPage';
import Contact         from './pages/Contact';
import DaughtersOfHonour from './pages/DaughtersOfHonour';
import GlobalChoir     from './pages/GlobalChoir';
import HomeOfLove      from './pages/HomeOfLove';

// ─── ABOUT PAGES ──────────────────────────────────────────────────────────────
import OurStory        from './pages/OurStory';
import OurMission      from './pages/OurMission';
import SeniorPastor    from './pages/SeniorPastor';
import CoPastor        from './pages/CoPastor';
import CoreBeliefs     from './pages/CoreBeliefs';

// ─── PRAYER REQUEST PAGE ──────────────────────────────────────────────────────
import PrayerRequestPage from './pages/PrayerRequestPage';

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage   from './pages/auth/ResetPasswordPage';
import ResendConfirmPage   from './pages/auth/ResendConfirmPage';

// ─── ADMIN PAGES ──────────────────────────────────────────────────────────────
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

// ─── SCROLL TO TOP ────────────────────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ─── LAYOUTS ──────────────────────────────────────────────────────────────────
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="grow">{children}</main>
    <Footer />
  </>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">{children}</div>
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold text-purple-700 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page not found.</p>
      <a href="/" className="px-6 py-2 bg-purple-700 text-white rounded-lg">Go Back Home</a>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
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

            {/* ── PUBLIC ROUTES ─────────────────────────────────────── */}
            <Route path="/"
              element={<PublicLayout><Home /></PublicLayout>} />

            {/* About — individual pages, no generic /about */}
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

            {/* Prayer Request */}
            <Route path="/prayer-request"
              element={<PublicLayout><PrayerRequestPage /></PublicLayout>} />

            <Route path="/books"
              element={<PublicLayout><BookStore /></PublicLayout>} />
            <Route path="/sermons"
              element={<PublicLayout><Sermons /></PublicLayout>} />
            <Route path="/sermons/:id"
              element={<PublicLayout><SermonDetail /></PublicLayout>} />
            <Route path="/events"
              element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/ministries"
              element={<PublicLayout><Ministries /></PublicLayout>} />
            <Route path="/give"
              element={<PublicLayout><Give /></PublicLayout>} />
            <Route path="/contact"
              element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/announcements"
              element={<PublicLayout><Announcements /></PublicLayout>} />
            <Route path="/ministries/daughters-of-honour"
              element={<PublicLayout><DaughtersOfHonour /></PublicLayout>} />
            <Route path="/ministries/global-choir"
              element={<PublicLayout><GlobalChoir onBack={() => window.history.back()} /></PublicLayout>} />
            <Route path="/ministries/home-of-love"
              element={<PublicLayout><HomeOfLove onBack={() => window.history.back()} /></PublicLayout>} />

            {/* ── AUTH ROUTES ───────────────────────────────────────── */}
            <Route path="/login"
              element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register"
              element={<AuthLayout><RegisterPage /></AuthLayout>} />
            <Route path="/forgot-password"
              element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
            <Route path="/reset-password"
              element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
            <Route path="/resend-confirmation"
              element={<AuthLayout><ResendConfirmPage /></AuthLayout>} />

            {/* ── PROTECTED ROUTES ──────────────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/youth"
                element={
                  <PublicLayout>
                    <div className="pt-24 p-8 text-2xl font-bold text-fuchsia-700">
                      House of Opra — Coming Soon
                    </div>
                  </PublicLayout>
                }
              />
            </Route>

            {/* ── ADMIN ROUTES ──────────────────────────────────────── */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminLayout><Admin /></AdminLayout>} />
              <Route path="contacts"       element={<AdminLayout><AdminContacts /></AdminLayout>} />
              <Route path="announcements"  element={<AdminLayout><AdminAnnouncements /></AdminLayout>} />
              <Route path="events"         element={<AdminLayout><AdminEvents /></AdminLayout>} />
              <Route path="sermons"        element={<AdminLayout><AdminSermons /></AdminLayout>} />
              <Route path="prayer-requests" element={<AdminLayout><AdminPrayerRequests /></AdminLayout>} />
              <Route path="testimonies"    element={<AdminLayout><AdminTestimonies /></AdminLayout>} />
              <Route path="users"          element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="donations"      element={<AdminLayout><AdminDonations /></AdminLayout>} />
              <Route path="books"          element={<AdminLayout><AdminBooks /></AdminLayout>} />
              <Route path="bulk-email"     element={<AdminLayout><AdminBulkEmail /></AdminLayout>} />
            </Route>

            {/* ── 404 ───────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;