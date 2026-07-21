import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useDeviceStore } from '@/store/device';
import { sendLedCommand } from '@/services/onenet';
import styles from './index.module.scss';

export default function LedPage() {
  const { data, status } = useDeviceStore();

  const handleToggle = (led: 'LED1' | 'LED2') => {
    if (status !== 'connected') {
      Taro.showToast({ title: '设备未连接', icon: 'none' });
      return;
    }
    const newState = !data[led];
    // 先更新本地状态，给用户即时反馈
    useDeviceStore.getState().updateData({ [led]: newState, timestamp: Date.now() });
    // 下发命令
    sendLedCommand(led, newState);
    Taro.showToast({ title: `${led} ${newState ? '已开启' : '已关闭'}`, icon: 'success', duration: 1000 });
  };

  const renderLedControl = (led: 'LED1' | 'LED2', label: string) => {
    const isOn = data[led];
    return (
      <View className={styles.controlCard}>
        <Text className={styles.ledTitle}>{label}</Text>
        <Text className={styles.ledDesc}>
          {isOn ? '当前状态：开启 — 点击按钮关闭' : '当前状态：关闭 — 点击按钮开启'}
        </Text>
        <View className={styles.ledStatus}>
          <View className={classnames(styles.ledIndicator, isOn ? styles.on : styles.off)} />
          <Text className={styles.ledStateText}>{isOn ? '已开启' : '已关闭'}</Text>
        </View>
        <Button
          className={classnames(styles.toggleBtn, isOn ? styles.onBtn : styles.offBtn)}
          onClick={() => handleToggle(led)}
        >
          {isOn ? '关闭' : '开启'} {label}
        </Button>
      </View>
    );
  };

  return (
    <View className={styles.pageContainer}>
      {/* 连接状态栏 */}
      <View className={styles.statusBar}>
        <View
          className={classnames(styles.statusDot, status === 'connected' ? styles.connected : styles.disconnected)}
        />
        <Text className={styles.statusText}>
          {status === 'connected' ? '设备已连接' : '设备未连接，无法控制'}
        </Text>
      </View>

      {renderLedControl('LED1', 'LED1 指示灯')}
      {renderLedControl('LED2', 'LED2 指示灯')}

      <Text className={styles.tips}>
        提示：通过 OneNET 云平台下发命令，控制 STM32 开发板上的 LED 灯亮灭
      </Text>
    </View>
  );
}