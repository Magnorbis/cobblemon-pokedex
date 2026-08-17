import { useState } from "react";

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

function capitalize(value) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

  return types
    .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
    .join(", ");
}

function formatEvYield(evYield) {
  if (!evYield || evYield.length === 0) {
    return "-";
  }

  return evYield
    .map((stat) =>
      stat
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(", ");
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

function formatBiomes(biomes) {
  if (!biomes || biomes.length === 0) {
    return "-";
  }

  return biomes
    .map((biome) => {
      if (biome.reference) {
        return biome.reference.replace(
          /^#(?:cobblemon|minecraft|terralith):/,
          "",
        );
      }

      if (biome.biomes?.length > 0) {
        return biome.biomes.join(", ");
      }

      return null;
    })
    .filter(Boolean)
    .join(", ");
}

function formatAntiBiomes(anticonditions) {
  return formatBiomes(anticonditions?.biomes);
}

function formatPosition(position) {
  if (!position) {
    return "-";
  }

  return position.charAt(0).toUpperCase() + position.slice(1);
}

function formatPresets(presets) {
  if (!presets || presets.length === 0) {
    return "-";
  }

  return presets
    .map((preset) =>
      preset
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(", ");
}

function formatTime(conditions) {
  if (!conditions.timeRange) {
    return "Any";
  }

  const time = conditions.timeRange.toLowerCase();

  return timeOrder[time]
    ? time.charAt(0).toUpperCase() + time.slice(1)
    : conditions.timeRange;
}

function formatWeather(conditions) {
  if (conditions.isRaining === undefined) {
    return "Any";
  }

  return conditions.isRaining ? "Rain" : "Clear";
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

function formatMultiplier(multiplier) {
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

  if (parts.length === 0) {
    return `x${multiplier.multiplier}`;
  }

  return `${parts.join(", ")} x${multiplier.multiplier}`;
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

  return multipliers.map(formatMultiplier).filter(Boolean).join(", ");
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

  const values = [];

  Object.entries(conditions).forEach(([condition, value]) => {
    if (excluded.has(condition)) {
      return;
    }

    const name = formatConditionName(condition);

    if (Array.isArray(value)) {
      const formattedValues = value
        .map((item) => formatItem(item, condition))
        .join(", ");

      values.push(`${name}: ${formattedValues}`);
    } else {
      values.push(`${name}: ${formatItem(value, condition)}`);
    }
  });

  Object.entries(anticonditions || {}).forEach(([condition, value]) => {
    if (condition === "biomes") {
      return;
    }

    const name = formatConditionName(condition);

    if (Array.isArray(value)) {
      const formattedValues = value
        .map((item) => formatItem(item, condition))
        .join(", ");

      values.push(`ANTI: ${name}: ${formattedValues}`);
    } else {
      values.push(`ANTI: ${name}: ${formatItem(value, condition)}`);
    }
  });

  return values.length > 0 ? values.join(", ") : "-";
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

function renderCell(entry, column) {
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
      return formatBucket(spawn.bucket);

    case "level":
      return spawn.level || "-";

    case "weight":
      return spawn.weight;

    case "multiplier":
      return formatMultipliers(spawn);

    case "biomes":
      return formatBiomes(spawn.biomes);

    case "antiBiomes":
      return formatAntiBiomes(spawn.anticonditions);

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

function PokemonList({ pokemon }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

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
    <>
      <div>
        <strong>Available Columns:</strong>

        {allColumns
          .filter((column) => !visibleColumns.includes(column.key))
          .map((column) => (
            <button
              key={column.key}
              type="button"
              onClick={() => toggleColumn(column.key)}
            >
              + {column.label}
            </button>
          ))}
      </div>

      <table>
        <thead>
          <tr>
            {allColumns
              .filter((column) => visibleColumns.includes(column.key))
              .map((column) => {
                const active = sortColumn === column.key;

                return (
                  <th key={column.key}>
                    {column.sortable ? (
                      <span
                        onClick={() => handleSort(column.key)}
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {column.label}

                        {active && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </span>
                    ) : (
                      column.label
                    )}

                    <button
                      type="button"
                      onClick={() => toggleColumn(column.key)}
                    >
                      ×
                    </button>
                  </th>
                );
              })}
          </tr>
        </thead>

        <tbody>
          {sortedSpawns.map((entry, index) => {
            const { pokemon, spawn } = entry;

            return (
              <tr key={`${pokemon.id}-${spawn.id}-${index}`}>
                {allColumns
                  .filter((column) => visibleColumns.includes(column.key))
                  .map((column) => (
                    <td key={column.key}>{renderCell(entry, column.key)}</td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default PokemonList;
