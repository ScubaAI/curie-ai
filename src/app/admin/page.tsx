import { redirect } from "next/navigation";

export default function AdminPage() {
  // Por ahora solo tenemos a Abraham, redirigir a su dashboard
  redirect("/admin/dashboard");
}
