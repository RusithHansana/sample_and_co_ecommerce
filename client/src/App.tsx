import { BrowserRouter, Route, Routes } from "react-router"

/* Storefront */
import StorefrontLayout from "@/layouts/storefront-layout"
import HomePage from "@/pages/storefront/home-page"
import ProductListingPage from "@/pages/storefront/product-listing-page"
import ProductDetailPage from "@/pages/storefront/product-detail-page"
import CartPage from "@/pages/storefront/cart-page"
import CheckoutPage from "@/pages/storefront/checkout-page"
import OrderConfirmationPage from "@/pages/storefront/order-confirmation-page"
import OrderHistoryPage from "@/pages/storefront/order-history-page"
import OrderDetailPage from "@/pages/storefront/order-detail-page"
import LoginPage from "@/pages/auth/login-page"
import RegisterPage from "@/pages/auth/register-page"
import NotFoundPage from "@/pages/not-found-page"

/* Admin */
import AdminLayout from "@/layouts/admin-layout"
import DashboardPage from "@/pages/admin/dashboard-page"
import ProductListPage from "@/pages/admin/product-list-page"
import ProductFormPage from "@/pages/admin/product-form-page"
import OrderListPage from "@/pages/admin/order-list-page"
import AdminOrderDetailPage from "@/pages/admin/admin-order-detail-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront routes */}
        <Route element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListingPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
