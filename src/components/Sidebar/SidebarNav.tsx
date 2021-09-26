import { Text, Flex, Button, Stack } from "@chakra-ui/react";
import { RiContactsLine, RiDashboardLine, RiPencilRulerLine, RiMailOpenLine, RiPriceTag3Line, RiSendPlaneLine, RiLogoutBoxLine,RiUser3Line } from "react-icons/ri";
import { NavLink } from "./NavLink";
import { signOut } from "../../contexts/AuthContext";
import { NavSection } from "./NavSection";
export function SidebarNav() {

  function handleSignOut() {
    signOut()
  }

  return (
    <Flex
      as="aside"
      w="72"
      minH="calc(100vh - 8rem)"
      bgColor="white"
      py="8"
      shadow="0 0 20px rgba(0, 0, 0, 0.05)"
      borderRadius={4}
      direction="column"
    >
      <Stack Stack spacing="8">
        <NavSection title="GERAL">
          <NavLink icon={RiDashboardLine} href="/dashboard">Painel</NavLink>
          <NavLink icon={RiContactsLine} href="/contacts">Contatos</NavLink>
          <NavLink icon={RiPriceTag3Line} href="/tags">Tags</NavLink>
          <NavLink icon={RiPencilRulerLine} href="/templates">Templates</NavLink>
          <NavLink icon={RiMailOpenLine} href="/messages">Mensagens</NavLink>
        </NavSection>

        <NavSection title="SISTEMA">
          <NavLink icon={RiSendPlaneLine} href="/senders">Remetentes</NavLink>
          <NavLink icon={RiUser3Line} href="/users">Usuários</NavLink>
        </NavSection>

      </Stack>

      <Button
        onClick={handleSignOut}
        variant="link"
        alignSelf="flex-start"
        display="flex"
        alignItems="center"
        py="1"
        ml={8}
        mt="auto"
      >
        <RiLogoutBoxLine size="20" />
        <Text ml="4" fontSize="medium" fontWeight="medium">Logout</Text>
      </Button>
    </Flex>
  );
}