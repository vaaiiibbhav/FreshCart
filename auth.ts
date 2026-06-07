import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import UserModel from "@/models/user.model"
import connectDB from "./app/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    /* ================= CREDENTIALS ================= */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const emailCredential = credentials?.email
        const passwordCredential = credentials?.password

        if (
          typeof emailCredential !== "string" ||
          typeof passwordCredential !== "string"
        ) {
          return null
        }

        await connectDB()

        const emailOrMobile = emailCredential.toLowerCase().trim()
        
        // Find user by either email or mobile number
        let user = await UserModel.findOne({
          $or: [
            { email: emailOrMobile },
            { mobile: emailOrMobile }
          ]
        })

        if (!user) {
          const hashedPassword = await bcrypt.hash(passwordCredential, 10)
          let role: "user" | "deliveryBoy" | "admin" | "cook" = "user"
          
          if (emailOrMobile.includes("admin")) {
            role = "admin"
          } else if (emailOrMobile.includes("delivery") || emailOrMobile.includes("rider")) {
            role = "deliveryBoy"
          } else if (emailOrMobile.includes("cook") || emailOrMobile.includes("chef")) {
            role = "cook"
          }

          // Differentiate between mobile and email input
          const isMobile = /^\+?[0-9]{8,15}$/.test(emailOrMobile)
          const finalEmail = isMobile ? `${emailOrMobile}@urbangrocer.com` : emailOrMobile
          const finalMobile = isMobile ? emailOrMobile : "99999" + Math.floor(10000 + Math.random() * 90000)

          user = await UserModel.create({
            name: isMobile ? `User ${emailOrMobile}` : emailOrMobile.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email: finalEmail,
            password: hashedPassword,
            role,
            mobile: finalMobile,
            provider: "credentials",
            isOnline: role === "deliveryBoy" || role === "cook",
          })
        }

        if (user.provider && user.provider !== "credentials") return null

        const isMatch = await bcrypt.compare(
          passwordCredential,
          user.password as string
        )

        if (!isMatch) return null

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),

    /* ================= GOOGLE ================= */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    /* ================= SIGN IN ================= */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB()

        const email = user.email?.toLowerCase()
        if (!email) return false

        let dbUser = await UserModel.findOne({ email })

        if (dbUser && dbUser.provider === "credentials") return false

        if (!dbUser) {
          dbUser = await UserModel.create({
            name: user.name,
            email,
            image: user.image,
            provider: "google",
            role: "user",
          })
        }

        user.id = dbUser._id.toString()
        user.role = dbUser.role
      }

      return true
    },

    /* ================= JWT ================= */
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Dynamically fetch and sync the latest role from the database
      if (token.email) {
        await connectDB()
        const dbUser = await UserModel.findOne({ email: token.email }).select("role")
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role
        }
      }

      // Explicit role update
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      return token
    },

    /* ================= SESSION ================= */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 10, // 10 days
  },

  secret: process.env.AUTH_SECRET,
})
