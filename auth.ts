import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [KeycloakProvider({})],
  callbacks: {
    authorized: async ({ auth, request }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
      //   if (!auth) {
      //     console.log(request.nextUrl.origin);
      //     return Response.redirect(
      //       new URL("/api/auth/signin/keycloak", request.nextUrl.origin)
      //     );
      //   }
    },
  },
});
