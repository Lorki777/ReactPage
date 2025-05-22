import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routing";
import ScrollToTop from "./ScrollToTop";
import "./Components/admin.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
}

export default App;
