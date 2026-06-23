import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuotationById } from "../hooks/useQuotationById";
import { convertQuotationToInvoice } from "../services/quotationService";

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState(null);

  const { data: quotation, isLoading, error } = useQuotationById(id);

  const handleConvertToInvoice = async () => {
    try {
      setIsConverting(true);
      setConvertError(null);

      await convertQuotationToInvoice(id);

      navigate("/invoices");
    } catch (err) {
      setConvertError(err.message || "Failed to convert quotation to invoice");
      console.error("Conversion error:", err);
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/quotations")}
          className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error ? `Error: ${error.message}` : "Quotation not found"}
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800 border-gray-300",
      Sent: "bg-blue-100 text-blue-800 border-blue-300",
      Accepted: "bg-green-100 text-green-800 border-green-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {quotation.quotationNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date(quotation.createdAt?.toDate?.()).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <button
            onClick={() => navigate("/quotations")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Back
          </button>

          <button
            onClick={handleConvertToInvoice}
            disabled={isConverting || quotation.status === "Rejected"}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-medium transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? "Converting..." : "Convert to Invoice"}
          </button>
        </div>
      </div>

      {convertError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {convertError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Client Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {quotation.client?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-gray-900">
                  {quotation.client?.company}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.client?.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {quotation.client?.phone}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">
                  {quotation.client?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Line Items
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Rate
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quotation.items?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-900">
                        {item.description}
                      </td>

                      <td className="py-3 px-2 text-center text-gray-900">
                        {item.quantity}
                      </td>

                      <td className="py-3 px-2 text-right text-gray-900">
                        ৳{Number(item.rate).toFixed(2)}
                      </td>

                      <td className="py-3 px-2 text-right font-semibold text-gray-900">
                        ৳{(item.quantity * item.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              STATUS
            </h3>

            <span
              className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border ${getStatusColor(
                quotation.status
              )}`}
            >
              {quotation.status}
            </span>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Issue Date</p>
              <p className="font-semibold text-gray-900">
                {quotation.issueDate}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Valid Until</p>
              <p className="font-semibold text-gray-900">
                {quotation.validUntil}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-soft border border-purple-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">
                ৳{quotation.subtotal?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Tax</span>
              <span className="text-gray-900 font-semibold">
                ৳{quotation.tax?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Discount</span>
              <span className="text-gray-900 font-semibold">
                ৳{quotation.discount?.toFixed(2)}
              </span>
            </div>

            <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-purple-600">
                ৳{quotation.total?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quotation.notes && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {quotation.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotationView;
