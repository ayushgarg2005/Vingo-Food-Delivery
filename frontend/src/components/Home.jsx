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
      <div className="w-full min-h-screen pt-20 flex flex-col items-center bg-[#fafafa] overflow-x-hidden">
        {userData.role === "user" && <UserDashboard />}
        {userData.role === "owner" && <OwnerDashboard />}
        {userData.role === "deliveryBoy" && <DeliveryBoy />}
      </div>
    </>
  );
}

export default Home;