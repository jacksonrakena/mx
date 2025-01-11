import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [KeycloakProvider({})],
  callbacks: {
    authorized: async ({ auth, request }) => {
      return !!auth;
    },
  },
});
