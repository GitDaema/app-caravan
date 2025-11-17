import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'mysql://caravan:caravan@localhost:3306/caravanshare',
  sessionSecret: process.env.SESSION_SECRET ?? 'change-me-session-secret',
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'caravanshare.sid',
  sessionStore: process.env.SESSION_STORE ?? 'mysql',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173',

  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',

  naverClientId: process.env.NAVER_CLIENT_ID ?? '',
  naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? '',
  naverCallbackUrl: process.env.NAVER_CALLBACK_URL ?? 'http://localhost:3000/auth/naver/callback',

  kakaoClientId: process.env.KAKAO_CLIENT_ID ?? '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? '',
  kakaoCallbackUrl: process.env.KAKAO_CALLBACK_URL ?? 'http://localhost:3000/auth/kakao/callback',
};
