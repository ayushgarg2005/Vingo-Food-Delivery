import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCity } from "../redux/userSlice";

function useGetCity() {
  const dispatch = useDispatch();

  const [location, setLocation] = useState({
    city: "",
    state: "",
    address: "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`
          );

          const data = result?.data?.results?.[0];

          const city = data?.city || "";
          const state = data?.state || "";
          const address = data?.formatted || "";

          dispatch(setCity(city));

          setLocation({
            city,
            state,
            address,
          });
        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return location;
}

export default useGetCity;