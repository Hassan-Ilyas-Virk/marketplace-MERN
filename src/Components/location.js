import { useState, useEffect } from 'react';
import Select from 'react-select';

const Location = ({ listings, onLocationFilter, locationData }) => {
  const [options, setOptions] = useState([]);
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_API_NINJAS_KEY;

  useEffect(() => {
    if (locationData) {
      setCityData(locationData);
    }
  }, [locationData]);

  const handleSearch = async (inputValue) => {
    if (!inputValue) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/city?name=${inputValue}&limit=10`,
        {
          headers: {
            'X-Api-Key': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await response.json();
      const cityOptions = data
        .filter((city) =>
          city.name.toLowerCase().startsWith(inputValue.toLowerCase())
        )
        .map((city) => ({
          value: `${city.name}, ${city.country}`,
          label: `${city.name}, ${city.country}`,
        }));

      setOptions(cityOptions);
    } catch (err) {
      setError('Failed to fetch cities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (selectedOption) => {
    setCityData(selectedOption);
    onLocationFilter(selectedOption?.value || null);
  };

  return (
    <div className="mb-4">
      <Select
        isClearable
        isSearchable
        isLoading={loading}
        options={options}
        value={cityData}
        onChange={handleLocationSelect}
        onInputChange={(value) => {
          clearTimeout(window.searchTimeout);
          window.searchTimeout = setTimeout(() => {
            handleSearch(value);
          }, 300);
        }}
        placeholder="Search for a city..."
        className="w-full"
        styles={{
          control: (base) => ({
            ...base,
            width: '100%', // Ensures the dropdown adapts to its parent container
          }),
          menu: (base) => ({
            ...base,
            width: '100%', // Matches the dropdown width to the container
          }),
        }}
        noOptionsMessage={({ inputValue }) =>
          !inputValue ? 'Type to search...' : 'No cities found'
        }
      />
    </div>
  );
};

export default Location;
