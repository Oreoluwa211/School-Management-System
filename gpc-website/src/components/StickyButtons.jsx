import { Video, MapPin } from "lucide-react";

export default function StickyButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <a href="https://youtube.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-navy text-white text-sm font-medium shadow-card hover:bg-gold hover:text-navy hover:scale-105 transition-all duration-200">
        <Video size={16} /> Virtual Campus Tour
      </a>
      <a href="https://maps.google.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-gold text-navy text-sm font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200">
        <MapPin size={18} /> Find Our Campus
      </a>
    </div>
  );
}