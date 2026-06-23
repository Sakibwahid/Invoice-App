import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./routes/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layout/DashboardLayout";

import ShowInvoice from "./pages/ShowInvoice";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceView from "./pages/InvoiceView";

import ShowQuotation from "./pages/ShowQuotation";
import CreateQuotation from "./pages/CreateQuotation";
import QuotationView from "./pages/QuotationView";

import Settings from "./pages/Settings";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },

  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },

      // ✅ INVOICES
      {
        path: "invoices",
        element: <ShowInvoice />,
      },

      {
        path: "invoices/create",
        element: <CreateInvoice />,
      },

      {
        path: "invoices/:id",
        element: <InvoiceView />,
      },

      // ✅ QUOTATIONS
      {
        path: "quotations",
        element: <ShowQuotation />,
      },

      {
        path: "quotations/create",
        element: <CreateQuotation />,
      },

      {
        path: "quotations/:id",
        element: <QuotationView />,
      },
      {
        path: "/settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
