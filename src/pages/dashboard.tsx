import { Flex, SimpleGrid, Heading, Box, Text, theme } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Head from 'next/head'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { ApexOptions } from 'apexcharts';
import { withSSRAuth } from '../utils/withSSRAuth';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const options: ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    foreColor: theme.colors.gray[500],
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime',
    axisBorder: {
      color: theme.colors.gray[600]
    },
    axisTicks: {
      color: theme.colors.gray[600]
    },
    categories: [
      '2021-03-18T00:00:00.000Z',
      '2021-03-19T00:00:00.000Z',
      '2021-03-20T00:00:00.000Z',
      '2021-03-21T00:00:00.000Z',
      '2021-03-22T00:00:00.000Z',
      '2021-03-23T00:00:00.000Z',
      '2021-03-24T00:00:00.000Z',
    ]
  },
  fill: {
    opacity: 0.3,
    type: 'gradient',
    gradient: {
      shade: 'dark',
      opacityFrom: 0.7,
      opacityTo: 0.3,
    }
  }
}

const series = [
  { name: 'series1', data: [31, 120, 10, 28, 61, 18, 109] }
]

export default function Dashboard() {
  return (
    <>
      <Box>
        <Head>
          <title>Umbriel | Painel</title>
        </Head>
        <Header />
        <Flex w="100%" my="6" maxWidth={1580} mx="auto" px="6">
          <Sidebar />

          <Box
            flex="1"
            ml="6"
            borderRadius={4}
            bgColor="white"
            shadow="0 0 20px rgba(0, 0, 0, 0.05)"
            p="8">
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Painel</Heading>
                <Text mt="1" color="gray.400">Um overview sobre seu negócio</Text>
              </Box>
            </Flex>
            <SimpleGrid flex="1" gap="4" minChildWidth="320px" align="flex-start">
              <Box
                p={['6', '8']}
                bg="gray.800"
                borderRadius={8}
                pb="4"
              >
                <Text> Inscritos da semana</Text>
                <Chart type="area" series={series} height={160} options={options} />
              </Box>
              <Box
                p="8"
                bg="gray.800"
                borderRadius={8}
                pb="4"
              >
                <Text> Taxa de abertura</Text>
                <Chart type="area" series={series} height={160} options={options} />
              </Box>
            </SimpleGrid>

          </Box>
        </Flex>
      </Box>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    // const apiClient = setupApiClient(ctx);
    // const response = await apiClient.get('/session/me');
  } catch (error) {
    console.log(error);
  }
  return {
    props: {}
  }
})