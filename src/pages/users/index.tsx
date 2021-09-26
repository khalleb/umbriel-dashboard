import { Box, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Icon, Spinner, HStack, Tooltip, Circle, useToast } from '@chakra-ui/react';
import { withSSRAuth } from "../../utils/withSSRAuth";
import { useMutation } from "react-query";
import { AxiosError } from "axios";
import { SubmitHandler, useForm } from 'react-hook-form';
import Head from 'next/head'
import { Sidebar } from '../../components/Sidebar'
import { RiAddLine, RiRefreshLine, RiPencilLine, RiShutDownLine } from 'react-icons/ri';
import { Input } from '../../components/Form/Input';
import { Button } from '../../components/Form/Button'
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Header } from '../../components/Header'
import { Pagination } from '../../components/Pagination'
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';
import { useUsers } from '../../hooks/users/useUsers';

type SearchUsersFormData = {
  search: string;
};

type InactivateActivateUserFormData = {
  user_id: string;
}

export default function Users() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading, error, isFetching, refetch } = useUsers(page, searchQuery);

  const handleSearchUser: SubmitHandler<SearchUsersFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  const inactivateActivateUser = useMutation(
    async (data: InactivateActivateUserFormData) => {
      const response = await api.get(`user/inactivate-activate?id=${data.user_id}`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: data?.message,
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        queryClient.invalidateQueries('users');
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


  async function handleInactivateActivateUser(id: string) {
    try {
      await inactivateActivateUser.mutateAsync({ user_id: id });
    } catch {
      toast({
        title: 'Error ao alterar o status do usuário',
        status: 'error',
        position: 'top-right',
        duration: 3000
      })
    }
  }

  return (
    <>
      <Box>
        <Head>
          <title>Umbriel | Usuários</title>
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
                <Heading size="lg" fontWeight="medium">Usuários</Heading>
                <Text mt="1" color="gray.400">Listagem completa de usuários</Text>
              </Box>
              <Flex>
                <Flex
                  as="form"
                  onSubmit={handleSubmit(handleSearchUser)}>
                  <Input
                    name="search"
                    placeholder="Buscar usuários"
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
                    onClick={() => router.push(`/users/create`)}
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

            {isLoading ? (
              <Flex justify="center">
                <Spinner />
              </Flex>
            ) : error ? (
              <Flex justify="center">
                <Text>Falha a lista de usuários</Text>
              </Flex>
            ) : (
              <>
                <Table colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>E-mail</Th>
                      <Th>Tipo</Th>
                      <Th >Status</Th>
                      <Th width="8">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.users.map(user => (
                      <Tr key={user.id}>
                        <Td color="gray.500">{user.name}</Td>
                        <Td color="gray.500">{user.email}</Td>
                        <Td color="gray.500">{user.role}</Td>
                        <Td>{user?.active ? (<MdCheckCircle color="#67e480" size={16} />) : (<MdCancel color="#E96379" size={16} />)}</Td>
                        <Td>
                          <HStack>
                            <Tooltip label="Editar">
                              <Circle
                                onClick={() => router.push(`users/${user.id}`)}
                                size="25px"
                                bg="purple.700"
                                cursor="pointer"
                                color="white">
                                <Icon as={RiPencilLine} fontSize="14" />
                              </Circle>
                            </Tooltip>
                            {
                              user?.active
                                ?
                                (
                                  <Tooltip label="Inativar">
                                    <Circle
                                      onClick={() => handleInactivateActivateUser(user?.id)}
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
                                      onClick={() => handleInactivateActivateUser(user?.id)}
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