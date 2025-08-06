const getSecondMatch = (regexp: RegExp, ua: string) => {
  const match = ua.match(regexp)
  return (match && match.length > 1 && match[2]) || ''
}

export default getSecondMatch
