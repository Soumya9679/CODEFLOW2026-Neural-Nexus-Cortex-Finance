import React from "react";
import { Link } from "react-router-dom";

function ChatbotButton() {
  return (
    <Link to="/chatbot">
      <button className="chatbot-open-btn">
        Open AI Assistant 🤖
      </button>
    </Link>
  );
}

export default ChatbotButton;