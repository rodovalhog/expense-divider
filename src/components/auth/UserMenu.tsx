'use client';

import { useSession } from "next-auth/react"
import { SignOut } from "./SignOut"
import { SignIn } from "./SignIn"
import Image from "next/image"
import { useState } from "react"

export function UserMenu() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    if (!session?.user) {
        // If you want a login button in the header instead of redirecting
        // return <SignIn /> 
        // Or return null if you redirect globally
        return (
            <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                Login
            </a>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
            >
                {session.user.image ? (
                    <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-200"
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {session.user.name?.[0] || 'U'}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 border border-neutral-700 z-50">
                    <div className="px-4 py-2 border-b border-neutral-700">
                        <p className="text-sm font-medium text-white truncate">
                            {session.user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {session.user.email}
                        </p>
                    </div>
                    <div className="p-2">
                        <SignOut />
                    </div>
                </div>
            )}
        </div>
    )
}
