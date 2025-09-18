import { useState } from "react";
import UploadDocument from "./UploadDocument";
import DocumentLibrary from "./DocumentLibrary";

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [activeFilename, setActiveFilename] = useState("");

  const handleUpload = (file) => {
    const newFile = { file, name: file.name, type: file.type, loading: false };
    setDocuments((prev) => [...prev, newFile]);
    setActiveFilename(file.name);
    window.__lastUploadedFilename = file.name;
  };

  const handleClear = () => {
    setDocuments([]);
  };

  const handleDelete = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <UploadDocument onUpload={handleUpload} />
      <DocumentLibrary
        documents={documents}
        onClear={handleClear}
        onDelete={handleDelete}
        onSelect={(name) => {
          setActiveFilename(name);
          window.__lastUploadedFilename = name;
        }}
        activeFilename={activeFilename}
      />
    </div>
  );
};

export default DocumentManager;
