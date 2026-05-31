SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

USE [master];
GO

-- Si la base de datos clonada ya existía a medio crear, la tumba para crearla limpia
IF (DB_ID(N'cloneMimos') IS NOT NULL) 
BEGIN
    ALTER DATABASE [cloneMimos] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [cloneMimos];
END
GO

PRINT N'Creating database cloneMimos...';
GO
-- Se crea con la intercalación por defecto insensible a mayúsculas (CI)
CREATE DATABASE [cloneMimos] COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

USE [cloneMimos];
GO

PRINT N'Creating Table [dbo].[Auditoria_Usuarios]...';
GO
CREATE TABLE [dbo].[Auditoria_Usuarios] (
    [id_auditoria]    BIGINT        IDENTITY (1, 1) NOT NULL,
    [id_usuario]      BIGINT        NOT NULL,
    [accion]          VARCHAR (50)  NOT NULL,
    [email_afectado]  VARCHAR (150) NULL,
    [estado_anterior] VARCHAR (50)  NULL,
    [estado_nuevo]    VARCHAR (50)  NULL,
    [rol_anterior]    INT           NULL,
    [rol_nuevo]       INT           NULL,
    [fecha_cambio]    DATETIME      NULL,
    PRIMARY KEY CLUSTERED ([id_auditoria] ASC)
);
GO

PRINT N'Creating Table [dbo].[Categorias]...';
GO
CREATE TABLE [dbo].[Categorias] (
    [id_categoria] BIGINT        IDENTITY (1, 1) NOT NULL,
    [nombre]       VARCHAR (100) NOT NULL,
    [descripcion]  VARCHAR (255) NULL,
    PRIMARY KEY CLUSTERED ([id_categoria] ASC)
);
GO

PRINT N'Creating Table [dbo].[Clientes]...';
GO
CREATE TABLE [dbo].[Clientes] (
    [id]            BIGINT        IDENTITY (1, 1) NOT NULL,
    [nombre]        VARCHAR (200) NOT NULL,
    [email]         VARCHAR (200) NOT NULL,
    [password_hash] VARCHAR (255) NOT NULL,
    [rol]           VARCHAR (50)  NOT NULL,
    [created_at]    DATETIME      NOT NULL,
    PRIMARY KEY CLUSTERED ([id] ASC),
    UNIQUE NONCLUSTERED ([email] ASC)
);
GO

