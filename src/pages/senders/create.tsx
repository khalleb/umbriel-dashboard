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

const createSenderFormSchema = yup.object().shape({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
});

type CreateSenderFormData = {
  name: string;
  email: string;
}

export default function CreateSender() {
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, formState } = useForm<any>({
    resolver: yupResolver(createSenderFormSchema)
  });

  const { errors } = formState;

  const createSender = useMutation(
    async (sender: CreateSenderFormData) => {
      const response = await api.post('/sender/store', sender);
      return response.data;
    },
    {
      onSuccess: () => {
        toast({
          title: 'Remetente criado com sucesso',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })

        queryClient.invalidateQueries('senders');
        router.push('/senders');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao criar o remetente',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleSaveSender: SubmitHandler<CreateSenderFormData> = async data => {
    try {
      await createSender.mutateAsync(data);
    } catch(error) {
      console.log(error)
    }
  };

  return (
    <>
      <Box>
        <Head>
          <title>Criar remetente | Umbriel</title>
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
            onSubmit={handleSubmit(handleSaveSender)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Criar remetente</Heading>
              </Box>

              <HStack>
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
              </HStack>
            </Flex>
            <VStack spacing="6" maxWidth="4xl">
              <Input
                label="E-mail"
                error={errors.email}
                name="email"
                {...register('email')}
              />
              <Input
                label="Nome"
                error={errors.name}
                name="name"
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
  return {
    props: {}
  };
});