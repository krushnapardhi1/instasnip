import { SignJWT, jwtVerify } from 'jose';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'y0ur-5up3r-53cr3t-jw7-t0k3n-k3y-1n-pr0duc710n';
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: { role: string }) {
  const secretKey = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
