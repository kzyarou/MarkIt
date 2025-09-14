import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DraftsProvider } from '@/contexts/DraftsContext';
import { BottomNavigation } from "@/components/BottomNavigation";
import { MobileHeader } from "@/components/MobileHeader";
import { useBottomNav } from '@/hooks/use-mobile';
import { UpdateNotification } from '@/components/UpdateNotification';
import { UpdateBanner } from '@/components/UpdateBanner';
import ScrollToTop from "@/components/ScrollToTop";
import { AppSidebarLayout } from "@/components/AppSidebar";
// MarkIt - Fisherfolk and Farmer Price Guarantee App
import Dashboard from "./pages/Dashboard";
import MyDashboard from "./pages/MyDashboard";
import CreateHarvest from "./pages/CreateHarvest";
import EditHarvest from "./pages/EditHarvest";
import HarvestDetailsPage from "./pages/HarvestDetailsPage";
import MyHarvestsPage from "./pages/MyHarvestsPage";
import MarketplacePage from './pages/MarketplacePage';
import SearchPage from './pages/SearchPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import SettingsPage from './pages/SettingsPage';
import PriceGuaranteePage from './pages/PriceGuaranteePage';
import PriceGuaranteeDetailPage from './pages/PriceGuaranteeDetailPage';
import FAQPage from './pages/FAQPage';
import DataPrivacyPage from './pages/DataPrivacyPage';
import TermsPage from './pages/TermsPage';
import HelpPage from './pages/HelpPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PriceCalculatorPage from './pages/PriceCalculatorPage';
import AdminPage from './pages/AdminPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';

import { getSections } from '@/services/gradesService';
import { loadDraft } from '@/utils/localDrafts';
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from '@capacitor/core';
import { usePresence } from '@/hooks/usePresence';
import EnforcementGate from '@/components/EnforcementGate';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

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

  // Presence updates for logged-in users
  usePresence();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAuthedArea = Boolean(user) && !['/auth', '/onboarding'].includes(location.pathname);
  const showBottomNav = isAuthedArea && isMobile;
  const showMobileHeader = isAuthedArea && isMobile;

  const routes = (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/onboarding" element={
        user ? <OnboardingPage /> : <Navigate to="/auth" replace />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
              <Dashboard />
            </RoleProtectedRoute>
          )}
        </ProtectedRoute>
      } />
      <Route path="/mydashboard" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
              <MyDashboard />
            </RoleProtectedRoute>
          )}
        </ProtectedRoute>
      } />
      <Route path="/create-harvest" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <RoleProtectedRoute allowedRoles={['farmer', 'fisherman']}>
              <CreateHarvest />
            </RoleProtectedRoute>
          )}
        </ProtectedRoute>
      } />
      <Route path="/harvest/:harvestId" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
          <HarvestDetailsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/harvest/:harvestId/edit" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman']}>
          <EditHarvest />
        </RoleProtectedRoute>
      } />
      <Route path="/my-harvests" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman']}>
          <MyHarvestsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/marketplace" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
          <MarketplacePage />
        </RoleProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
              <TransactionsPage />
            </RoleProtectedRoute>
          )}
        </ProtectedRoute>
      } />
      <Route path="/price-guarantee" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
          <PriceGuaranteePage />
        </RoleProtectedRoute>
      } />
      <Route path="/price-guarantee/:category/:subcategory" element={
        <RoleProtectedRoute allowedRoles={['farmer', 'fisherman', 'buyer']}>
          <PriceGuaranteeDetailPage />
        </RoleProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />}
        </ProtectedRoute>
      } />
      {/* Add price calculator route for farmers/fishermen */}
      {(user?.role === 'farmer' || user?.role === 'fisherman') && (
        <Route path="/price-calculator" element={
          <ProtectedRoute>
            <PriceCalculatorPage />
          </ProtectedRoute>
        } />
      )}
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
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
      <Route path="/help" element={<HelpPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
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
      {showMobileHeader && <MobileHeader />}
      <div className={showMobileHeader ? "pt-16" : ""}>
        {routes}
      </div>
      {Boolean(user) && <EnforcementGate />}
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
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
            <ScrollToTop />
            {process.env.NODE_ENV !== 'development' && <UpdateBanner />}
            <AppRoutes />
            {process.env.NODE_ENV !== 'development' && <UpdateNotification />}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