PRINT N'Creating Table [dbo].[DetalleVenta]...';
GO
CREATE TABLE [dbo].[DetalleVenta] (
    [id]              BIGINT          IDENTITY (1, 1) NOT NULL,
    [venta_id]        BIGINT          NOT NULL,
    [producto_id]     BIGINT          NOT NULL,
    [cantidad]        INT             NOT NULL,
    [precio_unitario] DECIMAL (10, 2) NOT NULL,
    [subtotal]        DECIMAL (10, 2) NOT NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

PRINT N'Creating Table [dbo].[Incidentes]...';
GO
CREATE TABLE [dbo].[Incidentes] (
    [id_incidente]    BIGINT         IDENTITY (1, 1) NOT NULL,
    [usuario_id]      BIGINT         NOT NULL,
    [venta_id]        BIGINT         NULL,
    [asunto]          VARCHAR (200)  NOT NULL,
    [mensaje]         VARCHAR (1000) NOT NULL,
    [estado]          VARCHAR (50)   NOT NULL,
    [fecha_creacion]  DATETIME       NOT NULL,
    [respuesta]       VARCHAR (1000) NULL,
    [fecha_respuesta] DATETIME       NULL,
    PRIMARY KEY CLUSTERED ([id_incidente] ASC)
);
GO

PRINT N'Creating Table [dbo].[Productos]...';
GO
CREATE TABLE [dbo].[Productos] (
    [id_producto]           BIGINT          IDENTITY (1, 1) NOT NULL,
    [nombre_producto]       VARCHAR (200)   NOT NULL,
    [descripcion_detallada] VARCHAR (1000)  NULL,
    [precio_unitario]       DECIMAL (10, 2) NOT NULL,
    [stock_disponible]      INT             NOT NULL,
    [url_imagen]            VARCHAR (500)   NULL,
    [fecha_ingreso]         DATETIME        NOT NULL,
    [fecha_ultimo_restock]  DATETIME        NULL,
    [esta_activo]           BIT             NOT NULL,
    [id_categoria]          BIGINT          NULL,
    PRIMARY KEY CLUSTERED ([id_producto] ASC)
);
GO

PRINT N'Creating Table [dbo].[Roles]...';
GO
CREATE TABLE [dbo].[Roles] (
    [id_rol]      BIGINT        IDENTITY (1, 1) NOT NULL,
    [nombre]      VARCHAR (50)  NOT NULL,
    [descripcion] VARCHAR (200) NULL,
    PRIMARY KEY CLUSTERED ([id_rol] ASC)
);
GO

PRINT N'Creating Table [dbo].[Usuarios]...';
GO
CREATE TABLE [dbo].[Usuarios] (
    [id_usuario]    BIGINT        IDENTITY (1, 1) NOT NULL,
    [id_rol]        BIGINT        NOT NULL,
    [nombre]        VARCHAR (100) NOT NULL,
    [apellido]      VARCHAR (100) NOT NULL,
    [email]         VARCHAR (200) NOT NULL,
    [estado]        VARCHAR (50)  NOT NULL,
    [password_hash] VARCHAR (255) NOT NULL,
    PRIMARY KEY CLUSTERED ([id_usuario] ASC),
    UNIQUE NONCLUSTERED ([email] ASC)
);
GO

PRINT N'Creating Table [dbo].[Ventas]...';
GO
CREATE TABLE [dbo].[Ventas] (
    [id]               BIGINT          IDENTITY (1, 1) NOT NULL,
    [usuario_id]       BIGINT          NOT NULL,
    [cliente_id]       BIGINT          NULL,
    [total]            DECIMAL (10, 2) NOT NULL,
    [fecha]            DATETIME        NOT NULL,
    [estado]           VARCHAR (50)    NOT NULL,
    [cedula_comprador] VARCHAR (50)    NULL,
    [metodo_pago]      VARCHAR (50)    NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

PRINT N'Creating Default Constraints...';
GO
ALTER TABLE [dbo].[Auditoria_Usuarios] ADD DEFAULT (getdate()) FOR [fecha_cambio];
ALTER TABLE [dbo].[Clientes] ADD DEFAULT ('cliente') FOR [rol];
ALTER TABLE [dbo].[Clientes] ADD DEFAULT (getdate()) FOR [created_at];
ALTER TABLE [dbo].[Incidentes] ADD DEFAULT (getdate()) FOR [fecha_creacion];
ALTER TABLE [dbo].[Incidentes] ADD DEFAULT ('Abierto') FOR [estado];
ALTER TABLE [dbo].[Productos] ADD DEFAULT ('/img/productos/default.png') FOR [url_imagen];
ALTER TABLE [dbo].[Productos] ADD DEFAULT (getdate()) FOR [fecha_ingreso];
ALTER TABLE [dbo].[Productos] ADD DEFAULT ((0)) FOR [stock_disponible];
ALTER TABLE [dbo].[Productos] ADD DEFAULT ((1)) FOR [esta_activo];
ALTER TABLE [dbo].[Ventas] ADD DEFAULT (getdate()) FOR [fecha];
ALTER TABLE [dbo].[Ventas] ADD DEFAULT ('activa') FOR [estado];
GO

PRINT N'Creating Foreign Keys...';
GO
ALTER TABLE [dbo].[DetalleVenta] ADD FOREIGN KEY ([venta_id]) REFERENCES [dbo].[Ventas] ([id]);
ALTER TABLE [dbo].[DetalleVenta] ADD FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([id_producto]);
ALTER TABLE [dbo].[Incidentes] ADD FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[Usuarios] ([id_usuario]);
ALTER TABLE [dbo].[Incidentes] ADD FOREIGN KEY ([venta_id]) REFERENCES [dbo].[Ventas] ([id]);
ALTER TABLE [dbo].[Productos] ADD CONSTRAINT [FK_Productos_Categorias] FOREIGN KEY ([id_categoria]) REFERENCES [dbo].[Categorias] ([id_categoria]);
ALTER TABLE [dbo].[Usuarios] ADD CONSTRAINT [FK_Usuarios_Roles] FOREIGN KEY ([id_rol]) REFERENCES [dbo].[Roles] ([id_rol]);
ALTER TABLE [dbo].[Ventas] ADD FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[Usuarios] ([id_usuario]);
ALTER TABLE [dbo].[Ventas] ADD FOREIGN KEY ([cliente_id]) REFERENCES [dbo].[Clientes] ([id]);
GO

PRINT N'Creating Trigger [dbo].[trg_Historial_Usuarios]...';
GO
CREATE TRIGGER trg_Historial_Usuarios
ON Usuarios
AFTER UPDATE
AS
BEGIN
    INSERT INTO Auditoria_Usuarios (id_usuario, accion, email_afectado, estado_anterior, estado_nuevo, rol_anterior, rol_nuevo)
    SELECT 
        i.id_usuario,
        'ACTUALIZACION',
        i.email,
        d.estado,
        i.estado,
        d.id_rol,
        i.id_rol
    FROM inserted i
    INNER JOIN deleted d ON i.id_usuario = d.id_usuario
    WHERE d.estado <> i.estado OR d.id_rol <> i.id_rol OR d.email <> i.email 
       OR d.nombre <> i.nombre OR d.apellido <> i.apellido;
END;
GO
PRINT 'Trigger trg_Historial_Usuarios activado.';
GO

PRINT N'Creating Procedure [dbo].[sp_ActivarProducto]...';
GO
CREATE PROCEDURE sp_ActivarProducto
    @id_producto BIGINT
AS
BEGIN
    UPDATE Productos SET esta_activo = 1 WHERE id_producto = @id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_ActualizarEstadoIncidente]...';
GO
CREATE PROCEDURE sp_ActualizarEstadoIncidente
    @id_incidente BIGINT,
    @nuevo_estado VARCHAR(50),
    @respuesta VARCHAR(1000) = NULL
AS
BEGIN
    UPDATE Incidentes
    SET estado = @nuevo_estado,
        respuesta = COALESCE(@respuesta, respuesta),
        fecha_respuesta = CASE WHEN @respuesta IS NOT NULL THEN GETDATE() ELSE fecha_respuesta END
    WHERE id_incidente = @id_incidente
END
GO

PRINT N'Creating Procedure [dbo].[sp_ActualizarProducto]...';
GO
CREATE PROCEDURE sp_ActualizarProducto
    @id_producto           BIGINT,
    @nombre_producto       VARCHAR(200),
    @descripcion_detallada VARCHAR(1000),
    @precio_unitario       DECIMAL(10,2),
    @url_imagen            VARCHAR(500)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Productos WHERE nombre_producto = @nombre_producto AND id_producto <> @id_producto)
    BEGIN
        RAISERROR('Ya existe otro producto con ese nombre', 16, 1)
        RETURN
    END

    UPDATE Productos
    SET nombre_producto       = @nombre_producto,
        descripcion_detallada = @descripcion_detallada,
        precio_unitario       = @precio_unitario,
        url_imagen            = COALESCE(@url_imagen, url_imagen)
    WHERE id_producto = @id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_ActualizarStock]...';
