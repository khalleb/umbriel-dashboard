import { Box, Flex, Heading, HStack, useToast, VStack, RadioGroup, Stack, Radio, SimpleGrid } from '@chakra-ui/react'
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from 'react';
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


const createUserFormSchema = yup.object().shape({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
  password: yup.string().required('Senha obrigatória'),
  password_confirmation: yup.string().required('Confirmar a senha é obrigatório'),
});

type CreateUserFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export default function CreateUser() {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState('client');

  const { register, handleSubmit, formState } = useForm<any>({
    resolver: yupResolver(createUserFormSchema)
  });

  const { errors } = formState;

  const createUser = useMutation(
    async (user: CreateUserFormData) => {
      const response = await api.post('/user/store', user);
      return response.data;
    },
    {
      onSuccess: () => {
        toast({
          title: 'Usuário criado com sucesso',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })

        queryClient.invalidateQueries('users');
        router.push('/users');
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

  const handleSaveUser: SubmitHandler<CreateUserFormData> = async data => {
    try {
      await createUser.mutateAsync({
        email: data?.email,
        name: data.name,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role
      });
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <>
      <Box>
        <Head>
          <title>Criar usuário | Umbriel</title>
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
            onSubmit={handleSubmit(handleSaveUser)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Criar usuário</Heading>
              </Box>

              <HStack>
                <Button
                  onClick={() => router.push(`/users`)}
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
            <VStack spacing="6">
              <RadioGroup onChange={setRole} value={role}>
                <Stack spacing={5} direction="row">
                  <Radio colorScheme="red" value="admin">
                    Adinistrador
                  </Radio>
                  <Radio colorScheme="green" value="client">
                    Cliente
                  </Radio>
                </Stack>
              </RadioGroup>
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
              <SimpleGrid minChildWidth="240px" spacing={['6', '8']} width="100%">
                <Input
                  label="Senha"
                  type="password"
                  error={errors.password}
                  name="password"
                  {...register('password')}
                />

                <Input
                  label="Confirmar Senha"
                  type="password"
                  error={errors.password_confirmation}
                  name="password_confirmation"
                  {...register('password_confirmation')}
                />
              </SimpleGrid>
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