import React, { ReactNode } from 'react';
import { Flex, Tab, TabList, Tabs as ChakraTabs, Box, StyleProps } from '@chakra-ui/react';

export interface TabItem {
  id: string;
  label: string | ReactNode;
}

interface Props extends StyleProps {
  list: TabItem[];
  activeId: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (id: string) => void;
}

const Tabs = ({ list, activeId, onChange, size = 'md', ...styleProps }: Props) => {
  return (
    <ChakraTabs
      variant={'unstyled'}
      index={list.findIndex((item) => item.id === activeId)}
      display={'flex'}
      alignItems={'center'}
      w={'fit-content'}
      {...styleProps}
    >
      <TabList>
        <Flex whiteSpace={'nowrap'}>
          {list.map((item) => (
            <Tab
              key={item.id}
              px={size === 'sm' ? 2 : 4}
              py={size === 'sm' ? '3px' : '5px'}
              fontSize={size === 'sm' ? 'sm' : 'md'}
              fontWeight={'medium'}
              _selected={{
                color: 'primary.600',
                borderBottom: '2px solid',
                borderBottomColor: 'primary.600'
              }}
              onClick={() => onChange?.(item.id)}
            >
              {item.label}
            </Tab>
          ))}
        </Flex>
      </TabList>
    </ChakraTabs>
  );
};

export default React.memo(Tabs);
