import React from "react";
import {
  IconDeviceGamepad,
  IconPlus,
  IconTv,
  IconSettings,
} from "@tabler/icons-react";

export default function Sidebar({ currentView, onViewChange, isLoading }) {
  const menuItems = [
    {
      id: "consoles",
      label: "Mis Consolas",
      icon: <IconDeviceGamepad size={18} className="sidebar-icon" />,
    },
    {
      id: "add_rom",
      label: "Añadir ROM",
      icon: <IconPlus size={18} className="sidebar-icon" />,
    },
    {
      id: "bigpicture",
      label: "Big Picture",
      icon: <IconTv size={18} className="sidebar-icon" />,
    },
    {
      id: "settings",
      label: "Ajustes",
      icon: <IconSettings size={18} className="sidebar-icon" />,
    },
  ];

  return (
    <aside className="app-sidebar no-drag">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => onViewChange(item.id)}
              disabled={isLoading}
              title={item.label}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-badge">CORE PRO</span>
      </div>
    </aside>
  );
}
