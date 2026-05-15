import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "@/store/AppStore";
import { Shell } from "@/components/Shell";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { StudioPublicPage } from "@/pages/StudioPublicPage";
import { LocationPublicPage } from "@/pages/LocationPublicPage";
import { EquipmentPublicPage } from "@/pages/EquipmentPublicPage";
import { OwnerDashboard } from "@/pages/owner/OwnerDashboard";
import { StudioEditPage } from "@/pages/owner/StudioEditPage";
import { LocationsManagePage } from "@/pages/owner/LocationsManagePage";
import { LocationEditPage } from "@/pages/owner/LocationEditPage";
import { EquipmentManagePage } from "@/pages/owner/EquipmentManagePage";
import { EquipmentEditPage } from "@/pages/owner/EquipmentEditPage";
import { CategoriesPage } from "@/pages/owner/CategoriesPage";
import { ClosuresPage } from "@/pages/owner/ClosuresPage";
import { AnalyticsPage } from "@/pages/owner/AnalyticsPage";
import { MyBookingsPage } from "@/pages/renter/MyBookingsPage";

function RequireOwner({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "owner") return <Navigate to="/me" replace />;
  return <>{children}</>;
}

function RequireRenter({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "renter") return <Navigate to="/owner" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/s/:slug" element={<StudioPublicPage />} />
        <Route path="/location/:id" element={<LocationPublicPage />} />
        <Route path="/equipment/:id" element={<EquipmentPublicPage />} />

        <Route
          path="/owner"
          element={
            <RequireOwner>
              <OwnerDashboard />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/studio/:id"
          element={
            <RequireOwner>
              <StudioEditPage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/studio/:sid/locations"
          element={
            <RequireOwner>
              <LocationsManagePage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/studio/:sid/location/:lid"
          element={
            <RequireOwner>
              <LocationEditPage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/studio/:sid/equipment"
          element={
            <RequireOwner>
              <EquipmentManagePage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/studio/:sid/equipment/:eid"
          element={
            <RequireOwner>
              <EquipmentEditPage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/categories"
          element={
            <RequireOwner>
              <CategoriesPage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/closures"
          element={
            <RequireOwner>
              <ClosuresPage />
            </RequireOwner>
          }
        />
        <Route
          path="/owner/analytics"
          element={
            <RequireOwner>
              <AnalyticsPage />
            </RequireOwner>
          }
        />

        <Route
          path="/me"
          element={
            <RequireRenter>
              <MyBookingsPage />
            </RequireRenter>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
