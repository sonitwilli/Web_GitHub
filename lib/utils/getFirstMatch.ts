const getFirstMatch = (regexp: RegExp, ua: string) => {
  const match = ua.match(regexp)
  return (match && match.length > 0 && match[1]) || ''
}

export default getFirstMatch
