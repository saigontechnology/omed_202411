import React from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { format, subDays } from "date-fns"; // Import format from date-fns
import {
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";
import { useFilterContext } from "./filter-context"; // Import the context
import { Loader } from "lucide-react";

interface ChartDemo2State {
  data: {
    name: string;
    fundingRate: number;
    realizedRate: number;
    interval: number;
  }[];
  filteredData: {
    name: string;
    fundingRate: number;
    realizedRate: number;
    interval: number;
  }[];
  loading: boolean;
  error: string | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { fundingRate, realizedRate, interval, fundingTime } =
      payload[0].payload;
    return (
      <div
        className="bg-white p-3 rounded-lg shadow-md border border-gray-200"
        style={{ maxWidth: 200 }}
      >
        <h3 className="text-sm font-bold text-gray-800">
          {format(new Date(fundingTime), "dd/MM/yyyy")}{" "}
        </h3>
        <div className="mt-1">
          <span className="text-xs text-gray-500">Funding Rate:</span>
          <div className="text-sm text-green-600">
            {Number(fundingRate).toFixed(10)}%
          </div>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-500">Realized Rate:</span>
          <div className="text-sm text-blue-600">
            {" "}
            {Number(realizedRate).toFixed(10)}%
          </div>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-500">Interval:</span>
          <div className="text-sm text-gray-700">{interval} hours</div>
        </div>
      </div>
    );
  }

  return null;
};

