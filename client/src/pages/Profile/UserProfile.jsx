"use client";
import React, { useRef, useState, useEffect } from "react";
import { useUser } from "../../Provider/UserProvider";
import { FaUserEdit, FaLock, FaEnvelope, FaPhone, FaSave } from "react-icons/fa";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import AxiosInstance from "../../components/AxiosInstance";

export default function UserProfile() {
  const { user, refreshUser } = useUser();
  const [userinfo, setUserInfo] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setUserInfo(user);
    }
  }, [user]);

  console.log("User Info:", userinfo);

  // Opens file picker
  const handleEditProfile = () => {
    fileInputRef.current.click();
  };

  // Handles image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setSelectedFile(file);
    }
  };

  // Upload photo
  const handlePhotoUpload = async () => {
    if (!selectedFile) return alert("Please select a photo first!");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profile_picture", selectedFile);

      const res = await AxiosInstance.patch(`user/${userinfo.id}/`, formData);
      setUserInfo(res.data);
      setPreview(null);
      setSelectedFile(null);
      refreshUser(); // update global user context
      alert("✅ Profile photo updated!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update photo");
    } finally {
      setIsUploading(false);
    }
  };

 
  return (
    <div className="max-w-3xl mx-auto my-10 bg-white shadow-md rounded-2xl p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={
              userinfo?.profile_picture
                ? userinfo.profile_picture.startsWith("http")
                  ? userinfo.profile_picture
                  : `https://utshab.com.bd${userinfo.profile_picture}`
                : "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
            }
            alt="User"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-100 shadow-md"
          />

          {/* Edit Icon */}
          <div
            className="absolute right-2 bottom-2 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={handleEditProfile}
            title="Change Profile Picture"
          >
            <FaUserEdit size={16} />
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Save Button */}
          {selectedFile && (
            <button
              onClick={handlePhotoUpload}
              disabled={isUploading}
              className={`mt-1 flex items-center gap-1 bg-green-600 text-sm text-white px-1 py-1 rounded-lg hover:bg-green-700 transition-colors ${
                isUploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FaSave />
              {isUploading ? "Uploading..." : "Save Photo"}
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">{userinfo?.username || "User"}</h2>
          <p className="text-sm text-gray-500 capitalize">{userinfo?.role || "Member"}</p>

          <div className="mt-4 space-y-3 text-gray-700">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-600" />
              <span>{userinfo?.email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-blue-600" />
              <span>{userinfo?.phone || "No phone provided"}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaUserEdit /> Edit Info
            </button>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaLock /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        user={userinfo} 
        setUserInfo = {setUserInfo}
      />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}