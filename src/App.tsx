import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SkipLink } from "@/components/SkipLink";
import { CookieConsent } from "@/components/CookieConsent";
import { LabLayout } from "@/components/LabLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <SkipLink />
          <Toaster />
          <Sonner />
          <CookieConsent />
          <Routes>
            <Route path="/" element={<MusicBlogHome />} />
            <Route path="/lab" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/dashboard" element={<ProtectedRoute><LabLayout><Dashboard /></LabLayout></ProtectedRoute>} />
            <Route path="/classroom" element={<ProtectedRoute><LabLayout><Classroom /></LabLayout></ProtectedRoute>} />
            <Route path="/classroom/:slug" element={<ProtectedRoute><LabLayout><CourseDetail /></LabLayout></ProtectedRoute>} />
            <Route path="/studio" element={<ProtectedRoute><LabLayout><StudioFloor /></LabLayout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><LabLayout><Community /></LabLayout></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><LabLayout><MemberDirectory /></LabLayout></ProtectedRoute>} />
            <Route path="/reference" element={<ArtistResources />} />
            <Route path="/events" element={<Events />} />
            <Route path="/reference/30-day-tracker" element={<ProtectedRoute><LabLayout><ImplementationTracker /></LabLayout></ProtectedRoute>} />
            <Route path="/reference/beat-license" element={<ProtectedRoute><LabLayout><BeatLicense /></LabLayout></ProtectedRoute>} />
            <Route path="/beats" element={<ProtectedRoute><LabLayout><BeatLibrary /></LabLayout></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><LabLayout><Account /></LabLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><LabLayout><Notifications /></LabLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><LabLayout><Admin /></LabLayout></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute><LabLayout><SecurityDocs /></LabLayout></ProtectedRoute>} />
            <Route path="/admin/monitoring" element={<ProtectedRoute><LabLayout><SecurityMonitoring /></LabLayout></ProtectedRoute>} />
            <Route path="/auth/patreon/callback" element={<AuthCallback />} />
            <Route path="/auth/diagnostics" element={<AuthDiagnostics />} />
            <Route path="/apply" element={<LabApplication />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/success" element={<StoreSuccess />} />
            <Route path="/catalog-audit" element={<CatalogAudit />} />
            <Route path="/sync-quiz" element={<SyncQuiz />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/free-guide" element={<FreeGuide />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/artist/:username" element={<ArtistProfile />} />
            <Route path="/migrate" element={<MigrateToGoogle />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;