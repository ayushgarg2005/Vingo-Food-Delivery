import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../config/api";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

function useGetMyShop() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverURL}/api/shop/my-shop`,
          { withCredentials: true }
        );
        dispatch(setMyShopData(result.data));
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }

    fetchShop()
  }, []);
}

export default useGetMyShop;