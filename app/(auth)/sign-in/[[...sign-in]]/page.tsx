import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Let's get you back to being productive
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-purple-600 hover:bg-purple-700 text-sm normal-case",
              card: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border border-gray-100 dark:border-gray-700",
              headerTitle: "text-2xl",
              headerSubtitle: "text-gray-600 dark:text-gray-300",
              socialButtonsBlockButton: "border-gray-300 dark:border-gray-600",
              formFieldInput: "border-gray-300 dark:border-gray-600",
              footer: "hidden"
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 