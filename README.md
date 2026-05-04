# Markdown Reader

https://wardiuz.github.io/markdown-reader/

Aplicacion web estatica para leer archivos Markdown directamente en el navegador. Permite cargar documentos mediante drag and drop o usando el explorador de archivos del sistema.

## Caracteristicas

- Carga de archivos `.md`, `.markdown` y `.txt`.
- Soporte para arrastrar y soltar archivos.
- Boton para abrir archivos desde el explorador.
- Renderizado de elementos comunes de Markdown:
  - titulos
  - parrafos
  - listas ordenadas y no ordenadas
  - citas
  - bloques de codigo
  - codigo en linea
  - enlaces
  - imagenes
  - tablas
  - texto en negrita, cursiva y tachado
- Vista de nombre, peso y cantidad aproximada de palabras del archivo.
- Funcionamiento 100% local, sin servidor ni subida de archivos.

## Vista General

La aplicacion esta pensada como un lector simple y rapido para revisar documentos Markdown sin instalar dependencias ni ejecutar un proceso de build.

Todo el contenido se lee usando la API `FileReader` del navegador y se renderiza en la misma pagina.

## Como Usar

1. Abre el archivo `index.html` en tu navegador.
2. Arrastra un archivo Markdown al area indicada.
3. Tambien puedes hacer clic en `Abrir archivo` y elegir un archivo desde el explorador.
4. El contenido renderizado aparecera en la zona principal de lectura.

## Estructura Del Proyecto

```text
.
+-- index.html
+-- styles.css
+-- app.js
+-- README.md
```

## Archivos

`index.html`

Define la estructura principal de la aplicacion: barra superior, boton de carga, zona de drag and drop, metadatos del archivo y area de previsualizacion.

`styles.css`

Contiene los estilos visuales, el layout responsive y el formato del contenido Markdown renderizado.

`app.js`

Gestiona la carga de archivos, la lectura del contenido y el renderizado basico de Markdown a HTML.

## Ejecutar Localmente

No necesitas instalar nada.

Abre directamente:

```text
index.html
```

Si prefieres usar un servidor local, puedes hacerlo con cualquier servidor estatico. Por ejemplo:

```bash
npx serve .
```

Luego abre la URL que indique la terminal.

## Publicar En GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Entra en `Settings`.
3. Ve a `Pages`.
4. En `Build and deployment`, selecciona la rama principal.
5. Usa la carpeta raiz del repositorio como origen.
6. Guarda los cambios.

GitHub Pages publicara la aplicacion como una pagina web estatica.

## Seguridad

La aplicacion no sube archivos a ningun servidor. Los documentos se procesan localmente en el navegador.

El renderizador incluido escapa HTML basico para reducir riesgos al abrir Markdown con contenido no confiable. Aun asi, no esta pensado como un sanitizador completo para escenarios de alta seguridad.

## Limitaciones

- No implementa todo el estandar CommonMark.
- No incluye resaltado de sintaxis en bloques de codigo.
- Las imagenes con rutas locales relativas pueden depender de como el navegador abra el archivo.
- No guarda historial ni documentos recientes.

## Tecnologias

- HTML
- CSS
- JavaScript

## Licencia

Puedes usar este proyecto como base para tus propias aplicaciones. Si vas a publicarlo, agrega la licencia que prefieras, por ejemplo MIT.
