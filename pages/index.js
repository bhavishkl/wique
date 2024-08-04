import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-800">Welcome to Wique</h1>
        <p className="text-xl mb-8 text-gray-600">The Ultimate Queue Management Marketplace</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Effortless Queue Management</h2>
            <p className="text-gray-600">Streamline your waiting lines and enhance customer satisfaction.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Real-time Updates</h2>
            <p className="text-gray-600">Keep your customers informed with live queue status and notifications.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Analytics & Insights</h2>
            <p className="text-gray-600">Make data-driven decisions to optimize your queue management strategy.</p>
          </div>
        </div>
        
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto mb-4"
        >
          Sign in with Google
        </button>
        
        <button
          onClick={() => signIn()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
        >
          Sign in with Email
        </button>
        
        <p className="mt-6 text-sm text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </main>
  );
}