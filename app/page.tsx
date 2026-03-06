import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Easy Money
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Suas finanças sob controle
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-slate-800 dark:bg-slate-600 px-4 py-2 text-white font-medium hover:bg-slate-700"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cadastrar
          </Link>
        </div>
      </div>
    </main>
  );
}
