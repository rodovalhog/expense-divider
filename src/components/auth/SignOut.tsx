
import { handleSignOut } from "@/app/auth-actions"

export function SignOut() {
    return (
        <form
            action={handleSignOut}
        >
            <button type="submit" className="text-sm text-gray-600 hover:text-red-500">
                Sign Out
            </button>
        </form>
    )
}
