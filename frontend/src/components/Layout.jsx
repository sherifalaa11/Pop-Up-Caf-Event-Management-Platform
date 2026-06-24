import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth";

const ROLE_LABEL = {
  organizer: "Event Organizer",
  staff: "Team Member",
  vendor: "Vendor",
  guest: "Guest",
  venueOwner: "Venue Owner",
};

// Shell for all signed-in pages: sidebar + top bar + page content.
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="title">Pop-Up Café Event Management</div>
          <div className="row">
            <span className="muted small">
              {user.name} · {ROLE_LABEL[user.role]}
            </span>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
