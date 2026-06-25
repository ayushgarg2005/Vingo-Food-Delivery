import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverURL } from "../config/api";
import { setItemsInMyCity } from "../redux/userSlice";

function useGetItemsByCity() {
  const dispatch = useDispatch();

  const { city } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!city) return;

        const result = await axios.get(
          `${serverURL}/api/item/get-by-city/${city}`,
          {
            withCredentials: true,
          }
        );

        dispatch(
          setItemsInMyCity(result.data.items)
        );

        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchItems();
  }, [city, dispatch]);
}

export default useGetItemsByCity;