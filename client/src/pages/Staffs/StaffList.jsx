import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { Link } from "react-router-dom";


export default function StaffList() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await AxiosInstance.get("staffs/");
      setStaffs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      if (isActive) {
        await AxiosInstance.delete(`staffs/${id}/`);
      } else {
        await AxiosInstance.post(`staffs/${id}/activate/`);
      }
      fetchStaffs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/add-staff/edit/${id}`)
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 font-serif">
      <h1 className="text-xl font-bold mb-4">Staff List</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Username</th>
            <th className="border px-2 py-1">Full Name</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Active</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff) => (
            <tr key={staff.id}>
              <td className="border px-2 text-center">{staff.id}</td>
              <td className="border px-2">{staff.user.username}</td>
              <td className="border px-2">{staff.name}</td>
              <td className="border px-2 text-center">{staff.user.role}</td>
              <td
                className={`border px-2 font-semibold text-center ${
                    staff.user.is_active ? "text-green-600" : "text-red-500"
                }`}
                >
                {staff.user.is_active ? "Active" : "Inactive"}
              </td>
              <td className="border px-2 flex gap-2 py-1 items-center justify-center">
                <button
                  onClick={() => toggleActive(staff.id, staff.user.is_active)}
                  className="px-2 bg-blue-500 text-white rounded cursor-pointer"
                >
                  {staff.user.is_active ? "Deactivate" : "Activate"}
                </button>

                <Link
                    to={`/dashboard/add-staff/edit/${staff.id}`}
                    className="px-2 bg-green-500 text-white rounded cursor-pointer"
                    >
                   Edit
                </Link>
               
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}