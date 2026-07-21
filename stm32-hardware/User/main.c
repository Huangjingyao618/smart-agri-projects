#include "stm32f10x.h"
#include "Delay.h"
#include "OLED.h"
#include "LED.h"
#include "Key.h"
#include "DHT11.h"
#include "Buzzer.h"
#include "ESP8266.h"

int main()
{
    uint8_t buffer[5];
    uint8_t key_val;
    float temp, humi;
    uint32_t report_count = 0;
    uint32_t last_report_tick = 0;
    
    // 初始化
    OLED_Init();
    LED_Init();
    Buzzer_Init();   // 关闭蜂鸣器
    Key_Init();
    DHT11_Init();
    ESP_RST_Init();
    USART2_Init();
    
    // 显示设备信息
    OLED_ShowString(1, 1, "ID:2023008382");
    OLED_ShowCC_F16x16(2, 1, 0);   // 温
    OLED_ShowCC_F16x16(2, 3, 2);   // 度
    OLED_ShowChar(2, 5, ':');
    OLED_ShowCC_F16x16(3, 1, 1);   // 湿
    OLED_ShowCC_F16x16(3, 3, 2);   // 度
    OLED_ShowChar(3, 5, ':');
    
    // 连接网络
    OLED_ShowString(4, 1, "Starting...");
    Delay_ms(2000);
    
    if(ESP8266_ConnectWiFi())
    {
        if(ESP8266_ConnectOneNET())
        {
            ESP8266_Subscribe();
            OLED_ShowString(4, 1, "Connected!  ");
        }
    }
    
    while(1)
    {
        // ===== 按键扫描：控制LED亮灭 =====
        key_val = Key_GetNum();
        if(key_val == 1)
        {
            LED1_Turn();  // KEY1 翻转 LED1
        }
        else if(key_val == 2)
        {
            LED2_Turn();  // KEY2 翻转 LED2
        }
        
        // ===== 处理ESP8266下发的OneNET命令 =====
        ESP8266_ProcessDownlink();
        
        // ===== DHT11温湿度采集与显示 =====
        if(DHT_ReadData(buffer) == 0)
        {
            humi = buffer[0] + buffer[1] / 10.0;
            temp = buffer[2] + buffer[3] / 10.0;
            
            OLED_ShowFNum(2, 6, temp, 3, 1);
            OLED_ShowCC_F16x16(2, 12, 3);
            OLED_ShowString(2, 13, "C ");
            OLED_ShowFNum(3, 6, humi, 3, 1);
            OLED_ShowChar(3, 12, '%');
            
            // 定时上报（每10秒，通过Delay_ms计数）
            if(report_count == 0 || (report_count % 10 == 0))
            {
                if(mqtt_connected)
                {
                    ESP8266_ReportData(temp, humi);
                    report_count++;
                    OLED_ShowNum(4, 10, report_count, 3);
                }
            }
            else
            {
                report_count++;
            }
        }
        else
        {
            OLED_ShowString(2, 6, "DHT11 ERROR");
        }
        
        Delay_ms(1000);  // 1秒采集一次
    }
}