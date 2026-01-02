import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";

export default function GoogleLoginButton() {
  const { login } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: credentialResponse.credential,
            }),
          });

          if (!res.ok) {
            throw new Error("Google auth failed");
          }

          const data = await res.json();

          // 🔑 reuse existing auth logic
          login(data.access_token, data.username);
        } catch (err) {
          console.error(err);
          alert("Google login failed");
        }
      }}
      onError={() => {
        alert("Google Login Failed");
      }}
    />
  );
}
