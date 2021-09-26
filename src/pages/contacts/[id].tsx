import { useState } from "react"
import { Box, Flex, Heading, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, HStack } from "@chakra-ui/react"
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

type UpdateContactFormData = {
  id: string
  name: string;
  email: string
}

type ContactDetailsProps = {
  contact: {
    id: string
    active: boolean
    name: string
    email: string
    subscribed: boolean
    tags: Array<{
      id: string
      active: boolean
      name: string
    }>
  }
}


type RemoveTagFormData = {
  contact_id: string;
  tag_id: string;
}

const updateContactFormSchema = yup.object().shape({
  id: yup.string().required('ID obrigatório'),
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('Precisa ser um e-mail').required('E-mail obrigatório'),
});

export default function ContactDetails({ contact }: ContactDetailsProps) {
  const toast = useToast();
  const router = useRouter()
  const [tags, setTags] = useState(contact?.tags || []);


  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: yupResolver(updateContactFormSchema)
  });

  setValue('id', contact?.id);
  setValue('name', contact?.name);
  setValue('email', contact?.email);

  const { errors } = formState;


  const removeTag = useMutation(
    async (data: RemoveTagFormData) => {
      const response = await api.delete(`/contact/delete-tag`, { data: { id_contact: data?.contact_id, id_tag: data?.tag_id } });
      return { message: response?.data?.message, id: data?.tag_id };
    },
    {
      onSuccess: (data) => {
        if (tags && tags.length > 0) {
          const newTags = tags.filter(e => e.id !== data?.id);
          setTags(newTags);
        }
        toast({
          title: data?.message,
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        queryClient.invalidateQueries('contact');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao remover a tag',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    },
  );

  async function handleRemoveTag(data: RemoveTagFormData) {
    try {
      await removeTag.mutateAsync(data);
    } catch {
      toast({
        title: 'Error ao remover tag',
        status: 'success',
        position: 'top-right',
        duration: 3000
      })
    }
  }

  const updateContact = useMutation(
    async (contact: UpdateContactFormData) => {
      const response = await api.put('/contact/update', contact);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contacts');
        toast({
          title: 'Contato alterada com sucesso.',
          status: 'success',
          position: 'top-right',
          duration: 3000
        })
        router.push('/contacts');
      },
      onError: (error: AxiosError) => {
        toast({
          title: error?.response?.data?.message || 'Houve um erro ao tentar altetar o contato',
          status: 'error',
          position: 'top-right',
          duration: 3000
        })
      }
    }
  );

  const handleUpdateContact: SubmitHandler<UpdateContactFormData> = async data => {
    try {
      await updateContact.mutateAsync({
        id: data.id,
        name: data.name,
        email: data.email
      });
    } catch {
      toast({
        title: 'Houve um erro ao tentar altetar o contato',
        status: 'error',
        position: 'top-right',
        duration: 3000
      })
    }
  };

  return (
    <Box>
      <Head>
        <title>Detalhes do contato | Umbriel</title>
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
          onSubmit={handleSubmit(handleUpdateContact)}>
          <Flex mb="8" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="medium">Detalhes do contato</Heading>
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
              name="email"
              label="E-mail do contato"
              error={errors.email}
              {...register('email')}
            />

            <Input
              name="name"
              label="Nome do contato"
              error={errors.name}
              {...register('name')}
            />
          </SimpleGrid>

          <Heading mt="4" size="md" fontWeight="bold">Tags</Heading>

          <Table mt="4">
            <Thead>
              <Tr>
                <Th>Nome da tag</Th>
                <Th>Remover</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tags?.map((tag) => (
                <Tr key={tag.id}>
                  <Td>
                    {tag.name}
                  </Td>
                  <Td color="gray.500">
                    <Button
                      mt="4"
                      type="submit"
                      size="sm"
                      leftIcon={<RiDeleteBin4Line size="16" />}
                      onClick={() => handleRemoveTag({ contact_id: contact.id, tag_id: tag.id })}
                      isLoading={removeTag.isLoading}
                      colorScheme="red"
                    >
                      Remover tag
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Box>
  )
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const { id } = ctx.params;

  const api = setupApiClient(ctx)

  const messageDataResponse = await api.get(`/contact/show?id=${id}`)
  if (!messageDataResponse.data) {
    return {
      redirect: {
        destination: '/contacts',
        permanent: false
      }
    };
  }
  return {
    props: {
      contact: messageDataResponse.data
    }
  };
});