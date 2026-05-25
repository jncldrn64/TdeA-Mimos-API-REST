import bcrypt from 'bcrypt';

const contraseña = "Mimos123";
const hash = await bcrypt.hash(contraseña, 10);
console.log(hash);

// Se debe ejcutar "node src/generarHash.js" dentro de la carpeta backend para generar el hash y mostrarlo

//Para actualizar la contraseña 
// "UPDATE usuario
//  SET password_hash = '$2b$10$EMvBHM0FglDsI20hnIYuV.PaHInYiQUzWklt.X03kzDyQCj/7yN7m'
//  WHERE email = 'admin@mimos.com'" 