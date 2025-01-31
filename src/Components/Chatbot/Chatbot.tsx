import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./Chatbot.css"; // Cambié la importación a un archivo CSS regular

export default function Chatbot() {
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { user: true, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const botResponse = {
        user: false,
        text: "Hola! Soy un chatbot. ¿En qué puedo ayudarte?",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="chatbotContainer">
      {!isOpen && (
        <button className="chatbotButton" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="chatbotBox"
        >
          <div className="chatbotHeader">
            <div className="chatbotTitle">
              <MessageCircle size={24} />
              <span>Talk to us</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="closeButton">
              <ChevronDown size={24} />
            </button>
          </div>
          <div className="chatbotMessages">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.user ? "userMessage" : "botMessage"}
              >
                <div className={msg.user ? "userBubble" : "botBubble"}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="chatbotInput">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="sendButton" onClick={sendMessage}>
              <Send size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
