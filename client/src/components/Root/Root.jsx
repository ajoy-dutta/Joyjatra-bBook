import { useNavigate } from "react-router-dom";
import { useUser } from "../../Provider/UserProvider";
import HomeNavbar from "../HomeNavbar/HomeNavbar";
import { Outlet } from 'react-router-dom';  
import Footer from "../Footer/Footer";



export default function Root() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div>
       <HomeNavbar></HomeNavbar>
       <Outlet></Outlet>
       <Footer></Footer>
    </div>
  );
}