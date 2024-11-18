import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Define the filter context types
interface FilterState {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  setAggregatedData: (data: any[]) => void;
}

// Define the props for the provider, including children
interface FilterProviderProps {
  children: ReactNode;
}

// Create the context with default values
const FilterContext = createContext<FilterState | undefined>(undefined);

// Custom hook to use the FilterContext
export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};

// Provider component with default values
export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  // Define the default filter values inside the provider
  const defaultFilters: Record<string, any> = {
    type: "Full", // Default selection for Coins List
    exchange: "OKX", // Default selection for Exchange
    date: {
      from: new Date("2024-10-15"),
      to: new Date(),
    },
    time: "1D", // Default time selection
    selectedCoin: "BTC-USDT-SWAP", // Default selected coin
    favoriteCoins: ["BTC-USDT-SWAP"], // Default favorite is BTCUSDT
    aggregatedData: [], // Add a default empty array for aggregatedData
  };

  // Fetch filters from localStorage if available, otherwise use default
  const loadFiltersFromLocalStorage = () => {
    const savedFilters = localStorage.getItem("filters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return defaultFilters;
  };

  const [filters, setFilters] = useState(loadFiltersFromLocalStorage);

  // Function to update a specific filter
  const setFilter = (key: string, value: any) => {
    // If the key is "type" and it changes, reset selectedCoin accordingly
    if (key === "type") {
      let updatedFilters = { ...filters, [key]: value };

      // Reset selectedCoin based on the type value
      if (value === "Full") {
        updatedFilters.selectedCoin = "BTC-USDT-SWAP"; // Default to the first coin when "Full" is selected
      } else if (value === "Favorites" && filters.favoriteCoins.length > 0) {
        updatedFilters.selectedCoin = filters.favoriteCoins[0]; // Default to the first favorite when "Favorites" is selected
      }

      setFilters(updatedFilters);
      localStorage.setItem("filters", JSON.stringify(updatedFilters)); // Save to localStorage
    } else {
      const updatedFilters = { ...filters, [key]: value };
      setFilters(updatedFilters);
      localStorage.setItem("filters", JSON.stringify(updatedFilters)); // Save to localStorage
    }
  };

  // Function to set the aggregatedData in context
  const setAggregatedData = (data: any[]) => {
    const updatedFilters = { ...filters, aggregatedData: data };
    setFilters(updatedFilters);
    localStorage.setItem("filters", JSON.stringify(updatedFilters)); // Save to localStorage
  };

  // Use effect to load filters when component mounts
  useEffect(() => {
    const savedFilters = loadFiltersFromLocalStorage();
    setFilters(savedFilters);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilter, setAggregatedData }}>
      {children}
    </FilterContext.Provider>
  );
};
