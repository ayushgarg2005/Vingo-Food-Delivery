import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../config/api";
import { useDispatch } from "react-redux";
import { setUserData, setAuthLoading } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverURL}/api/user/current`,
          { withCredentials: true }
        );
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setAuthLoading(false));
      }
    }

    fetchUser()
  }, []);
}

export default useGetCurrentUser;