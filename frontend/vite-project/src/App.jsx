import Navbar from "./components/Navbar";
import DocumentManager from "./components/DocumentManager";
import Chat from "./components/Chat";

const App = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Navbar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Documents */}
          <div className="lg:col-span-1">
            <DocumentManager />
          </div>
          {/* Right Column - Chat wider */}
          <div className="lg:col-span-2">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
