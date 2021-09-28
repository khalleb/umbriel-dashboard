import Head from 'next/head';
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'react-query'
import { Sidebar } from '../../components/Sidebar';
import { Input } from '../../components/Form/Input';
import { Header } from '../../components/Header';
import { Button } from '../../components/Form/Button';
import { Box, Flex, Heading, HStack, useToast, VStack } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AxiosError } from 'axios';
import { RiSaveLine } from 'react-icons/ri'
import { withSSRAuth } from "../../utils/withSSRAuth";
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';

const CodeEditor = dynamic(() => import("../../components/CodeEditor"), {
  ssr: false,
})

type SaveTemplateFormData = {
  name: string;
  content: string;
};

type CreateTemplateFormData = {
  name: string;
  content: string;
}

const createTemplateFormSchema = yup.object().shape({
  name: yup.string().required('Título obrigatório'),
  content: yup.string().test('hasMessageContent', 'Necessário ter a variável {{ message_content }} no conteúdo', (value) => {
    return value.includes('{{ message_content }}')
  }).required('Conteúdo obrigatório'),
});

export default function CreateTemplate() {
  const router = useRouter()
  const toast = useToast()

  const { register, handleSubmit, control, formState } = useForm<any>({
    defaultValues: {
      name: '',
      content: '{{ message_content }}',
    },
    resolver: yupResolver(createTemplateFormSchema)
  });

  const { errors } = formState;

  const createTemplate = useMutation(
    async (template: CreateTemplateFormData) => {
      const response = await api.post('/template/store', template);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates');
        toast({
          title: 'Template criado com sucesso.',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        router.push('/templates');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao criar o template',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleSaveTemplate: SubmitHandler<SaveTemplateFormData> = async data => {
    try {
      await createTemplate.mutateAsync({
        name: data.name,
        content: data.content,
      });
    } catch(error) {
      console.log(error)
    }
  };

  return (
    <Box>
      <Head>
        <title>Criar template | Umbriel</title>
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
          onSubmit={handleSubmit(handleSaveTemplate)}>
          <Flex mb="8" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="medium">Criar template</Heading>
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
  return {
    props: {}
  };
});