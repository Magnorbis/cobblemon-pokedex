import "./ActiveFilters.css";

const filterNames = {
  types: "Type",
  evYield: "EV Yield",
  bucket: "Bucket",
  position: "Position",
  presets: "Preset",
  time: "Time",
  weather: "Weather",
  sky: "Sky",
  biomeReferences: "Biome Reference",
  biomes: "Biome",
  antiBiomeReferences: "Anti Biome Reference",
  antiBiomes: "Anti Biome",
  skyLight: "Sky Light",
  bait: "Bait",
  rodType: "Rod Type",
  moonPhase: "Moon Phase",
  baseBlocks: "Base Block",
  nearbyBlocks: "Nearby Block",
  structures: "Structure",
  slimeChunk: "Slime Chunk",
  minX: "Min X",
  maxX: "Max X",
  minY: "Min Y",
  maxY: "Max Y",
  minLureLevel: "Min Lure Level",
  maxLureLevel: "Max Lure Level",
  maxLight: "Max Light",
  antiTime: "Anti Time",
  antiSlimeChunk: "Anti Slime Chunk",
  antiMinY: "Anti Min Y",
  antiMaxY: "Anti Max Y",
  antiMinLureLevel: "Anti Min Lure Level",
  antiNearbyBlocks: "Anti Nearby Blocks",
  antiStructures: "Anti Structures",
  otherConditionFilter: "Other Conditions",
};

const rawValueCategories = [
  "biomeReferences",
  "biomes",
  "antiBiomeReferences",
  "antiBiomes",
];

// Format value
function formatFilterValue(value, category) {
  if (rawValueCategories.includes(category)) {
    return String(value);
  }

  // Split on - & _ and capitalize first letters
  // e.g. special_attack -> Special Attack
  return String(value)
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ActiveFilters({ filters, setFilters }) {
  // Formatting exceptions (weather, sky, slime chunks) + normal formatting
  const formatValue = (category, value) => {
    if (category === "weather") {
      return value === "rain" ? "Rain" : "Clear";
    }

    if (category === "sky") {
      return value === "-" ? "-" : value;
    }

    if (category === "slimeChunk" || category === "antiSlimeChunk") {
      return value;
    }

    if (value === "-") {
      return "-";
    }

    return formatFilterValue(value, category);
  };

  const removeFilter = (category, value) => {
    setFilters((previous) => {
      const current = previous[category];

      if (!Array.isArray(current)) {
        const next = { ...previous };
        delete next[category];
        return next;
      }

      const remaining = current.filter((item) => item !== value);

      if (remaining.length === 0) {
        const next = { ...previous };
        delete next[category];
        return next;
      }

      return {
        ...previous,
        [category]: remaining,
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Retrieve all active filters
  const activeFilters = Object.entries(filters).flatMap(
    ([category, values]) => {
      if (category.endsWith("Search")) {
        return [];
      }

      if (!Array.isArray(values) || values.length === 0) {
        return [];
      }

      const label = filterNames[category] || category;

      return values.map((value) => ({
        category,
        label,
        value,
      }));
    },
  );

  // Skylight information with 0-15 formatting
  if (filters.skyLightMin !== undefined || filters.skyLightMax !== undefined) {
    activeFilters.push({
      category: "skyLight",
      label: "Sky Light",
      value: `${filters.skyLightMin ?? 0}-${filters.skyLightMax ?? 15}`,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="active-filters">
      <div className="active-filters-header">
        <strong>Active Filters:</strong>

        <button
          className="active-filters-clear"
          type="button"
          onClick={clearFilters}
        >
          Clear All
        </button>
      </div>

      <div className="active-filters-list">
        {activeFilters.map((filter, index) => {
          return (
            <span
              className="active-filter"
              key={`${filter.category}-${filter.value}-${index}`}
            >
              <span className="active-filter-label">{filter.label}:</span>

              <span className="active-filter-value">
                {formatValue(filter.category, filter.value)}
              </span>

              <button
                className="active-filter-remove"
                type="button"
                aria-label={`Remove ${filter.label}: ${formatValue(
                  filter.category,
                  filter.value,
                )}`}
                onClick={() => removeFilter(filter.category, filter.value)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default ActiveFilters;
