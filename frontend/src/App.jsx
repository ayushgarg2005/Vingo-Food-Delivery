import React from 'react'
import { Routes , Route} from 'react-router-dom'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import ForgotPassword from './components/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Home from './components/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './components/CreateEditShop'
import AddItem from './components/AddItem'
import EditItem from './components/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './components/CartPage'
import CheckOut from './components/CheckOut'
import UserOrders from './components/UserOrders'
import OwnerOrders from './components/OwnerOrders'
import OwnerDashboard from './components/OwnerDashboard'

function App() {
  useGetCurrentUser()
  useGetCity()
  useGetMyShop()
  useGetShopByCity()
  useGetItemsByCity()
  const { userData, authLoading } = useSelector((state) => state.user)

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 animate-[fadeIn_.3s_ease]">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-orange-500 mb-6">
          Vingo
        </h1>
        <div className="w-10 h-10 rounded-full border-[3px] border-orange-200 border-t-[#ff4d2d] animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium animate-pulse">
          Preparing your experience...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" replace />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" replace />}
          />

      <Route
        path="/forgot-password"
        element={!userData ? (
          <ForgotPassword />
        ) : (
          <Navigate to="/" replace />
        )}
      />

      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" replace />}
      />

      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to="/signin" replace />}
      />

      {/* USER: Order History */}
      <Route
        path="/orders"
        element={userData ? <UserOrders /> : <Navigate to="/signin" replace />}
      />

      {/* OWNER: Order Management */}
      <Route
        path="/owner/orders"
        element={userData ? <OwnerOrders /> : <Navigate to="/signin" replace />}
      />

      {/* OWNER: Dashboard */}
      <Route
        path="/owner/dashboard"
        element={userData ? <OwnerDashboard /> : <Navigate to="/signin" replace />}
      />
    </Routes>
  )
}

export default App
