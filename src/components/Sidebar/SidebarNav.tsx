import { VStack, Link, Stack, Text, Flex, Button } from "@chakra-ui/react";
import { RiMailOpenLine, RiContactsLine, RiDashboardLine, RiPencilRulerLine, RiPriceTag3Line, RiSettings2Line, RiSendPlaneLine, RiLogoutBoxLine } from "react-icons/ri";
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
      <NavSection title="GERAL">
        <NavLink icon={RiDashboardLine} href="/dashboard">Painel</NavLink>
        <NavLink icon={RiContactsLine} href="/contacts">Contatos</NavLink>
        <NavLink icon={RiPriceTag3Line} href="/tags">Tags</NavLink>
        <NavLink icon={RiSendPlaneLine} href="/senders">Remetentes</NavLink>
        <NavLink icon={RiPencilRulerLine} href="/templates">Templates</NavLink>
      </NavSection>

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