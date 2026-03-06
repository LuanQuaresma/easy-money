import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.config";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Painel
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Olá, {session.user.name ?? session.user.email}. Em breve: resumo financeiro aqui.
        </p>
      </div>
    </main>
  );
}
