import { useState } from "react"
import { Box, Flex, Heading,  Radio, Stack, RadioGroup, VStack, Button, useToast, HStack } from "@chakra-ui/react"
import { Header } from '../../components/Header'
import { RiDeleteBin4Line } from 'react-icons/ri'
import { Sidebar } from '../../components/Sidebar'
import { AxiosError } from "axios"
import { useRouter } from 'next/router';
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "react-query"
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup';
import { RiSaveLine } from 'react-icons/ri';
import Head from 'next/head';
import { Input } from '../../components/Form/Input';
import { setupApiClient } from "../../services/api";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { api } from "../../services/apiClient";
import { queryClient } from "../../services/queryClient";

const updateUserFormSchema = yup.object().shape({
  id: yup.string().required('ID obrigatório'),
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
});

type UserDetailsProps = {
  user: {
    id: string
    active: boolean
    name: string
    email: string
    role: string
  }
}
type UpdateUserFormData = {
  id: string
  name: string
  email: string
  role: string
}


export default function UserDetails({ user }: UserDetailsProps) {
  const toast = useToast();
  const router = useRouter();
  const [role, setRole] = useState(user.role);

  const { register, handleSubmit, formState, setValue } = useForm<any>({
    resolver: yupResolver(updateUserFormSchema)
  });

  setValue('id', user?.id);
  setValue('name', user?.name);
  setValue('email', user?.email);

  const { errors } = formState;

  const updateUser = useMutation(
    async (user: UpdateUserFormData) => {
      const response = await api.put('/user/update', user);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast({
          title: 'Usuário alterado',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        router.push('/users');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao alterar a tag',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleUpdateUser: SubmitHandler<UpdateUserFormData> = async data => {
    try {
      await updateUser.mutateAsync({
        id: data.id,
        name: data.name,
        email: data.email,
        role,
      });
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <Box>
      <Head>
        <title>Detalhes do usuário | Umbriel</title>
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
          p="8"
          onSubmit={handleSubmit(handleUpdateUser)}>
          <Flex mb="8" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="medium">Detalhes do usuário</Heading>
            </Box>

            <HStack>
              <>
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
              </>
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
          </VStack>
        </Box>
      </Flex>
    </Box>
  )

}

export const getServerSideProps = withSSRAuth(async ctx => {
  const { id } = ctx.params;

  const api = setupApiClient(ctx)

  const messageDataResponse = await api.get(`/user/show?id=${id}`)
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/users',
        permanent: false
      }
    };
  }
  return {
    props: {
      user: messageDataResponse.data
    }
  };
});
