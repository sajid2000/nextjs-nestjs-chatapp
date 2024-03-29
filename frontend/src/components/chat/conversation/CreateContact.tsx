"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ApplicationError, ValidationError } from "@/lib/errors";
import { CreateContactDto, createContactSchema, useCreateContact } from "@/services/contactService";

import LoadingButton from "../../LoadingButton";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";

const CreateContact: React.FC = () => {
  const { mutateAsync: createContact } = useCreateContact();

  const form = useForm<CreateContactDto>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      phone: undefined,
    },
  });

  const handleSubmit = async (data: CreateContactDto) => {
    try {
      await createContact(data);

      toast.info("Contact created successfully.");
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="h-12 w-full justify-start gap-4 px-2">
          <UserPlusIcon className="size-8 rounded-full bg-primary p-1 text-primary-foreground" /> New contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact</DialogTitle>
          <DialogDescription>Create a new contact</DialogDescription>
        </DialogHeader>
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
            <LoadingButton loading={form.formState.isSubmitting} type="submit">
              Save
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContact;
