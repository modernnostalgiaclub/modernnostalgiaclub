import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SkipLink } from "@/components/SkipLink";
import { CookieConsent } from "@/components/CookieConsent";
import LandingPage from "./pages/LandingPage";
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
import MemberDirectory from "./pages/MemberDirectory";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/classroom" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
            <Route path="/classroom/:slug" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/studio" element={<ProtectedRoute><StudioFloor /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MemberDirectory /></ProtectedRoute>} />
            <Route path="/reference" element={<ArtistResources />} />
            <Route path="/events" element={<Events />} />
            <Route path="/reference/30-day-tracker" element={<ProtectedRoute><ImplementationTracker /></ProtectedRoute>} />
            <Route path="/reference/beat-license" element={<ProtectedRoute><BeatLicense /></ProtectedRoute>} />
            <Route path="/beats" element={<ProtectedRoute><BeatLibrary /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute><SecurityDocs /></ProtectedRoute>} />
            <Route path="/admin/monitoring" element={<ProtectedRoute><SecurityMonitoring /></ProtectedRoute>} />
            <Route path="/auth/patreon/callback" element={<AuthCallback />} />
            <Route path="/auth/diagnostics" element={<AuthDiagnostics />} />
            <Route path="/apply" element={<LabApplication />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;