import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const stringConnection = {
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

export const poolConect = async () => {
    try {
        const pool = await sql.connect(stringConnection);
        console.log("Conectados a la base de datos");
        return pool;
    } catch (error) {
        console.log("Error al conectarse a la base de datos: " + error);
        throw error;
    }
};

export { sql };