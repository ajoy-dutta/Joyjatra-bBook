import React, { useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";


export default function ChangePasswordModal({ isOpen, onClose }) {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (passwordData.new_password !== passwordData.confirm_password) {
    alert("❌ Passwords do not match!");
    return;
  }

  if (passwordData.new_password.length < 6) {
    alert("❌ Passwords must be at least 6 characters long!");
    return;
  }
  
  try {
    await AxiosInstance.post("change-password/",passwordData);

    alert("✅ Password updated successfully!");
    onClose(); // close modal
    setPasswordData({ current_password: "", new_password: "", confirm_password: "" }); // reset form
  } catch (err) {
    console.error("Password change error:", err);
    alert(
      err.response?.data?.detail || 
      "❌ Failed to update password. Please try again."
    );
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Old Password</label>
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}