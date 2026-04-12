import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API = "http://localhost:8000";

const COLORS = ["#6366F1", "#EF4444"];

export default function Admin() {

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  const fetchData = async () => {
    try {

      const statsRes = await fetch(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const usersRes = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
      }

      setLoading(false);

    } catch (error) {
      console.error("Admin fetch error:", error);
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, []);

  const deleteUser = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`${API}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchData();
  };

  const chartData = stats
    ? [
        { name: "Users", value: stats.total_users - stats.total_admins },
        { name: "Admins", value: stats.total_admins }
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

            <div className="p-4 bg-white rounded shadow">
              <p className="text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.total_users}</p>
            </div>

            <div className="p-4 bg-white rounded shadow">
              <p className="text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold">{stats.total_admins}</p>
            </div>

          </div>

          <div className="bg-white rounded shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">
              User Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4">
        All Users
      </h2>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(users) &&
              users.map((u) => (
                <tr key={u.id} className="border-t">

                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>

                  <td className="p-3">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>

                </tr>
              ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}