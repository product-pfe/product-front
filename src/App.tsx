import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/auth/login/Login";
import Student from "./components/student/Student";
import Register from "./components/auth/register/Register";
import Navbar from "./components/home/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-gray-50 to-yellow-200">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <Student />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
