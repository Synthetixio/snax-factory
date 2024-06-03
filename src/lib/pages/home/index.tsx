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
  Select,
  Heading,
  Text,
  Link,
  CircularProgress,
  CircularProgressLabel,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import { addWeeks, format, isBefore } from "date-fns";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { config } from "~/lib/config/wagmi";

import { DataTable } from "~/lib/components/DataTable";
import { processData } from "~/lib/utils/processData";

// Helper function to format dates
const formatDate = (date: Date): string =>
  format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");

// Function to generate weeks array
const generateWeeks = (startDate: Date, numberOfWeeks: number) => {
  const weeksArray = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfWeeks; i++) {
    const startOfWeekDate = addWeeks(startDate, i); // startOfWeek sets week start to Wednesday
    const endOfWeekDate = addWeeks(startDate, i + 1); // endOfWeek sets week end to Tuesday
    weeksArray.push({
      start: formatDate(startOfWeekDate),
      end: formatDate(endOfWeekDate),
    });
  }
  return weeksArray;
};

// Initial start date
const initialStartDate = new Date(Date.UTC(2024, 0, 1, 20, 0, 0));

// Generate 52 weeks
const weeks = generateWeeks(initialStartDate, 52);

// Filter out weeks that start later than the current time
const now = new Date();
const filteredWeeks = weeks
  .filter((week) => {
    const startOfWeekDate = new Date(week.start);
    return isBefore(startOfWeekDate, now);
  })
  .reverse();

const queryClient = new QueryClient();

const Home = () => {
  const [tableData, setTableData] = useState<any>([]);
  const [filteredTableData, setFilteredTableData] = useState<any>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklySnxTotal, setWeeklySnxTotal] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [snxPrice, setSnxPrice] = useState(2.5);

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=havven&vs_currencies=usd",
      );
      const data = await response.json();
      setSnxPrice(data.havven.usd);
    };

    fetchPrice();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!filteredWeeks[selectedWeek] || !snxPrice) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const url = new URL("/api/data", window.location.origin);
        const startDate = new Date(
          filteredWeeks[selectedWeek].start,
        ).toISOString();
        const endDate = new Date(filteredWeeks[selectedWeek].end).toISOString();
        url.searchParams.append("startDate", startDate);
        url.searchParams.append("endDate", endDate);

        const response = await fetch(url.toString());
        const data = await response.json();
        const { processedData, totalSnxDistribution } = (await processData(
          data,
          snxPrice,
        )) as any;
        setTableData(processedData);
        setWeeklySnxTotal(Math.floor(totalSnxDistribution));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedWeek, snxPrice]);

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
                bg="black"
                border="1px solid"
                borderColor="whiteAlpha.300"
                p={6}
                borderRadius="md"
              >
                <Box my="auto">
                  <Heading size="md" fontWeight="semibold" mb={3}>
                    Hungry? Try SNAX.
                  </Heading>
                    <Text mb={6}>
                      SNAX is a new points system on Base. Trade on a Synthetix-powered exchange, provide liquidity to a permissionless pool, or spread the word on social media to earn some!
                    </Text>
                  <Text fontSize={14}>
                  <Link
                      _hover={{ textDecor: "none", borderColor: "gray.500" }}
                      borderBottom="1px solid"
                      borderColor="gray.600"
                      href="https://v3.synthetix.io"
                    >
                       Synthetix
                    </Link>{" "}
                     is an open and permissionless liquidity protocol that provides derivatives like
                    perpetual futures, options, parimutuel markets, and more
                    across EVM chains.
                  </Text>
                </Box>
              </Flex>
            </Flex>


            <Flex gap={6} direction={["column", "column", "row"]}>
              {/* // estimated daily SNX */}
              <Box
                color="gray.300"
                bg="black"
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
                        0 SNAX
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.300"
                        opacity={loading ? 0 : 1}
                        transition="opacity 0.33s"
                      >
                        Est. Daily SNAX
                      </Text>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>
              </Box>

              {/* // multiplier */}
              <Box
                color="gray.300"
                bg="black"
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
                        0.00x
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
                bg="black"
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
                        0 SNAX
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

            {/* <Flex w="100%" gap={6} direction={["column", "column", "row"]}>
              <InputGroup size="sm" bg="black">
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

              <Box ml={[0, 0, "auto"]} minWidth={["none", "none", "200px"]}>
                <Select
                  size="sm"
                  bg="black"
                  value={selectedWeek}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedWeek(Number(event.target.value))
                  }
                >
                  {filteredWeeks.map((week, ind) => {
                    return (
                      <option value={ind}>
                        Week {filteredWeeks.length - ind} (
                        {format(week.start, "M/d")} - {format(week.end, "M/d")})
                      </option>
                    );
                  })}
                </Select>
              </Box>
            </Flex>

            <Box
              color="gray.300"
              bg="black"
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
                <DataTable data={filteredTableData} price={snxPrice} />
              )}
            </Box> */}
          </Flex>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Home;
