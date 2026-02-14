"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
        </button>
    );
}
