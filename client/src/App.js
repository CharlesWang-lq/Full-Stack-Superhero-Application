// App.js

import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PasswordUpdate from "./components/PasswordUpdate";
import EmailVerify from "./components/EmailVerify";
import CombinedStartPageAndSearch from "./components/StartPage"; // Import the new component
import Admin from "./components/Admin";
import PolicyPage from "./components/Policy";
import DMCAPolicyPage from "./components/Policy/dmca";
import AUPPolicyPage from "./components/Policy/aup";
import Document from "./components/Policy/document";

function App() {
  const user = localStorage.getItem("token");

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Main />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/update-password" element={<PasswordUpdate />} />
          <Route path='/document' element = {<Document />} />
        </>
      ) : (
        <Route path="/" element={<CombinedStartPageAndSearch />} />
      )}
      <Route path="/policy" element={<PolicyPage />} />
      <Route path="/dmca" element={<DMCAPolicyPage />} />
      <Route path="/aup" element={<AUPPolicyPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users/:id/verify/:token" element={<EmailVerify />} />

    </Routes>
  );
}

export default App;

