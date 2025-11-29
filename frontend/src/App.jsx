import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sign_in_Sign_up from "./pages/Signinsignup/Signinsignup";
import Home from "./pages/Home/Home";
import Settings from "./pages/Settings/Settings";
import User_ProfileView from "./pages/User_Profileview/User_Profileview";
import Contact_Us from "./pages/Contact_Us/ContactUs";
import NoPage from "./pages/NoPage/Nopage";
import User_Profile from "./pages/User_Profile/User_Profile";
import ChangePassword from "./pages/Change_Password/Change_Password";
import Create_Admin from "./pages/Create_Admin/Create_Admin";
import {UserProvider} from "./components/contexts/userContext";
import { IdProvider } from "./components/contexts/idContext";


function App() {
  return (
    <div>
      <IdProvider>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              <Route index element={<Sign_in_Sign_up />} />
              <Route path="/Signin_Signup" element={<Sign_in_Sign_up/>} />
              <Route path="/Home" element={<Home />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/Contact_Us" element={<Contact_Us />} />
              <Route path="/User_ProfileView" element={<User_ProfileView />}/>
              <Route path="/User_Profile" element={<User_Profile />} />
              <Route path="/Change_Password" element={<ChangePassword/>}/>
              <Route path="/Create_Admin" element={<Create_Admin/>}/>

              <Route path="*" element={<NoPage />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </IdProvider>
    </div>
  );
}

export default App;