export default function EditorLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <div className="h-12 border-b border-line" />
      <div className="flex flex-1">
        <div className="hidden w-[272px] border-r border-line lg:block" />
        <div className="flex flex-1 items-center justify-center font-mono text-xs tracking-[0.3em] text-ghost">
          BOOTING EDITOR…
        </div>
      </div>
    </div>
  );
}
