import React, { useEffect, useState } from 'react'

import Typography from '~/shared/typography/typography'

import s from './timer.module.scss'

export const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(180) // начальное время в секундах (3 минуты)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(prevTime => prevTime - 1)
      }
    }, 1000)

    // Остановить таймер, когда время вышло
    return () => clearTimeout(timer)
  }, [timeLeft])

  // Функция для форматирования времени в формат "мм:сс"
  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div className={s.TimerRoot}>
      <Typography.Body6 className={s.TimerGray}>Status:</Typography.Body6>
      <Typography.Body6>{`ETA ${formatTime(timeLeft)} m to finalize`}</Typography.Body6>
    </div>
  )
}
