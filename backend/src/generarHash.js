import bcrypt from 'bcrypt';

const contraseña = "Mimos123";
const hash = await bcrypt.hash(contraseña, 10);
console.log(hash);

// Se debe ejcutar "node src/generarHash.js" dentro de la carpeta backend para generar el hash y mostrarlo