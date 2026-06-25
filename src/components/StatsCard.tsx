export default function StatsCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="bg-[#081528] border border-[#14243d] rounded-3xl p-6 shadow-lg">

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-5xl font-bold mt-4 text-white">
        {value}
      </h2>

    </div>
  );
}