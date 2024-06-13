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
          <Image src="/snax_neon.svg" alt="SNAX Factory" height="200px" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;