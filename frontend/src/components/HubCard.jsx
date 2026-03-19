export default function HubCard({ title, description, icon, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0056D2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col items-start">
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-xl bg-gray-950/50 border border-gray-800 flex items-center justify-center mb-5 group-hover:border-[#0056D2]/50 group-hover:shadow-[0_0_15px_rgba(0,86,210,0.3)] transition-all duration-300">
          <div className="text-[#0056D2] w-6 h-6 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Text Content */}
        <h3 className="text-lg font-semibold text-[#0056D2] mb-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