GO
CREATE PROCEDURE sp_ActualizarStock
    @id_producto BIGINT,
    @nuevo_stock INT
AS
BEGIN
    UPDATE Productos
    SET stock_disponible     = @nuevo_stock,
        fecha_ultimo_restock = GETDATE()
    WHERE id_producto = @id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_ActualizarUsuario]...';
GO
CREATE PROCEDURE sp_ActualizarUsuario
    @id       BIGINT,
    @nombre   VARCHAR(100),
    @apellido VARCHAR(100),
    @email    VARCHAR(200),
    @estado   VARCHAR(50)
AS
BEGIN
    UPDATE Usuarios
    SET nombre   = COALESCE(@nombre,   nombre),
        apellido = COALESCE(@apellido, apellido),
        email    = COALESCE(@email,    email),
        estado   = COALESCE(@estado,   estado)
    WHERE id_usuario = @id
END
GO

PRINT N'Creating Procedure [dbo].[sp_BuscarProductos]...';
GO
CREATE PROCEDURE sp_BuscarProductos
    @termino VARCHAR(200)
AS
BEGIN
    SELECT id_producto, nombre_producto, descripcion_detallada,
           precio_unitario, stock_disponible, url_imagen, esta_activo
    FROM Productos
    WHERE esta_activo = 1
      AND (nombre_producto        LIKE '%' + @termino + '%'
        OR descripcion_detallada  LIKE '%' + @termino + '%')
    ORDER BY nombre_producto ASC
END
GO

PRINT N'Creating Procedure [dbo].[sp_CrearIncidente]...';
GO
CREATE PROCEDURE sp_CrearIncidente
    @usuario_id BIGINT,
    @venta_id BIGINT = NULL,
    @asunto VARCHAR(200),
    @mensaje VARCHAR(1000)
