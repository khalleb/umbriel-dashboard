import { Box, Td, Tr, HStack, Tooltip, Circle, Icon } from '@chakra-ui/react'
import { RiPencilLine } from 'react-icons/ri';
import { Message } from "../../hooks/messages/useMessages";
import { useRouter } from 'next/router';
import { MessageStats } from './Stats';

type MessageItemProps = {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const router = useRouter();

  return (
    <Tr key={message.id}>
      <Td>
        <Box>
          {message.subject}
          {/* {message.sent_at && (<MessageStats messageId={message.id} />)} */}
        </Box>
      </Td>
      <Td color="gray.500">{message.sent_at || 'Não enviada'}</Td>
      <Td>
        <HStack>
          <Tooltip label="Ver detalhes">
            <Circle
              onClick={() => router.push(`/messages/${message.id}`)}
              size="25px"
              bg="purple.700"
              cursor="pointer"
              color="white">
              <Icon as={RiPencilLine} fontSize="14" />
            </Circle>
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  )
}