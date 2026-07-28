import { JoinPracticeClient } from "@/features/live-session/join-practice-client";

type Props = { params: Promise<{ token: string }> };

export default async function JoinPracticePage({ params }: Props) {
  const { token } = await params;
  return (
    <section className="space-y-4">
      <JoinPracticeClient inviteToken={token} />
    </section>
  );
}