const ChartDemo2: React.FC = () => {
  const { filters, setAggregatedData } = useFilterContext(); // Access filters from context

  const [state, setState] = React.useState<ChartDemo2State>({
    data: [],
    filteredData: [],
    loading: false,
    error: null,
  });

  const apiKey = "your_api_key";
  const secretKey = "your_secret_key";
  const passphrase = "your_passphrase";
  const baseURL = "https://www.okx.com";

  const signRequest = (method: string, requestPath: string, body = "") => {
    const timestamp = new Date().toISOString();
    const preHash = timestamp + method + requestPath + body;
    const sign = CryptoJS.HmacSHA256(preHash, secretKey).toString(
      CryptoJS.enc.Base64
    );
    return { sign, timestamp };
  };

  const fetchData = async () => {
    const {
      date: { from, to },
      selectedCoin,
      time, // Time range (e.g., "1D" or "7D")
    } = filters; // Get the date range and instId from the filters context

    const method = "GET";
    const endpoint = "/api/v5/public/funding-rate-history";

    // Set end of the day for 'to'
    const after = new Date(to).setHours(23, 59, 59, 999);

    // Default before date is 'from' date
    let before = new Date(from).getTime();

    if (time === "7D") {
      // For 7D, get data starting from 7 days before 'from'
      before = subDays(from, 7).getTime();
    }

    const requestPath = `/api/v5/public/funding-rate-history?instId=${selectedCoin}&after=${after}&before=${before}`;

    try {
      setState({ ...state, loading: true, error: null });

      const { sign, timestamp } = signRequest(method, requestPath);

      const response = await axios.get(
        `${baseURL}${endpoint}?instId=${selectedCoin}&after=${after}&before=${before}`,
        {
          headers: {
            "Content-Type": "application/json",
            "OK-ACCESS-KEY": apiKey,
            "OK-ACCESS-PASSPHRASE": passphrase,
            "OK-ACCESS-SIGN": sign,
            "OK-ACCESS-TIMESTAMP": timestamp,
          },
        }
      );

      // Map and format data
      const formattedData = response.data.data
        .map(
          (item: {
            fundingRate: string;
            realizedRate: string;
            fundingTime: string;
            nextFundingTime?: string;
          }) => {
            const fundingTime = parseInt(item.fundingTime, 10);
            const nextFundingTime = item.nextFundingTime
              ? parseInt(item.nextFundingTime, 10)
              : fundingTime + 8 * 60 * 60 * 1000; // Default to 8 hours in milliseconds

            const interval = (nextFundingTime - fundingTime) / (60 * 60 * 1000); // Calculate interval in hours

            return {
              name: format(new Date(fundingTime), "dd/MM/yyyy"), // Format fundingTime to DD/MM/YYYY
              fundingRate: parseFloat(item.fundingRate),
              realizedRate: parseFloat(item.realizedRate),
              interval: Math.round(interval), // Round interval to match dropdown options
              fundingTime, // Store the original timestamp for sorting
            };
          }
        )
        .filter((item: any) => item.fundingTime >= new Date(from).getTime()) // Filter out data before 'from' date
        .sort(
          (a: { fundingTime: number }, b: { fundingTime: number }) =>
            a.fundingTime - b.fundingTime
        ); // Sort by fundingTime ascending

      // Group data by 'name' (date) and calculate average values for fundingRate and realizedRate
      const groupedData: { [key: string]: any[] } = formattedData.reduce(
        (acc: { [x: string]: any[] }, item: { name: string | number }) => {
          if (!acc[item.name]) {
            acc[item.name] = [];
          }
          acc[item.name].push(item);
          return acc;
        },
        {}
      );

      // Calculate the average values for each day
      const aggregatedData = Object.keys(groupedData).map((key) => {
        const dayData = groupedData[key];
        const averageFundingRate =
          dayData.reduce((sum, current) => sum + current.fundingRate, 0) /
          dayData.length;

        const averageRealizedRate =
          dayData.reduce((sum, current) => sum + current.realizedRate, 0) /
          dayData.length;

        const averageInterval =
          dayData.reduce((sum, current) => sum + current.interval, 0) /
          dayData.length;

        return {
          name: key,
          fundingRate: averageFundingRate,
          realizedRate: averageRealizedRate,
          interval: Math.round(averageInterval),
          fundingTime: dayData[0].fundingTime, // Use the first record's timestamp for sorting
        };
      });

      // Apply logic to compute cumulative data for the last 7 days (if time is 7D)
      const finalAggregatedData = aggregatedData.map(
        (item: any, index: number, array: any[]) => {
          if (time === "7D") {
            // For 7D, calculate sum of funding rates from the last 7 days
            const sumFundingRate = array
              .slice(Math.max(index - 6, 0), index + 1)
              .reduce((sum, current) => sum + current.fundingRate, 0);

            const sumRealizedRate = array
              .slice(Math.max(index - 6, 0), index + 1)
              .reduce((sum, current) => sum + current.realizedRate, 0);

            return {
              ...item,
              fundingRate: sumFundingRate, // Replace with the sum of the last 7 days
              realizedRate: sumRealizedRate, // Replace with the sum of the last 7 days
            };
          } else if (time === "1D") {
            // For 1D, keep the value as is
            return item;
          }
          return item;
        }
      );

      setState({
        ...state,
        data: finalAggregatedData,
        filteredData: finalAggregatedData,
        loading: false,
      });

      setAggregatedData(finalAggregatedData);
    } catch (error) {
      setState({ ...state, error: "", loading: false });
    }
  };

  React.useEffect(() => {
    fetchData(); // Fetch data when the component mounts or filters change
  }, [filters]); // Dependency on filters to refetch when they change

  const { filteredData, loading, error } = state;

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}

      {loading ? (
        <div className="w-full h-full items-center flex justify-center mt-20">
          <Loader className="animate-spin" />
        </div>
      ) : filteredData.length === 0 ? (
        <div>No data available for the selected date range.</div>
      ) : (
        <div className="border rounded-lg p-4">
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              width={500}
              height={600}
              data={filteredData}
              margin={{ top: 5, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }} // Adjust font size for X-axis ticks
              >
                <Label className="text-[13px]" value={"Date Time"} dy={15} />
              </XAxis>
              <YAxis
                tick={{ fontSize: 10 }} // Adjust font size for Y-axis ticks
              >
                <Label
                  angle={270}
                  dx={-25}
                  className="text-[13px]"
                  value={"Funding Rate"}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />{" "}
              {/* Use custom tooltip here */}
              <ReferenceLine y={0} stroke="#000" />
              <Bar
                dataKey="fundingRate"
                fill="#4ade80"
                isAnimationActive={false}
                radius={[3, 3, 0, 0]} // Apply border radius to the top-left and top-right corners
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fundingRate > 0 ? "#4ade80" : "#f87171"}
                  />
                ))}
              </Bar>
              {/* <Brush
                dataKey="name"
                className="absolute top-20"
                height={30}
                stroke="#9ca3af"
              /> */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartDemo2;
