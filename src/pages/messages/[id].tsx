import { Box, Flex, Heading, Text, Button, useToast, HStack } from "@chakra-ui/react"
import { Header } from '../../components/Header'
import { RiSendPlaneLine } from 'react-icons/ri'
import { Sidebar } from '../../components/Sidebar'
import { AxiosError } from "axios"
import { useRouter } from 'next/router';
import { useMutation } from "react-query"
import Head from 'next/head';
import { setupApiClient } from "../../services/api";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { api } from "../../services/apiClient";
import { queryClient } from "../../services/queryClient";

type MessageDetailsProps = {
  message: {
    id: string
    subject: string
    body: string
    sent_at: Date
    sender: {
      name: string
      email: string
    }
    tags: Array<{
      id: string
      name: string
    }>


  }
}

export default function UserMessages({ message }: MessageDetailsProps) {
  const router = useRouter();
  const toast = useToast();

  const sendMessage = useMutation(
    async (messageId: string) => {
      const response = await api.post(`message/send?id=${messageId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast({
          description: 'Mensagem enviada com sucesso',
          status: 'success',
          position: 'top-right'
        })
        queryClient.invalidateQueries('messages');
        router.push('/messages')
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao enviar a mensagem',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    },
  );

  async function handleSendMessage(messageId: string) {
    try {
      await sendMessage.mutateAsync(messageId);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box>
      <Head>
        <title>Detalhes da mensagem | Umbriel</title>
      </Head>
      <Header />
      <Flex w="100%" my="6" maxWidth={1580} mx="auto" px="6">
        <Sidebar />

        <Box
          as="form"
          flex="1"
          ml="6"
          borderRadius={4}
          bgColor="white"
          shadow="0 0 20px rgba(0, 0, 0, 0.05)"
          p="8">
          <Flex mb="8" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="medium">Detalhes da mensagem</Heading>
            </Box>
            <HStack>
              <>
                <Button
                  onClick={() => router.push(`/messages`)}
                  size="md"
                  colorScheme="blackAlpha">
                  Cancelar
                </Button>
                {!message?.sent_at && (
                  <Button
                    mt="4"
                    type="submit"
                    size="md"
                    leftIcon={<RiSendPlaneLine size="24" />}
                    onClick={() => handleSendMessage(message?.id)}
                    isLoading={sendMessage.isLoading}
                    colorScheme="purple"
                  >
                    REALIZAR ENVIO
                  </Button>
                )}
              </>
            </HStack>
          </Flex>

          <Heading size="md" fontWeight="bold">Assunto do e-mail</Heading>
          <Text mt="2" fontWeight="medium">{message?.subject}</Text>
          <Heading mt="4" size="md" fontWeight="bold">Remetente</Heading>
          <Text mt="2">{`${message?.sender?.name} | <${message?.sender?.email}>`}</Text>
          <Heading mt="4" size="md" fontWeight="bold">Conteúdo</Heading>
          <Box mt="4" bg="gray.100" p="4" borderRadius="md" dangerouslySetInnerHTML={{ __html: message?.body }} />
        </Box>
      </Flex>
    </Box>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const { id } = ctx.params;
  const api = setupApiClient(ctx)

  const messageDataResponse = await api.get(`/message/show?id=${id}`)
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/messages',
        permanent: false
      }
    };
  }
  return {
    props: {
      message: messageDataResponse.data
    }
  };
});
