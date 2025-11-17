import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// @ts-expect-error types may not exist
import { Strategy as NaverStrategy } from 'passport-naver';
// @ts-expect-error types may not exist
import { Strategy as KakaoStrategy } from 'passport-kakao';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { env } from './env';

export function configurePassport() {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  });

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }),
  );

  if (env.googleClientId && env.googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.googleClientId,
          clientSecret: env.googleClientSecret,
          callbackURL: env.googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(null, false, { message: 'No email from Google' });
            const providerUserId = profile.id;
            const user = await upsertSocialUser('GOOGLE', providerUserId, email, profile.displayName);
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        },
      ),
    );
  }

  if (env.naverClientId && env.naverClientSecret) {
    passport.use(
      new NaverStrategy(
        {
          clientID: env.naverClientId,
          clientSecret: env.naverClientSecret,
          callbackURL: env.naverCallbackUrl,
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || profile.email;
            if (!email) return done(null, false, { message: 'No email from Naver' });
            const providerUserId = profile.id;
            const name = profile.displayName || profile.nickname;
            const user = await upsertSocialUser('NAVER', providerUserId, email, name);
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        },
      ),
    );
  }

  if (env.kakaoClientId && env.kakaoClientSecret) {
    passport.use(
      new KakaoStrategy(
        {
          clientID: env.kakaoClientId,
          clientSecret: env.kakaoClientSecret,
          callbackURL: env.kakaoCallbackUrl,
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const kakaoAccount = profile._json?.kakao_account ?? {};
            const email = kakaoAccount.email;
            if (!email) return done(null, false, { message: 'No email from Kakao' });
            const providerUserId = profile.id;
            const name = kakaoAccount.profile?.nickname || profile.displayName;
            const user = await upsertSocialUser('KAKAO', providerUserId, email, name);
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        },
      ),
    );
  }
}

async function upsertSocialUser(
  provider: 'GOOGLE' | 'NAVER' | 'KAKAO',
  providerUserId: string,
  email: string,
  fullName?: string | null,
) {
  const social = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    include: { user: true },
  });

  if (social?.user) {
    return social.user;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        socialAccounts: {
          create: {
            provider,
            providerUserId,
          },
        },
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      fullName: fullName ?? '',
      role: 'guest',
      socialAccounts: {
        create: {
          provider,
          providerUserId,
        },
      },
    },
  });
}
