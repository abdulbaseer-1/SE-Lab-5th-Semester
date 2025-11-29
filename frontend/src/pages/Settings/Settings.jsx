import setting_style from './Settings.module.css';
import Header from "../../components/Header/Header"
import Content from "../../components/content/Content";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const logout = async () => {
    try {
        const response = await axios.post('/api/users/logout', {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Log response for debugging
        console.log('Logout response:', response.data);
        
        // Clear any client-side state/storage if you're using any
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Optional: Wait a brief moment before redirecting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to login page
        window.location.href = "/Signin_Signup";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
  };
  
    const deleteAccount = async () => {
      try {
        // console.log("id from session : ", req.session.user.id); // cant do it here cus its a server side comp
          const response = await axios.post('/api/users/deletecurrent', {} ,{ //You're passing the config options as the request body//incorrect
              withCredentials: true,
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          if(!response){
            return console.log("not deleted :)");
          }
          console.log("deleted :(");
          navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
      };

    const MakeAdmin = async () => {
      navigate('/Create_Admin');
      };

  return(
    <>
      <Header/>
      <Content className={setting_style.contentBody}>
        <div>
          <a href="/Change_Password">Change Password</a><br />
          <a href="/User_Profile">Edit Profile</a><br />
          <a href="/Recovery_Options">Set Recovery options</a><br />
          <button onClick={logout}>logout</button><br />
          <button onClick={deleteAccount}>delete Account</button><br />
          {(role === 'admin') && (
            <>
              <button onClick={MakeAdmin}>Add New Admin Account</button>
              <br />
            </>
          )}
        </div>
      </Content>
      <Footer/>
    </>
  );
}

export default Settings;