'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {menus} from "@/app/_constants/layouts/menu"


export default function SideMenu() {
  const pathname = usePathname();
  return (
    <aside className="p-2">
      <nav>
        <ul>
          {
            menus.map((i)=>{
              const Icon = i.icon;
               const isActive =
              i.href === "/"
                ? pathname === "/"
                : pathname.startsWith(i.href);                
              return (
              <li key={i.id} className="mb-1">
                <Link 
                href={i.href} 
                className={`p-2 rounded-md block w-22 ${isActive ? "bg-blue-100":"hover:bg-gray-100"}`}>
                <span className="w-7 h-7 flex flex-col justify-center text-gray-600 mx-auto">
                  <Icon/>
                </span>
                  <h4 className="h-7 flex flex-col justify-center text-center text-sm">{i.title}</h4>
                </Link>
              </li>    
            )
            })
          }
        </ul>
      </nav>
    </aside>
  );
}
