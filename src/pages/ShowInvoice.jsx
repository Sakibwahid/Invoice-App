import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  Paid: {
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Unpaid: {
    badge: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  Partial: {
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${cfg.badge}`}
    >
      {status}
    </span>
  );
};

const ShowInvoice = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: invoices = [], isLoading, error } = useInvoices();

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setVisibleCount(PAGE_SIZE);
  };
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setVisibleCount(PAGE_SIZE);
  };

 const paidTotal = useMemo(() => invoices.reduce((s, i) => s + (i.paidAmount || (i.status === "Paid" ? i.total : 0) || 0), 0), [invoices]);
const unpaidTotal = useMemo(() => invoices.reduce((s, i) => s + (i.dueAmount || (i.status === "Unpaid" ? i.total : 0) || 0), 0), [invoices]);
  const grossTotal = useMemo(
    () => invoices.reduce((s, i) => s + (i.total || 0), 0),
    [invoices],
  );

  const filtered = useMemo(
    () =>
      invoices
        .filter((inv) => {
          const q = searchTerm.toLowerCase(); 
          const matchSearch =
            inv.invoiceNumber?.toLowerCase().includes(q) ||
            inv.client?.name?.toLowerCase().includes(q) ||
            inv.client?.company?.toLowerCase().includes(q);
          const matchStatus =
            statusFilter === "All" || inv.status === statusFilter;
          return matchSearch && matchStatus;
        })
        .sort((a, b) => {
          if (sortBy === "newest")
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
          if (sortBy === "oldest")
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
          if (sortBy === "highest") return (b.total || 0) - (a.total || 0);
          if (sortBy === "lowest") return (a.total || 0) - (b.total || 0);
          return 0;
        }),
    [invoices, searchTerm, statusFilter, sortBy],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const loadMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs tracking-wider text-slate-500 font-medium uppercase">
            Loading Invoices...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 md:p-8 font-[inter]">
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-xl text-xs font-normal">
          Failed to load invoices: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl font-[inter] mx-auto space-y-8 p-4 md:p-6 lg:p-8 animate-fadeIn text-slate-900 antialiased">
      {/* ── Header with Actions Placed Beside Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-blue-600 uppercase mb-1">
            Finance Hub
          </p>
          <h1 className="text-3xl font-medium text-slate-900 tracking-tight">
            Invoices
          </h1>
          <p className="text-slate-500 mt-1 text-base font-normal">
            Create, manage, and track your client billings.
          </p>
        </div>

        {/* Primary Action Buttons Positioned Higher Near Header */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Export dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition waves-effect shadow-sm">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
              <svg
                className="w-3 h-3 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 hidden group-focus-within:block overflow-hidden animate-fadeIn">
              <button className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition">
                Export by month
              </button>
              <button className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition">
                Export by year
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/invoices/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition shadow-sm shadow-slate-950/10"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Invoice
          </button>
        </div>
      </div>

      {/* ── Dashboard Analytics Grid (Layout Break Fixed) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Total Invoiced Card */}
        <div className="bg-white  rounded-xl p-6 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Invoiced
              </p>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="flex flex-col items-start xl:flex-row xl:items-baseline gap-0.5 xl:gap-1.5 min-w-0">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                AED
              </span>
              <p className="text-xl lg:text-xl font-medium text-slate-900 tracking-tight break-all xl:break-normal truncate w-full">
                {grossTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div
          onClick={() => handleFilterChange("Paid")}
          className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-emerald-200 cursor-pointer transition-all hover:shadow-md overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Paid Invoices
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex flex-col items-start xl:flex-row xl:items-baseline gap-0.5 xl:gap-1.5 min-w-0">
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">
                AED
              </span>
              <p className="text-xl lg:text-xl font-medium text-slate-900 tracking-tight break-all xl:break-normal truncate w-full">
                {paidTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Card */}
        <div
          onClick={() => handleFilterChange("Unpaid")}
          className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-rose-200 cursor-pointer transition-all hover:shadow-md overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Outstanding Balance
              </p>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="flex flex-col items-start xl:flex-row xl:items-baseline gap-0.5 xl:gap-1.5 min-w-0">
              <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">
                AED
              </span>
              <p className="text-xl lg:text-xl font-medium text-slate-900 tracking-tight break-all xl:break-normal truncate w-full">
                {unpaidTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => handleFilterChange("Unpaid")}
          className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-rose-200 cursor-pointer transition-all hover:shadow-md overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Outstanding Balance
              </p>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="flex flex-col items-start xl:flex-row xl:items-baseline gap-0.5 xl:gap-1.5 min-w-0">
              <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">
                AED
              </span>
              <p className="text-xl lg:text-xl font-medium text-slate-900 tracking-tight break-all xl:break-normal truncate w-full">
                {unpaidTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Control Layout ── */}
      <div className="space-y-2 pt-2">
        {/* Navigation Filters & Sort Menu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-6 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-6 no-scrollbar">
            {["All", "Paid", "Unpaid", "Partial"].map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => handleFilterChange(s)}
                  className={`pb-3 text-xs font-semibold tracking-wide transition-all relative ${
                    active
                      ? "text-slate-900 font-medium"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-2 pb-3 text-xs text-slate-600  font-medium hover:text-slate-900 transition focus:outline-none cursor-pointer bg-transparent"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="highest">Sort by: Highest Amount</option>
            <option value="lowest">Sort by: Lowest Amount</option>
          </select>
        </div>

        {/* Search Field Layout */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by invoice number, company, or client name…"
            className="w-full pl-10 pr-10 py-2.5 border-2 border-blue-300 focus:bg-white  focus:border-blue-700 rounded-md text-xs text-slate-900 font-medium placeholder-slate-500 transition-all focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Metadata Counts Row ── */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <p>
          Showing {visible.length} of {filtered.length} items
        </p>
        {(searchTerm || statusFilter !== "All") && (
          <button
            onClick={() => {
              handleSearchChange("");
              handleFilterChange("All");
            }}
            className="text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Content Table Area ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-20 text-center">
          <svg
            className="w-8 h-8 text-slate-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xs text-slate-500 font-medium">
            No invoices found matching your current filters.
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table Grid ── */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-3/12">Invoice Number</th>
                  <th className="px-6 py-4 w-3/12">Client</th>
                  <th className="px-6 py-4 w-2/12 hidden lg:table-cell">
                    Issue Date
                  </th>
                  <th className="px-6 py-4 w-2/12 hidden lg:table-cell">
                    Due Date
                  </th>
                  <th className="px-6 py-4 w-2/12 text-right">Amount</th>
                  <th className="px-6 py-4 w-1/12">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {visible.map((inv) => {
                  const isOverdue =
                    inv.status === "Unpaid" &&
                    inv.dueDate &&
                    new Date(inv.dueDate) < new Date();
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="group cursor-pointer hover:bg-slate-50/50 transition text-xs"
                    >
                      <td className="px-6 py-4.5 font-medium text-slate-900 group-hover:text-blue-600 transition">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="text-slate-900 font-semibold">
                          {inv.client?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {inv.client?.company}
                        </p>
                      </td>
                      <td className="px-6 py-4.5 hidden lg:table-cell text-slate-600 font-medium">
                        {inv.issueDate || "—"}
                      </td>
                      <td className="px-6 py-4.5 hidden lg:table-cell font-medium">
                        <span
                          className={
                            isOverdue
                              ? "text-rose-600 font-semibold"
                              : "text-slate-600"
                          }
                        >
                          {inv.dueDate || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-slate-900 font-medium">
                            <span className="text-xs text-slate-500 font-semibold mr-0.5">
                              AED
                            </span>
                            {inv.total?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        
                        </div>
                      </td>

                      <td className="px-6 py-4.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <svg
                          className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-0.5 ml-auto"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Stacked Cards Layout ── */}
          <div className="md:hidden space-y-3">
            {visible.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status] || { bar: "bg-slate-300" };
              return (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="group bg-white border border-slate-200 rounded-lg p-4 shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-1 h-9 rounded-full ${cfg.bar}`} />
                    <div>
                      <p className="text-xs font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {inv.client?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-xs font-medium text-slate-900">
                      <span className="text-xs text-slate-500 font-semibold mr-0.5">
                        AED
                      </span>
                      {inv.total?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Load More Button ── */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Load More · {filtered.length - visibleCount} remaining
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShowInvoice;