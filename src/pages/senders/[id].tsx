import { Box, Flex, Heading, HStack, useToast, VStack } from '@chakra-ui/react'
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from 'react-hook-form'
import { withSSRAuth } from "../../utils/withSSRAuth";
import { RiSaveLine } from 'react-icons/ri';
import { useMutation } from 'react-query'
import * as yup from 'yup';
import Head from 'next/head';
import { Input } from '../../components/Form/Input';
import { Header } from '../../components/Header';
import { Button } from '../../components/Form/Button';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';
import { AxiosError } from 'axios';
import { setupApiClient } from '../../services/api';

type SenderDetailsProps = {
  sender: {
    id: string
    active: boolean
    name: string
    email: string
  }
}

const updateSenderFormSchema = yup.object().shape({
  id: yup.string().required('ID obrigatório'),
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
});

type UpdateSenderFormData = {
  id: string;
  name: string;
  email: string;
}

export default function SenderDetails({ sender }: SenderDetailsProps) {
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, formState, setValue } = useForm<any>({
    resolver: yupResolver(updateSenderFormSchema)
  });

  setValue('id', sender?.id);
  setValue('name', sender?.name);
  setValue('email', sender?.email);

  const { errors } = formState;

  const updateSender = useMutation(
    async (sender: UpdateSenderFormData) => {
      const response = await api.put('/sender/update', sender);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('senders');
        toast({
          title: data?.message,
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        router.push('/senders');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao alterar o remetente',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleUpdateSender: SubmitHandler<UpdateSenderFormData> = async data => {
    try {
      await updateSender.mutateAsync(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Box>
        <Head>
          <title>Detalhes da remetente | Umbriel</title>
        </Head>

        <Header />

        <Flex width="100%" my="6" maxWidth={1580} marginX="auto">
          <Sidebar />
          <Box
            as="form"
            flex="1"
            ml="6"
            borderRadius={4}
            bgColor="white"
            shadow="0 0 20px rgba(0, 0, 0, 0.05)"
            p="8"
            onSubmit={handleSubmit(handleUpdateSender)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Detalhes da remetente</Heading>
              </Box>
              <HStack>
                <>
                  <Button
                    onClick={() => router.push(`/senders`)}
                    size="md"
                    colorScheme="blackAlpha">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    leftIcon={<RiSaveLine size="24" />}
                    colorScheme="purple">
                    Salvar
                  </Button>
                </>
              </HStack>
            </Flex>
            <VStack spacing="6" maxWidth="4xl">
              <Input
                name="email"
                label="E-mail"
                error={errors.email}
                {...register('email')}
              />
              <Input
                name="name"
                label="Nome"
                error={errors.name}
                {...register('name')}
              />
            </VStack>
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const { id } = ctx.params;
  const api = setupApiClient(ctx);

  const messageDataResponse = await api.get(`/sender/show?id=${id}`);
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/senders',
        permanent: false
      }
    };
  }
  return {
    props: {
      sender: messageDataResponse.data
    }
  };
});