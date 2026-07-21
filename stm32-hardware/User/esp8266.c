#include "ESP8266.h"
#include "LED.h"
#include "Delay.h"
#include "OLED.h"
#include <string.h>
#include <stdio.h>

// ========== OneNET MQTT 服务器IP(解决DNS解析失败) ==========
#define MQTT_IP         "183.230.40.39"

uint8_t mqtt_connected = 0;
uint8_t use_mqtt_at   = 0;   // 1=MQTT AT固件, 0=TCP透传+手动MQTT

// USART2 接收缓冲区
uint8_t usart2_rx_buf[USART2_RX_BUF_SIZE];
volatile uint16_t usart2_rx_len = 0;
volatile uint8_t usart2_rx_flag = 0;

// MQTT Packet ID
static uint16_t mqtt_packet_id = 1;

// ========== 内部辅助函数声明 ==========
static void     ClearRxBuf(void);
static uint8_t  WaitForString(char *str, uint16_t timeout_ms);
static uint8_t  TCPSend(uint8_t *data, uint16_t len);
static uint16_t MQTT_BuildConnect(uint8_t *buf);
static uint16_t MQTT_BuildSubscribe(uint8_t *buf, uint16_t pkt_id, char *topic);
static uint16_t MQTT_BuildPublish(uint8_t *buf, uint16_t pkt_id, char *topic, uint8_t *payload, uint16_t payload_len);
static void     ParseOneNETCommand(uint8_t *data, uint16_t len);

// ========== ESP8266 RST 引脚初始化 (PA1) ==========
void ESP_RST_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    RCC_APB2PeriphClockCmd(ESP_RST_RCC, ENABLE);
    GPIO_InitStructure.GPIO_Pin = ESP_RST_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(ESP_RST_PORT, &GPIO_InitStructure);
    ESP_RST_H();
}

// ========== ESP8266 硬件复位 ==========
void ESP8266_Reset(void)
{
    // 先拉低复位引脚
    ESP_RST_L();
    Delay_ms(500);   // 延长低电平时间确保可靠复位
    ESP_RST_H();
    Delay_ms(3000);  // 延长等待时间确保ESP8266完全启动
}

// ========== ESP8266 软件复位(AT+RST) ==========
static uint8_t ESP8266_SoftReset(void)
{
    ClearRxBuf();
    ESP8266_SendCmd("AT+RST");
    // AT+RST 返回 "OK" 然后重启，重启后返回 "ready"
    if(WaitForString("ready", 5000) || WaitForString("OK", 5000))
    {
        Delay_ms(2000);  // 等待稳定
        return 1;
    }
    return 0;
}

// ========== USART2 初始化 ==========
void USART2_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    USART_InitTypeDef USART_InitStructure;
    NVIC_InitTypeDef NVIC_InitStructure;

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART2, ENABLE);

    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_2;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_3;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init(GPIOA, &GPIO_InitStructure);

    USART_InitStructure.USART_BaudRate = 115200;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;
    USART_Init(USART2, &USART_InitStructure);

    USART_ITConfig(USART2, USART_IT_RXNE, ENABLE);

    NVIC_InitStructure.NVIC_IRQChannel = USART2_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 1;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);

    USART_Cmd(USART2, ENABLE);
}

// ========== 清空接收缓冲区 ==========
static void ClearRxBuf(void)
{
    uint16_t i;
    for(i = 0; i < USART2_RX_BUF_SIZE; i++)
        usart2_rx_buf[i] = 0;
    usart2_rx_len = 0;
    usart2_rx_flag = 0;
}

// ========== 等待接收缓冲区中出现指定字符串 ==========
static uint8_t WaitForString(char *str, uint16_t timeout_ms)
{
    uint16_t waited = 0;
    while(waited < timeout_ms)
    {
        if(usart2_rx_flag && strstr((char *)usart2_rx_buf, str) != NULL)
            return 1;
        Delay_ms(50);
        waited += 50;
    }
    return 0;
}

