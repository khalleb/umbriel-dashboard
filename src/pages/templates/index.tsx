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
import { useTemplates } from '../../hooks/templates/useTemplates';

type SearchTemplatesFormData = {
  search: string;
};

type InactivateActivateTemplateFormData = {
  template_id: string;
}

export default function Templates() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading, error, isFetching, refetch } = useTemplates(page, searchQuery);

  const handleSearchTemplate: SubmitHandler<SearchTemplatesFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  const inactivateActivateTemplate = useMutation(
    async (data: InactivateActivateTemplateFormData) => {
      const response = await api.get(`template/inactivate-activate?id=${data.template_id}`);
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
        queryClient.invalidateQueries('templates');
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

  async function handleInactivateActivateTemplate(id: string) {
    try {
      await inactivateActivateTemplate.mutateAsync({ template_id: id });
    } catch {
      toast({
        title: 'Error ao alterar o status do template',
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
          <title>Umbriel | Templates</title>
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
                <Heading size="lg" fontWeight="medium">Templates</Heading>
                <Text mt="1" color="gray.400">Listagem completa de templates</Text>
              </Box>
              <Flex>
                <Flex
                  as="form"
                  onSubmit={handleSubmit(handleSearchTemplate)}>
                  <Input
                    name="search"
                    placeholder="Buscar templates"
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
                    onClick={() => router.push(`/templates/create`)}
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
                    {data.templates.map(template => (
                      <Tr key={template.id}>
                        <Td color="gray.500">{template.name}</Td>
                        <Td>{template?.active ? (<MdCheckCircle color="#67e480" size={16} />) : (<MdCancel color="#E96379" size={16} />)}</Td>
                        <Td>
                          <HStack>
                            <Tooltip label="Editar">
                              <Circle
                                onClick={() => router.push(`templates/${template.id}`)}
                                size="25px"
                                bg="purple.700"
                                cursor="pointer"
                                color="white">
                                <Icon as={RiPencilLine} fontSize="14" />
                              </Circle>
                            </Tooltip>
                            {
                              template?.active
                                ?
                                (
                                  <Tooltip label="Inativar">
                                    <Circle
                                      onClick={() => handleInactivateActivateTemplate(template?.id)}
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
                                      onClick={() => handleInactivateActivateTemplate(template?.id)}
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