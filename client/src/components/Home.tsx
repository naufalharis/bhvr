import React from "react";

export default function Home() {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 bg-white px-10 py-4 shadow-sm">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-gray-800">
              <div className="text-[var(--primary-color)]">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-gray-900 text-xl font-bold leading-tight tracking-tight">
                EduHub
              </h1>
            </div>
            <nav className="flex items-center gap-8">
              <a
                className="text-gray-600 hover:text-[var(--primary-color)] text-base font-medium leading-normal transition-colors"
                href="#"
              >
                Beranda
              </a>
              <a
                className="text-[var(--primary-color)] text-base font-semibold leading-normal"
                href="#"
              >
                Kursus
              </a>
              <a
                className="text-gray-600 hover:text-[var(--primary-color)] text-base font-medium leading-normal transition-colors"
                href="#"
              >
                Jadwal
              </a>
              <a
                className="text-gray-600 hover:text-[var(--primary-color)] text-base font-medium leading-normal transition-colors"
                href="#"
              >
                Forum
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <label className="relative flex-col min-w-40 !h-10 max-w-64 hidden md:flex">
              <div className="flex w-full flex-1 items-stretch rounded-md h-full">
                <div className="text-gray-400 flex border-none bg-gray-100 items-center justify-center pl-3 rounded-l-md border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-gray-800 focus:outline-0 focus:ring-2 focus:ring-[var(--primary-color)] border-none bg-gray-100 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Cari kursus..."
                  value=""
                  readOnly
                />
              </div>
            </label>
            <button className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuALazITeWhiyVvCjRqnAZLRVEwgY26TGtJJSQS0WxOqjOHcabYddqh6J2iixItYkqmLka6f5Vdt89TXfsYHQYSOQE69sMT_Y_yOMaQjw8TTU2_n3Zv1BNG-Eldm-ouR2I6XdQcZDKiNR0CKNlxTV1_LjfVBLsO1yKxE4R4oLC_wmrZWhhK-tF7R2z8BWtpuVcXddXMjVLlL2N_XOcrrtO11Wosyn9i17XDUgj9nqewB4UWuvWwIRLK9BPeGszhhvEFLJrqXwyYDK2aN")',
              }}
            ></div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-10 md:px-20 lg:px-40 py-8">
          <div className="layout-content-container flex flex-col max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-gray-900 text-4xl font-bold leading-tight tracking-tighter">
                Dasbor Saya
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Selamat datang kembali! Mari lanjutkan progres belajar Anda.
              </p>
            </header>

            {/* Kursus */}
            <section className="mb-12">
              <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight mb-6">
                Kursus yang Sedang Berlangsung
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Pengantar Pemrograman Python",
                    start: "15 Mei 2024",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDP65hrNhoa2bpUeUu477xMt_jvR9VlO-b2yTswQZKo3Z5BP8icSpGj4sSdLXbaE1vzBg0lPlgoHEQqF9Uq9hnEfXaT3c72epbmTVLp45r1cj-ZDVJ3zKCrLKnXgsvKp8nI7uY-KSX5tTnbTMWKss5GFEa8VIT3ygz9jug-cixcjOyUPwbNbAP328jqss-_nGyNFj9B7xXFHu_1HzDRtmuVh5NcfpkAtXL95bXPjTFrgJs0utYdD7TvzRBUX4coGv2qlP3eqYQ5EkSQ",
                  },
                  {
                    title: "Desain Grafis untuk Pemula",
                    start: "20 Mei 2024",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsK13v7ow0O7ANSb6UsE3koFl-KeS_qlFHe_hc1qY7gznJeWT0TQueSrzfjwJzHkrUPpq4zcpZI1pfLREpWFcPOL_9Rn6jHmUe8TcueoyeCrjhuai0hfJo7Z_o7LBF19kMBmKC55o3DTTHoFLxS1UlmU6HuNC2OVlTh9g7gfCWXVLGmZRVQvLrjQFl2MREHkyca6lIboSEkM5vvnpOlZtAkG-6aDIB8JnMaGEh6KZnUO18LRcVRMLypTNtoukOMO8Tu-gz6q8ZoNU5",
                  },
                  {
                    title: "Pemasaran Digital",
                    start: "25 Mei 2024",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuJfmEhuJKq0xK2umqehDfYnop4TNSGaKQERj1220k1GFLGnwk-ZoO1GKRLeADMWOZUGgJI2u_zmgn72Npw-6rIFR1Uf1s7N4HHzgTGkgyrmPdmF9_W-4bY43l7SqT1Lx5XduHAXQzQ3BmkKAg1Yhs9Qn9thJofpgjhpdcpLYChVeKqULZkzO9g3RY_V8-TQ3_WiIazSm4I4izdlk2o7z1v2GphJb3JNaVa4ZMxyYH1y_YAQw_WdwZPjmFWkORG8w1ak0raZCLMYOy",
                  },
                ].map((course, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 rounded-lg bg-white shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                      style={{ backgroundImage: `url("${course.image}")` }}
                    ></div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-gray-800 text-lg font-semibold leading-normal flex-1">
                        {course.title}
                      </h3>
                      <p className="text-gray-500 text-sm font-normal leading-normal mt-1">
                        Mulai {course.start}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progres Belajar & Pemberitahuan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Progres Belajar */}
              <section className="lg:col-span-2">
                <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight mb-6">
                  Progres Belajar
                </h2>
                <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md">
                  {[
                    { title: "Pengantar Pemrograman Python", progress: 75 },
                    { title: "Desain Grafis untuk Pemula", progress: 50 },
                    { title: "Pemasaran Digital", progress: 25 },
                  ].map((course, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <div className="flex gap-4 justify-between items-center">
                        <p className="text-gray-800 text-base font-medium leading-normal">
                          {course.title}
                        </p>
                        <p className="text-[var(--primary-color)] text-base font-semibold leading-normal">
                          {course.progress}%
                        </p>
                      </div>
                      <div className="rounded-full bg-gray-200 h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-[var(--primary-color)]"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pemberitahuan */}
              <section>
                <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-tight mb-6">
                  Pemberitahuan
                </h2>
                <div className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-md">
                  {[
                    {
                      icon: "task_alt",
                      color: "text-blue-500",
                      title: "Tugas 1 Python telah dinilai",
                      date: "20 Mei 2024",
                    },
                    {
                      icon: "event_upcoming",
                      color: "text-green-500",
                      title: "Kelas Desain Grafis dimulai besok",
                      date: "18 Mei 2024",
                    },
                    {
                      icon: "campaign",
                      color: "text-yellow-500",
                      title: "Selamat datang di Pemasaran Digital!",
                      date: "15 Mei 2024",
                    },
                  ].map((notif, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-md hover:bg-gray-50 ${
                        idx > 0 ? "border-t border-gray-100" : ""
                      }`}
                    >
                      <div className={`flex-shrink-0 ${notif.color} mt-1`}>
                        <span className="material-symbols-outlined">
                          {notif.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-800 text-base font-medium leading-normal">
                          {notif.title}
                        </p>
                        <p className="text-gray-500 text-sm font-normal leading-normal">
                          {notif.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
