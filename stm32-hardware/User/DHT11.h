#ifndef __DHT11_H
#define __DHT11_H

#include "stm32f10x.h"

// ??????????????
#define DHT11_PORT       GPIOB
#define DHT11_PIN        GPIO_Pin_12
#define DHT11_RCC        RCC_APB2Periph_GPIOB

// ???????
#define DHT11_OUT_H()    GPIO_SetBits(DHT11_PORT, DHT11_PIN)
#define DHT11_OUT_L()    GPIO_ResetBits(DHT11_PORT, DHT11_PIN)

// ??????
#define DHT11_READ()     GPIO_ReadInputDataBit(DHT11_PORT, DHT11_PIN)

// ????
void DHT11_Init(void);
uint8_t DHT_ReadData(uint8_t *buffer);

#endif

