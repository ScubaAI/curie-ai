// src/lib/encryption.ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';

// ============================================================================
// Configuración y Constantes
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Salt base (cámbialo al rotar generaciones completas de claves)
const BASE_SALT = process.env.ENCRYPTION_SALT || 'curie-v1-2025';

// ============================================================================
// Gestión de Claves con Versionado (rotación real)
// ============================================================================

interface KeyVersion {
  version: number;
  key: Buffer;
  createdAt: Date;
  source: 'env' | 'derived';
}

const keyCache = new Map<number, KeyVersion>();

/**
 * Obtiene o deriva la clave para una versión específica
 * Prioriza variables de entorno numeradas: TOKEN_ENCRYPTION_KEY_V1, V2, etc.
 */
function getKeyForVersion(version: number): Buffer {
  if (keyCache.has(version)) {
    return keyCache.get(version)!.key;
  }

  // 1. Intentar clave directa desde env (más seguro)
  const envKeyName = `TOKEN_ENCRYPTION_KEY_V${version}`;
  let rawKey = process.env[envKeyName];

  let source: 'env' | 'derived' = 'env';

  // 2. Fallback a clave maestra + derivación scrypt
  if (!rawKey) {
    rawKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (!rawKey) {
      throw new Error(
        `No se encontró clave para versión ${version} ni clave maestra`
      );
    }
    source = 'derived';
  }

  // Derivación con scrypt (lento y resistente a ataques de fuerza bruta)
  const salt = `${BASE_SALT}-v${version}`;
  const key = scryptSync(rawKey, salt, KEY_LENGTH);

  const entry: KeyVersion = {
    version,
    key,
    createdAt: new Date(),
    source,
  };

  keyCache.set(version, entry);

  // Opcional: loggear carga de clave (solo en desarrollo o auditoría)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Encryption] Cargada clave v${version} (${source})`);
  }

  return key;
}

// ============================================================================
// Formato de datos encriptados
// ============================================================================

export interface EncryptedData {
  version: number;
  iv: string;      // base64url
  authTag: string; // base64url
  ciphertext: string; // base64url
}

/**
 * Encripta cualquier string
 * @returns string en formato: version:iv:authTag:ciphertext (todo base64url)
 */
export function encrypt(plaintext: string, version: number = 1): string {
  if (!plaintext) throw new Error('No se puede encriptar cadena vacía');

  const key = getKeyForVersion(version);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64url');
  ciphertext += cipher.final('base64url');

  const authTag = cipher.getAuthTag().toString('base64url');

  return `${version}:${iv.toString('base64url')}:${authTag}:${ciphertext}`;
}

/**
 * Desencripta string en formato version:iv:authTag:ciphertext
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) throw new Error('No se puede desencriptar cadena vacía');

  const parts = encrypted.split(':');
  if (parts.length !== 4) {
    throw new Error('Formato encriptado inválido: se esperan 4 partes');
  }

  const [versionStr, ivB64, authTagB64, ciphertext] = parts;
  const version = parseInt(versionStr, 10);

  if (isNaN(version) || version < 1) {
    throw new Error('Versión de clave inválida');
  }

  const key = getKeyForVersion(version);

  let iv: Buffer;
  let authTag: Buffer;

  try {
    iv = Buffer.from(ivB64, 'base64url');
    authTag = Buffer.from(authTagB64, 'base64url');
  } catch {
    throw new Error('IV o authTag en formato base64url inválido');
  }

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Longitud de IV o authTag incorrecta');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    let plaintext = decipher.update(ciphertext, 'base64url', 'utf8');
    plaintext += decipher.final('utf8');

    // Aquí iría el logging de acceso (placeholder)
    // logDecryptionAccess(version, encrypted.length, success: true);

    return plaintext;
  } catch (err) {
    // logDecryptionAccess(version, encrypted.length, success: false, err);
    throw new Error('Fallo en desencriptación: datos posiblemente manipulados o clave incorrecta');
  }
}

// ============================================================================
// Funciones específicas para tokens OAuth
// ============================================================================

export function encryptAccessToken(token: string, version?: number): string {
  return encrypt(token, version);
}

export function decryptAccessToken(encrypted: string): string {
  return decrypt(encrypted);
}

export function encryptRefreshToken(token: string, version?: number): string {
  return encrypt(token, version);
}

export function decryptRefreshToken(encrypted: string): string {
  return decrypt(encrypted);
}

// ============================================================================
// Generación segura de tokens y states
// ============================================================================

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

export function generateSecureState(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

export function generateSecureCode(length: number = 6): string {
  const digits = '0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map(b => digits[b % 10])
    .join('');
}

// ============================================================================
// Comparación segura (timing-safe)
// ============================================================================

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    timingSafeEqual(Buffer.from(a), Buffer.from(a)); // dummy para ocultar timing
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// ============================================================================
// Validación y diagnóstico
// ============================================================================

export function isEncryptionConfigured(): boolean {
  return (
    !!process.env.TOKEN_ENCRYPTION_KEY ||
    !!process.env.TOKEN_ENCRYPTION_KEY_V1
  );
}

export function getActiveKeyVersion(): number {
  // Lógica simple: la más alta disponible en env
  let highest = 1;
  for (let i = 1; i <= 10; i++) { // límite razonable
    if (process.env[`TOKEN_ENCRYPTION_KEY_V${i}`]) {
      highest = i;
    }
  }
  return highest;
}

// ============================================================================
// Rotación (para migraciones)
// ============================================================================

export function rotateString(oldEncrypted: string, newVersion: number): string {
  const plaintext = decrypt(oldEncrypted);
  return encrypt(plaintext, newVersion);
}

// Ejemplo de uso en batch (para jobs de migración)
export async function batchRotateTokens<T extends { id: string; encryptedToken: string }>(
  items: T[],
  newVersion: number,
  updateFn: (id: string, newEncrypted: string) => Promise<void>
) {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const item of items) {
    try {
      const newValue = rotateString(item.encryptedToken, newVersion);
      await updateFn(item.id, newValue);
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`Item ${item.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return results;
}