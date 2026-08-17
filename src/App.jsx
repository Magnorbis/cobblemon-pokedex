import { useEffect, useState } from "react";
import PokemonList from "./components/PokemonList";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import ActiveFilters from "./components/ActiveFilters";

function App() {
  const [pokemonData, setPokemonData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [compatibleMode, setCompatibleMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data/pokemon.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load pokemon.json: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setPokemonData(data);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  if (pokemonData == null) {
    return <h1>Loading Pokémon...</h1>;
  }

  const matchesSelectedValues = (selectedValues, matcher) => {
    return compatibleMode
      ? selectedValues.every(matcher)
      : selectedValues.some(matcher);
  };

  const matchesArrayFilter = (selectedValues, values = []) => {
    return matchesSelectedValues(selectedValues, (value) =>
      values.includes(value),
    );
  };

  const matchesExactValueFilter = (
    selectedValues,
    value,
    useCompatibleMode = false,
  ) => {
    if (!selectedValues?.length) {
      return true;
    }

    if (value === undefined) {
      return false;
    }

    return useCompatibleMode
      ? selectedValues.every(
          (selectedValue) => String(value) === String(selectedValue),
        )
      : selectedValues.some(
          (selectedValue) => String(value) === String(selectedValue),
        );
  };

  const matchesOtherFilters = (prefix, conditionSource) => {
    for (const key of Object.keys(filters)) {
      if (!key.startsWith(prefix)) {
        continue;
      }

      const conditionName = key.slice(prefix.length);
      const selectedValues = filters[key];

      if (!selectedValues?.length) {
        continue;
      }

      const conditionValue = conditionSource[conditionName];

      let values = [];

      if (Array.isArray(conditionValue)) {
        values = conditionValue.map(String);
      } else if (conditionValue !== undefined) {
        values = [String(conditionValue)];
      }

      const matches = compatibleMode
        ? selectedValues.every((value) => values.includes(value))
        : selectedValues.some((value) => values.includes(value));

      if (!matches) {
        return false;
      }
    }

    return true;
  };

  const matchesFilter = (pokemon, spawn) => {
    const conditions = spawn.conditions || {};
    const anticonditions = spawn.anticonditions || {};

    if (filters.types?.length > 0) {
      if (
        !matchesSelectedValues(filters.types, (type) =>
          pokemon.types?.includes(type),
        )
      ) {
        return false;
      }
    }

    if (filters.evYield?.length > 0) {
      if (
        !matchesSelectedValues(filters.evYield, (ev) =>
          pokemon.evYield?.includes(ev),
        )
      ) {
        return false;
      }
    }

    if (filters.bucket?.length > 0 && !filters.bucket.includes(spawn.bucket)) {
      return false;
    }

    if (
      filters.position?.length > 0 &&
      !filters.position.includes(spawn.position)
    ) {
      return false;
    }

    if (filters.presets?.length > 0) {
      if (!matchesArrayFilter(filters.presets, spawn.presets)) {
        return false;
      }
    }

    if (filters.time?.length > 0) {
      if (!filters.time.includes(conditions.timeRange)) {
        return false;
      }
    }

    if (filters.weather?.length > 0) {
      const weather = conditions.isRaining;

      const matchesWeather = filters.weather.some((value) => {
        if (value === "rain") {
          return weather === true;
        }

        if (value === "clear") {
          return weather === false;
        }

        return false;
      });

      if (!matchesWeather) {
        return false;
      }
    }

    if (filters.sky?.length > 0) {
      const matchesSky = matchesSelectedValues(filters.sky, (value) => {
        if (value === "Yes") {
          return conditions.canSeeSky === true;
        }

        if (value === "No") {
          return conditions.canSeeSky === false;
        }

        return false;
      });

      if (!matchesSky) {
        return false;
      }
    }

    if (filters.biomeReferences?.length > 0) {
      const references = spawn.biomes?.map((biome) =>
        biome.reference
          ?.replace(/^#cobblemon:/, "")
          .replace(/^#minecraft:/, "")
          .replace(/^#c:/, ""),
      );

      const matchesBiomeReference = matchesSelectedValues(
        filters.biomeReferences,
        (reference) => references?.includes(reference),
      );

      if (!matchesBiomeReference) {
        return false;
      }
    }

    if (filters.antiBiomeReferences?.length > 0) {
      const references = spawn.anticonditions?.biomes?.map((biome) =>
        biome.reference
          ?.replace(/^#cobblemon:/, "")
          .replace(/^#minecraft:/, "")
          .replace(/^#c:/, ""),
      );

      const matchesAntiBiomeReference = matchesSelectedValues(
        filters.antiBiomeReferences,
        (reference) => references?.includes(reference),
      );

      if (!matchesAntiBiomeReference) {
        return false;
      }
    }

    if (filters.biomes?.length > 0) {
      const matchesBiome = compatibleMode
        ? spawn.biomes?.some((biome) =>
            filters.biomes.every((selectedBiome) =>
              biome.biomes?.includes(selectedBiome),
            ),
          )
        : spawn.biomes?.some((biome) =>
            filters.biomes.some((selectedBiome) =>
              biome.biomes?.includes(selectedBiome),
            ),
          );

      if (!matchesBiome) {
        return false;
      }

      const antiBiomes = anticonditions.biomes || [];

      const matchesAntiBiome = filters.biomes.some((selectedBiome) =>
        antiBiomes.some((antiBiome) =>
          antiBiome.biomes?.includes(selectedBiome),
        ),
      );

      if (matchesAntiBiome) {
        return false;
      }
    }

    if (filters.antiBiomes?.length > 0) {
      const matchesAntiBiome = compatibleMode
        ? anticonditions.biomes?.some((biome) =>
            filters.antiBiomes.every((selectedBiome) =>
              biome.biomes?.includes(selectedBiome),
            ),
          )
        : anticonditions.biomes?.some((biome) =>
            filters.antiBiomes.some((selectedBiome) =>
              biome.biomes?.includes(selectedBiome),
            ),
          );

      if (!matchesAntiBiome) {
        return false;
      }
    }

    if (filters.skyLight?.length > 0) {
      const spawnMin = conditions.minSkyLight ?? 0;
      const spawnMax = conditions.maxSkyLight ?? 15;
      const spawnRange = `${spawnMin}-${spawnMax}`;

      const matchesSkyLight = compatibleMode
        ? filters.skyLight.every((value) => spawnRange === String(value))
        : filters.skyLight.some((value) => spawnRange === String(value));

      if (!matchesSkyLight) {
        return false;
      }
    }

    if (filters.bait?.length > 0 && !filters.bait.includes(conditions.bait)) {
      return false;
    }

    if (
      filters.rodType?.length > 0 &&
      !filters.rodType.includes(conditions.rodType)
    ) {
      return false;
    }

    if (filters.moonPhase?.length > 0) {
      const phases =
        conditions.moonPhase?.split(",").map((phase) => phase.trim()) || [];

      if (
        !matchesSelectedValues(filters.moonPhase, (phase) =>
          phases.includes(phase),
        )
      ) {
        return false;
      }
    }

    if (filters.baseBlocks?.length > 0) {
      if (
        !matchesArrayFilter(filters.baseBlocks, conditions.neededBaseBlocks)
      ) {
        return false;
      }
    }

    if (filters.nearbyBlocks?.length > 0) {
      if (
        !matchesArrayFilter(filters.nearbyBlocks, conditions.neededNearbyBlocks)
      ) {
        return false;
      }
    }

    if (filters.structures?.length > 0) {
      if (!matchesArrayFilter(filters.structures, conditions.structures)) {
        return false;
      }
    }

    if (filters.slimeChunk?.length > 0) {
      const matchesSlimeChunk = filters.slimeChunk.some((value) =>
        value === "Yes"
          ? conditions.isSlimeChunk === true
          : conditions.isSlimeChunk === false,
      );

      if (!matchesSlimeChunk) {
        return false;
      }
    }

    if (
      !matchesExactValueFilter(filters.minX, conditions.minX) ||
      !matchesExactValueFilter(filters.maxX, conditions.maxX) ||
      !matchesExactValueFilter(filters.minY, conditions.minY) ||
      !matchesExactValueFilter(filters.maxY, conditions.maxY) ||
      !matchesExactValueFilter(filters.maxLight, conditions.maxLight)
    ) {
      return false;
    }

    if (
      !matchesExactValueFilter(
        filters.minLureLevel,
        conditions.minLureLevel,
        true,
      )
    ) {
      return false;
    }

    if (
      !matchesExactValueFilter(
        filters.maxLureLevel,
        conditions.maxLureLevel,
        true,
      )
    ) {
      return false;
    }

    if (filters.antiTime?.length > 0) {
      const value = anticonditions.timeRange;

      const matchesAntiTime = compatibleMode
        ? filters.antiTime.every((selectedValue) => value === selectedValue)
        : filters.antiTime.some((selectedValue) => value === selectedValue);

      if (!matchesAntiTime) {
        return false;
      }
    }

    if (filters.antiSlimeChunk?.length > 0) {
      const isSlimeChunk = anticonditions.isSlimeChunk;

      const matchesAntiSlimeChunk = compatibleMode
        ? filters.antiSlimeChunk.every((value) =>
            value === "Yes" ? isSlimeChunk === true : isSlimeChunk === false,
          )
        : filters.antiSlimeChunk.some((value) =>
            value === "Yes" ? isSlimeChunk === true : isSlimeChunk === false,
          );

      if (!matchesAntiSlimeChunk) {
        return false;
      }
    }

    if (
      !matchesExactValueFilter(filters.antiMinY, anticonditions.minY, true) ||
      !matchesExactValueFilter(filters.antiMaxY, anticonditions.maxY, true) ||
      !matchesExactValueFilter(
        filters.antiMinLureLevel,
        anticonditions.minLureLevel,
        true,
      )
    ) {
      return false;
    }

    if (filters.antiNearbyBlocks?.length > 0) {
      if (
        !matchesArrayFilter(
          filters.antiNearbyBlocks,
          anticonditions.neededNearbyBlocks,
        )
      ) {
        return false;
      }
    }

    if (filters.antiStructures?.length > 0) {
      if (
        !matchesArrayFilter(filters.antiStructures, anticonditions.structures)
      ) {
        return false;
      }
    }

    if (!matchesOtherFilters("other.", conditions)) {
      return false;
    }

    if (!matchesOtherFilters("antiOther.", anticonditions)) {
      return false;
    }

    return true;
  };

  const query = searchQuery.trim();
  const normalizedQuery = query.replace(/^#/, "").toLowerCase();

  const filteredPokemon = pokemonData
    .map((pokemon) => ({
      ...pokemon,
      spawns: pokemon.spawns.filter((spawn) => matchesFilter(pokemon, spawn)),
    }))
    .filter((pokemon) => {
      if (/^#?\d{4}$/.test(normalizedQuery)) {
        return (
          String(pokemon.dex).padStart(4, "0") === normalizedQuery &&
          pokemon.spawns.length > 0
        );
      }

      const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery);

      const matchesDex = String(pokemon.dex).includes(normalizedQuery);

      return (matchesName || matchesDex) && pokemon.spawns.length > 0;
    });

  const totalSpawns = pokemonData.reduce(
    (total, pokemon) => total + pokemon.spawns.length,
    0,
  );

  const filteredSpawns = filteredPokemon.reduce(
    (total, pokemon) => total + pokemon.spawns.length,
    0,
  );

  return (
    <div>
      <h1>Cobblemon Pokédex</h1>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <FilterPanel
        pokemon={pokemonData}
        filters={filters}
        setFilters={setFilters}
        compatibleMode={compatibleMode}
        setCompatibleMode={setCompatibleMode}
      />

      <ActiveFilters filters={filters} setFilters={setFilters} />

      <p>
        Showing {filteredSpawns} of {totalSpawns} spawn possibilities
      </p>

      <PokemonList pokemon={filteredPokemon} />
    </div>
  );
}

export default App;
