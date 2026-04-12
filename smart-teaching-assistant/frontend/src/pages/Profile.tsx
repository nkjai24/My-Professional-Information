import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { Button } from "../components/ui/button";
import { toast } from "@/components/ui/use-toast";

const API = "http://localhost:8000";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* =========================
     HELPER — BUILD PHOTO URL
  ========================= */

  const buildPhotoUrl = (path?: string) => {
    if (!path) return null;

    // ✅ FIX: handle Google image URLs
    if (path.startsWith("http")) {
      return path;
    }

    if (path.startsWith("/")) {
      return `${API}${path}?t=${Date.now()}`;
    }

    return `${API}/${path}?t=${Date.now()}`;
  };

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);

        setUser(parsed);

        if (parsed.photo) {
          setPhoto(buildPhotoUrl(parsed.photo));
        }
      }
    } catch {
      setUser({});
    }
  }, []);

  /* =========================
     UPLOAD PHOTO
  ========================= */

  const handleUpload = async (file: File) => {
    if (!file) return;

    // ✅ FIX: always fetch latest token
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please login again",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/auth/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ correct
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Upload failed",
          description: data.detail || "Error uploading photo",
          variant: "destructive",
        });
        return;
      }

      const updatedUser = {
        ...user,
        photo: data.photo,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setPhoto(buildPhotoUrl(data.photo));

      toast({
        title: "Photo updated",
        description: "Profile photo uploaded successfully",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch {
      toast({
        title: "Error",
        description: "Server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

    toast({
      title: "Logged out",
      description: "You have been logged out",
    });
  };

  /* =========================
     UI
  ========================= */

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full ${isDarkMode ? "dark" : ""}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <div className="flex w-full">
          <AppSidebar />

          <main className="flex-1 p-6 space-y-6">
            <div className="max-w-xl mx-auto bg-white dark:bg-muted p-6 rounded-xl shadow">

              <h1 className="text-2xl font-bold mb-6">
                Profile
              </h1>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">

                {photo ? (
                  <img
                    src={photo}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUpload(e.target.files[0]);
                    }
                  }}
                />

                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {loading ? "Uploading..." : "Change Photo"}
                </Button>

              </div>

              <div className="mt-6 space-y-3">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Name
                  </p>
                  <p className="font-medium">
                    {user?.name || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium">
                    {user?.email || ""}
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;