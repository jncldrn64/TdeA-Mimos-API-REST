USE [master];
GO
IF DB_ID(N'MimosDemo') IS NOT NULL BEGIN
    ALTER DATABASE [MimosDemo] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [MimosDemo];
END
GO
CREATE DATABASE [MimosDemo] COLLATE SQL_Latin1_General_CP1_CI_AS;
GO
USE [MimosDemo];
GO

-- TABLA 1: Roles (debe crearse primero, no depende de nadie)
CREATE TABLE Roles (
    id_rol      BIGINT       IDENTITY(1,1) NOT NULL,
    nombre      VARCHAR(50)  NOT NULL,   
    descripcion VARCHAR(200) NULL,
    PRIMARY KEY (id_rol)
);

-- TABLA 2: Usuarios 
CREATE TABLE Usuarios (
    id_usuario    BIGINT       IDENTITY(1,1) NOT NULL,
    id_rol        BIGINT       NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    email         VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    estado        VARCHAR(50)  NOT NULL DEFAULT 'activo',
    created_at    DATETIME     NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (id_usuario),
    UNIQUE (email),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- TABLA 3: Categorias
CREATE TABLE Categorias (
    id_categoria BIGINT       IDENTITY(1,1) NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  VARCHAR(255) NULL,
    PRIMARY KEY (id_categoria)
);

-- TABLA 4: Productos
CREATE TABLE Productos (
    id_producto           BIGINT         IDENTITY(1,1) NOT NULL,
    id_categoria          BIGINT         NULL,
    nombre_producto       VARCHAR(200)   NOT NULL,
    descripcion_detallada VARCHAR(1000)  NULL,
    precio_unitario       DECIMAL(10,2)  NOT NULL,
    stock_disponible      INT            NOT NULL DEFAULT 0,
    url_imagen            VARCHAR(500)   NULL,
    fecha_ingreso         DATETIME       NOT NULL DEFAULT GETDATE(),
    fecha_ultimo_restock  DATETIME       NULL,
    esta_activo           BIT            NOT NULL DEFAULT 1,
    PRIMARY KEY (id_producto),
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

-- TABLA 5: Carrito 
CREATE TABLE Carrito (
    id_carrito BIGINT   IDENTITY(1,1) NOT NULL,
    usuario_id BIGINT   NOT NULL,
    creado_at  DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (id_carrito),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id_usuario)
);

-- TABLA 6: CarritoItem 
CREATE TABLE CarritoItem (
    id_item         BIGINT        IDENTITY(1,1) NOT NULL,
    id_carrito      BIGINT        NOT NULL,
    id_producto     BIGINT        NOT NULL,
    cantidad        INT           NOT NULL DEFAULT 1,
    precio_snapshot DECIMAL(10,2) NOT NULL, 
    PRIMARY KEY (id_item),
    FOREIGN KEY (id_carrito)  REFERENCES Carrito(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- TABLA 7: Ventas
CREATE TABLE Ventas (
    id               BIGINT        IDENTITY(1,1) NOT NULL,
    comprador_id     BIGINT        NOT NULL,
    procesado_por    BIGINT        NULL,  
    total            DECIMAL(10,2) NOT NULL,
    fecha            DATETIME      NOT NULL DEFAULT GETDATE(),
    estado           VARCHAR(50)   NOT NULL DEFAULT 'pendiente',
    cedula_comprador VARCHAR(50)   NULL,
    metodo_pago      VARCHAR(50)   NULL,
    referencia_pago  VARCHAR(100)  NULL,  
    PRIMARY KEY (id),
    FOREIGN KEY (comprador_id)  REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (procesado_por) REFERENCES Usuarios(id_usuario)
);

-- TABLA 8: DetalleVenta 
CREATE TABLE DetalleVenta (
    id              BIGINT        IDENTITY(1,1) NOT NULL,
    venta_id        BIGINT        NOT NULL,
    producto_id     BIGINT        NOT NULL,
    cantidad        INT           NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (venta_id)    REFERENCES Ventas(id),
    FOREIGN KEY (producto_id) REFERENCES Productos(id_producto)
);

-- TABLA 9: Envios
CREATE TABLE Envios (
    id_envio               BIGINT       IDENTITY(1,1) NOT NULL,
    venta_id               BIGINT       NOT NULL,
    direccion              VARCHAR(300) NOT NULL,
    ciudad                 VARCHAR(100) NOT NULL,
    estado_envio           VARCHAR(50)  NOT NULL DEFAULT 'preparando',
    fecha_despacho         DATETIME     NULL,
    fecha_entrega_estimada DATETIME     NULL,
    fecha_entrega_real     DATETIME     NULL,
    PRIMARY KEY (id_envio),
    FOREIGN KEY (venta_id) REFERENCES Ventas(id)
);

-- TABLA 10: PQRS 
CREATE TABLE PQRS (
    id_pqrs         BIGINT        IDENTITY(1,1) NOT NULL,
    usuario_id      BIGINT        NOT NULL,
    venta_id        BIGINT        NULL,
    asunto          VARCHAR(200)  NOT NULL,
    mensaje         VARCHAR(1000) NOT NULL,
    estado          VARCHAR(50)   NOT NULL DEFAULT 'abierto',
    fecha_creacion  DATETIME      NOT NULL DEFAULT GETDATE(),
    respuesta       VARCHAR(1000) NULL,
    fecha_respuesta DATETIME      NULL,
    PRIMARY KEY (id_pqrs),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (venta_id)   REFERENCES Ventas(id)
);

-- Datos mínimos
INSERT INTO Roles (nombre, descripcion) VALUES
    ('ADMIN',   'Administrador del sistema'),
    ('CLIENTE', 'Cliente registrado');

INSERT INTO Categorias (nombre, descripcion) VALUES
    ('Helados', 'Helados artesanales'),
    ('Postres', 'Postres y dulces'),
    ('Bebidas', 'Bebidas frias');
GO

USE [master];
GO

-- 1. Crea el acceso a nivel del servidor (Login)
CREATE LOGIN api_mimos_user WITH PASSWORD = 'MimosDev2026*';
GO

USE [MimosDemo];
GO

-- 2. Crea el usuario dentro de la base de datos mapeado al Login
CREATE USER api_mimos_user FOR LOGIN api_mimos_user;
GO

-- 3. Le otorga permisos totales, pero SOLO sobre la base de datos MimosDemo
ALTER ROLE db_owner ADD MEMBER api_mimos_user;
GO