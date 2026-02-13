### Documento de Requerimientos Técnicos (DRT) \- Plataforma ISMS v3

#### 1\. Introducción y Propósito del Sistema

La plataforma  **ISMS (Integrated Safety Management System)**  v3 representa la evolución digital de la gestión de seguridad en entornos industriales de alta complejidad. Diseñado específicamente bajo el marco del  **ISMS-CR** , este sistema tiene como objetivo centralizar y automatizar los procesos de seguridad, salud y medio ambiente ( **HSE**  \-  *Health, Safety, and Environment* ). El diseño reconoce la tendencia global de integrar la Calidad ( **QHSE** ) como un componente inherente; por lo tanto, la trazabilidad digital del sistema asegura no solo la seguridad, sino la "aptitud para el propósito" ( *fitness for purpose* ) de cada intervención.La implementación se fundamenta en los experimentos y necesidades identificadas en el  **Central Railway Carriage Workshop, Matunga Road** . La arquitectura propuesta mitiga las deficiencias de los sistemas basados en papel —tales como la comunicación fragmentada y la falta de rendición de cuentas— permitiendo una reducción drástica en los tiempos de aprobación de permisos de trabajo (PTW), optimizando el flujo de  **15.4 minutos a solo 5.5 minutos** . El sistema garantiza el cumplimiento del estándar  **IS 17893:2022** , transformando la cultura de seguridad operativa en un ecosistema digital auditable y transparente.

#### 2\. Arquitectura de Referencia y Stack Tecnológico

Se define una arquitectura modular moderna que prioriza la resiliencia de los datos y la experiencia del usuario en campo:

* **Frontend:**  React 18+ con TypeScript, utilizando  **Vite**  como empaquetador de alto rendimiento. La interfaz se construye sobre  **Tailwind CSS**  y la biblioteca de componentes  **shadcn-ui** .  
* **Persistencia de Estado de Usuario:**  Implementación de persistencia mediante  **useLocalStorage**  (vía @mantine/hooks o lógica similar) para prevenir el abandono de formularios y la pérdida de datos ante refrescos accidentales o fallos de red durante procesos críticos de solicitud.  
* **Backend & Database:**   **Supabase**  basado en  **PostgreSQL 15**  con extensiones  **PostGIS**  para el mapeo geoespacial de incidentes y permisos dentro de las zonas del taller.  
* **Gestión de Esquema:**  Uso mandatorio de  **Prisma ORM**  para la definición, migración y tipado estricto del esquema de base de datos, asegurando la integridad referencial.  
* **Gestión de Formularios y Validación:**  Integración de  **React Hook Form**  con  **Zod**  para la validación de esquemas en tiempo real y lógica condicional compleja.  
* **Autenticación y Seguridad:**   **Supabase Auth (JWT)**  implementando un modelo  **RBAC**  ( *Role-Based Access Control* ) con roles estrictos: Admin, Safety Officer, Supervisor (Area In-Charge), y Permittee (SSE-Maintenance).

#### 3\. Especificación Detallada del Esquema de Base de Datos

La arquitectura de datos se fundamenta en tablas relacionales gestionadas por PostgreSQL, utilizando tipos de datos específicos para garantizar la precisión técnica.

##### 3.1 Campos Comunes (Estructura Base)

Todas las tablas de reporte deben heredar o incluir los siguientes campos de auditoría:

* ID\_Permisos: UUID (Primary Key, generado por gen\_random\_uuid()).  
* Fecha\_Sistema: TIMESTAMPTZ (Default: now()).  
* Correo: TEXT (Validación de formato email).  
* Persona\_Reporte: TEXT (Nombre del responsable).  
* Fecha\_Reporte: DATE.  
* Jornada\_Trabajo: TEXT (Turno operativo).  
* Empresa: TEXT.  
* Centro\_Costos: TEXT.  
* Orden\_Servicio: TEXT (Referencia vinculada a ERP).

##### 3.2 Módulos Específicos

Tabla,Campos Adicionales y Tipos  
REPORTE\_EVENTOS,"Numero\_Incidente (SERIAL), Numero\_Auxilios (INT), Numero\_Tratamiento\_Medico (INT), Detalle\_Situacion (TEXT), Informacion\_Colaborador (JSONB), Nombre\_Persona (TEXT)."  
REPORTE\_AUSENTISMO,"Nombre\_Persona (TEXT), Causa\_Ausentismo (TEXT)."  
REPORTE\_ASISTENCIA,Seleccione\_Personal (Junction Table Many-to-Many o JSONB para IDs de colaboradores).  
REPORTE\_PERMISOS,"Tipo\_Permiso (ENUM), Numero\_Permiso (TEXT), Hora\_Firma (TIMESTAMPTZ), Permiso\_PDF (TEXT \- URL signed)."  
**Tipos de Permiso Soportados (IS 17893):**  El sistema debe restringir el campo Tipo\_Permiso a las siguientes seis categorías:

