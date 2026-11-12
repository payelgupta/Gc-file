import { NavLink } from "react-router-dom";
import { Home, BookOpen, Award, Bell, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "হোম" },
  { to: "/category/ssc", icon: BookOpen, label: "ক্লাস" },
  { to: "/results", icon: Award, label: "রেজাল্ট" },
  { to: "/notice", icon: Bell, label: "নোটিশ" },
  { to: "/login", icon: User, label: "অ্যাকাউন্ট" },
];

const MobileBottomNav = () => (
  <>
    <div className="h-16 md:hidden" />
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080A12]/95 backdrop-blur-xl md:hidden font-bengali">
      <div className="grid grid-cols-5">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${isActive ? "text-[#F5C76A]" : "text-muted-foreground hover:text-white"}`}>
            <Icon className="h-5 w-5" />{label}
          </NavLink>
        ))}
      </div>
    </nav>
  </>
);
export default MobileBottomNav;
