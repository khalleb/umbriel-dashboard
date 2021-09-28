import { Box, Flex, Heading, HStack, useToast, VStack } from '@chakra-ui/react'
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from 'next/dynamic';
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

const CodeEditor = dynamic(() => import("../../components/CodeEditor"), {
  ssr: false,
})

const updateTemplateFormSchema = yup.object().shape({
  id: yup.string().required('ID obrigatório'),
  name: yup.string().required('Título obrigatório'),
  content: yup.string().test('hasMessageContent', 'Necessário ter a variável {{ message_content }} no conteúdo', (value) => {
    return value.includes('{{ message_content }}')
  }).required('Conteúdo obrigatório'),
});

type TemplategDetailsProps = {
  template: {
    id: string
    active: boolean
    name: string
    content: string
  }
}

type UpdateTemplateFormData = {
  id: string;
  name: string;
  content: string;
}

export default function TemplateDetails({ template }: TemplategDetailsProps) {
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, formState, control, setValue } = useForm<any>({
    resolver: yupResolver(updateTemplateFormSchema)
  });

  setValue('id', template?.id);
  setValue('name', template?.name);
  setValue('content', template?.content);

  const { errors } = formState;

  const updateTemplate = useMutation(
    async (template: UpdateTemplateFormData) => {
      const response = await api.put('/template/update', template);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('templates');
        toast({
          title: data?.message,
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        router.push('/templates');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao alterar o template',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleUpdateTemplate: SubmitHandler<UpdateTemplateFormData> = async data => {
    try {
      await updateTemplate.mutateAsync({
        id: data.id,
        name: data.name,
        content: data.content,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box>
      <Head>
        <title>Detalhes do template | Umbriel</title>
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
          onSubmit={handleSubmit(handleUpdateTemplate)}>
          <Flex mb="8" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="medium">Detalhes do template</Heading>
            </Box>
            <HStack>
              <>
                <Button
                  onClick={() => router.push(`/templates`)}
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
              label="Nome"
              error={errors.name}
              name="name"
              {...register('name')}
            />

            <CodeEditor
              error={errors.content}
              label="Conteúdo"
              description="Inclua {{ message_content }} para injetar o conteúdo da mensagem"
              name="content"
              control={control}
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const { id } = ctx.params;
  const api = setupApiClient(ctx);

  const messageDataResponse = await api.get(`/template/show?id=${id}`);
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/templates',
        permanent: false
      }
    };
  }
  return {
    props: {
      template: messageDataResponse.data
    }
  };
});