// ========== 发送AT命令(自动加\r\n) ==========
void ESP8266_SendCmd(char *cmd)
{
    while(*cmd)
    {
        USART_SendData(USART2, (uint16_t)*cmd++);
        while(USART_GetFlagStatus(USART2, USART_FLAG_TXE) == RESET);
    }
    USART_SendData(USART2, 0x0D);
    while(USART_GetFlagStatus(USART2, USART_FLAG_TXE) == RESET);
    USART_SendData(USART2, 0x0A);
    while(USART_GetFlagStatus(USART2, USART_FLAG_TXE) == RESET);
}

// ========== 发送原始数据 ==========
void ESP8266_SendRaw(uint8_t *data, uint16_t len)
{
    uint16_t i;
    for(i = 0; i < len; i++)
    {
        USART_SendData(USART2, data[i]);
        while(USART_GetFlagStatus(USART2, USART_FLAG_TXE) == RESET);
    }
}

// ========== TCP发送：AT+CIPSEND=<len> → 等待> → 发送数据 ==========
static uint8_t TCPSend(uint8_t *data, uint16_t len)
{
    char cmd[32];
    sprintf(cmd, "AT+CIPSEND=%d", len);
    ClearRxBuf();
    ESP8266_SendCmd(cmd);

    if(!WaitForString(">", 3000))
        return 0;

    ClearRxBuf();
    ESP8266_SendRaw(data, len);

    if(!WaitForString("SEND OK", 5000))
        return 0;

    return 1;
}

// ========== MQTT 剩余长度编码 ==========
static uint8_t EncodeRemainingLength(uint32_t len, uint8_t *buf)
{
    uint8_t count = 0;
    do {
        uint8_t byte = len % 128;
        len /= 128;
        if(len > 0)
            byte |= 0x80;
        buf[count++] = byte;
    } while(len > 0);
    return count;
}

// ========== MQTT CONNECT 报文 ==========
static uint16_t MQTT_BuildConnect(uint8_t *buf)
{
    uint16_t pos = 0;
    uint8_t  rem_buf[4], rem_len;
    uint8_t  var_header[10];
    uint16_t var_len = 0;
    uint16_t payload_len = 0;
    uint16_t len;
    uint16_t total_remaining;

    var_header[var_len++] = 0x00;
    var_header[var_len++] = 0x04;
    var_header[var_len++] = 'M';
    var_header[var_len++] = 'Q';
    var_header[var_len++] = 'T';
    var_header[var_len++] = 'T';
    var_header[var_len++] = 0x04;
    var_header[var_len++] = 0xC2;  // username+password+clean session
    var_header[var_len++] = 0x00;
    var_header[var_len++] = 0x78;  // Keep Alive 120s

    payload_len = 2 + strlen(DEVICE_NAME);
    payload_len += 2 + strlen(PRODUCT_ID);
    payload_len += 2 + strlen(MQTT_TOKEN);

    total_remaining = var_len + payload_len;

    buf[pos++] = 0x10;
    rem_len = EncodeRemainingLength(total_remaining, rem_buf);
    memcpy(buf + pos, rem_buf, rem_len);
    pos += rem_len;

    memcpy(buf + pos, var_header, var_len);
    pos += var_len;

    len = strlen(DEVICE_NAME);
    buf[pos++] = (len >> 8) & 0xFF;
    buf[pos++] = len & 0xFF;
    memcpy(buf + pos, DEVICE_NAME, len);
    pos += len;

    len = strlen(PRODUCT_ID);
    buf[pos++] = (len >> 8) & 0xFF;
    buf[pos++] = len & 0xFF;
    memcpy(buf + pos, PRODUCT_ID, len);
    pos += len;

    len = strlen(MQTT_TOKEN);
    buf[pos++] = (len >> 8) & 0xFF;
    buf[pos++] = len & 0xFF;
    memcpy(buf + pos, MQTT_TOKEN, len);
    pos += len;

    return pos;
}

