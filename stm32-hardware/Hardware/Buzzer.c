#include "stm32f10x.h"
#include "Buzzer.h"

#define BUZZER_PORT   GPIOB
#define BUZZER_PIN    GPIO_Pin_0
#define BUZZER_RCC    RCC_APB2Periph_GPIOB

void Buzzer_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStructure;
    RCC_APB2PeriphClockCmd(BUZZER_RCC, ENABLE);
    GPIO_InitStructure.GPIO_Pin = BUZZER_PIN;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(BUZZER_PORT, &GPIO_InitStructure);
    Buzzer_OFF();  // 默认关闭蜂鸣器
}

void Buzzer_OFF(void)
{
    GPIO_SetBits(BUZZER_PORT, BUZZER_PIN);  // PB0高电平，关闭有源蜂鸣器
}

void Buzzer_ON(void)
{
    GPIO_ResetBits(BUZZER_PORT, BUZZER_PIN);
}