import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import RouterUsuario from './routes/UsuarioRoutes.js'
import RouterProducto from './routes/ProductoRoutes.js'
import RouterVenta from './routes/VentaRoutes.js';
import RouterWompi from './routes/WompiRoutes.js'; // <-- Nombre corregido
import incidenteRoutes from './routes/IncidenteRoutes.js';

dotenv.config()
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/api', RouterProducto)
app.use('/api', RouterUsuario)
app.use('/api/ventas', RouterVenta);
app.use('/api/wompi', RouterWompi); // <-- Asegúrate de que tenga el /wompi
app.use('/api', incidenteRoutes);


app.listen(port, ()=>{
    console.log(`Conectado al servido mediante puerto No. ${port}`)
})
