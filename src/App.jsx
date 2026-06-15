import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Venues from "./pages/Venues";
import VenueDetails from "./pages/VenueDetails";
import Guests from "./pages/Guests";
import Vendors from "./pages/Vendors";
import Tasks from "./pages/Tasks";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";

function Navbar() {
  return (
    <nav
      style={{
        padding: "15px",
        backgroundColor: "#f0f0f0",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
      }}
    >
      <Link to="/">Dashboard</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/events">Events</Link>
      <Link to="/venues">Venues</Link>
      <Link to="/guests">Guests</Link>
      <Link to="/vendors">Vendors</Link>
      <Link to="/tasks">Tasks</Link>
      <Link to="/budget">Budget</Link>
      <Link to="/reports">Reports</Link>
    </nav>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />

        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueDetails />} />

        <Route path="/guests" element={<Guests />} />
        <Route path="/vendors" element={<Vendors />} />

        <Route path="/tasks" element={<Tasks />} />

        <Route path="/budget" element={<Budget />} />

        <Route path="/reports" element={<Reports />} />
      </Routes>
    </>
  );
}

export default App;