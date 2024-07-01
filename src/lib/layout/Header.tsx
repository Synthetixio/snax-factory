import { Flex, Image } from '@chakra-ui/react';

const Header = () => {
  return (
    <Flex
      as="header"
      width="full"
      align="center"
      direction={['column']}
    >
      <Flex direction={['column', 'row']} gap={3.5}>
        <Flex mx={['auto', 'none']}>
          <Image src="/neon-sign.gif" alt="SNAX Factory" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;