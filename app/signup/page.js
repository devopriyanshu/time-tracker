// app/signup/page.js
import { Suspense } from "react";
import SignupContent from "./SignUpContent";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
