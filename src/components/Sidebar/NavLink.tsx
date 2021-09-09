
import {
  Icon,
  Link as ChakraLink,
  Text,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import { ElementType } from 'react';
import { ActiveLink } from '../ActiveLink';

type NavLinkProps = ChakraLinkProps & {
  icon: ElementType;
  href: string;
  children: string;
};

export function NavLink({
  icon,
  href,
  children,
  ...rest
}: NavLinkProps) {
  return (
    <ActiveLink
      href={href}
      passHref
    >
      <ChakraLink display="flex" alignItems="center" py="1" pl={8} borderLeft="3px solid" {...rest}>
        <Icon as={icon} fontSize="20" />
        <Text marginLeft="4" fontSize="medium" fontWeight="medium">
          {children}
        </Text>
      </ChakraLink>
    </ActiveLink>
  );
}