import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const port = 3000;

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  let myurl = window.location.hostname;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://${myurl}:${port}/api/auth`;
      const { data: res } = await axios.post(url, data);

      // Check if the login response indicates account deactivation
      if (res.message && res.message.toLowerCase().includes("deactivated")) {
        // Display a message to contact the administrator
        console.log("Account deactivated. Contact the administrator.");
        return;
      }

      localStorage.setItem("token", res.data);
       // Check if the user is an admin and redirect to the admin page
       if (res.isAdmin) {
        window.location = "/admin"; // Replace with your admin page route
      } else {
        window.location = "/";
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Login to Your Account</h1>
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
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />
            {error && <div className={styles.error_msg}>{error}</div>}
            <button type="submit" className={styles.green_btn}>
              Sign In
            </button>
          </form>
        </div>
        <div className={styles.right}>
          <h1>New Here ?</h1>
          <Link to="/signup">
            <button type="button" className={styles.white_btn}>
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
