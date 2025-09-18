import { Upload, FileText } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const UploadDocument = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      await uploadToBackend(file);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      await uploadToBackend(file);
    } else {
      alert("Only PDF files are allowed!");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadToBackend = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}upload/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Upload successful:", res.data);
      // expose last uploaded filename globally so Chat can filter context
      window.__lastUploadedFilename = file.name;
      // dispatch a custom event so Chat can auto-summarize
      window.dispatchEvent(new CustomEvent("pdf_uploaded", { detail: { filename: file.name } }));

      if (onUpload) onUpload(file);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert(err.response?.data?.detail || "Upload failed, check backend logs");
    }
  };

  return (
    <div className="card p-10 h-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold">Upload PDF</h2>
      </div>

      <label
        className={`group relative grid place-items-center rounded-2xl p-0 h-[140px] cursor-pointer transition-colors border-2 border-dashed ${
          isDragging ? "border-gray-900 bg-slate-50" : "border-slate-300 hover:border-slate-400 bg-gradient-to-b from-slate-50 to-white"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-xl grid place-items-center mb-3 ${isDragging ? "bg-gray-900" : "bg-slate-200"}`}>
            <FileText className={`w-6 h-6 ${isDragging ? "text-white" : "text-slate-500"}`} />
          </div>
          <p className="text-sm sm:text-base font-medium">
            Drop PDF here or <span className="underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">PDF only • Max ~10MB</p>
        </div>
      </label>
    </div>
  );
};

export default UploadDocument;
