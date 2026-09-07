import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA] px-4">
      <SignIn
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "shadow-xl rounded-2xl border border-[#E3E8EF]",
            headerTitle: "text-[#131A23]",
            headerSubtitle: "text-[#6B7686]",
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
  );
}
