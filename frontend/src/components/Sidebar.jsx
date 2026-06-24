import { NavLink } from "react-router-dom";
import { useAuth } from "../auth";
import Icon from "./Icon";

const NAV = {
  organizer: [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/events", label: "Events", icon: "events" },
    { to: "/design-layout", label: "Venue Layout", icon: "floorplan" },
    { to: "/venues", label: "Venues", icon: "venue" },
    { to: "/bookings", label: "Bookings", icon: "booking" },
    { to: "/vendors", label: "Vendors", icon: "truck" },
    { to: "/guests", label: "Guests", icon: "guest" },
    { to: "/team", label: "Team", icon: "team" },
    { to: "/reports", label: "Reports", icon: "reports" },
    { to: "/messages", label: "Messages", icon: "messages" },
    { to: "/profile", label: "My Account", icon: "profile" },
  ],
  staff: [
    { to: "/staff", label: "Dashboard", icon: "dashboard" },
    { to: "/my-tasks", label: "My Tasks", icon: "tasks" },
    { to: "/check-in", label: "Guest Check-In", icon: "checkin" },
    { to: "/vendor-arrivals", label: "Vendor Arrivals", icon: "truck" },
    { to: "/floor-plan", label: "Floor Plan", icon: "floorplan" },
    { to: "/profile", label: "My Account", icon: "profile" },
  ],
  vendor: [
    { to: "/sourcing", label: "Sourcing Requests", icon: "package" },
    { to: "/invoices", label: "Invoices", icon: "invoice" },
    { to: "/messages", label: "Messages", icon: "messages" },
    { to: "/profile", label: "My Profile", icon: "profile" },
  ],
  guest: [
    { to: "/invitations", label: "My Invitations", icon: "mail" },
    { to: "/notifications", label: "Notifications", icon: "bell" },
    { to: "/feedback", label: "Feedback", icon: "star" },
    { to: "/profile", label: "My Account", icon: "profile" },
  ],
  venueOwner: [
    { to: "/owner", label: "Dashboard", icon: "dashboard" },
    { to: "/listings", label: "My Listings", icon: "venue" },
    { to: "/booking-requests", label: "Booking Requests", icon: "booking" },
    { to: "/profile", label: "My Account", icon: "profile" },
  ],
};

const ROLE_LABEL = {
  organizer: "Event Organizer",
  staff: "Team Member",
  vendor: "Vendor",
  guest: "Guest",
  venueOwner: "Venue Owner",
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = NAV[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo"><Icon name="coffee" size={22} /></span>
        <span>Pop<span className="accent">Eyez</span></span>
      </div>
      <div className="role-tag">{ROLE_LABEL[user.role]}</div>
      <nav className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="ico"><Icon name={l.icon} size={18} /></span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <b>{user.name}</b>
          {user.email}
        </div>
      </div>
    </aside>
  );
}
