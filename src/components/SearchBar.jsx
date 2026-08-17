function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search Pokémon..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default SearchBar;
