import { zodResolver } from "@hookform/resolvers/zod";
import { Check, UserPlus2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ApplicationError, ValidationError } from "@/lib/errors";
import { useContactList } from "@/services/contactService";
import { CreateGroupDto, createGroupSchema, useCreateGroup } from "@/services/groupService";

import LoadingButton from "../LoadingButton";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ImageUpload from "../upload/ImageUpload";

const CreateGroup: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { data: users } = useContactList();
  const { mutateAsync: createGroup } = useCreateGroup();

  const form = useForm<CreateGroupDto>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      image: "",
      members: [],
    },
  });

  const handleSubmit = async (data: CreateGroupDto) => {
    try {
      const res = await createGroup(data);

      if (res.data) {
        console.log(res.data.conversationId);
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

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"secondary"} size={"icon"} className="size-9 rounded-full">
          <UserPlus2Icon size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="outline-none">
        <DialogHeader className="">
          <DialogTitle>Create a group conversation</DialogTitle>
          <DialogDescription>Invite users to this thread. This will create a new group message.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Image</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <div className="w-52">
                        <ImageUpload endpoint="groupImage" onUpload={field.onChange} value={field.value} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter group name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Members</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} role="combobox" className="justify-start">
                          {field.value && field.value.length > 0 ? `Selected (${field.value.length})` : "Select"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0">
                      <Command className="overflow-hidden">
                        <CommandInput placeholder="Search contact..." />
                        <CommandList>
                          <CommandEmpty>No contact found.</CommandEmpty>
                          <CommandGroup className="p-2">
                            {users?.map((user) => (
                              <CommandItem
                                key={user.phone}
                                className="flex items-center px-2"
                                onSelect={() => {
                                  if (field.value.includes(user.id)) {
                                    field.onChange(field.value.filter((v) => v !== user.id));
                                  } else {
                                    field.onChange([...field.value, user.id]);
                                  }
                                }}
                              >
                                <Avatar>
                                  <AvatarImage src={user.avatar ?? ""} alt="Image" />
                                  <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-2">
                                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                                </div>
                                {field.value.includes(user.id) ? <Check className="ml-auto flex size-5 text-primary" /> : null}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="">
              <LoadingButton loading={form.formState.isSubmitting} disabled={form.getValues("members").length < 1}>
                Start
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
