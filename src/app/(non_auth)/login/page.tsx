"use client";
import { useForm } from '@felte/react';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { toast, Toaster } from "react-hot-toast";
import "./Login.page.scss";

export default function LoginPage() {

  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [ formErrors, setFormErrors ] = useState<any>({});

  const { signIn } = useAuth();

  const router = useRouter();

  const getErrorMessages = (fieldName: string): JSX.Element[] => {
    return (formErrors[fieldName]?._errors || []).map((errorText: string, i: number) => {
      return <p key={i} style={{ color: "red" }}>* {errorText}</p>
    })
  }

  const { form: loginForm } = useForm({
    onSubmit(values) {
      setSubmitting(true);
      setFormErrors({});
      const LoginFormZchema = z.object({
        email: z.string().email({ message: "Invalid email" }),
        password: z.string().min(6, "Password must have at least 6 characters"),
      });

      const formCheck = LoginFormZchema.safeParse(values);
      
      if (!formCheck.success) {
        setSubmitting(false);
        return setFormErrors(formCheck.error.format());
      }

      signIn(values.email, values.password)
        .then(() => {
          router.push("/entities");
        })
        .catch((err) => {
          console.log("Error signing in", err);
          toast.error("Wrong email or password")
          setSubmitting(false);
        });
    },
  });

  return (
    <>
      <Toaster />
      <main className="login-page">
        <h1 className="login-page__title">
          Remarc
        </h1>

        <form ref={loginForm}>
          <label htmlFor="email">Email</label>
          <input disabled={submitting} type="email" name="email" />
          {getErrorMessages("email")}

          <label htmlFor="password">Password</label>
          <input disabled={submitting} type="password" name="password" />
          {getErrorMessages("password")}
      
          <button disabled={submitting} style={{ width: "100%" }} type="submit" className="button">
            Sign in
          </button>
        </form>
      </main>
    </>
  )
}