AS
BEGIN
    INSERT INTO Incidentes (usuario_id, venta_id, asunto, mensaje)
    VALUES (@usuario_id, @venta_id, @asunto, @mensaje);
    
    SELECT SCOPE_IDENTITY() AS id_incidente;
END
GO

PRINT N'Creating Procedure [dbo].[sp_DesactivarProducto]...';
GO
CREATE PROCEDURE sp_DesactivarProducto
    @id_producto BIGINT
AS
BEGIN
    UPDATE Productos SET esta_activo = 0 WHERE id_producto = @id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_eliminarUsuario]...';
GO
CREATE PROCEDURE sp_eliminarUsuario
    @id_usuario INT
AS
BEGIN
    DELETE FROM Usuarios WHERE id_usuario = @id_usuario
END
GO

PRINT N'Creating Procedure [dbo].[sp_InsertarProducto]...';
GO
CREATE PROCEDURE sp_InsertarProducto
    @nombre_producto       VARCHAR(200),
    @descripcion_detallada VARCHAR(1000),
    @precio_unitario       DECIMAL(10,2),
    @stock_disponible      INT,
    @url_imagen            VARCHAR(500)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Productos WHERE nombre_producto = @nombre_producto)
    BEGIN
        RAISERROR('Ya existe un producto con ese nombre', 16, 1)
        RETURN
    END

    INSERT INTO Productos
        (nombre_producto, descripcion_detallada, precio_unitario,
         stock_disponible, url_imagen, fecha_ingreso, esta_activo)
    VALUES
        (@nombre_producto, @descripcion_detallada, @precio_unitario,
         @stock_disponible, COALESCE(@url_imagen, '/img/productos/default.png'), GETDATE(), 1)

    SELECT SCOPE_IDENTITY() AS id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_InsertarUsuario]...';
GO
CREATE PROCEDURE sp_InsertarUsuario
    @id_rol        BIGINT,
    @nombre        VARCHAR(100),
    @apellido      VARCHAR(100),
    @email         VARCHAR(200),
    @estado        VARCHAR(50),
    @password_hash VARCHAR(255)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE email = @email)
    BEGIN
        RAISERROR('Ya existe un usuario con ese email', 16, 1)
        RETURN
    END
    INSERT INTO Usuarios (id_rol, nombre, apellido, email, estado, password_hash)
    VALUES (@id_rol, @nombre, @apellido, @email, @estado, @password_hash)
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarIncidentesUsuario]...';
GO
CREATE PROCEDURE sp_ListarIncidentesUsuario
    @usuario_id BIGINT
AS
BEGIN
    SELECT id_incidente, venta_id, asunto, mensaje, estado, fecha_creacion
    FROM Incidentes
    WHERE usuario_id = @usuario_id
    ORDER BY fecha_creacion DESC
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarProductosActivos]...';
GO
CREATE PROCEDURE sp_ListarProductosActivos
AS
BEGIN
    SELECT id_producto, nombre_producto, descripcion_detallada,
           precio_unitario, stock_disponible, url_imagen, esta_activo
    FROM Productos
    WHERE esta_activo = 1
    ORDER BY nombre_producto ASC
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarProductosTodos]...';
GO
CREATE PROCEDURE sp_ListarProductosTodos
AS
BEGIN
    SELECT id_producto, nombre_producto, descripcion_detallada,
           precio_unitario, stock_disponible, url_imagen,
           fecha_ingreso, fecha_ultimo_restock, esta_activo
    FROM Productos
    ORDER BY esta_activo DESC, nombre_producto ASC
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarTodosIncidentes]...';
GO
CREATE PROCEDURE sp_ListarTodosIncidentes
AS
BEGIN
    SELECT i.id_incidente, i.venta_id, i.asunto, i.mensaje, i.estado, i.fecha_creacion, 
           u.nombre, u.apellido, u.email
    FROM Incidentes i
    INNER JOIN Usuarios u ON i.usuario_id = u.id_usuario
    ORDER BY CASE i.estado WHEN 'Abierto' THEN 1 WHEN 'En Revisión' THEN 2 ELSE 3 END, i.fecha_creacion DESC
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarUsuarios]...';
GO
CREATE PROCEDURE sp_ListarUsuarios
AS
BEGIN
    SELECT id_usuario, id_rol, nombre, apellido, email, estado
    FROM Usuarios
    ORDER BY id_usuario ASC
