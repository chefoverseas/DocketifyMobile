import { useLocation } from "wouter";

export default function Footer() {
  const [location] = useLocation();
  
  // Don't show footer on admin login page
  if (location === "/admin/login") {
    return null;
  }

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Senmer Consulting OPC Pvt Ltd. All rights reserved.
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Powered by Chef Overseas • Docketify
          </div>
        </div>
      </div>
    </footer>
  );
}