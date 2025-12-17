// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Root from "../components/Root/Root";

// Home
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";


// Core
import Dashboard from "../pages/Dashboard";

// Sales
import Estimates from "../pages/sales/Estimates";
import SalesList from "../pages/sales/Invoices";
import RecurringInvoices from "../pages/sales/RecurringInvoices";
import Checkouts from "../pages/sales/Checkouts";
import Payments from "../pages/sales/Payments";
import CustomerStatements from "../pages/sales/CustomerStatements";
import Customers from "../pages/sales/Customers";
import CustomerProductSale from "../pages/sales/ProductSales";


// Purchases
import Bills from "../pages/purchases/Bills";
import Vendors from "../pages/purchases/Vendors";
import ProductsServicesPurchases from "../pages/purchases/ProductsPurchases";
import PurchaseInvoices from "../pages/purchases/Invoices";
import PurchasePayments from "../pages/purchases/PurchasePayments";
import PurchaseEntry from "../pages/purchases/purchaseEntry";
import Order from "../pages/purchases/Product Order/Order";
import OrderList from "../pages/purchases/Product Order/OrderList";


// Accounting
import Account from "../pages/accounting/Account";
import ManualJournals from "../pages/accounting/ManualJournals";
import BulkUpdates from "../pages/accounting/BulkUpdates";
import CurrencyAdjustments from "../pages/accounting/CurrencyAdjustments";
import ChartOfAccounts from "../pages/accounting/ChartOfAccounts";
import Budget from "../pages/accounting/Budget";
import TransactionLocking from "../pages/accounting/TransactionLocking";
import PettyCash from "../pages/accounting/PettyCash";
import CashReconciliation from "../pages/accounting/CashReconciliation";
import BankReconciliation from "../pages/accounting/BankReconciliation";
import BankTransactions from "../pages/accounting/BankTransactions";
import BankStatement from "../pages/accounting/BankStatement";
// Stock
import Stocks from "../pages/stock/Stocks/Stocks";
import Products from "../pages/stock/Products/Products";

//Expenses
import ExpensePage from "../pages/expenses/Expense";
import SalaryExpense from "../pages/expenses/SalaryExpense";
import PurchaseExpense from "../pages/expenses/PurchaseExpense";
import ExpenseReport from "../pages/expenses/ExpenseReport";


// Assets
import AssetsPage from "../pages/assets/Assets";
// import CurrentAssets from "../pages/assets/CurrentAssets";
// import DamagedAssets from "../pages/assets/DamagedAssets";

// Reports
import ReportsHome from "../pages/reports/ReportsHome";

// Settings
import BusinessCategory from "../pages/settings/businessCategory/page";
import InventoryCategory from "../pages/settings/InventoryCategory/page";
import CostCategory from "../pages/settings/CostCategory/page";
import SourceCategory from "../pages/settings/sourcecategory/page";
import ProductCategory from "../pages/settings/productcategory/page";
import PaymentMode from "../pages/settings/paymentmode/page";
import BankCategory from "../pages/settings/bankcategory/page";
import BankMaster from "../pages/settings/bank/page";
import Division from "../pages/settings/division/page";
import District from "../pages/settings/district/page";
import SupplierType from "../pages/settings/suppliertype/page";
import BankAccount from "../pages/settings/bankaccount/page";
import AccountCategory from "../pages/settings/accountcategory/page";
// Profile
import UserProfile from "../pages/Profile/UserProfile";


// Staffs
import AddStaff from "../pages/Staffs/AddStaff";
import StaffList from "../pages/Staffs/StaffList";


//requisitions  
import RequisitionList from "../pages/stock/Requisitions/RequisitionList";
import RequisitionCreate from "../pages/stock/Requisitions/RequisitionCreate";
import RequisitionEdit from "../pages/stock/Requisitions/RequisitionEdit";




