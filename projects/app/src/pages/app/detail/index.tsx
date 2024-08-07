import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { serviceSideProps } from '@fastgpt/web/common/system/nextjs';
import NextHead from '@/components/common/NextHead';
import { useContextSelector } from 'use-context-selector';
import { useUserStore } from '@/web/support/user/useUserStore';
import AppContextProvider, { AppContext } from '@/pageComponents/app/detail/context';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useChatStore } from '@/web/core/chat/context/useChatStore';

const SimpleEdit = dynamic(() => import('@/pageComponents/app/detail/SimpleApp'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});
const Workflow = dynamic(() => import('@/pageComponents/app/detail/Workflow'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});
const Plugin = dynamic(() => import('@/pageComponents/app/detail/Plugin'), {
  ssr: false,
  loading: () => <Loading fixed={false} />
});

const AppDetail = () => {
  const { userInfo } = useUserStore();
  const { setAppId, setSource } = useChatStore();
  const appDetail = useContextSelector(AppContext, (e) => e.appDetail);
  // 可以编辑日志的权限：app属于用户的默认组，且用户角色为editor或owner
  const canEditLogs =
    userInfo?.team.teamId === appDetail.teamId &&
    // @ts-ignore
    (userInfo?.team.role === 'owner' || userInfo?.team.role === 'editor');

  // root用户，并且是默认组的owner具有所有权限（root是所有组的owner）
  const canEverything = userInfo?.username == 'root' && userInfo?.team.role === 'owner';

  useEffect(() => {
    setSource('test');
    appDetail._id && setAppId(appDetail._id);
  }, [appDetail._id, setSource, setAppId]);

  if (!canEditLogs && !canEverything) {
    // return empty component
    return () => {};
  }

  return (
    <>
      <NextHead title={appDetail.name} icon={appDetail.avatar}></NextHead>
      <Box h={'100%'} position={'relative'}>
        {!appDetail._id ? (
          <Loading fixed={false} />
        ) : (
          <>
            {appDetail.type === AppTypeEnum.simple && <SimpleEdit />}
            {appDetail.type === AppTypeEnum.workflow && <Workflow />}
            {appDetail.type === AppTypeEnum.plugin && <Plugin />}
          </>
        )}
      </Box>
    </>
  );
};

const Provider = () => {
  return (
    <AppContextProvider>
      <AppDetail />
    </AppContextProvider>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      ...(await serviceSideProps(context, ['app', 'chat', 'user', 'file', 'publish', 'workflow']))
    }
  };
}

export default Provider;
