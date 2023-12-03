// Navbar.js

import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <nav className={styles.navbar}>
      <h1>facebook</h1>
      <Link to="/update-password" className={styles.white_btn}>
        Update Password
      </Link>
      <button className={styles.white_btn} onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;

