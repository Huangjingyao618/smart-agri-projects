import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { connectOnenet, disconnectOnenet } from '@/services/onenet';

function App(props: React.PropsWithChildren) {
  useEffect(() => {
    // 小程序启动时连接 OneNET
    connectOnenet();
  }, []);

  useDidShow(() => {
    // 从后台切回前台时尝试重连
    const { useDeviceStore } = require('@/store/device');
    if (useDeviceStore.getState().status !== 'connected') {
      connectOnenet();
    }
  });

  useDidHide(() => {
    // 切到后台时断开连接以节省资源
    disconnectOnenet();
  });

  return props.children as React.ReactElement;
}

export default App;