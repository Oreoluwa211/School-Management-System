const config = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  review: { label: "Under Review", className: "bg-purple-100 text-purple-700" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  fee_paid: { label: "Fee Paid", className: "bg-blue-100 text-blue-700" },
  enrolled: { label: "Enrolled", className: "bg-emerald-100 text-emerald-700" },
};

export default function StatusBadge({ status }) {
  const cfg = config[status] || { label: status, className: "bg-navy/10 text-navy/60" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}