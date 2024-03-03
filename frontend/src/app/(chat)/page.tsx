import ChatLayout from "@/components/chat/ChatLayout";

interface Props {
  searchParams: Record<string, string>;
}

export default function HomePage({ searchParams }: Props) {
  return (
    <div className="h-full md:flex">
      <ChatLayout conversationId={searchParams.conversation} />
    </div>
  );
}
