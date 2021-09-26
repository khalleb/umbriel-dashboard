import { Box, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Icon, Spinner, HStack, Tooltip, Circle, useToast } from '@chakra-ui/react';
import { withSSRAuth } from "../../utils/withSSRAuth";
import { useMutation } from "react-query";
import { AxiosError } from "axios";
import { SubmitHandler, useForm } from 'react-hook-form';
import Head from 'next/head'
import { Sidebar } from '../../components/Sidebar'
import { RiAddLine, RiRefreshLine, RiPencilLine, RiShutDownLine } from 'react-icons/ri';
import { MessageItem } from '../../components/MessageItem';
import { Input } from '../../components/Form/Input';
import { Button } from '../../components/Form/Button'
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Header } from '../../components/Header'
import { Pagination } from '../../components/Pagination'
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';
import { useMessages } from '../../hooks/messages/useMessages';


type SearchMessagesFormData = {
  search: string;
};

export default function Messages() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const toast = useToast();

  const { data, isLoading, error, isFetching, refetch } = useMessages(page, searchQuery);

  const handleSearchMessage: SubmitHandler<SearchMessagesFormData> = async ({ search }) => {
    setPage(1)
    setSearchQuery(search);
  };

  return (
    <>
      <Box>
        <Head>
          <title>Umbriel | Mensagens</title>
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
                <Heading size="lg" fontWeight="medium">Mensagens</Heading>
                <Text mt="1" color="gray.400">Listagem completa de mensagens</Text>
              </Box>
              <Flex>
                <Flex
                  as="form"
                  onSubmit={handleSubmit(handleSearchMessage)}>
                  <Input
                    name="search"
                    placeholder="Buscar mensagens"
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
                    onClick={() => router.push(`/messages/create`)}
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
                <Text>Falha a lista de mensagens</Text>
              </Flex>
            ) : (
              <>
                <Table colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th>Mensagem</Th>
                      <Th>Enviada em</Th>
                      <Th width="8">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.messages?.map(message => (
                      <MessageItem key={message.id} message={message} />
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