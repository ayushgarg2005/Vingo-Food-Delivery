import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerSlice from "./ownerSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    owner: ownerSlice,
  },
});

// Persist Cart & Cart Shop Metadata
store.subscribe(() => {
  const { cartItems, cartShopId } = store.getState().user;

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  
  if (cartShopId) {
    localStorage.setItem("cartShopId", cartShopId);
  } else {
    localStorage.removeItem("cartShopId");
  }
});

export default store;