import User_Profile_Form from "../../components/User_Profile_Form/User_Profile_Form";
import user_profile_style from "./User_Profile.module.css"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer";
import Content from "../../components/content/Content";

import React from 'react';

function User_Profile() {
  return (
<>
      <Header/>
      <Content className={user_profile_style.ContentBody}><User_Profile_Form/></Content>
      <Footer/>
      </>
  )
}

export default User_Profile;

