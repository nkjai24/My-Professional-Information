import {
  Mic,
  Zap,
  Settings,
  Home,
  Menu,
  User,
  LogOut,
  Shield
} from "lucide-react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

/* =========================
   TYPES
========================= */

type AppUser = {
  name?: string;
  email?: string;
  role?: string;
  photo?: string;
};

/* =========================
   NAV ITEMS
========================= */

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Voice", url: "/voice", icon: Mic },
  { title: "Actions", url: "/actions", icon: Zap },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Profile", url: "/profile", icon: User },
];

const API = "http://localhost:8000";

/* =========================
   COMPONENT
========================= */

export function AppSidebar() {

  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  /* =========================
     USER STATE
  ========================= */

  const [user, setUser] = useState<AppUser>({});

  useEffect(() => {

    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : {});
      } catch {
        setUser({});
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };

  }, []);

  /* =========================
     PHOTO
  ========================= */

  const photoUrl =
    user?.photo ? `${API}/${user.photo}` : null;

  /* =========================
     INITIALS
  ========================= */

  const getInitials = (name?: string) => {

    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  /* =========================
     ACTIVE STYLE
  ========================= */

  const isActive = (path: string) => currentPath === path;

  const getNavCls = (active: boolean) =>
    active
      ? "bg-primary/10 text-primary border-l-2 border-primary"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* =========================
     UI
  ========================= */

  return (
    <Sidebar
      className="glass-card border-r border-border/50"
      collapsible="icon"
    >
      <SidebarContent className="p-4">

        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* USER HEADER */}
        {!collapsed && (
          <div className="mb-4 px-2">
            <div className="flex items-center gap-3 bg-muted rounded-lg p-3">

              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow">
                  {getInitials(user?.name || user?.email)}
                </div>
              )}

              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {user?.name ?? "User"}
                </span>

                <span className="text-xs text-muted-foreground truncate">
                  {user?.email ?? ""}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <SidebarGroup>

          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>

            <SidebarMenu className="space-y-2">

              {items.map((item, index) => {

                const active = isActive(item.url);

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >

                    <SidebarMenuButton asChild>

                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover-bounce ${getNavCls(active)}`}
                      >

                        <item.icon className="h-5 w-5" />

                        {!collapsed && (
                          <span className="font-medium">
                            {item.title}
                          </span>
                        )}

                      </NavLink>

                    </SidebarMenuButton>

                  </SidebarMenuItem>
                );
              })}

              {/* ADMIN BUTTON */}
              {user?.role === "admin" && (

                <SidebarMenuItem>

                  <SidebarMenuButton asChild>

                    <NavLink
                      to="/admin"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${getNavCls(isActive("/admin"))}`}
                    >

                      <Shield className="h-5 w-5" />

                      {!collapsed && <span>Admin</span>}

                    </NavLink>

                  </SidebarMenuButton>

                </SidebarMenuItem>

              )}

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>

        {/* LOGOUT */}
        <div className="mt-auto pt-6">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-red-50 text-red-500 transition"
          >

            <LogOut className="h-5 w-5" />

            {!collapsed && <span>Logout</span>}

          </button>

        </div>

      </SidebarContent>
    </Sidebar>
  );
}