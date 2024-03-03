import SidebarMenu from "@/components/nav/SidebarMenu";
import ChatProvider from "@/contexts/ChatProvider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid h-screen max-w-[2000px] grid-cols-[max-content,auto]">
      <ChatProvider>
        <SidebarMenu />
        <main className="h-full overflow-hidden">{children}</main>
      </ChatProvider>
    </div>
  );
}
