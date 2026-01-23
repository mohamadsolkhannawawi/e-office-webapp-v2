import { redirect } from "next/navigation";

/**
 * Root page - redirects to login or dashboard based on auth status
 * TODO: Implement proper auth check
 */
export default function HomePage() {
    // TODO: Check if user is authenticated and get their role
    // For now, redirect to login
    redirect("/login");
}
