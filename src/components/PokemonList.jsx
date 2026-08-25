import { useState } from "react";
import "./PokemonList.css";
import InfoBadge from "./InfoBadge";
import LoadMore from "./LoadMore";

const allColumns = [
  { key: "dex", label: "Dex", sortable: true, defaultVisible: true },
  { key: "name", label: "Name", sortable: true, defaultVisible: true },
  { key: "types", label: "Types", sortable: false, defaultVisible: false },
  {
    key: "evYield",
    label: "EV Yield",
    sortable: false,
    defaultVisible: false,
  },
  { key: "bucket", label: "Bucket", sortable: true, defaultVisible: true },
  { key: "level", label: "Level", sortable: true, defaultVisible: false },
  { key: "weight", label: "Weight", sortable: true, defaultVisible: true },
  {
    key: "multiplier",
    label: "Multiplier",
    sortable: false,
    defaultVisible: true,
  },
  { key: "biomes", label: "Biomes", sortable: false, defaultVisible: true },
  {
    key: "antiBiomes",
    label: "Anti Biomes",
    sortable: false,
    defaultVisible: true,
  },
  {
    key: "position",
    label: "Position",
    sortable: true,
    defaultVisible: true,
  },
  { key: "presets", label: "Presets", sortable: false, defaultVisible: true },
  { key: "time", label: "Time", sortable: true, defaultVisible: true },
  { key: "weather", label: "Weather", sortable: true, defaultVisible: true },
  {
    key: "skyLight",
    label: "Sky Light",
    sortable: true,
    defaultVisible: true,
  },
  { key: "sky", label: "Sky", sortable: true, defaultVisible: true },
  { key: "other", label: "Other", sortable: false, defaultVisible: true },
];

const bucketOrder = {
  common: 1,
  uncommon: 2,
  rare: 3,
  "ultra-rare": 4,
};

const timeOrder = {
  day: 1,
  dusk: 2,
  night: 3,
};

const biomeReferenceColors = {
  // Forest / vegetation
  is_forest: "forest",
  is_jungle: "forest",
  is_bamboo: "forest",
  is_taiga: "forest",

  // Grasslands / open vegetation
  is_grassland: "grass",
  is_plains: "grass",
  is_shrubland: "grass",

  // Flowers / lush vegetation
  is_floral: "floral",
  is_cherry_blossom: "floral",
  is_lush: "floral",

  // Wetlands
  is_swamp: "swamp",

  // Beaches / coasts
  is_beach: "beach",
  is_coast: "beach",

  // Dry / arid
  is_desert: "desert",
  is_arid: "desert",
  is_badlands: "desert",
  is_savanna: "desert",
  is_sandy: "desert",

  // Oceans
  is_ocean: "ocean",
  is_deep_ocean: "ocean",
  is_cold_ocean: "ocean",
  is_lukewarm_ocean: "ocean",
  is_warm_ocean: "ocean",
  is_frozen_ocean: "ocean",

  // Rivers / freshwater
  is_river: "river",
  is_freshwater: "river",

  // Cold / snowy
  is_cold: "cold",
  is_freezing: "cold",
  is_glacial: "cold",
  is_snowy: "cold",
  is_snowy_forest: "cold",
  is_snowy_taiga: "cold",
  is_tundra: "cold",

  // Mountains / elevated terrain
  is_mountain: "mountain",
  is_highlands: "mountain",
  is_hills: "mountain",
  is_peak: "mountain",
  is_plateau: "mountain",
  is_island: "mountain",

  // Caves / underground
  is_cave: "cave",
  is_dripstone: "cave",
  is_deep_dark: "cave",

  // Mushroom
  is_mushroom: "mushroom",

  // Magical / unusual
  is_magical: "magical",
  is_spooky: "magical",

  // Sky
  is_sky: "sky",

  // End
  is_end: "end",

  // General Overworld
  is_overworld: "overworld",

  // Temperate
  is_temperate: "temperate",

  // Hot / volcanic
  is_thermal: "volcanic",
  is_volcanic: "volcanic",

  // Nether
  is_nether: "nether",
  "nether/is_basalt": "nether-basalt",
  "nether/is_crimson": "nether-crimson",
  "nether/is_desert": "nether-desert",
  "nether/is_fungus": "nether-fungus",
  "nether/is_mountain": "nether-mountain",
  "nether/is_soul_fire": "nether-soul",
  "nether/is_soul_sand": "nether-soul",
  "nether/is_warped": "nether-warped",
  "nether/is_wasteland": "nether-wasteland",
};

