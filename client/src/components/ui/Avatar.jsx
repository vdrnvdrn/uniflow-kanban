import { API_URL } from "../../api";

const statusColor = {
  available: "bg-emerald-400",
  busy: "bg-amber-400",
  away: "bg-white/40",
};

const Avatar = ({ photo, alt = "", status, size = 40, className = "", showStatus = true }) => {
  const dotSize = Math.max(8, Math.round(size / 4));
  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={`${API_URL}/${photo}`}
        alt={alt}
        className="w-full h-full rounded-full object-cover border border-white/30"
      />
      {showStatus && status && statusColor[status] && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-[#1a1530] ${statusColor[status]}`}
          style={{ width: dotSize, height: dotSize }}
          title={status}
        />
      )}
    </div>
  );
};

export default Avatar;
