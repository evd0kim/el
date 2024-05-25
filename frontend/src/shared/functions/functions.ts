export const substrBalance = (balance: string) => {
  const dotIndex = balance.indexOf('.')

  if (dotIndex !== -1 && dotIndex + 5 < balance.length) {
    return balance.substring(0, dotIndex + 6)
  } else {
    return balance
  }
}

export const formatBalance = (rawBalance: string, substr: number) => {
  const balance = substrBalance((parseInt(rawBalance) / 1000000000000000000).toString())
  // const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(toFixed)

  return balance
}
