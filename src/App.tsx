import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routing";
import Chatbot from "./Components/Chatbot/Chatbot";

function App() {
  return (
    <Router>
      <AppRoutes />
      <Chatbot />
    </Router>
  );
}

export default App;
