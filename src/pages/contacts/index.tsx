import Head from 'next/head'
import { Box, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Icon, Spinner } from '@chakra-ui/react';
import { Sidebar } from '../../components/Sidebar'
import { Header } from '../../components/Header'
import { useRouter } from 'next/router'
import { Button } from '../../components/Form/Button'
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '../../components/Form/Input';
import { withSSRAuth } from '../../utils/withSSRAuth'
import { RiAddLine, RiRefreshLine, RiSearch2Line, RiPencilLine } from 'react-icons/ri';
import { useState } from 'react';
import { Pagination } from '../../components/Pagination'

import { useContacts } from '../../hooks/contacts/useContacts';

type SearchContactsFormData = {
  search: string;
};

export default function Contacts() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const { data, isLoading, error, isFetching, refetch } = useContacts(page, searchQuery);

  const handleSearchContacts: SubmitHandler<SearchContactsFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  return (
    <>
      <Box>
        <Head>
          <title>Umbriel | Contatos</title>
        </Head>
        <Header />
        <Flex w="100%" my="6" maxWidth={1580} mx="auto" maxHeight="calc(100vh - 128px)" px="6">
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
                <Heading size="lg" fontWeight="medium">Contatos</Heading>
                <Text mt="1" color="gray.400">Listagem completa de contatos</Text>
              </Box>
              <Flex>
                <Flex as="form"
                  onSubmit={handleSubmit(handleSearchContacts)}>
                  <Input
                    name="search"
                    placeholder="Buscar contatos"
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
                  <Button
                    onClick={() => router.push(`/contacts/create`)}
                    size="lg"
                    fontSize="xl"
                    colorScheme="purple"
                    ml="2"
                    maxW={59}
                  >
                    <Icon as={RiAddLine} fontSize="16" />
                  </Button>
                </Flex>
              </Flex>
            </Flex>
            <Box>
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
                  <Table colorScheme="whiteAlpha" >
                    <Thead>
                      <Tr>
                        <Th>E-mail</Th>
                        <Th>Nome</Th>
                        <Th width="8"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.contacts.map(contact => (
                        <Tr key={contact.id}>
                          <Td color="gray.500">{contact.email}</Td>
                          <Td color="gray.500">{contact.name}</Td>
                          <Td>
                            <Button
                              onClick={() => router.push(`contacts/${contact.id}`)}
                              size="sm"
                              fontSize="sm"
                              colorScheme="purple"
                              leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                            >
                              Editar
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Box>
                    <Pagination
                      totalCountOfRegisters={data?.totalCount}
                      currentPage={page}
                      onPageChange={setPage}
                    />
                  </Box>

                </>
              )}

            </Box>
          </Box>
        </Flex>
      </Box>
    </>
  )
}


export const getServerSideProps = withSSRAuth(async ctx => {
  return {
    props: {}
  };
});