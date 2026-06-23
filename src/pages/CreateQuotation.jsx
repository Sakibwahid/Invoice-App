import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createQuotation } from "../services/quotationService";

const CreateQuotation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      rate: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0,
  );

  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const form = e.target;

      const quotationData = {
        issueDate: form.issueDate.value,
        validUntil: form.validUntil.value,
        status: form.status.value,

        client: {
          name: form.clientName.value,
          company: form.companyName.value,
          email: form.email.value,
          phone: form.phone.value,
          address: form.address.value,
        },

        items,

        subtotal,
        tax,
        discount,
        total,

        notes: form.notes.value,

        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };

      await createQuotation(quotationData);

      await queryClient.invalidateQueries({ queryKey: ["quotations"] });

      navigate("/quotations");
    } catch (err) {
      setError(err.message || "Failed to create quotation");
      console.error("Failed to create quotation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Quotation
        </h1>
        <p className="text-gray-600 mt-1">
          Fill in the details below to create a new quotation
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quotation Information */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quotation Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Quotation Number (Auto)"
              disabled
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-600"
            />

            <input
              name="issueDate"
              type="date"
              required
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <input
              name="validUntil"
              type="date"
              required
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <select
              name="status"
              required
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="">Select Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Client Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="clientName"
              type="text"
              placeholder="Client Name"
              required
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <input
              name="companyName"
              type="text"
              placeholder="Company Name"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <input
              name="phone"
              type="text"
              placeholder="Phone"
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />

            <textarea
              name="address"
              rows="3"
              placeholder="Address"
              className="border border-gray-300 rounded-lg p-3 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quotation Items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-medium transition font-medium text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">
                    Rate
                  </th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Item description"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        min="1"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </td>

                    <td className="p-3 text-right font-semibold text-gray-900">
                      ৳{(item.quantity * item.rate).toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-soft border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>

          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Tax</span>
              <span className="text-gray-900 font-semibold">
                ৳{tax.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Discount</span>
              <span className="text-gray-900 font-semibold">
                ৳{discount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t-2 border-purple-300 pt-3">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-purple-600">
                ৳{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Additional Notes
          </h2>

          <textarea
            name="notes"
            rows="5"
            placeholder="Add any additional notes for the quotation..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-medium transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Save Quotation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotation;