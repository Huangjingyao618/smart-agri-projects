#include "DHT11.h"
#include "Delay.h"
#include <stdlib.h>   // ??????? NULL ??

// ?????(????)
static void DHT11_Delay_us(uint32_t us)
{
    uint32_t i;
    for(i = 0; i < us * 10; i++)
    {
        __NOP();
    }
}

// ??GPIO?????
static void DHT11_Mode_Out(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = DHT11_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(DHT11_PORT, &GPIO_InitStructure);
}

// ??GPIO?????
static void DHT11_Mode_In(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = DHT11_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU;  // ??????,????????
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(DHT11_PORT, &GPIO_InitStructure);
}

// ???DHT11
void DHT11_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    
    RCC_APB2PeriphClockCmd(DHT11_RCC, ENABLE);
    
    GPIO_InitStructure.GPIO_Pin = DHT11_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(DHT11_PORT, &GPIO_InitStructure);
    
    DHT11_OUT_H();  // ???,????????????
}

// ??????
static uint8_t DHT11_ReadByte(void)
{
    uint8_t i, dat = 0;
    
    for(i = 0; i < 8; i++)
    {
        while(DHT11_READ() == 0);
        
        DHT11_Delay_us(30);
        
        if(DHT11_READ() == 1)
        {
            dat |= (1 << (7 - i));
            while(DHT11_READ() == 1);
        }
    }
    return dat;
}

// ??DHT11??
uint8_t DHT_ReadData(uint8_t *buffer)
{
    uint8_t i, check = 0;
    
    // ?? NULL ??,???:
    if(buffer == 0) return 1;
    
    DHT11_Mode_Out();
    DHT11_OUT_L();
    Delay_ms(18);
    
    DHT11_OUT_H();
    DHT11_Delay_us(30);
    
    DHT11_Mode_In();
    
    if(DHT11_READ() == 1) return 1;
    
    for(i = 0; i < 80; i++)
    {
        DHT11_Delay_us(1);
        if(DHT11_READ() == 1) break;
    }
    
    for(i = 0; i < 80; i++)
    {
        DHT11_Delay_us(1);
        if(DHT11_READ() == 0) break;
    }
    
    for(i = 0; i < 5; i++)
    {
        buffer[i] = DHT11_ReadByte();
    }
    
    DHT11_Mode_Out();
    DHT11_OUT_H();
    
    check = buffer[0] + buffer[1] + buffer[2] + buffer[3];
    if(check != buffer[4])
    {
        return 1;
    }
    
    return 0;
}