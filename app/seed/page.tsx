import { redirect } from "next/navigation";
import { GET as seedDatabase } from "../api/seed/route";

export default async function SeedPage() {
  await seedDatabase();
  redirect("/login");
}
