import { withSSRAuth } from "../../utils/withSSRAuth";
import { useForm } from 'react-hook-form';
import { Box, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Link as ChakraLink, Icon, Spinner } from '@chakra-ui/react';
import Head from 'next/head'
import { Sidebar } from '../../components/Sidebar'
import NextLink from 'next/link';
import { RiAddLine, RiRefreshLine, RiSearch2Line, RiPencilLine } from 'react-icons/ri';
import { Input } from '../../components/Form/Input';
import { Button } from '../../components/Form/Button'
import { useState } from 'react';
import { useTags } from '../../hooks/tags/useTags';
import { Header } from '../../components/Header'
import { Pagination } from '../../components/Pagination'

export default function Tags() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();

  const { data, isLoading, error, isFetching, refetch } = useTags(page, searchQuery);

  return (
    <>
      <Box>
        <Head>
          <title>Umbriel | Tags</title>
        </Head>
        <Header />

        <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
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
                <Heading size="lg" fontWeight="medium">Tags</Heading>
                <Text mt="1" color="gray.400">Listagem completa de tags</Text>
              </Box>
              <Flex>
                <Flex as="form">
                  <Input
                    name="search"
                    placeholder="Buscar tags"
                    {...register('search')}
                  />
                  <Button
                    size="lg"
                    fontSize="sm"
                    colorScheme="purple"
                    ml="2"
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    <Icon as={RiSearch2Line} fontSize="16" />
                  </Button>
                  <>
                    <Button
                      size="lg"
                      fontSize="sm"
                      colorScheme="purple"
                      ml="2"
                      maxW={59}
                      onClick={() => refetch()}
                      disabled={isLoading || isFetching}
                    >
                      <Icon as={RiRefreshLine} fontSize="16" />
                    </Button>
                  </>
                  <NextLink href="/tags/create" passHref>
                    <Button
                      size="lg"
                      fontSize="xl"
                      colorScheme="purple"
                      ml="2"
                      maxW={59}
                    >
                      <Icon as={RiAddLine} fontSize="16" />
                    </Button>
                  </NextLink>
                </Flex>
              </Flex>
            </Flex>

            {isLoading ? (
              <Flex justify="center">
                <Spinner />
              </Flex>
            ) : error ? (
              <Flex justify="center">
                <Text>Falha ao obter dados dos usuários</Text>
              </Flex>
            ) : (
              <>
                <Table colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th width="8"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.tags.map(tag => (
                      <Tr key={tag.id}>
                        <Td color="gray.500">{tag.name}</Td>
                        <Td>
                          <NextLink href={`tags/${tag.id}`}
                            passHref>
                            <Button
                              as="a"
                              size="sm"
                              fontSize="sm"
                              colorScheme="purple"
                              leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                            >
                              Editar
                            </Button>
                          </NextLink>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Pagination
                  totalCountOfRegisters={data?.totalCount}
                  currentPage={page}
                  onPageChange={setPage}
                />
              </>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async ctx => {
  return {
    props: {}
  };
});