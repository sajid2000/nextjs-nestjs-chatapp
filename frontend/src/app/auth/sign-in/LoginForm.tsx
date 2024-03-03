"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import LoadingButton from "@/components/LoadingButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "@/lib/axios";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/constants";
import { ApplicationError, ValidationError } from "@/lib/errors";

import { LoginPayload, LoginSchema } from "../_validators/auth";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const form = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      phone: 123123123,
      password: "123456",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: LoginPayload) => {
    try {
      const res = await axios.post("auth/signin", data);

      console.log(res);

      if (res?.data?.id) {
        router.replace(searchParams.get("callback-url") || DEFAULT_LOGIN_REDIRECT);
        router.refresh();
      }

      if (res?.data?.message) {
        toast.info(res.data.message, { duration: 8000 });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        error.fields.forEach((i) => {
          form.setError(i.field, { message: i.error });
        });

        return;
      }

      if (error instanceof ApplicationError) {
        toast.error(error.message);
        return;
      }

      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  type="number"
                  placeholder="Enter phone number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} placeholder="******" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {message && <FormSuccess message={message} />}
        {error && <FormError message={error} />}
        <LoadingButton type="submit" loading={isSubmitting} className="w-full">
          Login
        </LoadingButton>
      </form>
    </Form>
  );
};

export default LoginForm;
