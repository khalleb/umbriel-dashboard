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
import { useTags } from '../../hooks/tags/useTags';
import { Header } from '../../components/Header'
import { Pagination } from '../../components/Pagination'
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';

type InactivateActivateTagFormData = {
  tag_id: string;
}

type SearchTagsFormData = {
  search: string;
};

export default function Tags() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading, error, isFetching, refetch } = useTags(page, searchQuery);

  const handleSearchTags: SubmitHandler<SearchTagsFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  const inactivateActivateTag = useMutation(
    async (data: InactivateActivateTagFormData) => {
      const response = await api.get(`tag/inactivate-activate?id=${data.tag_id}`);
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
        queryClient.invalidateQueries('tags');
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

  async function handleInactivateActivateTag(id: string) {
    try {
      await inactivateActivateTag.mutateAsync({ tag_id: id });
    } catch {
      toast({
        title: 'Error ao alterar o status da tag',
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
          <title>Umbriel | Tags</title>
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
                <Heading size="lg" fontWeight="medium">Tags</Heading>
                <Text mt="1" color="gray.400">Listagem completa de tags</Text>
              </Box>
              <Flex>
                <Flex
                  as="form"
                  onSubmit={handleSubmit(handleSearchTags)}>
                  <Input
                    name="search"
                    placeholder="Buscar tags"
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
                    onClick={() => router.push(`/tags/create`)}
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
                <Text>Falha ao obter dados dos usuários</Text>
              </Flex>
            ) : (
              <>
                <Table colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th >Status</Th>
                      <Th width="8">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.tags.map(tag => (
                      <Tr key={tag.id}>
                        <Td color="gray.500">{tag.name}</Td>
                        <Td>{tag?.active ? (<MdCheckCircle color="#67e480" size={16} />) : (<MdCancel color="#E96379" size={16} />)}</Td>
                        <Td>
                          <HStack>
                            <Tooltip label="Editar">
                              <Circle
                                onClick={() => router.push(`tags/${tag.id}`)}
                                size="25px"
                                bg="purple.700"
                                cursor="pointer"
                                color="white">
                                <Icon as={RiPencilLine} fontSize="14" />
                              </Circle>
                            </Tooltip>
                            {
                              tag?.active
                                ?
                                (
                                  <Tooltip label="Inativar">
                                    <Circle
                                      onClick={() => handleInactivateActivateTag(tag?.id)}
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
                                      onClick={() => handleInactivateActivateTag(tag?.id)}
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