export default function AppRouter() {

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const category = JSON.parse(localStorage.getItem("business_category"));
    setSelectedCategory(category);
  }, []);

  const isHandiCraft = selectedCategory?.name === "Handi Craft";

  return (
    <Routes>

      {/* For Home Routing */}
      <Route element={<Root />}>
        {/* Root path now serves the Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* For Dashboard Routing */}
      <Route element={<Layout />} >

        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile */}
        <Route path="/dashboard/profile" element={<UserProfile />}></Route>

        {/* Staffs */}
        <Route path="/dashboard/staff-list" element={<StaffList />}></Route>
        <Route path="/dashboard/add-staff" element={<AddStaff />}></Route>

      
        {/* Sales */}
        <Route path="/sales/estimates" element={<Estimates />} />
        <Route path="/sales/invoices" element={<SalesList />} />
        <Route path="/sales/recurring-invoices" element={<RecurringInvoices />} />
        <Route path="/sales/checkouts" element={<Checkouts />} />
        <Route path="/sales/payments" element={<Payments />} />
        <Route path="/sales/customer-statements" element={<CustomerStatements />} />
        <Route path="/sales/customers" element={<Customers />} />
        <Route path="/sales/products-services" element={<CustomerProductSale />} />

        {/* Purchases - Only if not Handy Craft */}
        {!isHandiCraft && (
          <>
            <Route path="/purchases/bills" element={<Bills />} />
            <Route path="/purchases/vendors" element={<Vendors />} />
            <Route path="/purchases/products-services" element={<ProductsServicesPurchases />} />
            <Route path="/purchases/invoices" element={<PurchaseInvoices />} />
            <Route path="/purchases/payments" element={<PurchasePayments />} />
            <Route path="/purchases/products-order" element={<Order />} />
            <Route path="/purchases/order-list" element={<OrderList />} />
            <Route path="/purchases/purchase-entry" element={<PurchaseEntry />} />
          </>
        )}


        {/* Accounting */}
        <Route path="/accounting/accounts" element={<Account />} />
        <Route path="/accounting/bulk-updates" element={<BulkUpdates />} />
        <Route path="/accounting/currency-adjustments" element={<CurrencyAdjustments />} />
        <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="/accounting/budget" element={<Budget />} />
        <Route path="/accounting/transaction-locking" element={<TransactionLocking />} />
        <Route path="/accounting/petty-cash" element={<PettyCash />} />
        <Route path="/accounting/cash-reconciliation" element={<CashReconciliation />} />
        <Route path="/accounting/bank-reconciliation" element={<BankReconciliation/>} />
        <Route path="/accounting/bank-transactions"element={<BankTransactions />}/>
        <Route path="/accounting/bank-statement" element={<BankStatement />} />

        {/* Stock */}
        <Route path="/dashboard/stocks" element={<Stocks />} />
        <Route path="/dashboard/products" element={<Products />} />
        <Route path="/stock/requisitions" element={<RequisitionList />} />
        <Route path="/stock/requisitions/create" element={<RequisitionCreate />} />
        <Route path="/stock/requisitions/:id/edit" element={<RequisitionEdit />} />

        {/* Expenses */}
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/expenses/salary" element={<SalaryExpense />} />
        <Route path="/expenses/purchase" element={<PurchaseExpense />} />
        <Route path="/expenses/report" element={<ExpenseReport />} />

        {/* Assets */}
       <Route path="/assets" element={<AssetsPage />} />
        {/* <Route path="/assets/current-assets" element={<CurrentAssets />} />
        <Route path="/assets/damaged-assets" element={<DamagedAssets />} /> */}

        {/* Reports */}
        <Route path="/reports" element={<ReportsHome />} />

        {/* Master / Settings */}
        <Route path="/master/business-category" element={<BusinessCategory />} />
        <Route path="/master/inventory-category" element={<InventoryCategory />} />
        <Route path="/master/cost-category" element={<CostCategory />} />
        <Route path="/master/income-sources" element={<SourceCategory />} />
        <Route path="/master/product-category" element={<ProductCategory />} />
        <Route path="/master/payment-mode" element={<PaymentMode />} />
        <Route path="/master/bank-category" element={<BankCategory />} />
        <Route path="/master/bank" element={<BankMaster />} />
        <Route path="/master/divisions" element={<Division />} />
        <Route path="/master/districts" element={<District />} />
        <Route path="/master/supplier-type" element={<SupplierType />} />
        <Route path="/master/bank-account" element={<BankAccount />} />
        <Route path="/master/account-category" element={<AccountCategory />}/>
      </Route>
    </Routes>
  );
}