import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../config/api";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
  const dispatch = useDispatch();

  const { city } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    const fetchShops = async () => {
      try {
        if (!city) return;

        const result = await axios.get(
          `${serverURL}/api/shop/get-by-city/${city}`,
          {
            withCredentials: true,
          }
        );

        dispatch(
          setShopInMyCity(result.data.shops)
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchShops();
  }, [city, dispatch]);
}

export default useGetShopByCity;