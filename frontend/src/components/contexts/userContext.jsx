import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => { // check the double exports
  const [signupDetails, setSignupDetails] = useState({});

  return (
    <UserContext.Provider value={{ signupDetails, setSignupDetails }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext); // make it a context
export default useUser;