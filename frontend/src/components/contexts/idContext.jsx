import React, { createContext, useState, useContext } from 'react';

const IdContext = createContext();

export const IdProvider = ({ children }) => { // check the double exports
  const [ID, setID] = useState({});

  return (
    <IdContext.Provider value={{ ID, setID }}>
      {children}
    </IdContext.Provider>
  );
};

const useID = () => useContext(IdContext); // make it a context
export default useID;