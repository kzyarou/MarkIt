import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import ScrollToTop from "@/components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import CreateSection from "./pages/CreateSection";
import SectionDetailsPage from "./pages/SectionDetailsPage";
import SectionStudentsPage from "./pages/SectionStudentsPage";
import StudentSubjectsPage from "./pages/StudentSubjectsPage";
import ReportsPage from "./pages/ReportsPage";
import SearchPage from "./pages/SearchPage";
import AttendancePage from "./pages/AttendancePage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "next-themes";
import SubjectsECRPage from "./pages/SubjectsECRPage";
import SubjectECRDetailPage from "./pages/SubjectECRDetailPage";
import FAQPage from './pages/FAQPage';
import DataPrivacyPage from './pages/DataPrivacyPage';
import TermsPage from './pages/TermsPage';
import GradeCalculatorPage from './pages/GradeCalculatorPage';
import { useIsMobile } from "@/hooks/use-mobile";
import { AppSidebarLayout } from "@/components/AppSidebar";
// import UserProfilePage from "./pages/UserProfilePage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAuthedArea = Boolean(user) && !['/auth', '/onboarding'].includes(location.pathname);
  const showBottomNav = isAuthedArea && isMobile;

  const routes = (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/onboarding" element={
        user ? <OnboardingPage /> : <Navigate to="/auth" replace />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create-section" element={
        <ProtectedRoute>
          <CreateSection />
        </ProtectedRoute>
      } />
      <Route path="/section/:sectionId" element={
        <ProtectedRoute>
          <SectionDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/section/:sectionId/students" element={
        <ProtectedRoute>
          <SectionStudentsPage />
        </ProtectedRoute>
      } />
      <Route path="/section/:sectionId/student/:studentId" element={
        <ProtectedRoute>
          <StudentSubjectsPage />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      } />
      {/* Add calculator route for students only */}
      {user?.role === 'student' && (
        <Route path="/calculator" element={
          <ProtectedRoute>
            <GradeCalculatorPage />
          </ProtectedRoute>
        } />
      )}
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <AttendancePage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <ProfilePage viewOnly />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/privacy" element={<DataPrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/section/:sectionId/subjects-ecr" element={
        <ProtectedRoute>
          <SubjectsECRPage />
        </ProtectedRoute>
      } />
      <Route path="/section/:sectionId/subjects-ecr/:subjectId" element={
        <ProtectedRoute>
          <SubjectECRDetailPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  if (isAuthedArea && !isMobile) {
    return (
      <AppSidebarLayout>
        {routes}
      </AppSidebarLayout>
    );
  }

  return (
    <div className="relative">
      {routes}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
