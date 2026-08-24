import "./InfoBadge.css";

function InfoBadge({
  children,
  variant = "default",
  className = "",
  tooltip = null,
}) {
  return (
    <span className={`info-badge info-badge-${variant} ${className}`}>
      {children}

      {tooltip && (
        <span className="info-badge-tooltip">
          {tooltip.map((item) => (
            <span className="info-badge-tooltip-item" key={item}>
              {item}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

export default InfoBadge;
