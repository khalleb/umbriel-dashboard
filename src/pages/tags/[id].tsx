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

type TagDetailsProps = {
  tag: {
    id: string
    active: boolean
    name: string
  }
}


type UpdateTagFormData = {
  id: string;
  name: string;
}

const updateTagFormSchema = yup.object().shape({
  id: yup.string().required('ID obrigatório'),
  name: yup.string().required('Nome obrigatório'),
});

export default function TagDetails({ tag }: TagDetailsProps) {
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: yupResolver(updateTagFormSchema)
  });

  setValue('id', tag?.id);
  setValue('name', tag?.name);

  const { errors } = formState;


  const updateTag = useMutation(
    async (tag: UpdateTagFormData) => {
      const response = await api.put('/tag/update', tag);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tags');

        toast({
          title: 'Tag alterada com sucesso.',
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


  const handleUpdateTag: SubmitHandler<UpdateTagFormData> = async data => {
    try {
      await updateTag.mutateAsync({
        id: data.id,
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
          <title>Detalhes da tag | Umbriel</title>
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
            onSubmit={handleSubmit(handleUpdateTag)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Detalhes da tag</Heading>
              </Box>

              <HStack>
                <>
                  <Button
                    onClick={() => router.push(`/tags`)}
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

  const messageDataResponse = await api.get(`/tag/show?id=${id}`);
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/tags',
        permanent: false
      }
    };
  }
  return {
    props: {
      tag: messageDataResponse.data
    }
  };
});