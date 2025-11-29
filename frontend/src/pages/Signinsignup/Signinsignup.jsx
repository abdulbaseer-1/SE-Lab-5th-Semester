import React, { useContext, useState } from 'react';
import './Signinsignup.css'
import useUser from '../../components/contexts/userContext.jsx'; //my Context // default export imported
import { useNavigate } from 'react-router-dom'; // navigate to other page on some event // finally got what i was lookin for eh
import axios from 'axios'; // Importing axios for sending HTTP requests

const Signinsignup = () => {
    const [action, setAction] = useState("Sign Up");
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    //for checking userstate -> admin or mango people
    const [userstate, setUserstate] = useState('normal_user');
    // the brace suggest a named export, i.e. the setSignupDetals function of useUser itself.
    const { setSignupDetails } = useUser(); // i don't need to use the useContext hook again b/c i used it in the context creation component, check it out.
    //setting up navigator hook, is it a hook?
    const navigate = useNavigate();

    const handleUsername = (event) => { // if you use a callback in the set function, the parent event and the child are different, so this is the correct syntax
        // if(action === "Sign Up") // only required where the field is used in both sign in and signup
        setUsername(event.target.value);
    };
    const handleEmail = (event) => {
        setEmail(event.target.value);
    };
    const handlePassword = (event) => {
        // if(action === "Sign Up")
        setPassword(event.target.value);
    };
    const handlePasswordConfirmation = (event) => {
        setConfirmPassword(event.target.value);
    }

    // login logic
    const handleLogin = async () => {
        try {
            // Sending a POST request to the backend API for login
            console.log("username : " + username + "\n" + "password : " + password);

            const response = await axios.post('/api/users/login',{
                username,
                password, },
                {
                headers:{
                    'Content-Type': 'application/json',
                },
                withCredentials:true,
            });
            if (response.status === 200) {
                
                // Navigate based on user role (admin or user)
                const role = response.data.user.role; // its .user.role not just .role b/c respone can send multiple objects, and the user object sent here has the role
                console.log("role : " + role);
                
                // Store the role in localStorage
                localStorage.setItem('role', role);  // Save role to localStorage

                if (role === "admin") {
                    navigate("/Home"); // Redirect to home page but with admin sidebar
                } else if (role === "user") {
                    navigate("/Home"); // Redirect to home page but with the user sidebar
                } else {
                    alert("Unknown role, please contact support.");
                }
            }
        } catch (error) {
            // Handle error, e.g., wrong credentials or server issues
            alert(error.response?.data?.message || "Login failed. Please try again.");
        }
    };   

    const handleSubmit = () => {
        if(!username.trim()) {
            alert("username is required");  // if the username is empty after trimming whitespace
            return;
        }
        if(!email.trim()) {
            alert("email is required");
            return;
        }
        if(!password.trim()) {
            alert("password is required");
            return;
        }
        if(password !== confirmPassword) {
            alert("please confirm password");
            return;
        }

        setSignupDetails({username, email, password}); // a function to change the signupDetails inside the useUser.
        if(action === "Sign Up") {
        navigate("/User_Profile"); // takes routes not paths
        console.log("Navigate to profile page");
        }
    }

  return ( 
    <div className='container'>
        <div className="header">
            <div className="text">{action}</div>
            <div className="underline"></div>
        </div>
            <div className="inputs">
                <div className="input">
                    <h4>Username</h4>
                    <input type="text" placeholder='Name...' onChange={handleUsername} required/>
                </div>
                
                {action=="Sign In"?<div></div>:<div className="input">
                    <h4>Email</h4>
                    <input type="email" placeholder='Email...'  onChange={handleEmail} required/>
                </div>}
                <div className="input">
                    <h4>Password</h4>
                    <input type="password" placeholder='Password...' onChange={handlePassword} required/>
                </div>
                {action=="Sign In"?<div></div>:<div className="input">
                    <h4>Confirm Password</h4>
                    <input type="password" placeholder='Confirm Password...' required onChange={handlePasswordConfirmation}/>
                </div>}
            </div>
            {action=="Sign Up"?<div></div>:<div className="forgot-password">Forgot password? <span>Click here!</span></div>}
            <div className="submit-container">
            <div className="submit_form" onClick={action === "Sign In" ? handleLogin : handleSubmit}>Submit</div>
        </div>
            <div className="submit-container">
                <div className={action==="Sign Up"?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
                <div className={action==="Sign In"?"submit gray":"submit"} onClick={()=>{setAction("Sign In")}}>Sign In</div>
            </div>
    </div>
  );
}

export default Signinsignup;
