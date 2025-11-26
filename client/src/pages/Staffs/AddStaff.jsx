import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import AxiosInstance from "../../components/AxiosInstance";
import "react-toastify/dist/ReactToastify.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";


export default function AddStaff() {
  const capitalizeAll = (str) => {
    return str.toUpperCase();
  };

  const { id } = useParams();

  
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [years, setYears] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [idType, setIdType] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [students, setStudents] = useState([]);
  const [boards, setBoards] = useState([]);
   
  useEffect(() => {
    const academic_years = [];
    for (let i = 1950; i <= 2100; i++) {
      academic_years.push(i);
    }
    setYears(academic_years);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    username:"",
    password:"",
    confirm_password:"",
    role:"staff",
    father_name: "",
    father_name_bn: "",
    father_occupation: "",
    father_company: "",
    father_email: "",
    father_facebook: "",
    father_whatsapp: "",
    mother_company: "",
    mother_email: "",
    mother_facebook: "",
    mother_whatsapp: "",
    mother_name: "",
    mother_name_bn: "",
    mother_occupation: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    image: null,
    nationality: "",
    blood_group: "",
    mobile_self: "",
    mobile_father: "",
    mobile_mother: "",
    mobile_others: "",
    email: "",
    facebook_link: "",
    whatsapp_number: "",
    present_house_no: "",
    present_village: "",
    present_post_office: "",
    present_post_code: "",
    present_upazila: "",
    present_district: "",
    permanent_house_no: "",
    permanent_village: "",
    permanent_post_office: "",
    permanent_post_code: "",
    permanent_upazila: "",
    permanent_district: "",
    nid_birth_registration_no: "",
    exam_records: [],
    remarks: [],
    job_info: [],
    reference: "",
    co_activities: "",
  });


  const initialFormData = {
    name: "",
    name_bn: "",
    username:"",
    password:"",
    confirm_password:"",
    role:"staff",
    father_name: "",
    father_name_bn: "",
    father_occupation: "",
    father_company: "",
    father_email: "",
    father_facebook: "",
    father_whatsapp: "",
    mother_company: "",
    mother_email: "",
    mother_facebook: "",
    mother_whatsapp: "",
    mother_name: "",
    mother_name_bn: "",
    mother_occupation: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    image: null,
    nationality: "",
    blood_group: "",
    mobile_self: "",
    mobile_father: "",
    mobile_mother: "",
    mobile_others: "",
    email: "",
    facebook_link: "",
    whatsapp_number: "",
    present_house_no: "",
    present_village: "",
    present_post_office: "",
    present_post_code: "",
    present_upazila: "",
    present_district: "",
    permanent_house_no: "",
    permanent_village: "",
    permanent_post_office: "",
    permanent_post_code: "",
    permanent_upazila: "",
    permanent_district: "",
    course_fee: 0,
    registration_fee: 0,
    center_fee: 0,
    nid_birth_registration_no: "",
    exam_records: [],
    remarks: [],
    job_info: [],
    reference: "",
    co_activities: "",
  };


  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await AxiosInstance.get("boards/");
        setBoards(response.data);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };
    fetchBoards();
  }, []);



  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submit
      const form = e.target.form; // get current form
      const index = Array.prototype.indexOf.call(form, e.target);
      if (form.elements[index + 1]) {
        form.elements[index + 1].focus(); // focus next field
      }
    }
  };


   const handleDateInput = (e) => {
    const { name, value } = e.target;

    let v = value.replace(/\D/g, ""); 
    if (v.length > 8) v = v.slice(0, 8);

    // Add slashes automatically: DD/MM/YYYY
    if (v.length > 4) {
      v = v.replace(/^(\d{2})(\d{2})(\d{1,4})$/, "$1/$2/$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{1,2})$/, "$1/$2");
    }

    setFormData((prev) => ({ ...prev, [name]: v }));
  };


  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsPresent(isChecked);

    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        permanent_house_no: prev.present_house_no,
        permanent_village: prev.present_village,
        permanent_post_office: prev.present_post_office,
        permanent_post_code: prev.present_post_code,
        permanent_upazila: prev.present_upazila,
        permanent_district: prev.present_district,
      }));
    }
  };
  const handleTimeChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      time: value,
    }));
  };

  const [examInfo, setExamInfo] = useState({
      exam_name: "",
      roll_number: "",
      registration_number: "",
      year_of_passing: "",
      gpa_cgpa: "",
      institution_name: "",
      group: "",
      board: "",
    });

  const [remarksInfo, setRemarksInfo] = useState({
    remarks: "",
    step: "",
    result: "",
  });

  const [jobInfo, setJobInfo] = useState({
    title: "",
    company: "",
    location: "",
    duration: "",
    remarks: "",
  });


  const [examRecords, setExamRecords] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const exams = ["PSC", "JSC", "JDC","SSC","Diploma","HSC", "Hon's", "Masters"];

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    const skipCapitalization = [
      "email",
      "father_email",
      "mother_email",
      "facebook_link",
      "father_facebook",
      "mother_facebook",
      "whatsapp_number",
      "father_whatsapp",
      "mother_whatsapp",
      "nid_birth_registration_no",
    ];

    let processedValue = value;

    if (type === "text" && !skipCapitalization.includes(name) && isNaN(value)) {
      processedValue = capitalizeAll(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "file"
          ? files[0]
          : type === "checkbox"
            ? checked
            : processedValue,
    }));
  };



  const handleAddExam = () => {
    if (!selectedExam) return;

    const newRecord = {
      ...examInfo,
      exam_name: selectedExam,
    };

    setExamRecords((prev) => [...prev, newRecord]);
    setSelectedExam("");
    setExamInfo({}); 
  };


  const handleExamChange = (e) => {
    const { name, value, type } = e.target;

    const skipCapitalization = [
      "roll_number",
      "registration_number",
      "year_of_passing",
      "gpa_cgpa",
    ];
    let processedValue = value;

    if (type === "text" && !skipCapitalization.includes(name) && isNaN(value)) {
      processedValue = capitalizeAll(value);
    }
    setExamInfo((prevInfo) => ({
      ...prevInfo,
      [name]: processedValue,
    }));
  };

  const handleRemove = (index) => {
    const updated = [...examRecords];
    updated.splice(index, 1);
    setExamRecords(updated);
  };

  const handleRemarkChange = (e) => {
    const { name, value } = e.target;
    setRemarksInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

   // add remark into formData
  const addRemark = () => {
    if (
      remarksInfo.remarks.trim() === "" &&
      remarksInfo.step.trim() === "" &&
      remarksInfo.result.trim() === ""
    ) {
      return;
    }

    console.log("remarksInfo", remarksInfo)

    setFormData((prev) => ({
      ...prev,
      remarks: [...prev.remarks, remarksInfo],
    }));

    setRemarksInfo({
      remarks: "",
      step: "",
      result: "",
    });
  };


  const removeRemark = (index) => { 
    const updatedRemarks = [...formData.remarks];
    updatedRemarks.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      remarks: updatedRemarks,
    }));
  }


  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const addJob = () => {
    if (
      jobInfo.title.trim() === "" &&
      jobInfo.company.trim() === "" &&
      jobInfo.location.trim() === "" &&
      jobInfo.duration.trim() === "" &&
      jobInfo.remarks.trim() === "") 
      {
      return;
      }
    setFormData((prev) => ({
      ...prev,
      job_info: [...prev.job_info, jobInfo],
    }));
    setJobInfo({
      title: "",
      company: "",
      location: "",
      duration: "",
      remarks: "",
    });
  };


  const removeJob = (index) => {
    const updatedJobs = [...formData.job_info];
    updatedJobs.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      job_info: updatedJobs,
    }));
  };



   useEffect(() => {
      if (id) {
        setIsEdit(true);
        const fetchStaff = async () => {
          try {
            const response = await AxiosInstance.get(`staffs/${id}/`);
            const staffData = response.data;
            console.log("Fetched staff data:", staffData);
            setFormData({
              ...staffData,
              date_of_birth: formatDateShow(staffData.date_of_birth),
              image: null,
              username: staffData.user.username,
              password: "",
              confirm_password: "",
              role: staffData.user.role,
            });
            setIdType(staffData.id_type || "");
            setExamRecords(staffData.exam_records || []);
  
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        };
        fetchStaff();
      }
    }, [id]);


 const formatDateShow = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- Validate required fields ---
      if (
        !formData.name ||
        !formData.date_of_birth ||
        !formData.username ||
        !formData.password ||
        !formData.confirm_password ||
        !formData.role
      ) {
        toast.error("Please fill up required fields.");
        return;
      }

      console.log("Submitting formData:", formData);

      // --- Prepare FormData ---
      const formDataToSend = new FormData();

     for (let key in formData) {
        if (key === "exam_records") continue;
        if (key === "date_of_birth" && formData[key]) {
          formDataToSend.append(key, formatDate(formData[key]) || "");

        } else if (key === "remarks") {
          formDataToSend.append(key, JSON.stringify(formData[key] || ""));

        } else if (formData[key] != null) {
          formDataToSend.append(key, formData[key]);
        }
      }


     if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      formDataToSend.append("exam_records", JSON.stringify(examRecords));
      formDataToSend.append("job_info", JSON.stringify(formData.job_info || []));

      if (!formData.time) {
        formDataToSend.delete("time");
      }

     
      let response;

      if (id) {
        // --- UPDATE
        response = await AxiosInstance.put(`staffs/${id}/`, formDataToSend);
        toast.success("Form updated successfully!");
        setStudents((prev) =>
          prev.map((student) =>
            student.id === id ? response.data : student
          )
        );
      } else {
        // --- CREATE
        response = await AxiosInstance.post(`staffs/`, formDataToSend);
        toast.success("Form submitted successfully!");
      }

      setFormData(initialFormData);
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.roll_no
          ? "This Utshab Reg. No is already in use."
          : "Failed to submit form."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

    <div className="max-w-4xl mx-auto px-6 py-4 text-sm shadow-2xl rounded-sm border border-[#002A32] ">
      <ToastContainer position="top-right" autoClose={1000} />
      <h1 className="text-2xl text-center text-[#002A32] font-semibold mb-8">
        {isEdit ? "Update Staff Form" : "Staff Form"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            {/* Student Name Bangla */}
            <div>
              <label className="font-semibold">নাম (বাংলায়)</label>
              <span className="ml-1 text-red-500">*</span>
              <input
                name="name_bn"
                value={formData.name_bn || ""}
                placeholder="Enter Student Name (বাংলায়)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Father Name Bangla */}
            <div>
              <label className="font-semibold">পিতার নাম (বাংলায়)</label>
              <input
                name="father_name_bn"
                value={formData.father_name_bn || ""}
                placeholder="Enter Father's Name (বাংলায়)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Mother Name Bangla */}
            <div>
              <label className="font-semibold">মাতার নাম (বাংলায়)</label>
              <input
                name="mother_name_bn"
                value={formData.mother_name_bn || ""}
                placeholder="Enter Mother's Name (বাংলায়)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

          </div>

          <div className="space-y-1">
            {/* Student Name */}
            <div>
              <label className="font-semibold">Name (English)</label>
              <span className="ml-1 text-red-500">*</span>
              <input
                name="name"
                value={formData.name || ""}
                placeholder="Enter Student Name"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Father Name */}
            <div>
              <label className="font-semibold">Father's Name (English)</label>
              <input
                name="father_name"
                value={formData.father_name || ""}
                placeholder="Enter Father's Name"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Mother Name */}
            <div>
              <label className="font-semibold">Mother's Name (English)</label>
              <input
                name="mother_name"
                value={formData.mother_name || ""}
                placeholder="Enter Mother's Name"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

          </div> 

        </div>         
            

        <div className="grid grid-cols-2 gap-3">

          <div>
              <label className="font-semibold">Username</label>
              <span className="ml-1 text-red-500">*</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
                required
              />
            </div>


            {/* Role (read-only or selectable) */}
            <div>
              <label className="font-semibold">
                Role <span className="ml-1 text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="border rounded-md px-2 py-1 w-full text-sm"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="general">General</option>
                <option value="staff">Staff</option>
              </select>
            </div>


            {/* Password */}
            <div>
              <label className="font-semibold">Password</label>
              <span className="ml-1 text-red-500">*</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-semibold">Confirm Password</label>
              <span className="ml-1 text-red-500">*</span>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
                required
              />
            </div>

            

            {/* Father's Extra Info */}
            <div>
              <label className="font-semibold">Father's Occupation</label>
              <input
                name="father_occupation"
                value={formData.father_occupation || ""}
                placeholder="Enter Father's Occupation"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Company Name (Father)</label>
              <input
                name="father_company"
                value={formData.father_company || ""}
                placeholder="Enter Father's Company"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Father's Email</label>
              <input
                name="father_email"
                value={formData.father_email || ""}
                placeholder="Enter Father's Email"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Father's Facebook</label>
              <input
                name="father_facebook"
                value={formData.father_facebook || ""}
                placeholder="Enter Father's Facebook"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Father's WhatsApp</label>
              <input
                name="father_whatsapp"
                value={formData.father_whatsapp || ""}
                placeholder="Enter Father's WhatsApp"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Mother's Extra Info */}
            <div>
              <label className="font-semibold">Mother's Occupation</label>
              <input
                name="mother_occupation"
                value={formData.mother_occupation || ""}
                placeholder="Enter Mother's Occupation"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Company Name (Mother)</label>
              <input
                name="mother_company"
                value={formData.mother_company || ""}
                placeholder="Enter Mother's Company"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Mother's Email</label>
              <input
                name="mother_email"
                value={formData.mother_email || ""}
                placeholder="Enter Mother's Email"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Mother's Facebook</label>
              <input
                name="mother_facebook"
                value={formData.mother_facebook || ""}
                placeholder="Enter Mother's Facebook"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="font-semibold">Mother's WhatsApp</label>
              <input
                name="mother_whatsapp"
                value={formData.mother_whatsapp || ""}
                placeholder="Enter Mother's WhatsApp"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
            </div>
        </div>


        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold">Present Address:</label>
            <input
              name="present_house_no"
              value={formData.present_house_no || ""}
              placeholder="House No."
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border mt-1 rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="present_village"
              value={formData.present_village || ""}
              placeholder="Village/Road"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="present_post_office"
              value={formData.present_post_office || ""}
              placeholder="Post"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="present_post_code"
              value={formData.present_post_code || ""}
              placeholder="Post Code"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="present_upazila"
              value={formData.present_upazila || ""}
              placeholder="Upazila"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="present_district"
              value={formData.present_district || ""}
              placeholder="District"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center font-semibold gap-2">
              Permanent Address:
              <input
                type="checkbox"
                checked={sameAsPresent}
                onChange={handleCheckboxChange}
                onKeyDown={handleKeyDown}
              />
              <span className="text-sm">Same as Present Address</span>
            </label>

            <input
              name="permanent_house_no"
              value={formData.permanent_house_no || ""}
              placeholder="House No."
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="permanent_village"
              value={formData.permanent_village || ""}
              placeholder="Village/Road"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="permanent_post_office"
              value={formData.permanent_post_office || ""}
              placeholder="Post"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="permanent_post_code"
              value={formData.permanent_post_code || ""}
              placeholder="Post Code"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="permanent_upazila"
              value={formData.permanent_upazila || ""}
              placeholder="Upazila"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
            <input
              name="permanent_district"
              value={formData.permanent_district || ""}
              placeholder="District"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="font-semibold">Nationality:</label>
            <input
              name="nationality"
              value={formData.nationality || ""}
              placeholder="Enter nationality"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="font-semibold">Date of Birth:</label>
            <span className="ml-1 text-red-500">*</span>

            <input
              type="text"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleDateInput}
              onKeyDown={handleKeyDown}
              placeholder="DD/MM/YYYY"
              className="border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="font-semibold">Religion:</label>
            <select
              name="religion"
              value={formData.religion || ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-[#002A32] text-white border rounded-md px-2 py-[6px] w-full text-sm"
            >
              <option value="">-- Select Religion --</option>
              <option value="Islam">Islam</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Christianity">Christianity</option>
              <option value="Buddhism">Buddhism</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Gender:</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-[#002A32] text-white  border rounded-md px-2 py-[6px] w-full text-sm"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="font-semibold">Blood Group:</label>
            <select
              name="blood_group"
              value={formData.blood_group || ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-[#002A32] text-white  border rounded-md px-2 py-[6px] w-full text-sm"
            >
              <option value="">-- Select Blood Group --</option>
              <option value="A+">A+</option>
              <option value="A-">A−</option>
              <option value="B+">B+</option>
              <option value="B-">B−</option>
              <option value="O+">O+</option>
              <option value="O-">O−</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB−</option>
            </select>
          </div>

          
        </div>

        <div>
          <label className="block mb-1 font-semibold">Select Examination</label>
          <div className="flex items-center gap-2 mb-4">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-[#002A32] text-white  border rounded-md p-2 w-full"
            >
              <option value="">-- Select an exam --</option>
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddExam}
              className="btn btn-sm border border-black text-black rounded"
            >
              Add
            </button>
          </div>

          {selectedExam && (
            <div className="border rounded-md p-4 shadow mb-6">
              <h3 className="font-semibold mb-4">
                {selectedExam} Examination Details
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  name="roll_number"
                  placeholder="Roll Number"
                  onChange={handleExamChange}
                  onKeyDown={handleKeyDown}
                  value={examInfo.roll_number || ""}
                  className="border rounded-md h-8 p-2 w-full"
                />

                <input
                  type="text"
                  name="registration_number"
                  placeholder="Registration Number"
                  onChange={handleExamChange}
                  onKeyDown={handleKeyDown}
                  value={examInfo.registration_number || ""}
                  className="border rounded-md h-8 p-2 w-full"
                />

                <div>
                  <select
                    name="year_of_passing"
                    value={examInfo.year_of_passing}
                    onChange={handleExamChange}
                    onKeyDown={handleKeyDown}
                    className="border rounded-md px-2 py-[6px] w-full text-sm"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year || ""}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  name="gpa_cgpa"
                  placeholder="GPA / CGPA / Division"
                  onChange={handleExamChange}
                  onKeyDown={handleKeyDown}
                  value={examInfo.gpa_cgpa || ""}
                  className="border rounded-md h-8 p-2 w-full"
                />

                <input
                  name="institution_name"
                  placeholder="Name of School/College/University"
                  onChange={handleExamChange}
                  onKeyDown={handleKeyDown}
                  value={examInfo.institution_name || ""}
                  className="border rounded-md h-8 p-2 w-full"
                />
                {!["Hon's", "Masters"].includes(selectedExam) && (
                  <div>
                    <select
                      name="board"
                      value={examInfo.board}
                      onChange={handleExamChange}
                      onKeyDown={handleKeyDown}
                      className="border rounded-md px-2 py-[6px] w-full text-sm"
                    >
                      <option value="">Select Board</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.name || ""}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  name="group"
                  placeholder="Group"
                  onChange={handleExamChange}
                  onKeyDown={handleKeyDown}
                  value={examInfo.group || ""}
                  className="border rounded-md h-8 p-2 w-full"
                />
              </div>
            </div>
          )}

          {/* Display table of added exam entries */}
          {examRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full  border rounded-md rounded-md-collapse text-sm">
                <thead>
                  <tr className=" text-left">
                    <th className=" border rounded-md px-3 py-2">
                      Examination
                    </th>
                    <th className=" border rounded-md px-3 py-2">Roll No.</th>
                    <th className=" border rounded-md px-3 py-2">
                      Registration No.
                    </th>
                    <th className=" border rounded-md px-3 py-2">
                      Passing Year
                    </th>
                    <th className=" border rounded-md px-3 py-2">GPA / CGPA</th>
                    <th className=" border rounded-md px-3 py-2">
                      Institute Name
                    </th>
                    <th className=" border rounded-md px-3 py-2">Group</th>
                    <th className=" border rounded-md px-3 py-2">Board</th>
                    <th className=" border rounded-md px-3 py-2 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examRecords.map((item, index) => (
                    <tr key={index} className="">
                      <td className="border rounded-md px-3 py-2">
                        {item.exam_name || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.roll_number || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.registration_number || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.year_of_passing || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.gpa_cgpa || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.institution_name || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.group || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2">
                        {item.board || ""}
                      </td>
                      <td className="border rounded-md px-3 py-2 text-center">
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="font-semibold">Current Class/Department</label>
            <input
              name="current_class_or_dept"
              value={formData.current_class_or_dept || ""}
              placeholder="e.g. Class 10"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">Academic Year</label>
            <input
              name="academic_year"
              value={formData.academic_year || ""}
              placeholder="e.g. 2025"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">School/College/University</label>
            <input
              name="current_institution_name"
              value={formData.current_institution_name || ""}
              placeholder="Enter institution name"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">Reference</label>
            <input
              name="reference"
              value={formData.reference || ""}
              placeholder="Enter Reference Name"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
        </div>

       
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="font-semibold">Mobile No (self)</label>
            <input
              name="mobile_self"
              value={formData.mobile_self || ""}
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="font-semibold">Mobile No (Father's)</label>
            <input
              name="mobile_father"
              value={formData.mobile_father || ""}
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">Mobile No (Mother's)</label>
            <input
              name="mobile_mother"
              value={formData.mobile_mother || ""}
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">Mobile No (others)</label>
            <input
              name="mobile_others"
              value={formData.mobile_others || ""}
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="font-semibold">Email:</label>
            <input
              name="email"
              value={formData.email || ""}
              type="email"
              placeholder="example@email.com"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">Facebook Link</label>
            <input
              name="facebook_link"
              value={formData.facebook_link || ""}
              type="text"
              placeholder="Facebook profile link"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="font-semibold">WhatsApp Number</label>
            <input
              name="whatsapp_number"
              value={formData.whatsapp_number || ""}
              type="text"
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className=" border rounded-md px-2 py-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm">
              Select ID Type
            </label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border rounded-md px-2 py-1 w-full text-sm"
            >
              <option value="">-- Select --</option>
              <option value="NID">NID</option>
              <option value="Birth Certificate">Birth Certificate</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">
              NID/Birth Registration Number
            </label>
            <input
              name="nid_birth_registration_no"
              value={formData.nid_birth_registration_no || ""}
              type="number"
              placeholder="Enter"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={!idType} // disabled if not selected
              className={`border rounded-md px-2 py-1 w-full text-sm ${!idType ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Upload Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange} // adjust to your handler for files
              onKeyDown={handleKeyDown}
              className={
                "border rounded-md px-2 py-1 w-full text-sm cursor-pointergd"
              }
            />
          </div>
        </div>


      <div className="mt-4">
          {/* Input Form */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={remarksInfo.remarks}
              onChange={handleRemarkChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="step"
              placeholder="Step"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={remarksInfo.step}
              onChange={handleRemarkChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="result"
              placeholder="Result"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={remarksInfo.result}
              onChange={handleRemarkChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            type="button"
            onClick={addRemark}
            onKeyDown={handleKeyDown}
            className="bg-[#002A32] text-white cursor-pointer px-3 py-1 rounded-md"
          >
            + Add Remark
          </button>

          {/* Show Table only if data exists */}
          {formData.remarks.length > 0 && (
            <div className="mt-4">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Remarks</th>
                    <th className="border px-2 py-1">Step</th>
                    <th className="border px-2 py-1">Result</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.remarks.map((r, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{r.remarks}</td>
                      <td className="border px-2 py-1">{r.step}</td>
                      <td className="border px-2 py-1">{r.result}</td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeRemark(i)}
                          className="text-red-500 cursor-pointer hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>




      <div className="mt-4">
          {/* Input Form */}
          <div className="mb-3 grid grid-cols-5 gap-2">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={jobInfo.title}
              onChange={handleJobChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="company"
              placeholder="Organization"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={jobInfo.company}
              onChange={handleJobChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={jobInfo.location}
              onChange={handleJobChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="duration"
              placeholder="Duration"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={jobInfo.duration}
              onChange={handleJobChange}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              className="border rounded-md px-2 py-1 text-sm w-full"
              value={jobInfo.remarks}
              onChange={handleJobChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            type="button"
            onClick={addJob}
            onKeyDown={handleKeyDown}
            className="bg-[#002A32] text-white cursor-pointer px-3 py-1 rounded-md"
          >
            + Add Job
          </button>

          {/* Show Table only if data exists */}
          {formData.job_info.length > 0 && (
            <div className="mt-4">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Job Title</th>
                    <th className="border px-2 py-1">Organization</th>
                    <th className="border px-2 py-1">Location</th>
                    <th className="border px-2 py-1">Duration</th>
                    <th className="border px-2 py-1">Remarks</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.job_info.map((job, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{job.title}</td>
                      <td className="border px-2 py-1">{job.company}</td>
                      <td className="border px-2 py-1">{job.location}</td>
                      <td className="border px-2 py-1">{job.duration}</td>
                      <td className="border px-2 py-1">{job.remarks}</td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeJob(i)}
                          className="text-red-500 cursor-pointer hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

     <div className="mt-2 grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="reference" className="block text-sm font-semibold">
            Reference
          </label>
          <input
            type="text"
            id="reference"
            name="reference"
            className="mt-1 block w-full rounded-md border border-black px-2 py-1 focus:outline-none "
            placeholder="Enter reference"
          />
        </div>

        <div>
          <label htmlFor="co_activities" className="block text-sm font-semibold ">
            Co-Curricular Activities
          </label>
          <input
            type="text"
            id="co_activities"
            name="co_activities"
            className="mt-1 block w-full rounded-md border border-black px-2 py-1 focus:outline-none "
            placeholder="Enter co-curricular activities"
          />
        </div>
      </div>


      <button
        type="submit"
        className={` bg-blue-500 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{isEdit ? "Updating..." : "Submitting..."}</span>
          </>
        ) : (
          <span>{isEdit ? "Update" : "Submit"}</span>
        )}
      </button>
      </form>
    </div>
    </div>
  );
}