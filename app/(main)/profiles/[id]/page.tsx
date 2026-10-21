import { ProfileDetail } from "@/components/modules/ProfileDetail";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileDetail clientId={id} />;
}
