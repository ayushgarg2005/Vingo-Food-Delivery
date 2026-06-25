import UserDashboard from "./UserDashboard";
import OwnerDashboard from "./OwnerDashboard";
import DeliveryBoy from "./DeliveryBoy";
import { useSelector } from "react-redux";
import Nav from "./Nav";


function Home() {
  const { userData } = useSelector(
    (state) => state.user
  );

  if (!userData) {
    return null;
  }

  return (
    <>
    <Nav />
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      {userData.role === "user" && <UserDashboard />}
      {userData.role === "owner" && <OwnerDashboard />}
      {userData.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
    </>
  );
}

export default Home;