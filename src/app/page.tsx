import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">

      {/* Hero */}
      <section className="flex flex-col flex-1 items-center justify-center text-center px-6 py-20">
        <div className="flex flex-col items-center gap-6 max-w-xl">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="text-[#f26522]">Crew</span>
            <span className="text-[#1a1614]">base</span>
          </h1>
          <p className="text-[#7a7470] text-xl leading-relaxed">
            Your crew. Your jobs. All in one place.
          </p>
          <p className="text-[#7a7470] text-base leading-relaxed max-w-sm">
            Built for small crews and subcontractors — track jobs, manage your
            team, and share project previews with clients.
          </p>

          {/* Big CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-sm">
            <Link
              href="/jobs"
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold text-lg hover:bg-[#d4541a] transition-colors"
            >
              View Jobs
            </Link>
            <Link
              href="/admin"
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-[#d3cec7] text-[#1a1614] font-bold text-lg hover:border-[#f26522] hover:text-[#f26522] transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>

      {/* What Crewbase does */}
      <section className="border-t border-[#d3cec7] bg-[#ede9e4]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "📋",
              title: "Track Jobs",
              desc: "See every active job, who's on it, and what's left to do.",
            },
            {
              icon: "👷",
              title: "Manage Crews",
              desc: "Know which subs are where and keep everyone on the same page.",
            },
            {
              icon: "📎",
              title: "Share with Clients",
              desc: "Send a link so clients can view 3D renderings and project details.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 p-6 bg-[#e4dfd9] rounded-xl border border-[#d3cec7]"
            >
              <span className="text-3xl">{item.icon}</span>
              <p className="text-[#1a1614] font-semibold text-lg">{item.title}</p>
              <p className="text-[#7a7470] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
