const StatCard = ({ icon: IconComponent, label, value, subtext }) => {
  return (
    <div className="glass-card-subtle border-t border-white/30 p-4">
      <div className="text-white/50 mb-1">
        {typeof IconComponent === 'string' ? (
          <span className="text-2xl">{IconComponent}</span>
        ) : (
          <IconComponent className="w-6 h-6" />
        )}
      </div>
      <div className="text-sm font-medium text-white/60">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtext && (
        <div className="text-xs text-white/50 mt-1">{subtext}</div>
      )}
    </div>
  );
};

export default StatCard;
