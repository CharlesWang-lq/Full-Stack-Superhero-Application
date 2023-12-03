import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const port = 3000;

const PasswordUpdate = () => {
  const [data, setData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://${window.location.hostname}:${port}/api/update`;
      const { data: res } = await axios.post(url, data);
      setSuccessMessage(res.message); // Set the success message
      setError(""); // Clear any existing error messages
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
        setSuccessMessage(""); // Clear the success message if an error occurs
      }
    }
  };

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Welcome Back</h1>
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Sign in
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Update Your Password</h1>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Current Password"
              name="currentPassword"
              onChange={handleChange}
              value={data.currentPassword}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="New Password"
              name="newPassword"
              onChange={handleChange}
              value={data.newPassword}
              required
              className={styles.input}
            />
            {error && <div className={styles.error_msg}>{error}</div>}
            {successMessage && (
              <div className={styles.success_msg}>{successMessage}</div>
            )}
            <button type="submit" className={styles.green_btn}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdate;
