import { Link } from "react-router-dom";

export default function Header() {
    return (
      <header className="w-full">
        <div className="bg-[#7a2f0f] text-white text-sm px-6 py-2 flex justify-between items-center">
           <Link to="/login" className="cursor-pointer hover:underline">
          Login
        </Link>
          <div className="flex gap-3">
            <div className="border border-yellow-400 rounded-full px-2">f</div>
            <div className="border border-yellow-400 rounded-full px-2">x</div>
            <div className="border border-yellow-400 rounded-full px-2">ig</div>
          </div>
 
        </div>
 
        <div className="bg-yellow-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://www.mimos.com.co/wp-content/uploads/2022/07/newlogomimos.png"
              alt="Helados Mimos - Logo"
              className="w-full h-auto block m-0"/>
            <p className="text-3xl"></p>
          </div>
     
          <nav className="flex gap-6 text-sm font-medium text-[#5a2e0c]">
            <a className="text-red-600">Inicio</a>
            <a>Menú</a>
            <a>Convenios</a>
            <a>Encuéntranos</a>
            <a>Trabaja con nosotros</a>
            <a>Contacto</a>
          </nav>
 
     
          <div className="text-[#5a2e0c] text-lg">
            🔍
          </div>
 
        </div>
      </header>
    );
  }