// ========== MQTT SUBSCRIBE 报文 ==========
static uint16_t MQTT_BuildSubscribe(uint8_t *buf, uint16_t pkt_id, char *topic)
{
    uint16_t pos = 0;
    uint8_t  rem_buf[4], rem_len;
    uint16_t topic_len = strlen(topic);
    uint16_t remaining = 2 + 2 + topic_len + 1;

    buf[pos++] = 0x82;
    rem_len = EncodeRemainingLength(remaining, rem_buf);
    memcpy(buf + pos, rem_buf, rem_len);
    pos += rem_len;

    buf[pos++] = (pkt_id >> 8) & 0xFF;
    buf[pos++] = pkt_id & 0xFF;

    buf[pos++] = (topic_len >> 8) & 0xFF;
    buf[pos++] = topic_len & 0xFF;
    memcpy(buf + pos, topic, topic_len);
    pos += topic_len;

    buf[pos++] = 0x01;

    return pos;
}

// ========== MQTT PUBLISH 报文 (QoS 0) ==========
static uint16_t MQTT_BuildPublish(uint8_t *buf, uint16_t pkt_id, char *topic, uint8_t *payload, uint16_t payload_len)
{
    uint16_t pos = 0;
    uint8_t  rem_buf[4], rem_len;
    uint16_t topic_len = strlen(topic);
    uint16_t remaining = 2 + topic_len + payload_len;

    buf[pos++] = 0x30;
    rem_len = EncodeRemainingLength(remaining, rem_buf);
    memcpy(buf + pos, rem_buf, rem_len);
    pos += rem_len;

    buf[pos++] = (topic_len >> 8) & 0xFF;
    buf[pos++] = topic_len & 0xFF;
    memcpy(buf + pos, topic, topic_len);
    pos += topic_len;

    memcpy(buf + pos, payload, payload_len);
    pos += payload_len;

    return pos;
}

// ========== 检测ESP8266是否支持MQTT AT命令 ==========
static uint8_t DetectMQTTAT(void)
{
    ClearRxBuf();
    ESP8266_SendCmd("AT+MQTTUSERCFG=?");
    if(WaitForString("OK", 2000))
    {
        return 1;  // 支持MQTT AT命令
    }
    return 0;  // 不支持，需用TCP+手动MQTT
}

// ========== 连接WiFi ==========
uint8_t ESP8266_ConnectWiFi(void)
{
    char cmd[128];
    uint8_t retry;

    OLED_ShowString(4, 1, "WiFi Init...");

    // 硬件复位 + 软件复位双保险
    ESP8266_Reset();
    ClearRxBuf();

    // 软件复位一次，确保状态干净
    ESP8266_SoftReset();
    ClearRxBuf();

    // 测试AT
    ESP8266_SendCmd("AT");
    if(!WaitForString("OK", 3000))
    {
        // 重试一次
        ESP8266_SendCmd("AT");
        if(!WaitForString("OK", 3000))
        {
            OLED_ShowString(4, 1, "AT FAIL     ");
            return 0;
        }
    }

    // 设置Station模式
    ClearRxBuf();
    ESP8266_SendCmd("AT+CWMODE=1");
    Delay_ms(500);

    // 连接WiFi (带重试)
    for(retry = 0; retry < 3; retry++)
    {
        ClearRxBuf();
        sprintf(cmd, "AT+CWJAP=\"%s\",\"%s\"", WIFI_SSID, WIFI_PASSWORD);
        ESP8266_SendCmd(cmd);

        if(WaitForString("WIFI GOT IP", 15000) || WaitForString("OK", 15000))
            break;

        OLED_ShowString(4, 1, "WiFi RETRY...");
        Delay_ms(2000);
    }

    if(retry >= 3)
    {
        OLED_ShowString(4, 1, "WiFi FAIL   ");
        return 0;
    }

    OLED_ShowString(4, 1, "WiFi OK     ");
    return 1;
}