END
GO

PRINT N'Creating Procedure [dbo].[sp_LoginUsuario]...';
GO
CREATE PROCEDURE sp_LoginUsuario
    @email VARCHAR(200)
AS
BEGIN
    SELECT id_usuario, nombre, apellido, email, id_rol, password_hash
    FROM Usuarios
    WHERE email = @email
END
GO

PRINT N'Creating Procedure [dbo].[sp_ObtenerCategorias]...';
GO
CREATE PROCEDURE sp_ObtenerCategorias
AS
BEGIN
    SELECT id_categoria, nombre, descripcion 
    FROM Categorias 
    ORDER BY nombre ASC
END
GO

PRINT N'Creating Procedure [dbo].[sp_ObtenerDetalleVenta]...';
GO
CREATE PROCEDURE sp_ObtenerDetalleVenta
    @venta_id BIGINT
AS
BEGIN
    SELECT 
        dv.id AS detalle_id,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre_producto,
        p.url_imagen
    FROM DetalleVenta dv
    INNER JOIN Productos p ON dv.producto_id = p.id_producto
    WHERE dv.venta_id = @venta_id
END
GO

PRINT N'Creating Procedure [dbo].[sp_ObtenerProductoPorId]...';
GO
CREATE PROCEDURE sp_ObtenerProductoPorId
    @id_producto BIGINT
AS
BEGIN
    SELECT id_producto, nombre_producto, descripcion_detallada,
           precio_unitario, stock_disponible, url_imagen,
           fecha_ingreso, fecha_ultimo_restock, esta_activo
    FROM Productos
    WHERE id_producto = @id_producto
END
GO

PRINT N'Creating Procedure [dbo].[sp_ProcesarCheckout]...';
GO
CREATE PROCEDURE sp_ProcesarCheckout
    @usuario_id BIGINT,
    @total DECIMAL(18,2),
    @itemsJSON NVARCHAR(MAX),
    @cedula_comprador VARCHAR(50),  
    @metodo_pago VARCHAR(50)        
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT 
            JSON_VALUE(value, '$.id_producto') AS id_producto,
            CAST(JSON_VALUE(value, '$.cantidad') AS INT) AS cantidad,
            CAST(JSON_VALUE(value, '$.precio_unitario') AS DECIMAL(18,2)) AS precio_unitario,
            CAST(JSON_VALUE(value, '$.cantidad') AS INT) * CAST(JSON_VALUE(value, '$.precio_unitario') AS DECIMAL(18,2)) AS subtotal
        INTO #ItemsCarrito
        FROM OPENJSON(@itemsJSON);

        DECLARE @ProductoSinStock VARCHAR(100);

        SELECT TOP 1 @ProductoSinStock = p.nombre_producto
        FROM #ItemsCarrito c
        JOIN Productos p WITH (UPDLOCK) ON p.id_producto = c.id_producto
        WHERE p.stock_disponible < c.cantidad;

        IF @ProductoSinStock IS NOT NULL
        BEGIN
            DECLARE @ErrorMsg NVARCHAR(200) = 'Stock insuficiente o agotado para: ' + @ProductoSinStock;
            THROW 51000, @ErrorMsg, 1;
        END

        DECLARE @VentaID BIGINT;
        
        INSERT INTO Ventas (usuario_id, total, fecha, estado, cedula_comprador, metodo_pago)
        VALUES (@usuario_id, @total, GETDATE(), 'Completado', @cedula_comprador, @metodo_pago);
        
        SET @VentaID = SCOPE_IDENTITY(); 

        INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        SELECT @VentaID, id_producto, cantidad, precio_unitario, subtotal
        FROM #ItemsCarrito;

        UPDATE p
        SET p.stock_disponible = p.stock_disponible - c.cantidad
        FROM Productos p
        JOIN #ItemsCarrito c ON p.id_producto = c.id_producto;

        DROP TABLE #ItemsCarrito;

        COMMIT TRANSACTION;
        SELECT @VentaID AS id_venta;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        PRINT ERROR_MESSAGE(); 
        
        THROW;
    END CATCH
END
GO

PRINT N'Creating Procedure [dbo].[sp_ListarArticulo]...';
GO
CREATE PROCEDURE sp_ListarArticulo
AS
BEGIN
    EXEC sp_ListarProductosActivos
END
GO

PRINT N'Update complete.';
GO