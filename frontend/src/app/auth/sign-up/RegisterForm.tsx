"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import LoadingButton from "@/components/LoadingButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/upload/ImageUpload";
import axios from "@/lib/axios";
import { ApplicationError, ValidationError } from "@/lib/errors";

import { RegisterPayload, RegisterSchema } from "../_validators/auth";

const RegisterForm = () => {
  const form = useForm<RegisterPayload>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      avatar: "",
      fullName: "Jhon Doe",
      phone: 123123123,
      password: "123456",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: RegisterPayload) => {
    try {
      const res = await axios.post("auth/signup", data);

      if (res.data.id) {
        toast.info("Registration successfull", { duration: 8000 });
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
          disabled={isSubmitting}
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile photo</FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  <div className="w-52">
                    <ImageUpload endpoint="avatar" onUpload={field.onChange} value={field.value} />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} placeholder="example@mail.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <LoadingButton type="submit" loading={isSubmitting} className="w-full">
          Register
        </LoadingButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
