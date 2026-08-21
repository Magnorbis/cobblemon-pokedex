import "./InfoBadge.css";

function InfoBadge({ children, variant = "default", className = "" }) {
    return (
        <span className={`info-badge info-badge-${variant} ${className}`}>
            {children}
        </span>
    );
}

export default InfoBadge;