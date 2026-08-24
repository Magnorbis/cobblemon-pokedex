import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./InfoBadge.css";

function InfoBadge({
  children,
  variant = "default",
  className = "",
  tooltip = null,
}) {
  const badgeRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const hasTooltip = tooltip && tooltip.length > 0;

  const updateTooltipPosition = () => {
    const badge = badgeRef.current;

    if (!badge) {
      return;
    }

    const badgeRect = badge.getBoundingClientRect();

    const estimatedTooltipHeight = Math.min(tooltip.length * 24 + 16, 256);

    const placeBelow = badgeRect.top < estimatedTooltipHeight + 8;

    setTooltipPosition({
      left: badgeRect.left + badgeRect.width / 2,
      top: placeBelow ? badgeRect.bottom : badgeRect.top,
      placement: placeBelow ? "bottom" : "top",
    });
  };

  const showTooltip = () => {
    if (!hasTooltip) {
      return;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    updateTooltipPosition();
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Small delay allows the mouse to move from the badge
    // onto the portaled tooltip without it disappearing.
    hideTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isTooltipVisible || !hasTooltip) {
      return;
    }

    const updatePosition = () => {
      const badge = badgeRef.current;

      if (!badge) {
        return;
      }

      const badgeRect = badge.getBoundingClientRect();

      const estimatedTooltipHeight = Math.min(tooltip.length * 24 + 16, 256);

      const placeBelow = badgeRect.top < estimatedTooltipHeight + 8;

      setTooltipPosition({
        left: badgeRect.left + badgeRect.width / 2,
        top: placeBelow ? badgeRect.bottom : badgeRect.top,
        placement: placeBelow ? "bottom" : "top",
      });
    };

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isTooltipVisible, hasTooltip, tooltip]);

  const tooltipElement =
    hasTooltip && isTooltipVisible && tooltipPosition ? (
      <span
        className={`info-badge-tooltip info-badge-tooltip-portal info-badge-tooltip-${tooltipPosition.placement}`}
        style={{
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`,
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {tooltip.map((item) => (
          <span className="info-badge-tooltip-item" key={item}>
            {item}
          </span>
        ))}
      </span>
    ) : null;

  return (
    <span
      ref={badgeRef}
      className={`info-badge info-badge-${variant} ${className}`}
      onMouseEnter={hasTooltip ? showTooltip : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltip : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
    >
      {children}

      {tooltipElement && createPortal(tooltipElement, document.body)}
    </span>
  );
}

export default InfoBadge;
