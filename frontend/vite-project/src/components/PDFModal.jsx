const PDFModal = ({ file, onClose }) => {
  if (!file) return null;

  const fileURL = URL.createObjectURL(file);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* PDF Viewer */}
        <iframe
          src={fileURL}
          title={file.name}
          className="flex-1 w-full"
        />
      </div>
    </div>
  );
};

export default PDFModal;
