import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Star } from "lucide-react";
import { useFilterContext } from "./components/filter-context";
import ChartDemo2 from "./components/chart-demo";
import { format } from "date-fns";

export function App() {
  const { filters, setFilter } = useFilterContext();

  // Handle selecting a coin
  const handleCoinSelect = (coin: string) => {
    setFilter("selectedCoin", coin); // Set selected coin in context
  };

  // Handle adding/removing coins from favorites
  const handleFavoriteToggle = (coin: string) => {
    const isFavorite = filters.favoriteCoins.includes(coin);
    const updatedFavorites = isFavorite
      ? filters.favoriteCoins.filter((c: string) => c !== coin)
      : [...filters.favoriteCoins, coin];

    setFilter("favoriteCoins", updatedFavorites);
  };

  // Get the filtered coin list based on type (all or favorite)
  const filteredCoins =
    filters.type === "Favorites"
      ? [
          "BTC-USDT-SWAP",
          "ETH-USDT-SWAP",
          "SOL-USDT-SWAP",
          "LTC-USDT-SWAP",
        ].filter((coin) => filters.favoriteCoins.includes(coin))
      : ["BTC-USDT-SWAP", "ETH-USDT-SWAP", "SOL-USDT-SWAP", "LTC-USDT-SWAP"]; // Show all coins if "all" is selected

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {format(new Date(), "MMMM dd yyyy")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div>
            <div>
              <span className="text-md">Exchange</span>:{" "}
              <span className="font-bold text-gray-600 border rounded-md px-4 py-1 text-sm border-blue-600">
                {filters?.exchange}
              </span>{" "}
            </div>
          </div>
          <div className="border rounded-lg p-2 grid-cols-12 grid">
            <div className="col-span-2 border-r mr-2 flex flex-col justify-center gap-2">
              <span className="text-sm font-bold">Coin</span>
              <div className="bg-gray-100 h-[1px]" />
              <span className="text-sm font-bold">Funding Rate</span>
            </div>
            <div className="col-span-10 grid grid-cols-12">
              {filteredCoins.map((coin) => (
                <div
                  key={coin}
                  className={`col-span-3 p-2 flex flex-col justify-center gap-2 pl-2 cursor-pointer ${
                    filters.selectedCoin === coin
                      ? "bg-blue-50 rounded-md border"
                      : ""
                  }`} // Background color for selected coin
                  onClick={() => handleCoinSelect(coin)} // Handle coin selection
                >
                  <div className="flex gap-2 items-center">
                    <Star
                      className={`cursor-pointer rounded-md p-[2px] ${
                        filters.favoriteCoins.includes(coin)
                          ? "bg-yellow-400 text-white"
                          : "hover:bg-yellow-400 duration-300 hover:text-white"
                      }`}
                      size={24}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the selection handler
                        handleFavoriteToggle(coin); // Toggle favorite status
                      }}
                    />
                    <span className="text-sm font-bold">{coin}</span>
                  </div>
                  <div className="bg-gray-100 h-[1px]" />
                  <span className="text-sm">
                    {coin?.includes(filters?.selectedCoin)
                      ? `${Number(
                          filters?.aggregatedData?.[
                            filters?.aggregatedData.length - 1
                          ]?.fundingRate
                        )?.toFixed(10)}%`
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <ChartDemo2 />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
