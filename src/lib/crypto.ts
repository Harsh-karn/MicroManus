import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // Must be 32 bytes (256 bits)
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16 // For AES, this is always 16

if (!ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY is not set. API keys will not be stored securely.')
}

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) return text
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'base64'),
    iv
  )
  
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) return text
  
  try {
    const textParts = text.split(':')
    const ivHex = textParts.shift()
    const encryptedText = textParts.join(':')
    
    if (!ivHex || !encryptedText) return text
    
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedTextBuffer = Buffer.from(encryptedText, 'hex')
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'base64'),
      iv
    )
    
    let decrypted = decipher.update(encryptedTextBuffer)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString()
  } catch (error) {
    console.error('Failed to decrypt:', error)
    return ''
  }
}
