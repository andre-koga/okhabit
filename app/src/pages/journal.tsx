import JournalList from "@/components/journal/journal-list";

export default function JournalPage() {
  return (
    <div className="p-4 pb-32">
      <h1 className="text-3xl font-bold mb-1">Journal</h1>
      <p className="text-muted-foreground mb-6">Your daily reflections</p>
      <JournalList />
    </div>
  );
}
