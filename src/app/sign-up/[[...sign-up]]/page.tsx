import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-[22px] font-bold text-[#131A23] mb-1">
            Sign up to Pehchaan
          </h1>
          <p className="text-[14px] text-[#6B7686]">
            Create your account to get started
          </p>
        </div>
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl rounded-2xl border border-[#E3E8EF]",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-[#D9E1E8] text-[#414D5C] hover:bg-[#F6F8FA]",
              formButtonPrimary:
                "bg-[#1C6B66] hover:bg-[#17594f] text-white font-bold",
              footerActionLink: "text-[#1C6B66] hover:text-[#17594f]",
              formFieldLabel: "text-[#414D5C]",
              formFieldInput: "border-[#D9E1E8] focus:border-[#1C6B66] focus:ring-[#1C6B66]",
            },
          }}
        />
      </div>
    </div>
  );
}