// ========== 连接OneNET MQTT (自适应) ==========
uint8_t ESP8266_ConnectOneNET(void)
{
    char cmd[512];
    uint8_t mqtt_buf[256];
    uint16_t mqtt_len;

    OLED_ShowString(4, 1, "MQTT Conn...");

    // 检测是否支持MQTT AT命令
    use_mqtt_at = DetectMQTTAT();

    if(use_mqtt_at)
    {
        // ====== 方案A: MQTT AT命令 ======
        OLED_ShowString(4, 1, "MQTT AT...");

        // 1. MQTT用户配置(OneNET Token可能过长导致失败)
        ClearRxBuf();
        sprintf(cmd, "AT+MQTTUSERCFG=0,1,\"%s\",\"%s\",\"%s\",0,0,\"\"",
                DEVICE_NAME, PRODUCT_ID, MQTT_TOKEN);
        ESP8266_SendCmd(cmd);
        if(!WaitForString("OK", 3000))
        {
            // MQTT AT配置失败(Token太长), 降级到TCP方案
            OLED_ShowString(4, 1, "AT CFG FAIL ");
            use_mqtt_at = 0;
            goto tcp_mqtt;
        }

        // 2. 连接MQTT服务器
        ClearRxBuf();
        sprintf(cmd, "AT+MQTTCONN=0,\"%s\",%s,1", MQTT_BROKER, MQTT_PORT);
        ESP8266_SendCmd(cmd);
        if(!WaitForString("OK", 15000))
        {
            OLED_ShowString(4, 1, "MQTT CON FAIL");
            use_mqtt_at = 0;
            goto tcp_mqtt;
        }
    }
    else
    {
tcp_mqtt:
        // ====== 方案B: TCP透传 + 手动MQTT ======
        OLED_ShowString(4, 1, "TCP MQTT...");

        // 1. 设置单连接模式
        ClearRxBuf();
        ESP8266_SendCmd("AT+CIPMUX=0");
        Delay_ms(500);

        // 2. 用IP直连MQTT服务器(避免DNS解析失败)
        ClearRxBuf();
        sprintf(cmd, "AT+CIPSTART=\"TCP\",\"%s\",%s", MQTT_IP, MQTT_PORT);
        ESP8266_SendCmd(cmd);
        if(!WaitForString("CONNECT", 15000))
        {
            OLED_ShowString(4, 1, "TCP FAIL    ");
            return 0;
        }

        // 3. 发送MQTT CONNECT报文
        mqtt_len = MQTT_BuildConnect(mqtt_buf);
        if(!TCPSend(mqtt_buf, mqtt_len))
        {
            OLED_ShowString(4, 1, "MQTT FAIL   ");
            return 0;
        }

        // 等待CONNACK
        if(!WaitForString("+IPD", 5000))
        {
            OLED_ShowString(4, 1, "NO CONNACK  ");
            return 0;
        }
    }

    mqtt_connected = 1;
    OLED_ShowString(4, 1, "MQTT OK     ");
    return 1;
}

// ========== 订阅Topic ==========
void ESP8266_Subscribe(void)
{
    char cmd[256];
    uint8_t mqtt_buf[128];
    uint16_t mqtt_len;

    if(!mqtt_connected) return;

    if(use_mqtt_at)
    {
        // MQTT AT方式订阅
        ClearRxBuf();
        sprintf(cmd, "AT+MQTTSUB=0,\"%s\",1", TOPIC_SUB);
        ESP8266_SendCmd(cmd);
        WaitForString("OK", 3000);

        ClearRxBuf();
        sprintf(cmd, "AT+MQTTSUB=0,\"%s\",1", TOPIC_PUB_REPLY);
        ESP8266_SendCmd(cmd);
        WaitForString("OK", 3000);
    }
    else
    {
        // TCP+手动MQTT方式订阅
        mqtt_len = MQTT_BuildSubscribe(mqtt_buf, mqtt_packet_id++, TOPIC_SUB);
        TCPSend(mqtt_buf, mqtt_len);

        mqtt_len = MQTT_BuildSubscribe(mqtt_buf, mqtt_packet_id++, TOPIC_PUB_REPLY);
        TCPSend(mqtt_buf, mqtt_len);
    }
}

