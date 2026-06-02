"use client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-600">Demo rejimda ro'yxatdan o'tish mavjud emas.</p>
      <button onClick={() => router.push("/login")} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
        Login sahifasiga qaytish
      </button>
    </div>
  );
}
