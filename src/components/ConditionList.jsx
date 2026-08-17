function ConditionList({ pokemon }) {
  const antiConditions = {};

  pokemon.forEach((pokemonEntry) => {
    pokemonEntry.spawns.forEach((spawn) => {
      const conditions = spawn.anticonditions || {};

      Object.entries(conditions).forEach(([condition, value]) => {
        if (condition === "biomes") {
          return;
        }

        if (!antiConditions[condition]) {
          antiConditions[condition] = new Set();
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            antiConditions[condition].add(String(item));
          });
        } else {
          antiConditions[condition].add(String(value));
        }
      });
    });
  });

  const sortedConditions = Object.keys(antiConditions).sort();

  return (
    <div>
      <h2>Other Anti Conditions</h2>

      <ul>
        {sortedConditions.map((condition) => (
          <li key={condition}>
            <strong>{condition}</strong>

            <ul>
              {[...antiConditions[condition]].sort().map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConditionList;
