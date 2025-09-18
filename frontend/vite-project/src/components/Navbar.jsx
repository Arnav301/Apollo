import { FileText } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="mb-8">
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Apollo AI Assistant</h1>
            <p className="text-sm text-gray-600">Upload documents and ask questions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
