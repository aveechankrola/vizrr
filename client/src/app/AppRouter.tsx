import { Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { ShopProvider } from '../context/ShopContext'
import { AppUIProvider } from '../context/AppUIContext'
import { AppShell } from '../layouts/AppShell'
import { AdminShell } from '../layouts/AdminShell'
import { PageTransition } from '../components/PageTransition'
import { HomePage } from '../pages/HomePage'
import { AIAnalyserPage } from '../pages/AIAnalyserPage'
import { AboutPage } from '../pages/AboutPage'
import { ContactPage } from '../pages/ContactPage'
import { AccountPage } from '../pages/AccountPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { GetAppPage } from '../pages/GetAppPage'
import { AdminProvider } from '../admin/AdminProvider'
import { AdminLoginPage } from '../admin/AdminLoginPage'
import { AdminDashboardPage } from '../admin/AdminDashboardPage'
import { AdminSupportPage } from '../admin/AdminSupportPage'
import { AdminSalesPage } from '../admin/AdminSalesPage'
import { AdminMasterPage } from '../admin/AdminMasterPage'
import { AdminOrdersPage } from '../admin/AdminOrdersPage'
import { AdminProductsPage } from '../admin/AdminProductsPage'
import { AdminUsersPage } from '../admin/AdminUsersPage'

export function AppRouter() {
  return (
    <CartProvider>
      <AppUIProvider>
        <ShopProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route element={<PageTransition />}>
                <Route index element={<HomePage />} />
                <Route path="ai-analyser" element={<AIAnalyserPage />} />
                <Route path="shop" element={<Navigate to="/ai-analyser" replace />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="get-app" element={<GetAppPage />} />
              </Route>
            </Route>

            <Route path="admin" element={<AdminProvider />}>
              <Route path="login" element={<AdminLoginPage />} />
              <Route element={<AdminShell />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="support" element={<AdminSupportPage />} />
                <Route path="sales" element={<AdminSalesPage />} />
                <Route path="master" element={<AdminMasterPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShopProvider>
      </AppUIProvider>
    </CartProvider>
  )
}
