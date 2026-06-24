import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Organizer
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Bookings from "./pages/Bookings";
import DesignLayout from "./pages/DesignLayout";
import Vendors from "./pages/Vendors";
import Guests from "./pages/Guests";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";

// Staff
import StaffDashboard from "./pages/staff/StaffDashboard";
import MyTasks from "./pages/staff/MyTasks";
import CheckIn from "./pages/staff/CheckIn";
import VendorArrivals from "./pages/staff/VendorArrivals";
import FloorPlan from "./pages/staff/FloorPlan";

// Vendor
import VendorSourcing from "./pages/vendor/VendorSourcing";
import VendorInvoices from "./pages/vendor/VendorInvoices";
import Profile from "./pages/Profile";

// Guest
import MyInvitations from "./pages/guest/MyInvitations";
import GuestNotifications from "./pages/guest/GuestNotifications";
import GuestFeedback from "./pages/guest/GuestFeedback";

// Venue Owner
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MyListings from "./pages/owner/MyListings";
import BookingRequests from "./pages/owner/BookingRequests";

// Sends each role to its own home page
function Home() {
  const { user } = useAuth();
  const homes = {
    organizer: "/dashboard",
    staff: "/staff",
    vendor: "/sourcing",
    guest: "/invitations",
    venueOwner: "/owner",
  };
  return <Navigate to={homes[user.role] || "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Organizer */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/design-layout" element={<DesignLayout />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/team" element={<Team />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/messages" element={<Messages />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/vendor-arrivals" element={<VendorArrivals />} />
          <Route path="/floor-plan" element={<FloorPlan />} />

          {/* Vendor */}
          <Route path="/sourcing" element={<VendorSourcing />} />
          <Route path="/invoices" element={<VendorInvoices />} />
          <Route path="/profile" element={<Profile />} />

          {/* Guest */}
          <Route path="/invitations" element={<MyInvitations />} />
          <Route path="/notifications" element={<GuestNotifications />} />
          <Route path="/feedback" element={<GuestFeedback />} />

          {/* Venue Owner */}
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/listings" element={<MyListings />} />
          <Route path="/booking-requests" element={<BookingRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
