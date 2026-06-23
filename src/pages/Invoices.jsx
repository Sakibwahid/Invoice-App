import { Link } from "react-router-dom";
import ShowInvoice from "../pages/ShowInvoice";

const Invoices = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Invoices
        </h1>

        <Link
          to="/invoices/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Invoice
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <ShowInvoice />
      </div>
    </div>
  );
};

export default Invoices;