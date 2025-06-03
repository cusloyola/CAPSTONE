import PageMeta from "../../components/common/PageMeta.jsx";
import AuthLayout from "./AuthPageLayout.jsx";
import SignInForm from "../../components/auth/SignInForm.jsx";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="CloudConstruct | Sign In"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
