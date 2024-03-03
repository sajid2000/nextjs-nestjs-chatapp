import ThemeToggle from "@/components/ThemeToggle";

const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main className="grid min-h-screen items-center justify-center bg-muted p-4">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      {children}
    </main>
  );
};

export default AuthLayout;
