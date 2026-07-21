#ifndef __ESP8266_H
#define __ESP8266_H

#include "stm32f10x.h"

// ========== 平台配置 ==========
#define PRODUCT_ID      "46LC0850o3"        // 产品ID
#define DEVICE_NAME     "stm32"             // 设备名称

// OneNET MQTT Token (access_key方式)
#define MQTT_TOKEN      "version=2018-10-31&res=products%2F46LC0850o3%2Fdevices%2Fstm32&et=1893456000&method=md5&sign=k4uDjK3Zp1aR%2BWFjvSXsEg%3D%3D"

// WiFi 配置
#define WIFI_SSID       "724"
#define WIFI_PASSWORD   "724724666"

// MQTT 服务器
#define MQTT_BROKER     "mqtts.heclouds.com"
#define MQTT_PORT       "1883"

// ========== Topic 定义(OneJSON协议) ==========
#define TOPIC_PUB       "$sys/46LC0850o3/stm32/thing/property/post"
#define TOPIC_PUB_REPLY "$sys/46LC0850o3/stm32/thing/property/post/reply"
#define TOPIC_SUB       "$sys/46LC0850o3/stm32/thing/property/set"

// ========== ESP8266 引脚 ==========
#define ESP_RST_PORT    GPIOA
#define ESP_RST_PIN     GPIO_Pin_1
#define ESP_RST_RCC     RCC_APB2Periph_GPIOA

#define ESP_RST_H()     GPIO_SetBits(ESP_RST_PORT, ESP_RST_PIN)
#define ESP_RST_L()     GPIO_ResetBits(ESP_RST_PORT, ESP_RST_PIN)

// USART2 接收缓冲区大小
#define USART2_RX_BUF_SIZE  1024

// ========== 全局变量声明 ==========
extern uint8_t mqtt_connected;
extern uint8_t usart2_rx_buf[USART2_RX_BUF_SIZE];
extern volatile uint16_t usart2_rx_len;
extern volatile uint8_t usart2_rx_flag;

// ========== 函数声明 ==========
void ESP_RST_Init(void);
void ESP8266_Reset(void);
void USART2_Init(void);
void ESP8266_SendCmd(char *cmd);
void ESP8266_SendRaw(uint8_t *data, uint16_t len);
uint8_t ESP8266_ConnectWiFi(void);
uint8_t ESP8266_ConnectOneNET(void);
void ESP8266_Subscribe(void);
void ESP8266_ReportData(float temp, float humi);
void ESP8266_ProcessDownlink(void);

#endif