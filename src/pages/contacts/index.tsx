import Head from 'next/head'
import { Box, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Icon, Spinner, HStack, Circle, Tooltip, useToast } from '@chakra-ui/react';
import { Sidebar } from '../../components/Sidebar'
import { AxiosError } from "axios";
import { Header } from '../../components/Header'
import { useRouter } from 'next/router'
import { Button } from '../../components/Form/Button'
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '../../components/Form/Input';
import { withSSRAuth } from '../../utils/withSSRAuth'
import { RiAddLine, RiRefreshLine, RiPencilLine, RiShutDownLine } from 'react-icons/ri';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { useState } from 'react';
import { Pagination } from '../../components/Pagination'
import { useMutation } from "react-query";
import { useContacts } from '../../hooks/contacts/useContacts';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';


type SearchContactsFormData = {
  search: string;
};

type RemoveTagFormData = {
  contact_id: string;
}

export default function Contacts() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading, error, isFetching, refetch } = useContacts(page, searchQuery);

  const handleSearchContacts: SubmitHandler<SearchContactsFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  const inscribeDescribeContact = useMutation(
    async (data: RemoveTagFormData) => {
      const response = await api.get(`contact/inscribe-describe?id=${data.contact_id}`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log(data);
        toast({
          title: data?.message,
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        queryClient.invalidateQueries('contacts');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao mudar o status do contato',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    },
  );

  async function handleInscribeDescribeContact(id: string) {
    try {
      await inscribeDescribeContact.mutateAsync({ contact_id: id });
    } catch {
      toast({
        title: 'Error ao alterar o status do contato',
        status: 'success',
        position: 'top-right',
        duration: 3000
      })
    }
  }

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
                <Flex
                  as="form"
                  onSubmit={handleSubmit(handleSearchContacts)}>
                  <Input
                    name="search"
                    placeholder="Buscar contatos"
                    {...register('search')}
                  />
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
                  <Text>Falha ao obter a lista de contatos</Text>
                </Flex>
              ) : (
                <>
                  <Table colorScheme="whiteAlpha" >
                    <Thead>
                      <Tr>
                        <Th>E-mail</Th>
                        <Th>Nome</Th>
                        <Th>Inscrito</Th>
                        <Th width="8">Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.contacts.map(contact => (
                        <Tr key={contact.id}>
                          <Td color="gray.500">{contact.email}</Td>
                          <Td color="gray.500">{contact.name}</Td>
                          <Td>{contact?.subscribed ? (<MdCheckCircle color="#67e480" size={16} />) : (<MdCancel color="#E96379" size={16} />)}</Td>
                          <Td>
                            <HStack>
                              <Tooltip label="Editar">
                                <Circle
                                  onClick={() => router.push(`contacts/${contact.id}`)}
                                  size="25px"
                                  bg="purple.700"
                                  cursor="pointer"
                                  color="white">
                                  <Icon as={RiPencilLine} fontSize="14" />
                                </Circle>
                              </Tooltip>
                              {
                                contact?.subscribed
                                  ?
                                  (
                                    <Tooltip label="Inativar">
                                      <Circle
                                        onClick={() => handleInscribeDescribeContact(contact?.id)}
                                        size="25px"
                                        bg="tomato"
                                        cursor="pointer"
                                        color="white">
                                        <Icon as={RiShutDownLine} fontSize="14" />
                                      </Circle>
                                    </Tooltip>
                                  )
                                  :
                                  (
                                    <Tooltip label="Ativar">
                                      <Circle
                                        onClick={() => handleInscribeDescribeContact(contact?.id)}
                                        size="25px"
                                        bg="#67e480"
                                        cursor="pointer"
                                        color="white">
                                        <Icon as={RiShutDownLine} fontSize="14" />
                                      </Circle>
                                    </Tooltip>
                                  )
                              }
                            </HStack>
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