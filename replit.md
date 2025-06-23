# Sistema de Gestión para Ferretería Litoral

## Descripción del Proyecto

Sistema completo de gestión empresarial desarrollado específicamente para Ferretería Litoral. La aplicación está construida con HTML, CSS y JavaScript puro, sin frameworks complejos, para facilitar su implementación y mantenimiento.

## Características Principales

### Funcionalidades del Sistema
- **Dashboard**: Panel principal con métricas en tiempo real
- **Inventario**: Gestión completa de productos con control de stock
- **Ventas**: Registro de transacciones y generación de facturas
- **Gastos**: Control de gastos empresariales por categorías
- **Reportes**: Análisis financiero y reportes de gestión

### Tecnologías Utilizadas
- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsivo con variables CSS y Flexbox/Grid
- **JavaScript ES6+**: Lógica de aplicación sin dependencias externas
- **LocalStorage**: Almacenamiento de datos en el navegador
- **Font Awesome**: Iconografía consistente

## Estructura de Archivos

```
ferreteria-litoral/
├── index.html          # Página principal de la aplicación
├── style.css          # Estilos y diseño responsivo
├── script.js          # Lógica principal de la aplicación
├── chart.js           # Sistema de gráficos personalizado
├── data.js            # Gestión de datos y ejemplos
├── utils.js           # Funciones de utilidad
├── config.js          # Configuración de la aplicación
└── README.md          # Documentación del usuario
```

## Características Técnicas

### Almacenamiento de Datos
- **LocalStorage**: Persistencia de datos en el navegador
- **JSON**: Formato de datos estructurado
- **Backup/Restore**: Exportación e importación de datos
- **Cache**: Sistema de caché para mejor rendimiento

### Diseño y UX
- **Responsivo**: Adaptado para móviles, tablets y escritorio
- **Moderno**: Interfaz limpia con colores corporativos
- **Accesible**: Cumple con estándares de accesibilidad web
- **Intuitivo**: Navegación simple y clara

### Funcionalidades Avanzadas
- **Gráficos**: Sistema de visualización de datos personalizado
- **Reportes**: Generación automática de reportes en múltiples formatos
- **Notificaciones**: Sistema de alertas y confirmaciones
- **Búsqueda**: Filtrado inteligente de productos y datos
- **Validaciones**: Control de integridad de datos

## Gestión de Inventario

### Productos
- Registro completo con SKU, nombre, descripción
- Control de stock con alertas automáticas
- Categorización por tipos de productos
- Precios y márgenes de ganancia
- Marcas y proveedores

### Categorías Predefinidas
1. **Herramientas**: Manuales y eléctricas
2. **Construcción**: Materiales de obra
3. **Plomería**: Tuberías y accesorios
4. **Eléctrico**: Cables y componentes
5. **Pintura**: Pinturas y herramientas

## Sistema de Ventas

### Funcionalidades
- Registro de ventas con múltiples productos
- Generación automática de números de factura
- Control de clientes y datos de contacto
- Actualización automática de inventario
- Historial completo de transacciones

### Características
- Cálculo automático de totales
- Validación de stock disponible
- Notas y observaciones por venta
- Búsqueda y filtrado de ventas

## Control de Gastos

### Categorías de Gastos
- Alquiler
- Servicios (luz, agua, internet)
- Compras de inventario
- Marketing y publicidad
- Mantenimiento
- Transporte
- Otros gastos operativos

### Reportes Financieros
- Resumen mensual de ingresos y gastos
- Análisis de rentabilidad
- Productos más vendidos
- Tendencias de ventas

## Configuración y Personalización

### Configuraciones Disponibles
- Información de la empresa
- Categorías de productos
- Formatos de moneda y fecha
- Colores y tema visual
- Configuraciones de notificaciones

### Datos de Ejemplo
- Productos de muestra para pruebas
- Ventas de ejemplo
- Gastos de ejemplo
- Configuración inicial automática

## Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Conexión a internet para cargar FontAwesome

### Instrucciones
1. Descargar todos los archivos
2. Abrir `index.html` en el navegador
3. Hacer clic en "Iniciar Sesión"
4. Comenzar a usar la aplicación

### Datos de Prueba
Para cargar datos de ejemplo, abrir la consola del navegador y ejecutar:
```javascript
initializeSampleData()
```

## Historial de Cambios

### 23 de Junio, 2025
- **Creación inicial**: Sistema completo de gestión
- **Migración a archivos estáticos**: Eliminación de dependencias de servidor
- **Implementación de funcionalidades**: Dashboard, inventario, ventas, gastos
- **Sistema de gráficos**: Visualización de datos personalizada
- **Documentación completa**: Guías de usuario y técnica
- **Limpieza de archivos**: Eliminación de archivos innecesarios del proyecto Node.js

## Preferencias del Usuario

- **Estilo de comunicación**: Lenguaje simple y directo en español
- **Formato de proyecto**: Archivos HTML/CSS/JavaScript simples para fácil subida a GitHub
- **Preferencia técnica**: Aplicación independiente sin frameworks complejos
- **Almacenamiento**: LocalStorage para persistencia de datos sin servidor

## Soporte y Mantenimiento

### Compatibilidad
- Navegadores modernos con soporte ES6+
- Dispositivos móviles y tablets
- Resoluciones desde 320px hasta 4K

### Backup y Seguridad
- Datos almacenados localmente en el navegador
- Sistema de exportación para respaldos
- Sin transmisión de datos a servidores externos

## Próximos Pasos

El proyecto está listo para:
1. **Subir a GitHub**: Los 8 archivos principales están listos
2. **Implementar en GitHub Pages**: Funciona completamente como sitio estático
3. **Usar inmediatamente**: Abrir index.html en cualquier navegador