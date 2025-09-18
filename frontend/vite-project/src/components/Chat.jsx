import { MessageCircle, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI knowledge assistant. Upload some documents and I'll help you find answers from them.",
      sender: "ai",
      time: new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Auto-summary after upload
  useEffect(() => {
    const handlePdfUploaded = async (e) => {
      const filename = e?.detail?.filename || window.__lastUploadedFilename || "";
      if (!filename) return;
      setIsThinking(true);
      try {
        const prompt = "Summarize this PDF in 5 concise bullet points highlighting key topics and sections.";
        const params = new URLSearchParams({ user_message: prompt, filename });
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}chat/?${params.toString()}`);
        setMessages((prev) => [
          ...prev,
          {
            text: res.data.answer,
            sender: "ai",
            time: new Intl.DateTimeFormat([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(new Date()),
          },
        ]);
      } catch (error) {
        const detail = error?.response?.data?.detail || "⚠️ Could not generate summary.";
        setMessages((prev) => [
          ...prev,
          {
            text: detail,
            sender: "ai",
            time: new Intl.DateTimeFormat([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(new Date()),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    };

    window.addEventListener("pdf_uploaded", handlePdfUploaded);
    return () => window.removeEventListener("pdf_uploaded", handlePdfUploaded);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      sender: "user",
      time: new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsThinking(true);

    // If no active/last uploaded filename, short-circuit with a helpful response
    const lastFilenameGuard = window.__lastUploadedFilename;
    if (!lastFilenameGuard) {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "No PDF uploaded",
          sender: "ai",
          time: new Intl.DateTimeFormat([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date()),
        },
      ]);
      return;
    }

    try {
      // Try to pull the last uploaded filename from a global variable set by DocumentManager
      const lastFilename = window.__lastUploadedFilename || "";
      const params = new URLSearchParams({ user_message: input });
      if (lastFilename) params.append("filename", lastFilename);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}chat/?${params.toString()}`);

      const aiResponse = {
        text: res.data.answer,
        sender: "ai",
        time: new Intl.DateTimeFormat([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date()),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const detail = error?.response?.data?.detail || "⚠️ Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          text: detail,
          sender: "ai",
          time: new Intl.DateTimeFormat([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date()),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="card flex flex-col h-[70vh] lg:h-[75vh]">
      {/* Chat Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold">
            Chat with your documents
          </h2>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] lg:max-w-[80%] px-4 py-2 rounded-2xl shadow-sm border ${
                msg.sender === "user"
                  ? "bg-slate-100 text-gray-900"
                  : "bg-white text-gray-900"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-2 rounded-2xl shadow-sm border bg-white">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about your documents..."
            className="input"
          />
          <button
            onClick={handleSend}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
