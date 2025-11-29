// User_Profileview.jsx

import style from './User_Profileview.module.css';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Content from "../../components/content/Content";
import UserProfile from '../../components/user_profileview/user_profileview'; // Default import

function User_Profileview() {
  return (
    <>
      <Header />
    
      <Content className={style.contentBody}>
        <UserProfile /> {/* Use the imported UserProfile component */}
      </Content>
      <Footer />
    </>
  );
}

export default User_Profileview;
