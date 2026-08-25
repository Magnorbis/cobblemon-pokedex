import { useState } from "react";
import "./FilterPanel.css";

const rawValueCategories = [
  "biomeReferences",
  "biomes",
  "antiBiomeReferences",
  "antiBiomes",
  "rodType",
  "bait",
  "nearbyBlocks",
  "baseBlocks",
  "structures",
  "skyLight",
  "minX",
  "maxX",
  "minY",
  "maxY",
  "maxLight",
  "antiNearbyBlocks",
  "antiStructures",
  "antiMinY",
  "antiMaxY",
];

const dedicatedConditionNames = [
  "timeRange",
  "isRaining",
  "canSeeSky",
  "minSkyLight",
  "maxSkyLight",
  "bait",
  "rodType",
  "moonPhase",
  "neededBaseBlocks",
  "neededNearbyBlocks",
  "minX",
  "maxX",
  "minY",
  "maxY",
  "maxLight",
  "isSlimeChunk",
  "structures",
  "minLureLevel",
  "maxLureLevel",
];

const dedicatedAntiConditionNames = [
  "biomes",
  "timeRange",
  "isSlimeChunk",
  "minY",
  "maxY",
  "minLureLevel",
  "neededNearbyBlocks",
  "structures",
];

const numericCategories = [
  "minX",
  "maxX",
  "minY",
  "maxY",
  "maxLight",
  "minLureLevel",
  "maxLureLevel",
  "antiMinY",
  "antiMaxY",
  "antiMinLureLevel",
];

