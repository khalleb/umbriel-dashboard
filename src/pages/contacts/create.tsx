import { Box, Flex, Heading, HStack, useToast, SimpleGrid } from '@chakra-ui/react';
import { withSSRAuth } from "../../utils/withSSRAuth";
import React, { useCallback } from 'react';
import Head from 'next/head'
import { Sidebar } from '../../components/Sidebar'
import { AxiosError } from 'axios'
import { RiSaveLine } from 'react-icons/ri'
import { useMutation } from 'react-query'
import { Header } from '../../components/Header'
import { Button } from '../../components/Form/Button'
import { Input } from '../../components/Form/Input'
import { AsyncSelect } from '../../components/Form/AsyncSelect'
import * as yup from 'yup'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { api } from "../../services/apiClient";
import { queryClient } from "../../services/queryClient";

type CreateContactFormData = {
  name: string;
  email: string;
  tags?: any[];
}

const createContactFormSchema = yup.object().shape({
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
  name: yup.string(),
  tags: yup.array(),
});

export default function CreateContact() {
  const router = useRouter()
  const toast = useToast()

  const { register, handleSubmit, formState, control } = useForm<any>({
    resolver: yupResolver(createContactFormSchema)
  });

  const loadTags = useCallback(async search => {
    const response = await api.post('/tag/index', { page: 1, status: 'active' });
    return response?.data?.list?.map(tag => ({
      value: tag.id,
      label: tag.name,
    }));
  }, []);

  const { errors } = formState;

  const createContact = useMutation(
    async (contact: CreateContactFormData) => {
      const response = await api.post('/contact/store', contact);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contacts');

        toast({
          title: 'Contato criado com sucesso.',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })

        router.push('/contacts');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao tentar criar o contato. Tente novamente',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleSaveContatc: SubmitHandler<CreateContactFormData> = async data => {
    try {
      await createContact.mutateAsync({
        name: data?.name || null,
        email: data.email,
        tags: data?.tags?.map(e => e?.value),
      });
    } catch {
      toast({
        title: 'Erro ao criar contato',
        status: 'error',
        position: 'top-right',
        duration: 3000
      })
    }
  };

  return (
    <>
      <Box>
        <Head>
          <title>Criar contato | Umbriel</title>
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
            onSubmit={handleSubmit(handleSaveContatc)}>
            <Flex mb="8" justifyContent="space-between" alignItems="center">
              <Box>
                <Heading size="lg" fontWeight="medium">Criar contato</Heading>
              </Box>

              <HStack>
                <>
                  <Button
                    onClick={() => router.push(`/contacts`)}
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
            <SimpleGrid minChildWidth="240px" spacing={['6', '8']} width="100%">
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
            </SimpleGrid>
            <SimpleGrid minChildWidth="240px" spacing={['6', '8']} width="100%">
              <AsyncSelect
                name="tags"
                control={control}
                loadOptions={loadTags}
                label="Tag"
                error={errors.tag} />
            </SimpleGrid>
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