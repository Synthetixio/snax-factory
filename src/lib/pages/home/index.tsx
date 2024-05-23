/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

'use client';

import { SearchIcon } from '@chakra-ui/icons';
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
} from '@chakra-ui/react';
import { addWeeks, format, isBefore } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import { DataTable } from '~/lib/components/DataTable';
// import type { ProcessedData } from '~/lib/utils/processData';
import { processData } from '~/lib/utils/processData';

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
const initialStartDate = new Date(Date.UTC(2024, 4, 22, 20, 0, 0));

// Generate 100 weeks
const weeks = generateWeeks(initialStartDate, 100);

// Filter out weeks that start later than the current time
const now = new Date();
const filteredWeeks = weeks
  .filter((week) => {
    const startOfWeekDate = new Date(week.start);
    return isBefore(startOfWeekDate, now);
  })
  .reverse();

const Home = () => {
  const [tableData, setTableData] = useState<any>([]);
  const [filteredTableData, setFilteredTableData] = useState<any>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklySnxTotal, setWeeklySnxTotal] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [snxPrice, setSnxPrice] = useState(2.5);

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=havven&vs_currencies=usd'
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
        const url = new URL('/api/data', window.location.origin);
        const startDate = new Date(
          filteredWeeks[selectedWeek].start
        ).toISOString();
        const endDate = new Date(filteredWeeks[selectedWeek].end).toISOString();
        url.searchParams.append('startDate', startDate);
        url.searchParams.append('endDate', endDate);

        const response = await fetch(url.toString());
        const data = await response.json();
        const { processedData, totalSnxDistribution } = (await processData(
          data,
          snxPrice
        )) as any;
        setTableData(processedData);
        setWeeklySnxTotal(Math.floor(totalSnxDistribution));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedWeek, snxPrice]);

  useEffect(() => {
    setFilteredTableData(
      tableData.filter((row: any) => {
        return row.walletAddress.includes(filter);
      })
    );
  }, [filter, tableData]);

  return (
    <Flex direction="column" minHeight="70vh" gap={6} mb={6} w="full">
      <Flex gap={6} direction={['column', 'column', 'row']}>
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
              Synthetix is rebating a share of fees on Base
            </Heading>
            <Text mb={2}>
              <Link
                _hover={{ textDecor: 'none', borderColor: 'gray.500' }}
                borderBottom="1px solid"
                borderColor="gray.600"
                href="https://v3.synthetix.io"
              >
                Synthetix
              </Link>{' '}
              is rebating trading fees from the perpetual futures markets
              deployed to Base with 500,000 SNX allocated by the Treasury
              Council. Read about the criteria in&nbsp;
              <Link
                _hover={{ textDecor: 'none', borderColor: 'gray.500' }}
                borderBottom="1px solid"
                borderColor="gray.600"
                href="https://blog.synthetix.io/snx-perps-trading-incentives-on-base/"
              >
                this blog post
              </Link>
              .
            </Text>
            <Text>Use this tool to see an estimate of the distributions.</Text>
          </Box>
        </Flex>

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
                  0 SNX
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.300"
                  opacity={loading ? 0 : 1}
                  transition="opacity 0.33s"
                >
                  Total Distributed
                </Text>
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>
        </Box>
      </Flex>

      {filteredWeeks[selectedWeek] && (
        <Box
          color="gray.300"
          bg="black"
          border="1px solid"
          borderColor="whiteAlpha.300"
          p={6}
          borderRadius="md"
        >
          <Flex
            mb={3.5}
            alignItems={['left', 'left', 'center']}
            direction={['column', 'column', 'row']}
          >
            <Heading size="md" fontWeight="semibold" mb={[2, 2, 0]}>
              Distribution Estimate for Week{' '}
              {filteredWeeks.length - selectedWeek} (
              {format(filteredWeeks[selectedWeek].start, 'M/d')} -{' '}
              {format(filteredWeeks[selectedWeek].end, 'M/d')})
            </Heading>
            <Text
              fontSize="md"
              fontWeight="medium"
              textTransform="uppercase"
              color="gray.300"
              ml={[0, 0, 'auto']}
              opacity={loading ? 0 : 1}
              transition="opacity 0.33s"
            >
              {weeklySnxTotal.toLocaleString()}/50,000 SNX
            </Text>
          </Flex>
          <Progress
            color="#00D1FF"
            background="#001C22"
            size="lg"
            value={(weeklySnxTotal / 50000) * 100}
            borderRadius="sm"
            isIndeterminate={loading}
          />
        </Box>
      )}

      <Flex w="100%" gap={6} direction={['column', 'column', 'row']}>
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

        <Box ml={[0, 0, 'auto']} minWidth={['none', 'none', '200px']}>
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
                  Week {filteredWeeks.length - ind} ({format(week.start, 'M/d')}{' '}
                  - {format(week.end, 'M/d')})
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
      </Box>
    </Flex>
  );
};

export default Home;
