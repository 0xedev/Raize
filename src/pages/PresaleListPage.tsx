import { useState, useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import PresaleFactoryJson from "@/abis/PresaleFactory.json";
import PresaleJson from "@/abis/Presale.json";
import { type Abi, erc20Abi } from "viem";
import PresaleCard from "@/components/presale/PresaleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { getPresaleStatus } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const factoryAbi = PresaleFactoryJson.abi as Abi;
const presaleAbi = PresaleJson.abi as Abi;
const factoryAddress = import.meta.env
  .VITE_PRESALE_FACTORY_ADDRESS as `0x${string}`;

const ITEMS_PER_PAGE = 10;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};
const fabVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1, boxShadow: "0 10px 15px rgba(19, 73, 66, 0.2)" },
  tap: { scale: 0.95 },
};

// Skeleton Card Component
const PresaleCardSkeleton = () => (
  <Card className="animate-pulse border-2 border-[#13494220] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
    <CardHeader className="flex flex-row items-center gap-3 bg-[#13494210] pb-4">
      <Skeleton className="h-12 w-12 rounded-full bg-[#13494220]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4 bg-[#13494220]" />
        <Skeleton className="h-3 w-full bg-[#13494220]" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full bg-[#13494220]" />
    </CardHeader>
    <CardContent className="space-y-3 pt-4">
      <Skeleton className="h-4 w-full bg-[#13494220]" />
      <Skeleton className="h-4 w-2/3 bg-[#13494220]" />
      <Skeleton className="h-8 w-full mt-3 rounded-md bg-[#13494220]" />
    </CardContent>
  </Card>
);

// Define the structure of the presale object after combining data
interface PresaleWithDetails {
  address: `0x${string}`;
  options: any;
  state: number | undefined;
  tokenSymbol: string | undefined;
}

const PresaleListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- Data Fetching Logic ---
  const { data: allPresaleAddressesResult, isLoading: isLoadingAddresses } =
    useReadContract({
      address: factoryAddress,
      abi: factoryAbi,
      functionName: "getAllPresales",
      query: { staleTime: 300_000 }, // Cache for 5 minutes
    });
  const allPresaleAddresses = (
    (allPresaleAddressesResult as `0x${string}`[] | undefined) ?? []
  )
    .slice()
    .reverse();

  const allPresaleDetailsContracts = useMemo(() => {
    return allPresaleAddresses.flatMap((addr) => [
      {
        address: addr,
        abi: presaleAbi,
        functionName: "options",
      },
      {
        address: addr,
        abi: presaleAbi,
        functionName: "state",
      },
      {
        address: addr,
        abi: presaleAbi,
        functionName: "token",
      },
    ]);
  }, [allPresaleAddresses]);

  const { data: allPresaleDetailsResults, isLoading: isLoadingDetails } =
    useReadContracts({
      allowFailure: true,
      contracts: allPresaleDetailsContracts,
      query: { enabled: allPresaleAddresses.length > 0 },
    });

  const allTokenSymbolContracts = useMemo(() => {
    if (
      !allPresaleDetailsResults ||
      allPresaleDetailsResults.length !== allPresaleAddresses.length * 3
    )
      return [];
    return allPresaleAddresses
      .map((_address, index) => {
        const tokenResult = allPresaleDetailsResults[index * 3 + 2];
        const tokenAddress = tokenResult?.result as `0x${string}` | undefined;
        if (tokenResult?.status === "success" && tokenAddress) {
          return {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "symbol",
          };
        }
        return null;
      })
      .filter((contract) => contract !== null) as any[];
  }, [allPresaleAddresses, allPresaleDetailsResults]);

  const { data: allTokenSymbolResults, isLoading: isLoadingSymbols } =
    useReadContracts({
      allowFailure: true,
      contracts: allTokenSymbolContracts,
      query: { enabled: allTokenSymbolContracts.length > 0 },
    });

  const presalesWithDetails: PresaleWithDetails[] = useMemo(() => {
    if (
      !allPresaleDetailsResults ||
      !allTokenSymbolResults ||
      allPresaleDetailsResults.length !== allPresaleAddresses.length * 3
    ) {
      return [];
    }

    // Create a map for quick lookup of token symbols by their address
    const tokenSymbolMap = new Map<`0x${string}`, string | undefined>();
    allTokenSymbolContracts.forEach((contractDef, i) => {
      if (contractDef && allTokenSymbolResults[i]?.status === "success") {
        tokenSymbolMap.set(
          contractDef.address,
          allTokenSymbolResults[i].result as string | undefined
        );
      }
    });

    return allPresaleAddresses
      .map((address, index) => {
        const optionsResult = allPresaleDetailsResults[index * 3];
        const stateResult = allPresaleDetailsResults[index * 3 + 1];
        const tokenResult = allPresaleDetailsResults[index * 3 + 2];

        if (
          optionsResult?.status !== "success" ||
          stateResult?.status !== "success" ||
          tokenResult?.status !== "success"
        ) {
          return null;
        }

        const options = optionsResult.result as any;
        const state = stateResult.result as number | undefined;
        const tokenAddress = tokenResult.result as `0x${string}` | undefined;
        const tokenSymbol = tokenAddress
          ? tokenSymbolMap.get(tokenAddress)
          : undefined;

        return { address, options, state, tokenSymbol };
      })
      .filter((p): p is PresaleWithDetails => p !== null);
  }, [
    allPresaleAddresses,
    allPresaleDetailsResults,
    allTokenSymbolResults,
    allTokenSymbolContracts,
  ]);

  // Filtering Logic
  const filteredPresales = useMemo(() => {
    return presalesWithDetails.filter((presale) => {
      const statusObject = getPresaleStatus(presale.state, presale.options);
      const matchesStatus =
        filterStatus === "all" ||
        statusObject.text.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesSearch =
        searchTerm === "" ||
        presale.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (presale.tokenSymbol &&
          presale.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [presalesWithDetails, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredPresales.length / ITEMS_PER_PAGE);
  const paginatedPresales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPresales.slice(startIndex, endIndex);
  }, [filteredPresales, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const isLoading = isLoadingAddresses || isLoadingDetails || isLoadingSymbols;

  return (
    <div className="space-y-8 relative pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between items-center mt-8">
        <h1 className="text-4xl font-bold text-[#134942] self-start md:self-center">
          Presales
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#13494299]" />
            <Input
              placeholder="Search Address or Symbol..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 border-2 focus:border-[#134942] rounded-lg h-10 focus:ring-2 focus:ring-[#13494240] transition-all duration-200"
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full border-2 focus:border-[#134942] rounded-lg h-10 focus:ring-2 focus:ring-[#13494240] transition-all duration-200 pl-10">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#13494299]" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="border-2 border-[#13494240] rounded-lg shadow-lg bg-white">
                <SelectItem value="all" className="hover:bg-[#13494210]">
                  All Statuses
                </SelectItem>
                <SelectItem value="upcoming" className="hover:bg-[#13494210]">
                  Upcoming
                </SelectItem>
                <SelectItem value="active" className="hover:bg-[#13494210]">
                  Active
                </SelectItem>
                <SelectItem
                  value="ended (success)"
                  className="hover:bg-[#13494210]"
                >
                  Ended (Success)
                </SelectItem>
                <SelectItem
                  value="ended (failed)"
                  className="hover:bg-[#13494210]"
                >
                  Ended (Failed)
                </SelectItem>
                <SelectItem
                  value="ended (processing)"
                  className="hover:bg-[#13494210]"
                >
                  Ended (Processing)
                </SelectItem>
                <SelectItem value="canceled" className="hover:bg-[#13494210]">
                  Canceled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLoading ? "loading" : currentPage + filterStatus + searchTerm}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {isLoading ? (
            [...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <motion.div key={`skeleton-${i}`} variants={itemVariants}>
                <PresaleCardSkeleton />
              </motion.div>
            ))
          ) : paginatedPresales.length > 0 ? (
            paginatedPresales.map((presale) => (
              <motion.div key={presale.address} variants={itemVariants}>
                <PresaleCard presaleAddress={presale.address} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-[#13494210] rounded-full p-6 mb-4">
                <Search className="h-12 w-12 text-[#134942]" />
              </div>
              <p className="text-xl font-medium text-[#134942]">
                No presales found
              </p>
              <p className="text-[#13494299] mt-2 text-center max-w-md">
                We couldn't find any presales matching your criteria. Try
                adjusting your search filters.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-2 border-[#13494240] text-[#134942] hover:bg-[#13494210] hover:border-[#134942] rounded-lg px-4 py-2 disabled:opacity-50 transition-all"
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 p-0 font-medium ${
                    currentPage === pageNum
                      ? "bg-[#134942] text-white"
                      : "text-[#134942] hover:bg-[#13494210]"
                  } rounded-md transition-all`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-2 border-[#13494240] text-[#134942] hover:bg-[#13494210] hover:border-[#134942] rounded-lg px-4 py-2 disabled:opacity-50 transition-all"
          >
            Next
          </Button>
        </div>
      )}

      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={fabVariants}
      >
        <Link
          to="/create"
          className="flex items-center justify-center bg-[#134942] text-white rounded-full w-16 h-16 shadow-lg transition-all"
          aria-label="Create Presale"
        >
          <Plus className="h-7 w-7" />
        </Link>
      </motion.div>
    </div>
  );
};

export default PresaleListPage;