1. Hot Work (Trabajo en Caliente)  
2. Cold Work (Trabajo en Frío)  
3. Electrical (Trabajo Eléctrico)  
4. Excavation (Excavación)  
5. Height Work (Trabajo en Altura)  
6. Confined Space Entry (Entrada a Espacio Confinado)

#### 4\. Implementación del Frontend y Lógica de Componentes

##### 4.1 SteppedForm y Persistencia

El componente  **SteppedForm**  utilizará el Context API de React para coordinar el estado entre pasos. Es un requerimiento crítico que cada paso parcial se sincronice con localStorage. Al reiniciar la aplicación, el sistema debe detectar estados incompletos y ofrecer la restauración del progreso al usuario.

##### 4.2 Validación Condicional con Zod

La validación mediante Zod debe implementar lógica dependiente. Si el Tipo\_Permiso es "Hot Work" o "Confined Space Entry", el esquema debe exigir obligatoriamente los campos de  **Gas Tester Entry**  y mediciones atmosféricas, bloqueando el avance del formulario si estos datos están ausentes.

##### 4.3 Captura de Firma y Generación de Documentos

* **Signature Canvas:**  La firma manuscrita se captura como base64.  
* **Comunicación Parent-to-Child:**  Para la generación de documentos imprimibles, el sistema debe emplear una comunicación de ventana padre a ventana hija. La ventana hija (documento de impresión) invocará una función global en la ventana padre (window.opener.obtenerImagen()) para recuperar la firma en base64 e insertarla dinámicamente en el DOM antes de disparar el diálogo window.print().

#### 5\. Gestión de Archivos (Supabase Storage)

La estrategia de almacenamiento se basa en el uso de  **Files Buckets** :

* **Seguridad:**  Los archivos cargados (ej. Permiso\_PDF) no deben ser públicos. Se requiere el uso de  **URLs Firmadas**  (Signed URLs) con tiempo de expiración limitado para el acceso a documentos de auditoría y seguridad.  
* **Optimización:**  El contenido será servido a través de una  **CDN Global**  para garantizar baja latencia en la visualización de planos o permisos previos en las diversas áreas del taller.

#### 6\. Funcionalidades de Seguridad y Tiempo Real

##### 6.1 Realtime Authorization (RLS)

Para el uso de realtime.broadcast\_changes() en la notificación de incidentes, es imperativo configurar las políticas de seguridad de Row Level Security (RLS) en el esquema realtime.  **Requerimiento Técnico:**  Debe existir una política específica en la tabla realtime.messages que permita la operación SELECT únicamente a usuarios con el rol authenticated.

##### 6.2 Control de Acceso (RBAC)

El sistema debe forzar la segregación de funciones:

* **Permittee/Issuer:**  Limitado a la iniciación y validación técnica del sitio.  
* **Safety Officer:**  Único rol autorizado para la aprobación final (Authorization) y el cierre formal (Closure) del permiso.

##### 6.3 Exportación Personalizada

El sistema debe permitir la exportación a PDF y Excel. Siguiendo el estándar industrial, las exportaciones deben incluir:

* Encabezados corporativos (Logo de Central Railway).  
* Agregación de datos por Centro\_Costos y Orden\_Servicio.  
* Formateo de celdas y filas específicas para representar la jerarquía del reporte.

#### 7\. Requerimientos de Rendimiento y Cumplimiento

La plataforma debe satisfacer las métricas medidas durante la fase experimental para garantizar la viabilidad operativa:| Métrica | Valor Objetivo / Medido || \------ | \------ || Latencia promedio de API | \< 120 ms || Tiempo de respuesta DB | \~ 27 ms || **Precisión de validación de formularios** | **98.7%** || Disponibilidad del sistema (Uptime) | 99.3% || **Estándar de Cumplimiento** | **IS 17893:2022**  (Work Permit System Code of Practice) |  
**Ciclo de Vida del Permiso (IS 17893:2022):**  El flujo de trabajo digital debe reflejar estrictamente las 5 etapas normativas:

1. **Initiation:**  Registro de tareas y peligros.  
2. **Validation:**  Verificación técnica de medidas de seguridad.  
3. **Authorization:**  Firma digital del Safety Officer.  
4. **Execution:**  Monitoreo en tiempo real del trabajo activo.  
5. **Closure:**  Finalización, reporte de incidentes y liberación del área.

