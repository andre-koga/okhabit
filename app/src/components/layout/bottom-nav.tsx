import { Link, useLocation } from "react-router-dom";
import { ListTodo, Folder, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: ListTodo, label: "Today" },
  { href: "/activities", icon: Folder, label: "Activities" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex h-full flex-1 flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
