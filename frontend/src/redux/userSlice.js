import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authLoading: true,
    city: null,
    shopInMyCity: null,
    itemsInMyCity: [],
    // Load existing items and the corresponding shop ID from localStorage
    cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
    cartShopId: localStorage.getItem("cartShopId") || null, 
  },
  reducers: {
    setAuthLoading: (state, action) => { state.authLoading = action.payload; },
    setUserData: (state, action) => { state.userData = action.payload; },
    setCity: (state, action) => { state.city = action.payload; },
    setShopInMyCity: (state, action) => { state.shopInMyCity = action.payload; },
    setItemsInMyCity: (state, action) => { state.itemsInMyCity = action.payload; },

    addToCart: (state, action) => {
      const item = action.payload; // Make sure action.payload includes the 'shop' ID from your Mongoose schema

      // 1. If cart is empty, set the active cartShopId
      if (state.cartItems.length === 0) {
        state.cartShopId = item.shop; 
      } 
      // 2. Reject item if it belongs to a different shop
      else if (state.cartShopId !== item.shop) {
        // We handle the rejection UI flow on the component level using a confirmation modal/alert
        return; 
      }

      const existingItem = state.cartItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...item,
          quantity: 1,
        });
      }
    },

    // A helper reducer specifically for resetting and adding the fresh item
    replaceCartWithNewShop: (state, action) => {
      const item = action.payload;
      state.cartShopId = item.shop;
      state.cartItems = [{ ...item, quantity: 1 }];
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === itemId);

      if (!existingItem) return;

      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter((item) => item.id !== itemId);
      }

      // Clean up the shop tracking if the cart is completely emptied
      if (state.cartItems.length === 0) {
        state.cartShopId = null;
      }
    },

    removeItemFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      
      if (state.cartItems.length === 0) {
        state.cartShopId = null;
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.cartShopId = null;
    },
  },
});

export const {
  setAuthLoading,
  setUserData,
  setCity,
  setShopInMyCity,
  setItemsInMyCity,
  addToCart,
  replaceCartWithNewShop,
  removeFromCart,
  clearCart,
  removeItemFromCart
} = userSlice.actions;

export default userSlice.reducer;