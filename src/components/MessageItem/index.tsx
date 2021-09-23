import { Box, Td, Tr, Link as ChakraLink } from '@chakra-ui/react'


import Link from 'next/link'
import { Message } from '../../hooks/messages/useMessages';
import { MessageStats } from './Stats';

type MessageItemProps = {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <Tr key={message.id}>
      <Td>
        <Box>
          <Link href={`/messages/${message.id}`} passHref>
            <ChakraLink
              title="Ver detalhes"
              fontSize="lg"
              color="blue.500"
            >
              {message.subject}
            </ChakraLink>
          </Link>
          {message.sentAt && (
            <MessageStats messageId={message.id} />
          )}
        </Box>
      </Td>
      <Td color="gray.500">{message.sentAt || 'Not sent'}</Td>
    </Tr>
  )
}