// ========== 上报温湿度数据 ==========
void ESP8266_ReportData(float temp, float humi)
{
    char payload[256];
    char cmd[384];
    uint8_t mqtt_buf[512];
    uint16_t payload_len, mqtt_len;

    if(!mqtt_connected) return;

    payload_len = sprintf(payload,
        "{\"id\":\"%u\",\"version\":\"1.0\","
        "\"params\":{"
        "\"temperature\":{\"value\":%.1f},"
        "\"humidity\":{\"value\":%.1f}"
        "}}",
        (uint16_t)(SysTick->VAL & 0xFFFF), temp, humi);

    if(use_mqtt_at)
    {
        // MQTT AT方式上报
        ClearRxBuf();
        sprintf(cmd, "AT+MQTTPUBRAW=0,\"%s\",%d,0,0", TOPIC_PUB, payload_len);
        ESP8266_SendCmd(cmd);

        if(!WaitForString(">", 5000))
        {
            OLED_ShowString(4, 1, "PUB NO >    ");
            return;
        }

        ESP8266_SendRaw((uint8_t *)payload, payload_len);

        if(!WaitForString("OK", 5000))
        {
            OLED_ShowString(4, 1, "PUB FAIL    ");
            return;
        }
    }
    else
    {
        // TCP+手动MQTT方式上报
        mqtt_len = MQTT_BuildPublish(mqtt_buf, mqtt_packet_id++, TOPIC_PUB,
                                     (uint8_t *)payload, payload_len);
        if(!TCPSend(mqtt_buf, mqtt_len))
        {
            OLED_ShowString(4, 1, "PUB FAIL    ");
            return;
        }
    }
}

// ========== 解析OneNET下发的JSON命令 ==========
static void ParseOneNETCommand(uint8_t *data, uint16_t len)
{
    char *ptr;

    ptr = strstr((char *)data, "\"LED1\"");
    if(ptr != NULL)
    {
        ptr = strstr(ptr, "\"value\"");
        if(ptr != NULL)
        {
            ptr = strchr(ptr, ':');
            if(ptr != NULL)
            {
                if(*(ptr + 1) == '1') LED1_ON();
                else if(*(ptr + 1) == '0') LED1_OFF();
            }
        }
    }

    ptr = strstr((char *)data, "\"LED2\"");
    if(ptr != NULL)
    {
        ptr = strstr(ptr, "\"value\"");
        if(ptr != NULL)
        {
            ptr = strchr(ptr, ':');
            if(ptr != NULL)
            {
                if(*(ptr + 1) == '1') LED2_ON();
                else if(*(ptr + 1) == '0') LED2_OFF();
            }
        }
    }
}

// ========== 处理ESP8266下发的MQTT消息 ==========
void ESP8266_ProcessDownlink(void)
{
    char *ptr, *json_start, *json_end;

    if(usart2_rx_flag == 0) return;

    if(use_mqtt_at)
    {
        // MQTT AT方式: 查找 +MQTTSUBRECV 消息
        ptr = strstr((char *)usart2_rx_buf, "+MQTTSUBRECV:");
        if(ptr != NULL)
        {
            json_start = strchr(ptr, '{');
            if(json_start != NULL)
            {
                json_end = strrchr(ptr, '}');
                if(json_end != NULL)
                {
                    ParseOneNETCommand((uint8_t *)json_start, (uint16_t)(json_end - json_start + 1));
                }
            }
        }
    }
    else
    {
        // TCP方式: 查找 +IPD 消息
        ptr = strstr((char *)usart2_rx_buf, "+IPD,");
        if(ptr != NULL)
        {
            json_start = strchr(ptr, '{');
            if(json_start != NULL)
            {
                json_end = strrchr(ptr, '}');
                if(json_end != NULL)
                {
                    ParseOneNETCommand((uint8_t *)json_start, (uint16_t)(json_end - json_start + 1));
                }
            }
        }
    }

    ClearRxBuf();
}