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
import AdminOrderDetailPage from "@/pages/admin/order-detail-page"
import { AuthProvider } from "@/contexts/auth-context"
import { GuestRoute } from "@/components/auth/guest-route"
import { ProtectedRoute } from "@/components/auth/protected-routes"
import ForbiddenPage from "@/pages/forbidden-page"
import AdminRoute from "@/components/auth/admin-route"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>
          {/* Storefront routes */}
          <Route element={<StorefrontLayout />}>
            {/* Public */}
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListingPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />

            {/* Guest only */}
            <Route element={<GuestRoute />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/*  Protected */}

            <Route element={<ProtectedRoute />}>
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
            </Route>

            <Route path="forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id" element={<ProductFormPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
