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
import NextLink from 'next/link';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';
import { AxiosError } from 'axios';

type CreateTagFormData = {
  name: string;
}


const createTagFormSchema = yup.object().shape({
  name: yup.string().required('Nome obrigatório'),
});

export default function CreateTag() {
  const router = useRouter()
  const toast = useToast()

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(createTagFormSchema)
  });

  const { errors } = formState;


  const createTag = useMutation(
    async (tag: CreateTagFormData) => {
      const response = await api.post('/tag/store', tag);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tags');

        toast({
          title: 'Tag criada com sucesso.',
          status: 'success',
          position: 'top',
          duration: 3000
        })

        router.push('/tags');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.error || 'Houve um erro ao criar a tag',
          status: 'error',
          position: 'top',
          duration: 3000
        })

      }
    }
  );


  const handleSaveTag: SubmitHandler<CreateTagFormData> = async data => {
    try {
      await createTag.mutateAsync({
        name: data.name,
      });
    } catch {
      console.log('Error happened')
    }
  };


  return (
    <>
      <Box>
        <Head>
          <title>Criar tag | Umbriel</title>
        </Head>

        <Header />

        <Flex width="100%" my="6" maxWidth={1480} marginX="auto">
          <Sidebar />

          <Box
            as="form"
            flex="1"
            ml="6"
            borderRadius={4}
            bgColor="white"
            shadow="0 0 20px rgba(0, 0, 0, 0.05)"
            p="8"
            onSubmit={handleSubmit(handleSaveTag)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Criar tag</Heading>
              </Box>

              <HStack>
                <NextLink href="/tags">
                  <Button size="md" colorScheme="blackAlpha">
                    Cancelar
                  </Button>
                </NextLink>
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