/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

"use client";

import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { config } from "~/lib/config/wagmi";

import { DataTable } from "~/lib/components/DataTable";
import { processData } from "~/lib/utils/processData";

const initialStartDate = new Date(Date.UTC(2024, 0, 1, 20, 0, 0));
const queryClient = new QueryClient();

const Home = () => {
  const [tableData, setTableData] = useState<any>([]);
  const [filteredTableData, setFilteredTableData] = useState<any>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [multiplierFactor, setMultiplierFactor] = useState<number>(1);
  const [snaxBalance, setSnaxBalance] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = new URL("/api/data", window.location.origin);
        url.searchParams.append("startDate", initialStartDate.toISOString());

        const response = await fetch(url.toString());
        const data = await response.json();
        const { processedData, totalSnaxEarned } = (await processData(
          data,
        )) as any;
        setTableData(processedData);
        setStreakCount(Math.floor(streakCount));
        setMultiplierFactor(Math.floor(1));
        setSnaxBalance(Math.floor(totalSnaxEarned));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredTableData(
      tableData.filter((row: any) => {
        return row.walletAddress.includes(filter);
      }),
    );
  }, [filter, tableData]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Flex direction="column" minHeight="70vh" gap={6} mb={6} w="full">

            {/* // ConnectButton for wallet */}
            <Flex
              as="header"
              width="full"
              align="center"
              direction={['column']}
              mb={6}
              >
              <Flex direction={['column']} gap={6} >
                <Flex>
                <ConnectButton />
                </Flex>
              </Flex>
            </Flex>

            {/* // main text box */}
            <Flex gap={6} direction={["column", "column", "row"]}>
              <Flex
                color="gray.300"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={6}
                borderRadius="md"
              >
                <Box my="auto">
                  <Heading size="md" fontWeight="semibold" mb={3}>
                    Hungry? Try some SNAX, degen.
                  </Heading>
                    <Text mb={3}>
                      SNAX is a new points system on Base. Earn some by trading on a Synthetix-powered exchange, providing liquidity to the Spartan Council pool, or spreading the word on social media.
                    </Text>
                    <Text>Connect your wallet to view your SNAX stats.</Text>
                </Box>
              </Flex>
            </Flex>

            {/* // stats boxes */}
            <Flex gap={6} direction={["column", "column", "row"]}>
              {/* // streak count */}
              <Box
                color="gray.300"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={3}
                borderRadius="md"
                minWidth="200px"
              >
                <Flex alignItems="center" justifyContent="center">
                  <CircularProgress
                    value={0}
                    trackColor="#001C22"
                    color="#00D1FF"
                    size="100%"
                    thickness="6px"
                    isIndeterminate={loading}
                  >
                    <CircularProgressLabel>
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        {38} Trades
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.300"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        Trade Count
                      </Text>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>
              </Box>

              {/* // multiplier */}
              <Box
                color="gray.300"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={3}
                borderRadius="md"
                minWidth="200px"
              >
                <Flex alignItems="center" justifyContent="center">
                  <CircularProgress
                    value={0}
                    trackColor="#001C22"
                    color="#00D1FF"
                    size="100%"
                    thickness="6px"
                    isIndeterminate={loading}
                  >
                    <CircularProgressLabel>
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        textTransform="lowercase"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        {multiplierFactor.toFixed(2)}x
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.300"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        Multiplier
                      </Text>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>
              </Box>

              {/* // SNAX balance */}
              <Box
                color="gray.300"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={3}
                borderRadius="md"
                minWidth="200px"
              >
                <Flex alignItems="center" justifyContent="center">
                  <CircularProgress
                    value={0}
                    trackColor="#001C22"
                    color="#00D1FF"
                    size="100%"
                    thickness="6px"
                    isIndeterminate={loading}
                  >
                    <CircularProgressLabel>
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        textTransform="uppercase"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        {snaxBalance.toLocaleString()} SNAX
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.300"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        Total Balance
                      </Text>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>
              </Box>
            </Flex>

            <Flex w="100%" gap={6} direction={["column", "column", "row"]}>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Filter by wallet address"
                  value={filter}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFilter(event.target.value)
                  }
                />
              </InputGroup>
            </Flex>

            <Box
              color="gray.300"
              border="1px solid"
              borderColor="whiteAlpha.300"
              borderRadius="md"
              overflow="auto"
            >
              {loading ? (
                <Flex py={12}>
                  <Spinner m="auto" size="xl" color="#00D1FF" />
                </Flex>
              ) : (
                <DataTable data={filteredTableData} />
              )}
            </Box>
          </Flex>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Home;
