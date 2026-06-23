import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";
import { useQuotations } from "../hooks/useQuotations";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: invoices = [] } = useInvoices();
  const { data: quotations = [] } = useQuotations();

  // Helper function to format large currency amounts cleanly
  const formatCompactNumber = (number) => {
    if (number == null || isNaN(number)) return "0.00";
    
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    if (number >= 1_000_000_000) {
      return (number / 1_000_000_000).toFixed(2) + "B";
    }
    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(2) + "M";
    }
    if (number >= 1_000) {
      return (number / 1_000).toFixed(2) + "K";
    }
    
    return number.toLocaleString(undefined, options);
  };

  const stats = useMemo(() => {
    const revenue = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const paid = invoices.filter((inv) => inv.status === "Paid").length;
    const unpaid = invoices.filter((inv) => inv.status === "Unpaid").length;

    return {
      totalRevenue: formatCompactNumber(revenue),
      paidCount: paid,
      unpaidCount: unpaid,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices]);
  const recentQuotations = useMemo(() => quotations.slice(0, 5), [quotations]);

  const getInvoiceStatusStyle = (status) => {
    const styles = {
      Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Unpaid: "bg-rose-50 text-rose-600 border-rose-100",
      Partial: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return styles[status] || "bg-slate-50 text-slate-500 border-slate-100";
  };

  const getQuotationStatusStyle = (status) => {
    const styles = {
      Draft: "bg-slate-50 text-slate-500 border-slate-100",
      Sent: "bg-sky-50 text-sky-600 border-sky-100",
      Accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Rejected: "bg-rose-50 text-rose-600 border-rose-100",
    };
    return styles[status] || "bg-slate-50 text-slate-500 border-slate-100";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl font-[inter] mx-auto space-y-6 p-4 md:p-6 lg:p-8 animate-fadeIn text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase mb-1">{today}</p>
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Workspace Overview</h1>
          <p className="text-slate-400 mt-0.5 text-xs font-medium">Monitor your operational pipeline and fiscal growth.</p>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center">
          <button
            onClick={() => navigate("/quotations/create")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Create Quotation
          </button>

          <button
            onClick={() => navigate("/invoices/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm shadow-blue-500/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invoice
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="group bg-white/90 border border-white/60 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Revenue</p>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
            <span className="text-xs text-slate-400 font-medium mr-1">AED</span>{stats.totalRevenue}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> From settled entries
          </p>
        </div>

        {/* Paid Invoices */}
        <div className="group bg-white/90 border border-white/60 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Paid Invoices</p>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">{stats.paidCount}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Fully collected
          </p>
        </div>

        {/* Unpaid Invoices */}
        <div className="group bg-white/90 border border-white/60 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Unpaid Invoices</p>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">{stats.unpaidCount}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Awaiting payments
          </p>
        </div>

        {/* Total Quotations */}
        <div className="group bg-white/90 border border-white/60 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Quotations</p>
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">{quotations.length}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Lifetime pipeline
          </p>
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Invoices Table Area */}
        <div className="bg-white/90 border border-white/60 rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900 tracking-tight">Recent Invoices</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Quick look at latest client billings</p>
            </div>
            <button
              onClick={() => navigate("/invoices")}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1 bg-blue-50 rounded-lg transition-colors duration-200"
            >
              View all
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-12 my-auto bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-medium text-slate-400">No invoices generated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="pb-2 w-5/12">Invoice</th>
                    <th scope="col" className="pb-2 w-4/12">Client</th>
                    <th scope="col" className="pb-2 w-3/12 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="group cursor-pointer hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="py-3 pr-2 text-xs font-medium text-slate-800 group-hover:text-blue-600 transition-colors duration-150">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-400 font-medium truncate max-w-[120px]">
                        {inv.client?.name || "Unknown Client"}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium text-slate-900">
                            <span className="text-[10px] text-slate-400 font-normal mr-0.5">AED</span>
                            {inv.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-[9px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-md border ${getInvoiceStatusStyle(inv.status)}`}>
                            {inv.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Quotations Table Area */}
        <div className="bg-white/90 border border-white/60 rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900 tracking-tight">Recent Quotations</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Active business pipeline estimates</p>
            </div>
            <button
              onClick={() => navigate("/quotations")}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1 bg-blue-50 rounded-lg transition-colors duration-200"
            >
              View all
            </button>
          </div>

          {recentQuotations.length === 0 ? (
            <div className="text-center py-12 my-auto bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-medium text-slate-400">No quotations generated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="pb-2 w-5/12">Quotation</th>
                    <th scope="col" className="pb-2 w-4/12">Client</th>
                    <th scope="col" className="pb-2 w-3/12 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {recentQuotations.map((qt) => (
                    <tr
                      key={qt.id}
                      onClick={() => navigate(`/quotations/${qt.id}`)}
                      className="group cursor-pointer hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="py-3 pr-2 text-xs font-medium text-slate-800 group-hover:text-blue-600 transition-colors duration-150">
                        {qt.quotationNumber}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-400 font-medium truncate max-w-[120px]">
                        {qt.client?.name || "Unknown Client"}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium text-slate-900">
                            <span className="text-[10px] text-slate-400 font-normal mr-0.5">AED</span>
                            {qt.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-[9px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-md border ${getQuotationStatusStyle(qt.status)}`}>
                            {qt.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;