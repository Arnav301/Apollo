import { FileText, RotateCcw, X, Loader2 } from "lucide-react";
import { useState } from "react";
import PDFModal from "./PDFModal";

const DocumentLibrary = ({ documents, onClear, onDelete, onSelect, activeFilename }) => {
  const [selectedPDF, setSelectedPDF] = useState(null);

  return (
    <>
      <div className="card p-6 h-[260px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">
              Document Library
            </h2>
          </div>
          <RotateCcw
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={onClear}
          />
        </div>

        {documents.length === 0 ? (
          <div className="min-h-40 flex items-center justify-center">
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          <ul className="space-y-3 overflow-y-auto pr-1 max-h-[140px]">
            {documents.map((doc, index) => {
              const fileURL = URL.createObjectURL(doc.file);

              return (
                <li
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-slate-50 ${
                    activeFilename === doc.name ? "ring-2 ring-gray-300" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {/* ✅ Show spinner while loading */}
                    {doc.loading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <FileText
                        className={`w-5 h-5 ${
                          doc.type === "application/pdf"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      />
                    )}

                    {/* ✅ Clickable filename (disabled while loading) */}
                    {doc.loading ? (
                      <span className="truncate text-sm text-gray-400">
                        {doc.name} (Uploading...)
                      </span>
                    ) : doc.type === "application/pdf" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPDF(doc.file)}
                          className="truncate text-sm text-blue-600 hover:underline text-left"
                        >
                          {doc.name}
                        </button>
                        <button
                          onClick={() => onSelect && onSelect(doc.name)}
                          className="text-xs px-2 py-1 rounded bg-white border hover:bg-slate-50"
                          title="Use this document for chat"
                        >
                          Use
                        </button>
                      </div>
                    ) : (
                      <a
                        href={fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                        className="truncate text-sm text-blue-600 hover:underline"
                      >
                        {doc.name}
                      </a>
                    )}
                  </div>

                  {/* ❌ Delete button (disabled while loading) */}
                  {!doc.loading && (
                    <button
                      onClick={() => onDelete(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ✅ PDF Preview Modal */}
      {selectedPDF && (
        <PDFModal file={selectedPDF} onClose={() => setSelectedPDF(null)} />
      )}
    </>
  );
};

export default DocumentLibrary;
