import { useState } from "react";
import "../App.css";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const handleLogin = () => {
    // TODO: ganti dengan API login jika ada
    onLogin(); // set state isLoggedIn true → redirect otomatis
  };
  
  return (
    <div
      className="text-gray-900"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-black bg-opacity-50">
        {/* Header */}
        <header className="sticky top-0 z-20 w-full bg-white bg-opacity-80">
          <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <a className="flex items-center" href="#">
              <div className="h-8 w-8 text-blue-600">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="ml-3 text-xl font-bold tracking-tight">EduConnect</h2>
            </a>
            <nav className="hidden md:flex items-center ml-8">
              <a
                className="text-sm font-medium text-gray-600 hover:text-gray-900 mr-8"
                href="#"
              >
                Browse
              </a>
              <a
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                href="#"
              >
                Teach
              </a>
            </nav>
            <div className="flex items-center ml-3">
              <a
                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                href="#"
              >
                Log in
              </a>
              <a
                className="ml-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                href="#"
              >
                Sign up
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center py-12 sm:py-16 md:py-24">
          <div className="w-full max-w-md space-y-8 rounded-xl bg-white bg-opacity-90 p-8 shadow-lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Login to Your Account
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your credentials to access your courses.
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="youremail@example.com"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow focus:border-blue-600 focus:outline-none focus:ring focus:ring-blue-600 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <a
                      className="font-medium text-blue-600 hover:text-blue-800"
                      href="#"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>
                <div className="mt-1">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow focus:border-blue-600 focus:outline-none focus:ring focus:ring-blue-600 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Log in
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white bg-opacity-90 px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Facebook</span>
              </button>
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
                <span>Google</span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a
                className="font-medium text-blue-600 hover:text-blue-800"
                href="#"
              >
                Sign up
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
