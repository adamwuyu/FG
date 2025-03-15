1. 打开某个应用：http://localhost:3000/app/detail?appId=67b131b0d9d41c2d4f2b5d7d
2. 点击设置按钮，弹出“应用信息设置”模态框
3. 在模态框的协作者部分点击“添加”
4. 页面崩溃，错误信息：
Unhandled Runtime Error
TypeError: groups.filter is not a function
详细信息：
```
The above error occurred in the <MemberModal> component:

    at MemberModal (webpack-internal:///./src/components/support/permission/MemberManager/MemberModal.tsx:56:11)
    at LoadableComponent (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/shared/lib/loadable.shared-runtime.js:113:9)
    at ContextProvider (webpack-internal:///../../node_modules/.pnpm/use-context-selector@1.4.4_react-dom@18.3.1_react@18.3.1__react@18.3.1_scheduler@0.23.2/node_modules/use-context-selector/dist/index.modern.mjs:36:5)
    at CollaboratorContextProvider (webpack-internal:///./src/components/support/permission/MemberManager/context.tsx:71:11)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at eval (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+modal@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_rea_uwwvdbew3dqnyohtqiv6ix7ag4/node_modules/@chakra-ui/modal/dist/chunk-OFOVX77R.mjs:19:11)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at MyBox (webpack-internal:///../../packages/web/components/common/MyBox/index.tsx:13:11)
    at section
    at MotionComponent (webpack-internal:///../../node_modules/.pnpm/framer-motion@9.1.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/framer-motion/dist/es/motion/index.mjs:51:65)
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at eval (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+modal@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_rea_uwwvdbew3dqnyohtqiv6ix7ag4/node_modules/@chakra-ui/modal/dist/chunk-7NUJBCEL.mjs:47:13)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at eval (webpack-internal:///../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.1_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/UI.js:23:50)
    at div
    at FocusLockUI (webpack-internal:///../../node_modules/.pnpm/react-focus-lock@2.13.6_@types+react@18.3.1_react@18.3.1/node_modules/react-focus-lock/dist/es2015/Lock.js:23:66)
    at FocusLockUICombination
    at FocusLock (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+focus-lock@2.1.0_@types+react@18.3.1_react@18.3.1/node_modules/@chakra-ui/focus-lock/dist/chunk-UU5OHSNF.mjs:21:5)
    at ModalFocusScope (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+modal@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_rea_uwwvdbew3dqnyohtqiv6ix7ag4/node_modules/@chakra-ui/modal/dist/chunk-NABYTFTG.mjs:35:75)
    at eval (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+modal@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_rea_uwwvdbew3dqnyohtqiv6ix7ag4/node_modules/@chakra-ui/modal/dist/chunk-EL2VKIZQ.mjs:23:7)
    at DefaultPortal (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+portal@2.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@chakra-ui/portal/dist/chunk-34PD6CUK.mjs:43:11)
    at Portal
    at PresenceChild (webpack-internal:///../../node_modules/.pnpm/framer-motion@9.1.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/framer-motion/dist/es/components/AnimatePresence/PresenceChild.mjs:15:26)
    at AnimatePresence (webpack-internal:///../../node_modules/.pnpm/framer-motion@9.1.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs:72:28)
    at Modal (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+modal@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_rea_uwwvdbew3dqnyohtqiv6ix7ag4/node_modules/@chakra-ui/modal/dist/chunk-MSA2NPQT.mjs:59:88)
    at MyModal (webpack-internal:///../../packages/web/components/common/MyModal/index.tsx:18:11)
    at InfoModal (webpack-internal:///./src/pageComponents/app/detail/InfoModal.tsx:44:11)
    at LoadableComponent (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/shared/lib/loadable.shared-runtime.js:113:9)
    at ContextProvider (webpack-internal:///../../node_modules/.pnpm/use-context-selector@1.4.4_react-dom@18.3.1_react@18.3.1__react@18.3.1_scheduler@0.23.2/node_modules/use-context-selector/dist/index.modern.mjs:36:5)
    at AppContextProvider (webpack-internal:///./src/pageComponents/app/detail/context.tsx:98:11)
    at Provider
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at Flex2 (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+layout@2.3.1_@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_re_laqjbpecjankktkuucdmld3nb4/node_modules/@chakra-ui/layout/dist/chunk-KRPLQIP4.mjs:13:11)
    at Auth (webpack-internal:///./src/components/Layout/auth.tsx:28:11)
    at div
    at eval (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:60:66)
    at ChakraComponent (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-5PL47M24.mjs:50:102)
    at Layout (webpack-internal:///./src/components/Layout/index.tsx:122:11)
    at EnvironmentProvider (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+react-env@3.1.0_react@18.3.1/node_modules/@chakra-ui/react-env/dist/chunk-VMD3UMGK.mjs:34:11)
    at ColorModeProvider (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+color-mode@2.2.0_react@18.3.1/node_modules/@chakra-ui/color-mode/dist/chunk-AMBGAKG2.mjs:29:5)
    at ThemeProvider (webpack-internal:///../../node_modules/.pnpm/@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1/node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js:123:50)
    at ThemeProvider (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+system@2.6.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+sty_wi4uqijjwo5hre4rhnie7z5x2y/node_modules/@chakra-ui/system/dist/chunk-MFVQSVQB.mjs:28:11)
    at ChakraProvider (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+provider@2.4.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+s_ztdrk2mdo2gfdolrenibnh3bx4/node_modules/@chakra-ui/provider/dist/chunk-3DDHO3UN.mjs:20:5)
    at ChakraProvider2 (webpack-internal:///../../node_modules/.pnpm/@chakra-ui+react@2.8.1_@emotion+react@11.11.1_@types+react@18.3.1_react@18.3.1__@emotion+styl_ee4y2ut6ylglwvio6l6nsbci6m/node_modules/@chakra-ui/react/dist/chunk-QAITB7GG.mjs:19:5)
    at ChakraUIContext (webpack-internal:///./src/web/context/ChakraUI.tsx:25:11)
    at ContextProvider (webpack-internal:///../../node_modules/.pnpm/use-context-selector@1.4.4_react-dom@18.3.1_react@18.3.1__react@18.3.1_scheduler@0.23.2/node_modules/use-context-selector/dist/index.modern.mjs:36:5)
    at I18nContextProvider (webpack-internal:///./src/web/context/I18n.tsx:19:11)
    at ContextProvider (webpack-internal:///../../node_modules/.pnpm/use-context-selector@1.4.4_react-dom@18.3.1_react@18.3.1__react@18.3.1_scheduler@0.23.2/node_modules/use-context-selector/dist/index.modern.mjs:36:5)
    at SystemStoreContextProvider (webpack-internal:///../../packages/web/context/useSystem.tsx:30:11)
    at QueryClientProvider (webpack-internal:///../../node_modules/.pnpm/@tanstack+react-query@4.36.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:48:3)
    at QueryClientContext (webpack-internal:///./src/web/context/QueryClient.tsx:20:11)
    at App (webpack-internal:///./src/pages/_app.tsx:36:11)
    at I18nextProvider (webpack-internal:///../../node_modules/.pnpm/react-i18next@14.1.2_i18next@23.11.5_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/react-i18next/dist/es/I18nextProvider.js:11:5)
    at AppWithTranslation (webpack-internal:///../../node_modules/.pnpm/next-i18next@15.3.0_i18next@23.11.5_next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0__v4bjmxai7j5wbttffakqeadybq/node_modules/next-i18next/dist/esm/appWithTranslation.js:50:22)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/shared/lib/router/adapters.js:81:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/client/components/react-dev-overlay/pages/ErrorBoundary.js:41:9)
    at ReactDevOverlay (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/client/components/react-dev-overlay/pages/ReactDevOverlay.js:33:11)
    at Container (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/client/index.js:81:1)
    at AppContainer (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/client/index.js:214:11)
    at Root (webpack-internal:///../../node_modules/.pnpm/next@14.2.5_@babel+core@7.26.9_babel-plugin-macros@3.1.0_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.85.0/node_modules/next/dist/client/index.js:438:11)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
```