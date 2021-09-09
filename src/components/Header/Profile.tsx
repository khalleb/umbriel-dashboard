import { Flex, Text,Box } from '@chakra-ui/react'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

interface ProfileProps {
  showProfileData?: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
  const { user } = useContext(AuthContext)
  return (
    <Flex align="center">
      {showProfileData && (
        <Box mr="4" textAlign="right">
          <Text fontWeight="medium">{user?.name}</Text>
          <Text color="gray.500" fontSize="small">{user?.email}</Text>
        </Box>
       
      )}
    </Flex>
  )
}