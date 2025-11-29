import React from 'react';
import styles from './User_HomePage_DB.module.css';
import LiveViewer from "../Live viewer/LiveViewer.jsx";

function User_HomePage_DB() {
  return (
    <>
      <div className={styles.viewerWrapper}>
        <LiveViewer />
      </div>
    </>
  );
}

export default User_HomePage_DB;
