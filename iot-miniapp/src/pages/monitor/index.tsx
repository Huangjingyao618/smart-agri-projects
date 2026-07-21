import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { useDeviceStore } from '@/store/device';
import { connectOnenet } from '@/services/onenet';
import styles from './index.module.scss';

export default function MonitorPage() {
  const { data, status } = useDeviceStore();

  const statusText: Record<string, string> = {
    connected: '已连接',
    connecting: '连接中...',
    disconnected: '未连接',
    error: '连接失败',
  };

  const handleReconnect = () => {
    connectOnenet();
  };

  return (
    <View className={styles.pageContainer}>
      {/* 连接状态栏 */}
      <View className={styles.statusBar}>
        <View className={classnames(styles.statusDot, styles[status])} />
        <Text className={styles.statusText}>{statusText[status] || '未知'}</Text>
        {status !== 'connected' && status !== 'connecting' && (
          <Text className={styles.reconnectBtn} onClick={handleReconnect}>
            重连
          </Text>
        )}
      </View>

      {/* 温湿度数据卡片 */}
      <View className={styles.dataCards}>
        <View className={classnames(styles.dataCard, styles.tempCard)}>
          <Text className={styles.cardIcon}>🌡️</Text>
          <Text className={styles.cardLabel}>温度</Text>
          <Text className={styles.cardValue}>
            {data.temp.toFixed(1)}
            <Text className={styles.cardUnit}>℃</Text>
          </Text>
        </View>
        <View className={classnames(styles.dataCard, styles.humiCard)}>
          <Text className={styles.cardIcon}>💧</Text>
          <Text className={styles.cardLabel}>湿度</Text>
          <Text className={styles.cardValue}>
            {data.humidity.toFixed(1)}
            <Text className={styles.cardUnit}>%</Text>
          </Text>
        </View>
      </View>

      {/* LED 状态速览 */}
      <View className={styles.ledOverview}>
        <Text className={styles.sectionTitle}>LED 状态</Text>
        <View className={styles.ledRow}>
          <Text className={styles.ledLabel}>LED1</Text>
          <Text className={classnames(styles.ledBadge, data.LED1 ? styles.on : styles.off)}>
            {data.LED1 ? '已开启' : '已关闭'}
          </Text>
        </View>
        <View className={styles.ledRow}>
          <Text className={styles.ledLabel}>LED2</Text>
          <Text className={classnames(styles.ledBadge, data.LED2 ? styles.on : styles.off)}>
            {data.LED2 ? '已开启' : '已关闭'}
          </Text>
        </View>
      </View>

      {/* 更新时间 */}
      {data.timestamp > 0 && (
        <Text className={styles.updateTime}>
          更新时间：{new Date(data.timestamp).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}