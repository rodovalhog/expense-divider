
import { handleSignIn } from "@/app/auth-actions"

export function SignIn() {
    return (
        <form
            action={handleSignIn}
        >
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Sign in with Google
            </button>
        </form>
    )
}
