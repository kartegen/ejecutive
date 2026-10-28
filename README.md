# Anatomía del cerebro (modelo 3D interactivo)

Haz clic en una región del cerebro (o elígela en la lista) y se abre una ventana con su información y videos de YouTube.

## Estructura

```
index.html        página principal
css/estilos.css   estilos
js/main.js        escena 3D, lista de regiones y ventana emergente
js/partes.js      TODO el contenido: textos, videos y referencias
models/brain.glb  modelo 3D
```

## Subirlo a GitHub y verlo en línea

1. Crea un repositorio en GitHub y sube todo el contenido de esta carpeta (arrastra los archivos en «Add file → Upload files»).
2. En el repositorio entra a **Settings → Pages**. En «Build and deployment» elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
3. Espera uno o dos minutos: GitHub mostrará el enlace de tu página.

## Probarlo en tu computadora

Abrir `index.html` con doble clic **no** carga el modelo ni los videos (los navegadores lo bloquean). Desde la carpeta del proyecto ejecuta:

```
python3 -m http.server 8000
```

y abre http://localhost:8000.

## Agregar o cambiar el contenido de una región

Edita `js/partes.js`. Cada región tiene esta forma (el lóbulo frontal ya está completo como ejemplo):

```js
{
  id: 'parietal', nodo: 'pariet', nombre: 'Lóbulo parietal', color: '#4FB0C6',
  resumen: 'Una línea que aparece bajo el título.',
  videos: [{ id: 'CODIGO_DE_YOUTUBE', titulo: 'Título del video' }],
  secciones: [
    { titulo: 'Título de la sección', parrafos: ['Texto…'], items: [['Término', 'Explicación']] },
  ],
  aviso: 'Nota opcional al final.',
  referencias: [{ texto: 'Cita en APA', url: 'https://…' }],
}
```

- `CODIGO_DE_YOUTUBE` es lo que va después de `v=` en el enlace (en `youtube.com/watch?v=yrCPnNc-YJY` es `yrCPnNc-YJY`).
- `nodo` debe coincidir con el nombre de la pieza en el modelo; no lo cambies. Los nombres son: `frontal`, `pariet`, `temp`, `occipit`, `cereb`, `stem`, `corpus` y `pitua`.
- Para resaltar un concepto clave en amarillo, enciérralo entre dobles asteriscos: `**perseveración**`.
- Las regiones sin `secciones` muestran «contenido en preparación».
- El cuerpo calloso y la hipófisis quedan dentro del cerebro, así que se abren desde la lista de regiones.

## Créditos

Modelo 3D «Brain» de farhad.Guli (https://sketchfab.com/3d-models/brain-6ca0844a846b400695ff54553dc9bda4), licencia CC BY 4.0. La licencia exige mantener este crédito.
