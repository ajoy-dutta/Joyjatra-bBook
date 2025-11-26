import { createContext, useState, useContext, useEffect } from "react";
import AxiosInstance from "../components/AxiosInstance";

const UserContext = createContext();


export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // const storedUser = localStorage.getItem("user") ;
    // return storedUser ? JSON.parse(storedUser) : null; // Retrieve user data from localStorage
  });  
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const token = localStorage.getItem("access_token");

  const fetchUserData = async () => {
    if (!token) {
      console.log("jsbhdfkjbdhs")
      setError("No token found. Please log in.");
      setUser(null);
      setLoading(false)
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await AxiosInstance.get('user/');

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch user data.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const refreshUser = () => {
    fetchUserData();
  };

  // Handle Sign Out
  const signOut = () => {
    localStorage.removeItem("access_token"); 
    setUser(null);
    
  };


  useEffect(() => {
    if (token && !user) { 
      fetchUserData();
    }
  }, [token, user]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, signOut }}>
       {loading ? <div>Loading...</div> : children} 
    </UserContext.Provider>
  );
};