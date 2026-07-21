#include "stm32f10x.h"                  // Device header

/**
  * 函    数：LED初始化
  * 参    数：无
  * 返 回 值：无
  */
void LED_Init(void)
{
	/*开启时钟*/
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC | RCC_APB2Periph_GPIOA, ENABLE);	//开启GPIOC和GPIOA的时钟
	
	/*GPIO初始化 LED1: PC13 */
	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_13;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_Init(GPIOC, &GPIO_InitStructure);						//将PC13引脚初始化为推挽输出
	
	/*GPIO初始化 LED2: PA9 */
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
	GPIO_Init(GPIOA, &GPIO_InitStructure);						//将PA9引脚初始化为推挽输出
	
	/*设置GPIO初始化后的默认电平：高电平，LED熄灭*/
	GPIO_SetBits(GPIOC, GPIO_Pin_13);
	GPIO_SetBits(GPIOA, GPIO_Pin_9);
}

/**
  * 函    数：LED1开启
  * 参    数：无
  * 返 回 值：无
  */
void LED1_ON(void)
{
	GPIO_ResetBits(GPIOC, GPIO_Pin_13);		//设置PC13引脚为低电平
}

/**
  * 函    数：LED1关闭
  * 参    数：无
  * 返 回 值：无
  */
void LED1_OFF(void)
{
	GPIO_SetBits(GPIOC, GPIO_Pin_13);		//设置PC13引脚为高电平
}

/**
  * 函    数：LED1状态翻转
  * 参    数：无
  * 返 回 值：无
  */
void LED1_Turn(void)
{
	if (GPIO_ReadOutputDataBit(GPIOC, GPIO_Pin_13) == 0)
	{
		GPIO_SetBits(GPIOC, GPIO_Pin_13);
	}
	else
	{
		GPIO_ResetBits(GPIOC, GPIO_Pin_13);
	}
}

/**
  * 函    数：LED2开启
  * 参    数：无
  * 返 回 值：无
  */
void LED2_ON(void)
{
	GPIO_ResetBits(GPIOA, GPIO_Pin_9);		//设置PA9引脚为低电平
}

/**
  * 函    数：LED2关闭
  * 参    数：无
  * 返 回 值：无
  */
void LED2_OFF(void)
{
	GPIO_SetBits(GPIOA, GPIO_Pin_9);		//设置PA9引脚为高电平
}

/**
  * 函    数：LED2状态翻转
  * 参    数：无
  * 返 回 值：无
  */
void LED2_Turn(void)
{
	if (GPIO_ReadOutputDataBit(GPIOA, GPIO_Pin_9) == 0)
	{                                                  
		GPIO_SetBits(GPIOA, GPIO_Pin_9);               		
	}                                                  
	else                                               		
	{                                                  
		GPIO_ResetBits(GPIOA, GPIO_Pin_9);             		
	}
}