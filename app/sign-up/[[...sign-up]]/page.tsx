import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-purple-600 hover:bg-purple-700 text-sm normal-case",
              card: "bg-white dark:bg-gray-800 shadow-xl",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 