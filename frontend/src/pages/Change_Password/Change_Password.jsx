import React, { useState } from 'react';
import axios from 'axios';
import styles from './Change_Password.module.css';  // Corrected import for CSS Module
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer";
import Content from "../../components/content/Content";

const ChangePassword = () => {
  const [action, setAction] = useState("Change Password");
  const [previousPassword, setPreviousPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!previousPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await axios.put(
        '/api/users/change-password',
        { previousPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMessage("Password updated successfully.");
        setPreviousPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setAction("Change Password");
      } else {
        setMessage(response.data.message || "Password update failed.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred. Please try again.");
      console.error("Error updating password:", error);
    }
  };

  return (
    <>
    <Header/>
    <Content>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.text}>{action}</div>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <h4>Previous Password</h4>
            <input
              type="password"
              placeholder="Previous Password..."
              value={previousPassword}
              onChange={(e) => setPreviousPassword(e.target.value)}
            />
          </div>
          <div className={styles.input}>
            <h4>New Password</h4>
            <input
              type="password"
              placeholder="New Password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.input}>
            <h4>Confirm Password</h4>
            <input
              type="password"
              placeholder="Confirm Password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        {message && <div className={styles.message}>{message}</div>}
        <div className={styles.submitContainer}>
          <div className={styles.changePassword} onClick={handleChangePassword}>
            Change Password
          </div>
        </div>
      </div>
    </Content>
    <Footer/>
    </>
  );
};

export default ChangePassword;
