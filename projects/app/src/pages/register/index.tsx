import React, { useState, useEffect } from 'react';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { serviceSideProps } from '@/web/common/utils/i18n';
import dynamic from 'next/dynamic';
import Loading from '@fastgpt/web/components/common/MyLoading';

const RegisterForm = dynamic(() => import('./components/RegisterForm'), {
  ssr: false
});

const Register = () => {
  const { feConfigs } = useSystemStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading ? (
        <Loading fixed={false} />
      ) : (
        <RegisterForm 
          // @ts-ignore
          setPageType={() => {}} 
          loginSuccess={() => {
            window.location.href = '/login';
            return null;
          }}
          defaultPageType="register"
        />
      )}
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Register;
