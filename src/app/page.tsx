import { DimensionShiftingToken } from "@/components/DimensionShiftingToken";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex w-full max-w-md flex-col items-center gap-4">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Dimension Shifting Token
        </h1>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Tap the token to restore your dimension. You’ll be redirected based on the result.
        </p>
        <DimensionShiftingToken />
      </main>
    </div>
  );
}
