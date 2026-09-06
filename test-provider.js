const { default: GoogleProvider } = require("next-auth/providers/google");
const provider = GoogleProvider({
  clientId: "123",
  clientSecret: "123",
  allowDangerousEmailAccountLinking: true
});
console.log(provider.options.allowDangerousEmailAccountLinking);
const { default: parseProviders } = require("next-auth/core/lib/providers");
const parsed = parseProviders({ providers: [provider], url: "http://localhost" });
console.log(parsed.providers[0].allowDangerousEmailAccountLinking);