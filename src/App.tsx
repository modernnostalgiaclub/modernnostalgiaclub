import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SkipLink } from "@/components/SkipLink";
import { CookieConsent } from "@/components/CookieConsent";
import { LabLayout } from "@/components/LabLayout";
import { AuthAwareLayout } from "@/components/AuthAwareLayout";
import MusicBlogHome from "./pages/MusicBlogHome";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import BlogIndex from "./pages/BlogIndex";
import Artists from "./pages/Artists";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import CourseDetail from "./pages/CourseDetail";
import StudioFloor from "./pages/StudioFloor";
import Community from "./pages/Community";
import ArtistResources from "./pages/ReferenceShelf";
import Events from "./pages/Events";
import ImplementationTracker from "./pages/ImplementationTracker";
import BeatLicense from "./pages/BeatLicense";
import BeatLibrary from "./pages/BeatLibrary";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import SecurityDocs from "./pages/SecurityDocs";
import SecurityMonitoring from "./pages/SecurityMonitoring";
import AuthCallback from "./pages/AuthCallback";
import AuthDiagnostics from "./pages/AuthDiagnostics";
import LabApplication from "./pages/LabApplication";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import MemberDirectory from "./pages/MemberDirectory";
import Notifications from "./pages/Notifications";
import Store from "./pages/Store";
import StoreSuccess from "./pages/StoreSuccess";
import SyncQuiz from "./pages/SyncQuiz";
import CatalogAudit from "./pages/CatalogAudit";
import Connect from "./pages/Connect";
import FreeGuide from "./pages/FreeGuide";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ArtistProfile from "./pages/ArtistProfile";
import MigrateToGoogle from "./pages/MigrateToGoogle";
import BlogPost from "./pages/BlogPost";
import ArtistProfileSettings from "./pages/ArtistProfileSettings";
import Ebooks from "./pages/Ebooks";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
          <SkipLink />
          <Toaster />
          <Sonner />
          <CookieConsent />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<AuthAwareLayout><MusicBlogHome /></AuthAwareLayout>} />
            
            <Route path="/join" element={<LandingPage />} />
            <Route path="/about" element={<AuthAwareLayout><AboutPage /></AuthAwareLayout>} />
            <Route path="/blog" element={<AuthAwareLayout><BlogIndex /></AuthAwareLayout>} />
            <Route path="/blog/:slug" element={<AuthAwareLayout><BlogPost /></AuthAwareLayout>} />
            <Route path="/artists" element={<AuthAwareLayout><Artists /></AuthAwareLayout>} />
            <Route path="/dashboard" element={<ProtectedRoute><LabLayout><Dashboard /></LabLayout></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><LabLayout><Classroom /></LabLayout></ProtectedRoute>} />
            <Route path="/courses/:slug" element={<ProtectedRoute><LabLayout><CourseDetail /></LabLayout></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><LabLayout><StudioFloor /></LabLayout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><LabLayout><Community /></LabLayout></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><LabLayout><MemberDirectory /></LabLayout></ProtectedRoute>} />
            {/* Legacy redirects */}
            <Route path="/classroom" element={<ProtectedRoute><LabLayout><Classroom /></LabLayout></ProtectedRoute>} />
            <Route path="/classroom/:slug" element={<ProtectedRoute><LabLayout><CourseDetail /></LabLayout></ProtectedRoute>} />
            <Route path="/studio" element={<ProtectedRoute><LabLayout><StudioFloor /></LabLayout></ProtectedRoute>} />
            <Route path="/artistresources" element={<ArtistResources />} />
            <Route path="/events" element={<ProtectedRoute><LabLayout><Events /></LabLayout></ProtectedRoute>} />
            <Route path="/artistresources/30-day-tracker" element={<ProtectedRoute><LabLayout><ImplementationTracker /></LabLayout></ProtectedRoute>} />
            <Route path="/artistresources/beat-license" element={<ProtectedRoute><LabLayout><BeatLicense /></LabLayout></ProtectedRoute>} />
            <Route path="/beatlibrary" element={<ProtectedRoute><LabLayout><BeatLibrary /></LabLayout></ProtectedRoute>} />
            <Route path="/ebooks" element={<ProtectedRoute><LabLayout><Ebooks /></LabLayout></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><LabLayout><ArtistProfileSettings /></LabLayout></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><LabLayout><Account /></LabLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><LabLayout><Notifications /></LabLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><LabLayout><Admin /></LabLayout></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute><LabLayout><SecurityDocs /></LabLayout></ProtectedRoute>} />
            <Route path="/admin/monitoring" element={<ProtectedRoute><LabLayout><SecurityMonitoring /></LabLayout></ProtectedRoute>} />
            <Route path="/auth/patreon/callback" element={<AuthCallback />} />
            <Route path="/auth/diagnostics" element={<AuthDiagnostics />} />
            <Route path="/apply" element={<LabApplication />} />
            <Route path="/terms" element={<AuthAwareLayout><TermsOfService /></AuthAwareLayout>} />
            <Route path="/privacy" element={<AuthAwareLayout><PrivacyPolicy /></AuthAwareLayout>} />
            <Route path="/contact" element={<AuthAwareLayout><Contact /></AuthAwareLayout>} />
            <Route path="/store" element={<AuthAwareLayout><Store /></AuthAwareLayout>} />
            <Route path="/store/success" element={<AuthAwareLayout><StoreSuccess /></AuthAwareLayout>} />
            <Route path="/catalog-audit" element={<AuthAwareLayout><CatalogAudit /></AuthAwareLayout>} />
            <Route path="/sync-quiz" element={<AuthAwareLayout><SyncQuiz /></AuthAwareLayout>} />
            <Route path="/connect" element={<AuthAwareLayout><Connect /></AuthAwareLayout>} />
            <Route path="/free-guide" element={<AuthAwareLayout><FreeGuide /></AuthAwareLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/artist/:username" element={<AuthAwareLayout><ArtistProfile /></AuthAwareLayout>} />
            <Route path="/migrate" element={<MigrateToGoogle />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;