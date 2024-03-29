import { Flex, useBreakpointValue } from '@chakra-ui/react'
import { Logo } from './Logo';
import { Profile } from './Profile';

export function Header() {

  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  })

  return (
    <Flex
      as="header"
      h="20"
      w="100%"
      bgColor="white"
      px="8"
      shadow="0 0 20px rgba(0, 0, 0, 0.05)"
    >
      <Flex
        width="100%"
        maxWidth={1580}
        marginX="auto"
        alignItems="center"
        justifyContent="space-between">

        <Logo />
        {/* {isWideVersion && <SearchBox />} */}

        <Flex
          align="center"
          ml="auto">
          <Profile showProfileData={isWideVersion} />
        </Flex>
      </Flex>


    </Flex>
  )
}