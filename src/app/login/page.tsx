import { SignIn } from "@/components/auth/SignIn"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Expense Divider</h1>
                <p className="mb-8 text-gray-600">Please sign in to continue</p>
                <SignIn />
            </div>
        </div>
    )
}
