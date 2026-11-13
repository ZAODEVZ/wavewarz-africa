import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Not here</h1>
      <p className="muted">That battle or page does not exist on this API.</p>
      <p><Link href="/">Back to the battles</Link></p>
    </main>
  );
}
