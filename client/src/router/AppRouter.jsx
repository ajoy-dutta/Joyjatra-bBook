// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

// Core
import Dashboard from "../pages/Dashboard";

// Sales
import Estimates from "../pages/sales/Estimates";
import Invoices from "../pages/sales/Invoices";
import RecurringInvoices from "../pages/sales/RecurringInvoices";
import Checkouts from "../pages/sales/Checkouts";
import Payments from "../pages/sales/Payments";
import CustomerStatements from "../pages/sales/CustomerStatements";
import Customers from "../pages/sales/Customers";
import ProductsServicesSales from "../pages/sales/ProductsServicesSales";

// Purchases
import Bills from "../pages/purchases/Bills";
import Vendors from "../pages/purchases/Vendors";
import ProductsServicesPurchases from "../pages/purchases/ProductsServicesPurchases";

// Accounting
import ManualJournals from "../pages/accounting/ManualJournals";
import BulkUpdates from "../pages/accounting/BulkUpdates";
import CurrencyAdjustments from "../pages/accounting/CurrencyAdjustments";
import ChartOfAccounts from "../pages/accounting/ChartOfAccounts";
import Budget from "../pages/accounting/Budget";
import TransactionLocking from "../pages/accounting/TransactionLocking";

// Stock
import Inventory from "../pages/stock/Inventory";
import Products from "../pages/stock/Products";
import DamagedProducts from "../pages/stock/DamagedProducts";

// Assets
import CurrentAssets from "../pages/assets/CurrentAssets";
import DamagedAssets from "../pages/assets/DamagedAssets";

// Reports
import ReportsHome from "../pages/reports/ReportsHome";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Sales */}
        <Route path="/sales/estimates" element={<Estimates />} />
        <Route path="/sales/invoices" element={<Invoices />} />
        <Route path="/sales/recurring-invoices" element={<RecurringInvoices />} />
        <Route path="/sales/checkouts" element={<Checkouts />} />
        <Route path="/sales/payments" element={<Payments />} />
        <Route path="/sales/customer-statements" element={<CustomerStatements />} />
        <Route path="/sales/customers" element={<Customers />} />
        <Route path="/sales/products-services" element={<ProductsServicesSales />} />

        {/* Purchases */}
        <Route path="/purchases/bills" element={<Bills />} />
        <Route path="/purchases/vendors" element={<Vendors />} />
        <Route path="/purchases/products-services" element={<ProductsServicesPurchases />} />

        {/* Accounting */}
        <Route path="/accounting/manual-journals" element={<ManualJournals />} />
        <Route path="/accounting/bulk-updates" element={<BulkUpdates />} />
        <Route path="/accounting/currency-adjustments" element={<CurrencyAdjustments />} />
        <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="/accounting/budget" element={<Budget />} />
        <Route path="/accounting/transaction-locking" element={<TransactionLocking />} />

        {/* Stock */}
        <Route path="/stock/inventory" element={<Inventory />} />
        <Route path="/stock/products" element={<Products />} />
        <Route path="/stock/damaged-products" element={<DamagedProducts />} />

        {/* Assets */}
        <Route path="/assets/current-assets" element={<CurrentAssets />} />
        <Route path="/assets/damaged-assets" element={<DamagedAssets />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsHome />} />
      </Route>
    </Routes>
  );
}