// Default formatting
function formatFilterValue(value, category) {
  if (rawValueCategories.includes(category)) {
    return String(value);
  }

  return String(value)
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Remove namespace from biome references
function normalizedBiomeReference(reference) {
  return reference
    .replace(/^#cobblemon:/, "")
    .replace(/^#minecraft:/, "")
    .replace(/^#c:/, "");
}

function FilterPanel({
  pokemon,
  filters,
  setFilters,
  compatibleMode,
  setCompatibleMode,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const types = new Set();
  const evYields = new Set();
  const buckets = new Set();
  const positions = new Set();
  const presets = new Set();

  const times = new Set();
  const weathers = new Set();
  const skies = new Set();

  const biomeReferences = new Set();
  const actualBiomes = new Set();

  const antiBiomeReferences = new Set();
  const antiBiomes = new Set();

  const baits = new Set();
  const rodTypes = new Set();
  const moonPhases = new Set();
  const baseBlocks = new Set();
  const nearbyBlocks = new Set();
  const structures = new Set();
  const slimeChunks = new Set();

  const minXs = new Set();
  const maxXs = new Set();
  const minYs = new Set();
  const maxYs = new Set();
  const maxLights = new Set();

  const minLureLevels = new Set();
  const maxLureLevels = new Set();

  const antiTimes = new Set();
  const antiSlimeChunks = new Set();
  const antiMinYs = new Set();
  const antiMaxYs = new Set();
  const antiMinLureLevels = new Set();
  const antiNearbyBlocks = new Set();
  const antiStructures = new Set();

  const skyLights = new Set();

  const otherConditions = {};
  const antiOtherConditions = {};

  const spawnEntries = pokemon.flatMap((pokemonEntry) =>
    pokemonEntry.spawns.map((spawn) => ({
      pokemon: pokemonEntry,
      spawn,
    })),
  );

  // Retrieve all different options and put them in their sets
  pokemon.forEach((pokemonEntry) => {
    pokemonEntry.types?.forEach((type) => {
      types.add(type);
    });

    pokemonEntry.evYield?.forEach((evYield) => {
      evYields.add(evYield);
    });

    pokemonEntry.spawns?.forEach((spawn) => {
      if (spawn.bucket) {
        buckets.add(spawn.bucket);
      }

      if (spawn.position) {
        positions.add(spawn.position);
      }

      spawn.presets?.forEach((preset) => {
        presets.add(preset);
      });

      spawn.biomes?.forEach((biome) => {
        if (biome.reference) {
          biomeReferences.add(normalizedBiomeReference(biome.reference));
        }

        biome.biomes?.forEach((actualBiome) => {
          actualBiomes.add(actualBiome);
        });
      });

      spawn.anticonditions?.biomes?.forEach((biome) => {
        if (biome.reference) {
          antiBiomeReferences.add(normalizedBiomeReference(biome.reference));
        }

        biome.biomes?.forEach((actualBiome) => {
          antiBiomes.add(actualBiome);
        });
      });

      // Get all conditions and anticonditions and add to their sets
      const conditions = spawn.conditions || {};
      const anticonditions = spawn.anticonditions || {};

      if (conditions.timeRange) {
        times.add(conditions.timeRange);
      }

      if ("isRaining" in conditions) {
        weathers.add(conditions.isRaining ? "rain" : "clear");
      }

      if ("canSeeSky" in conditions) {
        skies.add(conditions.canSeeSky ? "Yes" : "No");
      }

      if (
        conditions.minSkyLight !== undefined ||
        conditions.maxSkyLight !== undefined
      ) {
        const min = conditions.minSkyLight ?? 0;
        const max = conditions.maxSkyLight ?? 15;

        skyLights.add(`${min}-${max}`);
      }

      if (conditions.bait) {
        baits.add(conditions.bait);
      }

      if (conditions.rodType) {
        rodTypes.add(conditions.rodType);
      }

      if (conditions.moonPhase) {
        conditions.moonPhase
          .split(",")
          .map((phase) => phase.trim())
          .forEach((phase) => moonPhases.add(phase));
      }

      if (conditions.neededBaseBlocks) {
        conditions.neededBaseBlocks.forEach((block) => {
          baseBlocks.add(block);
        });
      }

      if (conditions.neededNearbyBlocks) {
        conditions.neededNearbyBlocks.forEach((block) => {
          nearbyBlocks.add(block);
        });
      }

      if (conditions.structures) {
        conditions.structures.forEach((structure) => {
          structures.add(structure);
        });
      }

      if (conditions.isSlimeChunk === true) {
        slimeChunks.add("Yes");
      }

      if (conditions.minX !== undefined) {
        minXs.add(String(conditions.minX));
      }

      if (conditions.maxX !== undefined) {
        maxXs.add(String(conditions.maxX));
      }

      if (conditions.minY !== undefined) {
        minYs.add(String(conditions.minY));
      }

      if (conditions.maxY !== undefined) {
        maxYs.add(String(conditions.maxY));
      }

      if (conditions.maxLight !== undefined) {
        maxLights.add(String(conditions.maxLight));
      }

      if (conditions.minLureLevel !== undefined) {
        minLureLevels.add(String(conditions.minLureLevel));
      }

      if (conditions.maxLureLevel !== undefined) {
        maxLureLevels.add(String(conditions.maxLureLevel));
      }

      if (anticonditions.timeRange) {
        antiTimes.add(anticonditions.timeRange);
      }

      if (anticonditions.isSlimeChunk === true) {
        antiSlimeChunks.add("Yes");
      }

      if (anticonditions.minY !== undefined) {
        antiMinYs.add(String(anticonditions.minY));
      }

      if (anticonditions.maxY !== undefined) {
        antiMaxYs.add(String(anticonditions.maxY));
      }

      if (anticonditions.neededNearbyBlocks) {
        anticonditions.neededNearbyBlocks.forEach((block) => {
          antiNearbyBlocks.add(block);
        });
      }

      if (anticonditions.structures) {
        anticonditions.structures.forEach((structure) => {
          antiStructures.add(structure);
        });
      }

      if (anticonditions.minLureLevel !== undefined) {
        antiMinLureLevels.add(String(anticonditions.minLureLevel));
      }

      // Add all other conditions in case these exist
      Object.entries(conditions).forEach(([condition, value]) => {
        if (dedicatedConditionNames.includes(condition)) {
          return;
        }

        if (!otherConditions[condition]) {
          otherConditions[condition] = new Set();
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            otherConditions[condition].add(String(item));
          });
        } else {
          otherConditions[condition].add(String(value));
        }
      });

      // Add all other anticonditions in case these exist
      Object.entries(anticonditions).forEach(([condition, value]) => {
        if (dedicatedAntiConditionNames.includes(condition)) {
          return;
        }

        if (!antiOtherConditions[condition]) {
          antiOtherConditions[condition] = new Set();
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            antiOtherConditions[condition].add(String(item));
          });
        } else {
          antiOtherConditions[condition].add(String(value));
        }
      });
    });
  });

  // Default sorting
  const sorted = (values) =>
    [...values].sort((a, b) => String(a).localeCompare(String(b)));

  const spawnHasBiomeReference = (spawn, value) => {
    return spawn.biomes?.some(
      (biome) =>
        biome.reference && normalizedBiomeReference(biome.reference) === value,
    );
  };

  const spawnHasBiome = (spawn, value) => {
    return spawn.biomes?.some((biome) => biome.biomes?.includes(value));
  };

  const spawnHasAntiBiomeReference = (spawn, value) => {
    return spawn.anticonditions?.biomes?.some(
      (biome) =>
        biome.reference && normalizedBiomeReference(biome.reference) === value,
    );
  };

  const spawnHasAntiBiome = (spawn, value) => {
    return spawn.anticonditions?.biomes?.some((biome) =>
      biome.biomes?.includes(value),
    );
  };

  const spawnHasConditionArrayValue = (spawn, condition, value) => {
    return spawn.conditions?.[condition]?.includes(value);
  };

  const spawnHasAntiConditionArrayValue = (spawn, condition, value) => {
    return spawn.anticonditions?.[condition]?.includes(value);
  };

  const matchesFilterValue = (entry, category, value) => {
    const { pokemon: pokemonEntry, spawn } = entry;
    const conditions = spawn.conditions || {};
    const anticonditions = spawn.anticonditions || {};

    // Check if value is present (within its category) in spawn
    switch (category) {
      case "types":
        return pokemonEntry.types?.includes(value);

      case "evYield":
        return pokemonEntry.evYield?.includes(value);

      case "bucket":
        return spawn.bucket === value;

      case "position":
        return spawn.position === value;

      case "presets":
        return spawn.presets?.includes(value);

      case "time":
        return conditions.timeRange === value;

      case "weather":
        if (!("isRaining" in conditions)) {
          return false;
        }

        return value === "rain"
          ? conditions.isRaining === true
          : conditions.isRaining === false;

      case "sky":
        if (!("canSeeSky" in conditions)) {
          return false;
        }

        return value === "Yes"
          ? conditions.canSeeSky === true
          : conditions.canSeeSky === false;

      case "biomeReferences":
        return spawnHasBiomeReference(spawn, value);

      case "biomes":
        return spawnHasBiome(spawn, value);

      case "antiBiomeReferences":
        return spawnHasAntiBiomeReference(spawn, value);

      case "antiBiomes":
        return spawnHasAntiBiome(spawn, value);

      case "skyLight": {
        const min = conditions.minSkyLight ?? 0;
        const max = conditions.maxSkyLight ?? 15;

        return `${min}-${max}` === String(value);
      }

      case "bait":
        return conditions.bait === value;

      case "rodType":
        return conditions.rodType === value;

      case "moonPhase":
        return conditions.moonPhase
          ?.split(",")
          .map((phase) => phase.trim())
          .includes(value);

      case "baseBlocks":
        return spawnHasConditionArrayValue(spawn, "neededBaseBlocks", value);

      case "nearbyBlocks":
        return spawnHasConditionArrayValue(spawn, "neededNearbyBlocks", value);

      case "structures":
        return spawnHasConditionArrayValue(spawn, "structures", value);

      case "slimeChunk":
        if (!("isSlimeChunk" in conditions)) {
          return false;
        }

        return value === "Yes"
          ? conditions.isSlimeChunk === true
          : conditions.isSlimeChunk === false;

      case "minX":
        return (
          conditions.minX !== undefined &&
          String(conditions.minX) === String(value)
        );

      case "maxX":
        return (
          conditions.maxX !== undefined &&
          String(conditions.maxX) === String(value)
        );

      case "minY":
        return (
          conditions.minY !== undefined &&
          String(conditions.minY) === String(value)
        );

      case "maxY":
        return (
          conditions.maxY !== undefined &&
          String(conditions.maxY) === String(value)
        );

      case "maxLight":
        return (
          conditions.maxLight !== undefined &&
          String(conditions.maxLight) === String(value)
        );

      case "minLureLevel":
        return (
          conditions.minLureLevel !== undefined &&
          String(conditions.minLureLevel) === String(value)
        );

      case "maxLureLevel":
        return (
          conditions.maxLureLevel !== undefined &&
          String(conditions.maxLureLevel) === String(value)
        );

      case "antiTime":
        return anticonditions.timeRange === value;

      case "antiIsSlimeChunk":
        return anticonditions.isSlimeChunk === true && value === "Yes";

      case "antiMinY":
        return (
          anticonditions.minY !== undefined &&
          String(anticonditions.minY) === String(value)
        );

      case "antiMaxY":
        return (
          anticonditions.maxY !== undefined &&
          String(anticonditions.maxY) === String(value)
        );

      case "antiMinLureLevel":
        return (
          anticonditions.minLureLevel !== undefined &&
          String(anticonditions.minLureLevel) === String(value)
        );

      case "antiNearbyBlocks":
        return spawnHasAntiConditionArrayValue(
          spawn,
          "neededNearbyBlocks",
          value,
        );

      case "antiStructures":
        return spawnHasAntiConditionArrayValue(spawn, "structures", value);

      default:
        if (category.startsWith("other.")) {
          const condition = category.slice(6);

          if (!(condition in conditions)) {
            return false;
          }

          const conditionValue = conditions[condition];

          if (Array.isArray(conditionValue)) {
            return conditionValue.map((item) => String(item)).includes(value);
          }

          return String(conditionValue) === value;
        }

        if (category.startsWith("antiOther.")) {
          const condition = category.slice(10);
          const antiConditions = spawn.anticonditions || {};

          if (!(condition in antiConditions)) {
            return false;
          }

          const conditionValue = antiConditions[condition];

          if (Array.isArray(conditionValue)) {
            return conditionValue.map((item) => String(item)).includes(value);
          }

          return String(conditionValue) === value;
        }

        return false;
    }
  };

  // Check if spawn matches all selected filters
  const matchesSelectedFilters = (
    entry,
    ignoredCategory = null,
    additionalCategory = null,
    additionalValue = null,
  ) => {
    const categories = Object.keys(filters);

    for (const category of categories) {
      if (
        category.endsWith("Search") ||
        category === "compatibleMode" ||
        category === ignoredCategory
      ) {
        continue;
      }

      const selected = filters[category];

      if (!Array.isArray(selected) || selected.length === 0) {
        continue;
      }

      let matchesCategory;

      if (
        compatibleMode &&
        (category === "biomes" || category === "antiBiomes")
      ) {
        const biomeGroups =
          category === "biomes"
            ? entry.spawn.biomes
            : entry.spawn.anticonditions?.biomes;

        matchesCategory = biomeGroups?.some((biome) =>
          selected.every((value) => biome.biomes?.includes(value)),
        );
      } else {
        matchesCategory = compatibleMode
          ? selected.every((value) =>
              matchesFilterValue(entry, category, value),
            )
          : selected.some((value) =>
              matchesFilterValue(entry, category, value),
            );
      }

      if (!matchesCategory) {
        return false;
      }
    }

    if (additionalCategory) {
      return matchesFilterValue(entry, additionalCategory, additionalValue);
    }

    return true;
  };

  // Check if filter is available in compatibleMode
  const isFilterValueAvailable = (category, value) => {
    if (!compatibleMode) {
      return true;
    }

    return spawnEntries.some((entry) => {
      if (!matchesSelectedFilters(entry, category)) {
        return false;
      }

      const selected = filters[category] || [];

      if (category === "biomes") {
        const biomeGroups = entry.spawn.biomes || [];
        const antiBiomeGroups = entry.spawn.anticonditions?.biomes || [];

        const candidateValues = [...selected, value];

        const matchesPositive = biomeGroups.some((biome) =>
          candidateValues.every((selectedBiome) =>
            biome.biomes?.includes(selectedBiome),
          ),
        );

        if (!matchesPositive) {
          return false;
        }

        const conflictsWithAntiBiome = candidateValues.some((selectedBiome) =>
          antiBiomeGroups.some((antiBiome) =>
            antiBiome.biomes?.includes(selectedBiome),
          ),
        );

        if (conflictsWithAntiBiome) {
          return false;
        }

        return true;
      }

      if (category === "antiBiomes") {
        const antiBiomeGroups = entry.spawn.anticonditions?.biomes || [];

        const candidateValues = [...selected, value];

        const matchesAnti = antiBiomeGroups.some((biome) =>
          candidateValues.every((selectedBiome) =>
            biome.biomes?.includes(selectedBiome),
          ),
        );

        if (!matchesAnti) {
          return false;
        }

        const selectedPositiveBiomes = filters.biomes || [];

        const conflictsWithPositive = candidateValues.some(
          (selectedAntiBiome) =>
            selectedPositiveBiomes.includes(selectedAntiBiome),
        );

        if (conflictsWithPositive) {
          return false;
        }

        return true;
      }

      return [...selected, value].every((selectedValue) =>
        matchesFilterValue(entry, category, selectedValue),
      );
    });
  };

  // Toggle filter (checkbox)
  const toggleFilter = (category, value) => {
    setFilters((previous) => {
      const current = previous[category] || [];

      if (current.includes(value)) {
        return {
          ...previous,
          [category]: current.filter((item) => item !== value),
        };
      }

      return {
        ...previous,
        [category]: [...current, value],
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const renderFilter = (label, category, values) => {
    // (Customized) sorting for different categories
    const sortedValues =
      category === "sky"
        ? ["Yes", "No"].filter((value) => values.has(value))
        : category === "bucket"
          ? ["common", "uncommon", "rare", "ultra-rare"].filter((value) =>
              values.has(value),
            )
          : category === "skyLight"
            ? [...values].sort((a, b) => {
                const [aMin, aMax] = a.split("-").map(Number);
                const [bMin, bMax] = b.split("-").map(Number);

                return aMin - bMin || aMax - bMax;
              })
            : numericCategories.includes(category)
              ? [...values].sort((a, b) => Number(a) - Number(b))
              : sorted(values);

    const hasSelected = filters[category]?.length > 0;

    return (
      <details className="filter-section" key={category}>
        <summary className="filter-section-header">
          <span>{label}</span>

          {hasSelected && (
            <button
              className="filter-button-clear"
              type="button"
              onClick={(event) => {
                event.preventDefault();

                setFilters((previous) => {
                  const next = { ...previous };
                  delete next[category];
                  return next;
                });
              }}
            >
              Clear
            </button>
          )}
        </summary>

        <div className="filter-options">
          {sortedValues.map((value) => {
            const selected = filters[category]?.includes(value) || false;
            const available = isFilterValueAvailable(category, value);

            return (
              <label
                className="filter-option"
                key={value}
                style={{
                  opacity: !available && !selected ? 0.4 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!available && !selected}
                  onChange={() => toggleFilter(category, value)}
                />

                {formatFilterValue(value, category)}
              </label>
            );
          })}
        </div>
      </details>
    );
  };

  // Searchable checkbox filter
  const renderSearchableFilter = (label, category, values) => {
    const sortedValues = sorted(values);
    const search = filters[`${category}Search`] || "";

    const filteredValues = sortedValues.filter((value) =>
      String(value).toLowerCase().includes(search.toLowerCase()),
    );

    const hasSelected =
      filters[category]?.length > 0 || Boolean(filters[`${category}Search`]);

    return (
      <details className="filter-section">
        <summary className="filter-section-header">
          <span>{label}</span>

          {hasSelected && (
            <button
              className="filter-button-clear"
              type="button"
              onClick={(event) => {
                event.preventDefault();

                setFilters((previous) => {
                  const next = { ...previous };
                  delete next[category];
                  delete next[`${category}Search`];
                  return next;
                });
              }}
            >
              Clear
            </button>
          )}
        </summary>

        <input
          className="filter-search"
          type="text"
          placeholder={`Search ${label.toLowerCase()}...`}
          value={search}
          onChange={(event) =>
            setFilters((previous) => ({
              ...previous,
              [`${category}Search`]: event.target.value,
            }))
          }
        />

        <div className="filter-options">
          {filteredValues.map((value) => {
            const selected = filters[category]?.includes(value) || false;
            const available = isFilterValueAvailable(category, value);

            return (
              <label
                className="filter-option"
                key={value}
                style={{
                  opacity: !available && !selected ? 0.4 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!available && !selected}
                  onChange={() => toggleFilter(category, value)}
                />

                {formatFilterValue(value, category)}
              </label>
            );
          })}
        </div>
      </details>
    );
  };

  return (
    <>
      <button
        className="filter-panel-open"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Filters
      </button>

      {isOpen && (
        <button
          className="filter-panel-backdrop"
          type="button"
          aria-label="Close filters"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`filter-panel ${isOpen ? "filter-panel-opened" : ""}`}>
        <div className="filter-panel-header">
          <h2>Filters</h2>

          <div className="filter-panel-header-actions">
            <button
              className="filter-button-clear"
              type="button"
              onClick={clearFilters}
            >
              Clear All
            </button>

            <button
              className="filter-panel-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
            >
              ×
            </button>
          </div>
        </div>

        <div className="filter-panel-content">
          <div className="compatible-filter">
              <span>Compatible Filters</span>

            <button
              className={`filter-button ${
                compatibleMode ? "filter-button-active" : ""
              }`}
              type="button"
              onClick={() => {
                setCompatibleMode((previous) => {
                  const newValue = !previous;

                  if (newValue) {
                    setFilters({});
                  }

                  return newValue;
                });
              }}
            >
              {compatibleMode ? "On" : "Off"}
            </button>
          </div>

          {renderFilter("Types", "types", types)}

          {renderFilter("EV Yield", "evYield", evYields)}

          {renderFilter("Bucket", "bucket", buckets)}

          {renderFilter("Position", "position", positions)}

          {renderSearchableFilter("Presets", "presets", presets)}

          {renderFilter("Time", "time", times)}

          {renderFilter("Weather", "weather", weathers)}

          {renderFilter("Sky", "sky", skies)}

          {renderSearchableFilter(
            "Biome References",
            "biomeReferences",
            biomeReferences,
          )}

          {renderSearchableFilter("Biomes", "biomes", actualBiomes)}

          {renderSearchableFilter(
            "Anti Biome References",
            "antiBiomeReferences",
            antiBiomeReferences,
          )}

          {renderSearchableFilter("Anti Biomes", "antiBiomes", antiBiomes)}

          {renderFilter("Sky Light", "skyLight", skyLights)}

          {renderFilter("Bait", "bait", baits)}

          {renderFilter("Rod Type", "rodType", rodTypes)}

          {renderFilter("Moon Phase", "moonPhase", moonPhases)}

          {renderSearchableFilter("Base Blocks", "baseBlocks", baseBlocks)}

          {renderSearchableFilter(
            "Nearby Blocks",
            "nearbyBlocks",
            nearbyBlocks,
          )}

          {renderSearchableFilter("Structures", "structures", structures)}

          {renderFilter("Slime Chunk", "slimeChunk", slimeChunks)}

          {renderFilter("Min X", "minX", minXs)}

          {renderFilter("Max X", "maxX", maxXs)}

          {renderFilter("Min Y", "minY", minYs)}

          {renderFilter("Max Y", "maxY", maxYs)}

          {renderFilter("Min Lure Level", "minLureLevel", minLureLevels)}

          {renderFilter("Max Lure Level", "maxLureLevel", maxLureLevels)}

          {renderFilter("Max Light", "maxLight", maxLights)}

          {renderFilter("Anti Time", "antiTime", antiTimes)}

          {renderFilter("Anti Slime Chunk", "antiSlimeChunk", antiSlimeChunks)}

          {renderFilter("Anti Min Y", "antiMinY", antiMinYs)}

          {renderFilter("Anti Max Y", "antiMaxY", antiMaxYs)}

          {renderFilter(
            "Anti Min Lure Level",
            "antiMinLureLevel",
            antiMinLureLevels,
          )}

          {renderSearchableFilter(
            "Anti Nearby Blocks",
            "antiNearbyBlocks",
            antiNearbyBlocks,
          )}

          {renderSearchableFilter(
            "Anti Structures",
            "antiStructures",
            antiStructures,
          )}

          {Object.keys(otherConditions)
            .sort()
            .map((condition) =>
              renderFilter(
                condition,
                `other.${condition}`,
                otherConditions[condition],
              ),
            )}

          {Object.keys(antiOtherConditions)
            .sort()
            .map((condition) =>
              renderFilter(
                `Anti ${formatFilterValue(condition, "other")}`,
                `antiOther.${condition}`,
                antiOtherConditions[condition],
              ),
            )}
        </div>
      </aside>
    </>
  );
}

export default FilterPanel;