const biomeColors = {
  "minecraft:mushroom_fields": "mushroom",
  "minecraft:sunflower_plains": "sunflower",
  "minecraft:frozen_river": "frozen-river",
  "minecraft:snowy_beach": "snowy-beach",
};

function capitalize(value) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Form formatting
function formatForm(form) {
  if (!form) {
    return null;
  }

  const regionMatch = form.match(/^region_bias=(.+)$/i);

  if (regionMatch) {
    return capitalize(regionMatch[1]);
  }

  return form
    .split(" ")
    .map((part) => {
      const [key, value] = part.split("=");

      if (!value) {
        return capitalize(key);
      }

      return `${capitalize(key)}: ${capitalize(value)}`;
    })
    .join(", ");
}

function formatName(pokemon, spawn) {
  const form = formatForm(spawn.form);

  return form ? `${pokemon.name} (${form})` : pokemon.name;
}

function formatTypes(types) {
  if (!types || types.length === 0) {
    return "-";
  }

  return (
    <div className="pokemon-list-badges">
      {types.map((type) => (
        <InfoBadge key={type} variant={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </InfoBadge>
      ))}
    </div>
  );
}

function formatEvYield(evYield) {
  if (!evYield || evYield.length === 0) {
    return "-";
  }

  return (
    <div className="pokemon-list-badges">
      {evYield.map((stat) => {
        const normalizedStat = stat.toLowerCase().replaceAll("_", "-");

        const formattedStat = stat
          .split(/[\s_]+/)
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ");

        return (
          <InfoBadge key={stat} variant={`ev-${normalizedStat}`}>
            {formattedStat}
          </InfoBadge>
        );
      })}
    </div>
  );
}

function formatBucket(bucket) {
  if (!bucket) {
    return "-";
  }

  return bucket
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatBiomes(biomeGroups, biomeData) {
  if (!biomeGroups || biomeGroups.length === 0) {
    return "-";
  }

  return (
    <div className="pokemon-list-badges">
      {biomeGroups.map((biome, index) => {
        if (biome.reference) {
          const normalizedReference = biome.reference.replace(/^#/, "");

          const reference = normalizedReference.replace(
            /^(?:cobblemon|minecraft|terralith|c):/,
            "",
          );

          const biomeColor = biomeReferenceColors[reference] || "default";
          const actualBiomes = biomeData?.[normalizedReference] || [];

          return (
            <InfoBadge
              key={`reference-${biome.reference}-${index}`}
              variant="biome-reference"
              className={`info-badge-biome-reference-${biomeColor}`}
              tooltip={actualBiomes}
            >
              {reference}
            </InfoBadge>
          );
        }

        if (biome.biomes?.length > 0) {
          return biome.biomes.map((actualBiome) => {
            const biomeColor = biomeColors[actualBiome] || "default";

            return (
              <InfoBadge
                key={`actual-${actualBiome}`}
                variant="biome"
                className={`info-badge-biome-${biomeColor}`}
              >
                {actualBiome}
              </InfoBadge>
            );
          });
        }

        return null;
      })}
    </div>
  );
}

function formatAntiBiomes(anticonditions, biomeData) {
  return formatBiomes(anticonditions?.biomes, biomeData);
}

function formatPosition(position) {
  if (!position) {
    return "-";
  }

  const formattedPosition =
    position.charAt(0).toUpperCase() + position.slice(1);

  return <InfoBadge>{formattedPosition}</InfoBadge>;
}

function formatPresets(presets) {
  if (!presets || presets.length === 0) {
    return "-";
  }

  return (
    <div className="pokemon-list-badges">
      {presets.map((preset) => {
        const formattedPreset = preset
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return <InfoBadge key={preset}>{formattedPreset}</InfoBadge>;
      })}
    </div>
  );
}

function formatTime(conditions) {
  if (!conditions.timeRange) {
    return <InfoBadge>Any</InfoBadge>;
  }

  const time = conditions.timeRange.toLowerCase();

  const formattedTime = time.charAt(0).toUpperCase() + time.slice(1);

  return <InfoBadge variant={`time-${time}`}>{formattedTime}</InfoBadge>;
}

function formatWeather(conditions) {
  if (conditions.isRaining === undefined) {
    return <InfoBadge>Any</InfoBadge>;
  }

  const weather = conditions.isRaining ? "Rain" : "Clear";

  return (
    <InfoBadge variant={`weather-${weather.toLowerCase()}`}>
      {weather.charAt(0).toUpperCase() + weather.slice(1)}
    </InfoBadge>
  );
}

function formatSkyLight(conditions) {
  const min = conditions.minSkyLight;
  const max = conditions.maxSkyLight;

  if (min === undefined && max === undefined) {
    return "-";
  }

  if (min === undefined) {
    return `0-${max}`;
  }

  if (max === undefined) {
    return `${min}-15`;
  }

  return `${min}-${max}`;
}

function formatSky(conditions) {
  if (conditions.canSeeSky === undefined) {
    return "-";
  }

  return conditions.canSeeSky ? "Yes" : "No";
}

function formatConditionName(condition) {
  const names = {
    minLureLevel: "Min. Lure Level",
    maxLureLevel: "Max. Lure Level",
    moonPhase: "Moon Phase",
    neededBaseBlocks: "Base Blocks",
    neededNearbyBlocks: "Nearby Blocks",
    structures: "Structure",
    timeRange: "Time",
    isRaining: "Weather",
    isThundering: "Weather",
    canSeeSky: "Sky",
    minSkyLight: "Min. Sky Light",
    maxSkyLight: "Max. Sky Light",
    minLight: "Min. Light",
    maxLight: "Max. Light",
    minX: "Min. X Coordinate",
    maxX: "Max. X Coordinate",
    minY: "Min. Y Coordinate",
    maxY: "Max. Y Coordinate",
    isSlimeChunk: "Slime Chunk",
    bait: "Bait",
    rodType: "Fishing Rod Type",
  };

  return names[condition] || condition;
}

function formatItem(value, condition) {
  if (condition === "isSlimeChunk") {
    return value ? "Yes" : "No";
  }

  if (typeof value !== "string") {
    return String(value);
  }

  return value;
}

function formatMultiplierCondition(condition, value) {
  if (condition === "biomes") {
    return value
      .map((biome) => {
        const reference = biome.reference || "";

        return reference
          .replace(/^#cobblemon:/, "")
          .replace(/^#minecraft:/, "")
          .replace(/^#c:/, "");
      })
      .join(", ");
  }

  if (Array.isArray(value)) {
    return value.map(formatItem).join(", ");
  }

  if (condition === "isRaining") {
    return value ? "Rain" : "Clear";
  }

  if (condition === "isThundering") {
    return value ? "Thunder" : "Clear";
  }

  if (condition === "canSeeSky") {
    return value ? "Yes" : "No";
  }

  if (condition === "timeRange") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return formatItem(value);
}

function formatMultiplierText(multiplier) {
  if (!multiplier || multiplier.multiplier === undefined) {
    return null;
  }

  const condition = multiplier.condition || {};

  const parts = Object.entries(condition)
    .map(([conditionName, value]) => {
      const formattedValue = formatMultiplierCondition(conditionName, value);

      if (!formattedValue) {
        return null;
      }

      const displayName =
        conditionName === "biomes"
          ? "Biome"
          : formatConditionName(conditionName);

      return `${displayName}: ${formattedValue}`;
    })
    .filter(Boolean);

  return (
    <>
      {parts.length > 0 && `${parts.join(", ")} `}
      <span className="pokemon-list-multiplier-value">
        ×{multiplier.multiplier}
      </span>
    </>
  );
}

function formatMultipliers(spawn) {
  const multipliers = [];

  if (spawn.weightMultiplier) {
    multipliers.push(spawn.weightMultiplier);
  }

  if (spawn.weightMultipliers) {
    multipliers.push(...spawn.weightMultipliers);
  }

  if (multipliers.length === 0) {
    return "-";
  }

  return (
    <div className="pokemon-list-badges">
      {multipliers.map((multiplier, index) => (
        <InfoBadge key={index} variant="multiplier">
          {formatMultiplierText(multiplier)}
        </InfoBadge>
      ))}
    </div>
  );
}

function formatOther(conditions, anticonditions) {
  const excluded = new Set([
    "biomes",
    "timeRange",
    "isRaining",
    "minSkyLight",
    "maxSkyLight",
    "canSeeSky",
  ]);

  const badges = [];

  Object.entries(conditions).forEach(([condition, value]) => {
    if (excluded.has(condition)) {
      return;
    }

    const name = formatConditionName(condition);

    const formattedValue = Array.isArray(value)
      ? value.map((item) => formatItem(item, condition)).join(", ")
      : formatItem(value, condition);

    badges.push(
      <InfoBadge key={`condition-${condition}`} variant="condition">
        {name}: {formattedValue}
      </InfoBadge>,
    );
  });

  Object.entries(anticonditions || {}).forEach(([condition, value]) => {
    if (condition === "biomes") {
      return;
    }

    const name = formatConditionName(condition);

    const formattedValue = Array.isArray(value)
      ? value.map((item) => formatItem(item, condition)).join(", ")
      : formatItem(value, condition);

    badges.push(
      <InfoBadge key={`anti-condition-${condition}`} variant="anti-condition">
        ANTI: {name}: {formattedValue}
      </InfoBadge>,
    );
  });

  if (badges.length === 0) {
    return "-";
  }

  return <div className="pokemon-list-badges">{badges}</div>;
}

function getSortValue(entry, column) {
  const { pokemon, spawn } = entry;
  const conditions = spawn.conditions || {};

  switch (column) {
    case "dex":
      return pokemon.dex;

    case "name":
      return pokemon.name?.toLowerCase() || "";

    case "bucket":
      return bucketOrder[spawn.bucket] || 999;

    case "level": {
      if (!spawn.level) {
        return null;
      }

      const [minLevel, maxLevel] = spawn.level.split("-").map(Number);

      return [minLevel, maxLevel];
    }

    case "weight":
      return spawn.weight ?? -Infinity;

    case "position":
      return spawn.position?.toLowerCase() || "";

    case "time":
      return timeOrder[conditions.timeRange] || 0;

    case "weather":
      if (conditions.isRaining === undefined) {
        return 0;
      }

      return conditions.isRaining ? 2 : 1;

    case "skyLight": {
      if (
        conditions.minSkyLight === undefined &&
        conditions.maxSkyLight === undefined
      ) {
        return null;
      }

      const minSkyLight = conditions.minSkyLight ?? 0;
      const maxSkyLight = conditions.maxSkyLight ?? 15;

      return [minSkyLight, maxSkyLight];
    }

    case "sky":
      if (conditions.canSeeSky === undefined) {
        return 0;
      }

      return conditions.canSeeSky ? 2 : 1;

    default:
      return "";
  }
}

function sortSpawns(spawns, sortColumn, sortDirection) {
  return [...spawns].sort((a, b) => {
    if (!sortColumn) {
      return 0;
    }

    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);

    let comparison;

    if (sortColumn === "skyLight" || sortColumn === "level") {
      const aEmpty = aValue === null;
      const bEmpty = bValue === null;

      if (aEmpty && bEmpty) {
        comparison = 0;
      } else if (aEmpty) {
        comparison = 1;
      } else if (bEmpty) {
        comparison = -1;
      } else {
        comparison = aValue[0] - bValue[0] || aValue[1] - bValue[1];
      }
    } else if (typeof aValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue - bValue;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });
}

function renderCell(entry, column, biomes) {
  const { pokemon, spawn } = entry;
  const conditions = spawn.conditions || {};

  switch (column) {
    case "dex":
      return `#${String(pokemon.dex).padStart(4, "0")}`;

    case "name":
      return formatName(pokemon, spawn);

    case "types":
      return formatTypes(pokemon.types);

    case "evYield":
      return formatEvYield(pokemon.evYield);

    case "bucket":
      if (!spawn.bucket) {
        return <InfoBadge></InfoBadge>;
      }

      return (
        <InfoBadge variant={spawn.bucket}>
          {formatBucket(spawn.bucket)}
        </InfoBadge>
      );

    case "level":
      return spawn.level || "-";

    case "weight":
      return spawn.weight;

    case "multiplier":
      return formatMultipliers(spawn);

    case "biomes":
      return formatBiomes(spawn.biomes, biomes);

    case "antiBiomes":
      return formatAntiBiomes(spawn.anticonditions, biomes);

    case "position":
      return formatPosition(spawn.position);

    case "presets":
      return formatPresets(spawn.presets);

    case "time":
      return formatTime(conditions);

    case "weather":
      return formatWeather(conditions);

    case "skyLight":
      return formatSkyLight(conditions);

    case "sky":
      return formatSky(conditions);

    case "other":
      return formatOther(conditions, spawn.anticonditions);

    default:
      return "-";
  }
}

const ROWS_PER_BATCH = 50;
// List with all possible spawns
function PokemonList({ pokemon, biomes }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [visibleRowCount, setVisibleRowCount] = useState(ROWS_PER_BATCH);

  const [visibleColumns, setVisibleColumns] = useState(
    allColumns
      .filter((column) => column.defaultVisible)
      .map((column) => column.key),
  );

  const spawns = pokemon.flatMap((pokemon) =>
    pokemon.spawns.map((spawn) => ({
      pokemon,
      spawn,
    })),
  );

  const sortedSpawns = sortSpawns(spawns, sortColumn, sortDirection);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    setVisibleRowCount(ROWS_PER_BATCH);
  };

  const toggleColumn = (column) => {
    setVisibleColumns((previous) => {
      if (previous.includes(column)) {
        return previous.filter((key) => key !== column);
      }

      return allColumns
        .filter((item) => previous.includes(item.key) || item.key === column)
        .map((item) => item.key);
    });
  };

  return (
    <div className="pokemon-list">
      <div className="pokemon-list-columns">
        <span className="pokemon-list-columns-label">Available Columns:</span>

        {allColumns
          .filter((column) => !visibleColumns.includes(column.key))
          .map((column) => (
            <button
              className="pokemon-list-column-button"
              key={column.key}
              type="button"
              onClick={() => toggleColumn(column.key)}
            >
              + {column.label}
            </button>
          ))}
      </div>

      <div className="pokemon-table-wrapper">
        <table className="pokemon-table">
          <thead>
            <tr>
              {allColumns
                .filter((column) => visibleColumns.includes(column.key))
                .map((column) => {
                  const active = sortColumn === column.key;

                  return (
                    <th className={`column-${column.key}`} key={column.key}>
                      {column.sortable ? (
                        <span
                          className="pokemon-table-sort"
                          onClick={() => handleSort(column.key)}
                        >
                          {column.label}

                          {active && (sortDirection === "asc" ? " ↑" : " ↓")}
                        </span>
                      ) : (
                        column.label
                      )}

                      <button
                        className="pokemon-table-remove"
                        type="button"
                        onClick={() => toggleColumn(column.key)}
                        aria-label={`Remove ${column.label} column`}
                      >
                        ×
                      </button>
                    </th>
                  );
                })}
            </tr>
          </thead>

          <tbody>
            {sortedSpawns.slice(0, visibleRowCount).map((entry, index) => {
              const { pokemon, spawn } = entry;

              return (
                <tr key={`${pokemon.id}-${spawn.id}-${index}`}>
                  {allColumns
                    .filter((column) => visibleColumns.includes(column.key))
                    .map((column) => {
                      const value = renderCell(entry, column.key, biomes);

                      return (
                        <td className={`column-${column.key}`} key={column.key}>
                          {value}
                        </td>
                      );
                    })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleRowCount < sortedSpawns.length && (
          <LoadMore
            onLoadMore={() => {
              setVisibleRowCount((previous) =>
                Math.min(previous + ROWS_PER_BATCH, sortedSpawns.length),
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PokemonList;
