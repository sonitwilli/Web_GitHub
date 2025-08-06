const generateId = () => {
  let id = ''
  const possible = 'ABCDEF0123456789'

  for (let i = 0; i < 16; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return id
}

export default generateId
