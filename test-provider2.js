const { merge } = require("next-auth/utils/merge");
function normalizeOAuthOptions(oauthOptions, isUserOptions = false) {
  if (!oauthOptions) return;
  const normalized = Object.entries(oauthOptions).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
  return normalized;
}

const { default: GoogleProvider } = require("next-auth/providers/google");
const provider = GoogleProvider({
  clientId: "123",
  clientSecret: "123",
  allowDangerousEmailAccountLinking: true
});

const { options: userOptions, ...rest } = provider;
const normalizedOptions = normalizeOAuthOptions(rest);
const normalizedUserOptions = normalizeOAuthOptions(userOptions, true);

const merged = merge(normalizedOptions, {
  ...normalizedUserOptions,
  signinUrl: `http/signin`,
  callbackUrl: `http/callback`
});

console.log(merged.allowDangerousEmailAccountLinking);