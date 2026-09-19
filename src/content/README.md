# Cómo editar el sitio

Todo lo que el sitio dice y muestra está en los archivos `.json` de esta
carpeta. No hace falta tocar código para cambiar un texto, poner una foto,
añadir un libro o anunciar un evento.

Un archivo por página, más `site.json` para lo que sale en todas.

| Archivo          | Qué controla                                                    |
| ---------------- | --------------------------------------------------------------- |
| `site.json`      | El nombre y el pie de página                                    |
| `home.json`      | La portada                                                      |
| `libros.json`    | La página de Libros                                             |
| `arte.json`      | La página de Arte: los poemas y las canciones                    |
| `tejidos.json`   | La página de Tejidos                                            |
| `eventos.json`   | La página de Eventos (TARLITEART)                               |
| `biografia.json` | La página de Biografía                                          |

## Reglas que valen para todo

1. **El texto puede ser tan largo o tan corto como haga falta.** Todo se
   acomoda solo: las cajas crecen, el texto se parte en varias líneas.
2. **Cada sección tiene un interruptor.** Casi toda sección lleva un campo
   `visible`. Póngalo en `false` y esa franja deja de salir en la página, **sin
   perder nada de lo que hay dentro**; póngalo de nuevo en `true` y vuelve tal
   cual estaba. Es la forma de apagar algo por un tiempo sin borrarlo. Si no
   aparece el campo, la sección se ve: `visible` solo hace falta para apagarla.
   Lo de arriba de cada página (el encabezado rosa) y las pocas secciones que
   no tienen un bloque propio llevan su interruptor con nombre, al lado de sus
   textos: `headVisible` (el encabezado, en `libros`, `arte`, `tejidos`,
   `eventos` y `biografia`), `shelfVisible` (los libros, en `libros.json`),
   `channelsVisible` (los canales, en `tejidos.json`) y `bioVisible` (el
   retrato y el texto, en `biografia.json`). Funcionan igual: `false` apaga,
   y si no aparecen, se ve. La versión en inglés sigue siempre a estos
   interruptores del español.
3. **Si se vacía una sección, también desaparece.** Deje sus textos en `""` y
   esa sección deja de salir, sin dejar un título vacío. La diferencia con el
   interruptor es que así sí se pierde el texto.
4. **Cada página es independiente.** Lo que se escribe en un archivo no cambia
   ninguna otra página. La portada tiene su propia copia de todo lo que muestra
   — sus tres libros, su encuentro, sus canales — así que cambiar un libro en
   `libros.json` no cambia el que sale en la portada, y al revés. Si quiere que
   los dos digan lo mismo, hay que escribirlo en los dos sitios.
5. **Las direcciones internas no se escriben.** Los botones y enlaces que llevan
   a otra página de este mismo sitio ya saben a dónde van; usted solo cambia la
   palabra que se ve. Las direcciones de fuera — Amazon, YouTube, las redes —
   esas sí se escriben enteras, porque solo usted las sabe.
6. **Las listas pueden tener cualquier cantidad de elementos.** Para añadir un
   libro, un poema o un evento, copie un bloque entero de esa lista — desde su
   `{` hasta su `}` — péguelo debajo separado por una coma, y cámbiele los
   valores.
7. **Cada sección lleva arriba una palabrita y un título.** La palabrita es
   `kicker` (sale pequeña, en mayúsculas, con una rayita delante) y el título es
   `title`. Si se deja `kicker` en `""`, sale solo el título.

## Las fotos

**Ahora mismo el sitio no tiene ninguna fotografía.** En cada lugar donde va
una foto sale un marco de reserva: un recuadro suave con un dibujo de línea que
indica qué tipo de imagen corresponde ahí. Es a propósito — el sitio se ve
terminado aunque todavía no haya fotos.

Para poner una foto de verdad:

1. Copie el archivo de imagen dentro de la carpeta **`public/content/`**.
2. Escriba su nombre en el campo correspondiente del JSON:

```json
"photo": "marcia.jpg"
```

Solo el nombre del archivo, sin carpetas. También sirve una dirección web
completa (`"https://..."`). Si se deja `""`, se queda el marco de reserva. Y si
el nombre está mal escrito o la imagen no carga, la página vuelve sola al marco
de reserva en vez de mostrar una imagen rota.

## La forma de las fotos

Casi toda foto del sitio —una portada, un afiche, la foto de un encuentro, una
prenda terminada, un diploma, la ilustración de un poema— lleva un campo que
dice **qué forma tiene**. Hay tres, y son **las mismas tres en todo el sitio**:

| Valor          | Qué forma es                          |
| -------------- | ------------------------------------- |
| `"cuadrado"`   | Cuadrada                              |
| `"alto"`       | Más alta que ancha *(la que sale por defecto)* |
| `"ancho"`      | Más ancha que alta                    |

Se escribe así:

```json
"shape": "ancho"
```

Casi siempre el campo se llama `shape`. Cuando en un mismo bloque hay una sola
foto suelta —el retrato de la portada, el retrato de la biografía— se llama
igual que la foto pero terminado en `Shape`: `photoShape`, `portraitShape`.

**Lo más importante: no hay que acertarle.** La forma solo *reserva el hueco*
mientras la foto se carga, y sirve para el marco vacío de una foto que todavía
no se ha subido. En cuanto la foto está, **el marco toma la forma exacta de la
foto y se cierra alrededor de ella**, sea cual sea la palabra que se haya
escrito aquí. Así que si una foto salió más ancha de lo que se pensaba, no
queda ningún espacio en blanco a los lados: el marco se acomoda solo.

Por eso tampoco importa el **tamaño** del archivo. Una foto de tres mil píxeles
y una de cuatrocientos salen del mismo tamaño en la página, porque el tamaño lo
decide el sitio —todas las de una fila salen a la misma altura— y de la foto
solo se toma la proporción.

Otras cosas que conviene saber:

- **Se mezclan libremente.** En una misma lista pueden convivir las tres. Las
  portadas se apoyan todas sobre la misma línea del estante, las prendas
  cuelgan todas del mismo hilo, y los reconocimientos quedan centrados unos con
  otros: nada se recorta ni se deforma.
- **Si se deja vacío o mal escrito, sale `"alto"`.** No rompe nada.
- **La misma palabra no da exactamente la misma proporción en todas partes.**
  Un libro `"alto"` es más estilizado que una foto `"alta"`, porque un libro
  es más estilizado que una fotografía. Eso lo decide el sitio; aquí solo hay
  que elegir entre las tres palabras.
- **Una foto muy larga o muy angosta** —una panorámica, por ejemplo— sí queda
  con un poco de fondo a los lados: el sitio no deja que una sola foto sea más
  de tres veces más ancha que alta, o al revés, para que no descuadre toda una
  fila ella sola.

En **los encuentros** el `shape` vale para la foto que se ve en el archivo y
para las de su galería que no traigan la suya propia; cada foto de `fotos` puede
llevar su propia `shape`. Igual que en el resto del sitio, es el hueco que se
reserva: al cargar, cada foto se queda con su forma real.

Los videos no llevan forma: siempre son apaisados, como es un video.

## Los videos

Un campo `video` acepta **dos cosas distintas**, y el sitio se da cuenta solo de
cuál es:

**1. Un video que ya está en internet.** Se pega el enlace en formato **embed**,
no el normal:

- ✅ `https://www.youtube.com/embed/ABC123`
- ❌ `https://www.youtube.com/watch?v=ABC123`

En YouTube se consigue con *Compartir → Insertar*, o cambiando `watch?v=` por
`embed/` en la dirección. Sirve igual el enlace de Vimeo o de cualquier otro
sitio que dé una dirección para insertar — **no tiene que ser YouTube**.

**2. Un archivo de video propio.** Se copia el archivo dentro de
**`public/content/`**, igual que una foto, y se escribe su nombre:

```json
"video": "clase.mp4"
```

Sirven `.mp4`, `.webm`, `.mov`, `.m4v`. Ese se ve con el reproductor del propio
sitio, sin depender de nadie.

Si se deja `""`, sale un marco de reserva de video.

## Los saltos de línea (poemas)

En los campos de poema, `\n` es un salto de línea y se respeta tal cual. Dos
seguidos (`\n\n`) dejan un espacio, que es como se separan las estrofas.

```json
"body": "Primer verso,\nsegundo verso.\n\nEstrofa nueva."
```

## Los colores

En `site.json`, `"theme"` elige los colores de todo el sitio. Es una de estas
palabras: `"papel"` (el de siempre, crema y rosa), `"salvia"` (verde),
`"lavanda"` (lila), `"mar"` (azul), `"terracota"` (barro), `"noche"` (oscuro), `"durazno"` (coral), `"vino"` (burdeos), `"girasol"` (amarillo y azul), `"cielo"` (azul claro), `"grafito"` (blanco y negro) o `"medianoche"` (azul oscuro con dorado).
Cada tema trae además su propio carácter: lo redondo o recto de las esquinas y
los botones, la marquita antes de cada palabrita de arriba, un dibujo tejido en
las franjas rosas (lino, olas, estrellas, lunares…), el tipo de sombra y, en
algunos, los títulos inclinados. Y **sus dibujitos**, como los de las fiestas
pero más tranquilos: un ovillo con agujas en Papel, ramitas de salvia, lavanda
y libros, gaviotas y un barquito en Mar, un sol y un cántaro en Terracota, luna
y vela en Noche, girasoles y abejitas, nubes y un globo en Cielo, estrellas en
Medianoche… Salen en la portada, junto a su foto, y además junto a su nombre y a
lo largo del pie. Las cabeceras de las demás páginas quedan limpias; solo los
temas de fiesta las adornan. Los textos, las fotos y el orden quedan
igual.
Una palabra que no sea ninguna de estas deja el de siempre. Desde el editor se
elige en **Ajustes › Colores**, viendo cada tema antes de aplicarlo.

### Los temas de fiesta

Para las fiestas hay además `"navidad"`, `"halloween"`, `"sanvalentin"`,
`"pascua"`, `"gracias"` (Acción de Gracias), `"anonuevo"` (Año Nuevo),
`"muertos"` (Día de Muertos) y `"madre"` (Día de la Madre). Se ponen para la
temporada y después se vuelve al de siempre.

Cada uno trae **sus adornos**: algo sobre su foto de la portada (astas de reno,
un sombrero de bruja, orejas de conejo, cempasúchil…), un gorrito o un dibujito
junto a su nombre arriba, una guirnalda a lo largo del pie de página (luces,
banderines, papel picado…) y cosas que caen despacio en la portada y en la
cabecera de cada página (nieve, murciélagos, corazones, hojas, confeti).

`"holidayExtras"` enciende (`true`) o apaga (`false`) los adornos de **todos**
los temas, los de fiesta y los de siempre. Apagado, el tema deja solo sus
colores y su carácter. En el editor es el interruptor **Adornos del tema**, en
Ajustes › Colores.

## Las letras

También en `site.json`, dos palabras eligen las letras:

- `"fontTitles"` — la de los títulos grandes: `"fraunces"` (la de siempre),
  `"playfair"`, `"cormorant"`, `"dmserif"`, `"abril"`, `"montserrat"`, o una
  manuscrita: `"dancing"`, `"greatvibes"` o `"caveat"`. Las manuscritas solo se
  usan en los títulos grandes; los títulos pequeños (el de un libro en su
  tarjeta, por ejemplo) quedan en una letra que se lee bien.
- `"fontText"` — la del texto: `"inter"` (la de siempre), `"lato"`, `"nunito"`,
  `"worksans"`, `"lora"` o `"sourceserif"`.

Una palabra que no esté en la lista deja la de siempre. Desde el editor se
eligen en **Ajustes › Letras**, donde cada letra se ve escrita.

## La versión en inglés

El sitio puede verse en inglés. El texto en inglés vive en la carpeta
**`en/`**, con un archivo igual a cada uno de esta carpeta (`en/home.json`,
`en/libros.json`…). Solo cambian las palabras: las fotos, los enlaces y el
orden son siempre los del español.

El pie de página siempre muestra «Español · English», y la visita cambia de
idioma ahí. Eso no se configura: está fijo en el sitio. Un enlace que termina
en `?lang=en` abre el sitio directamente en inglés.

**No hace falta escribir estos archivos a mano.** En el editor, **Ajustes ›
Inglés**:

1. **Copiar el español** copia todos los textos, ordenados, con las
   instrucciones para quien traduce ya puestas arriba.
2. Se pega en ChatGPT, Claude, Gemini o el traductor que se prefiera, y se
   copia la respuesta completa.
3. Se pega la respuesta en el recuadro y se presiona **Usar esta traducción**,
   y luego **Aplicar**.

Si después se cambia algo en español que no son palabras —se añade un libro, se
cambia una foto, se apaga una sección— el editor avisa que el inglés quedó
atrasado. Basta con repetir los tres pasos.

`"ui"`, en `site.json`, guarda palabras sueltas que no son de ninguna página
(el botón de cerrar la foto grande, las páginas de «no encontrado»…), para que
también existan en inglés.

## Los campos que empiezan con `_`

`_guia` y `_nota` son recordatorios para quien edita. **No salen en la página**
y se pueden borrar sin que pase nada.

Los `_nota` marcan los textos de muestra que todavía hay que reemplazar con las
palabras reales — sobre todo los poemas y la frase de cierre de la portada.

## Detalle de algunos campos

### `site.json`

- **Los canales ya no están aquí.** Cada página tiene los suyos: los de la
  página de Tejidos están en `tejidos.json` y los de la portada en `home.json`,
  en `tejidos.channels`. Son dos copias a propósito, para que cambiar una no
  toque la otra. En ninguna hay número de suscriptores: el sitio no consulta a
  YouTube, así que cualquier cifra quedaría desactualizada sola.
- `footer` — el pie de página, en dos partes: su nombre con `note` debajo, y
  las redes. No lleva menú, porque el de arriba ya está en todas las páginas.
  - `note` es la línea corta que va bajo el nombre.
  - `socialTitle` es el título que va sobre las redes. Vacío, no sale.
  - `social` es la lista de cuentas; cada una sale como un botoncito con su
    dibujito. Una entrada con `url` en `""` sale igual, en gris y sin enlace,
    hasta que haya cuenta. Se pueden añadir o quitar entradas: la fila se
    acomoda sola.
  - `icon` es el dibujito que va al lado del nombre de cada cuenta. Es una de
    estas palabras: `"youtube"`, `"facebook"`, `"instagram"`, `"x"`,
    `"linkedin"`, `"amazon"` o `"globe"` (un mundito, para cualquier otra cosa).
    Si se escribe otra palabra, o se deja vacío, sale el mundito y el enlace
    funciona igual.
- **El sitio no muestra correos.** El contacto es por las redes.

### `home.json`

**La portada es dueña de todo lo que muestra.** Sus tres libros, su encuentro y
sus canales están escritos aquí, no tomados de las otras páginas. Cambiar algo
aquí no cambia nada allá, y al revés.

- `hero.honorific` — el título que va antes del nombre («Dra.»).
- `hero.roles` — las palabras que se van escribiendo solas debajo del nombre.
  Se pueden añadir o quitar.
- `hero.primaryLabel` y `hero.secondaryLabel` — lo que dicen los dos botones. El
  primero lleva siempre a los libros y el segundo a los tejidos; eso no se
  cambia desde aquí. Si se deja una etiqueta en `""`, ese botón no sale.
- `proximo` — la franja del próximo encuentro, justo debajo de la portada. **El
  encuentro se escribe aquí**, con sus propios `date`, `time`, `title`, `venue`,
  `city` y `poster`. Cuando pase, se le cambian los valores por los del
  siguiente; si se dejan `date` y `title` vacíos, la franja desaparece sola.
  - `kicker` — la palabra de arriba («Lo próximo»).
  - `detalleLabel` — el enlace que abre la página de ese encuentro, del lado de
    Eventos. La dirección se saca del `title`, así que para que funcione el
    encuentro tiene que existir en `eventos.json` con **el mismo título**. Si
    todavía no tiene página allá, deje esta etiqueta en `""` y el enlace no
    sale.
  - `linkLabel` — el enlace de la derecha, que lleva a la página de eventos.
- `books.items` — los tres libros de la portada, con su `title`, `year`,
  `categoria`, `shape`, `cover` y `slug`. El `slug` es el que abre la página del
  libro en la sección de Libros, así que tiene que coincidir con el de allá.
- `tejidos.channels` — los dos canales, como salen en la portada.
- `quote` — la frase suya, que cierra la portada. Si se deja `text` en `""`, esa
  franja desaparece.

### `libros.json`

Cada libro lleva `title`, `year`, `categoria`, `pages`, `cover`, `synopsis` y el
enlace de compra (`buyLabel`, `buyUrl`). El bloque `upcoming` es para los
títulos que todavía no salen.

`generos` es la lista de géneros: las pestañas de arriba, en ese orden. La
`categoria` de cada libro tiene que ser uno de ellos, escrito igual. Un género
que se quita de la lista deja de tener pestaña, y los libros que todavía lo
llevan salen igual, solo en «Todos». Si la lista falta o queda vacía, las
pestañas se arman solas con los géneros de los libros.

**La forma de la portada** se indica con `shape`, con las tres formas de
siempre: `"alto"` (rectangular, lo normal en un libro), `"cuadrado"` (común en
libros infantiles) o `"ancho"` (apaisado). Ver *La forma de las fotos*.

Las tres se pueden mezclar libremente y en cualquier posición: las portadas se
apoyan todas sobre la misma línea —hay una línea fina dibujada, como la tabla
de un estante— y los títulos de abajo quedan alineados. La portada nunca se
recorta ni se deforma.

**En la portada del sitio salen los tres primeros libros de esta lista**, en el
orden en que estén aquí. Para cambiar cuáles se ven o en qué orden, se mueven
los bloques dentro de la lista. La página de Libros los sigue mostrando todos.

### `arte.json`

Arriba va la **cabecera** de la página, sobre el rosa, como en las demás:
`kicker`, `title` y `lead`. Si se deja `title` vacío, la cabecera no sale y la
página empieza por los poemas.

Debajo, **dos partes**: `poems` (los poemas) y `songs` (las canciones). Cada una
lleva su propio `kicker`, `title` y `lead`, y las dos pesan lo mismo.

#### `poems`

Cada poema es un bloque de `items` y **tiene su propia página**, igual que los
libros. Lleva `title`, `source` (de dónde sale), `year`, `photo`, `preview` y
`body`. `body` es el poema completo, el que se lee en su página. `preview` es la
vista previa: las pocas líneas que salen en la lista, las que mejor presenten el
poema, aunque vengan de la mitad. Si `preview` se deja vacío, salen los primeros
uno o dos versos.

La lista de poemas es un **índice**, como la tabla de contenido de un libro:
cada poema es una entrada con su ilustración al lado, y las entradas van de dos
en dos, numeradas y separadas por una línea fina. En pantallas angostas pasan a
una sola columna. De cada poema se muestra el título, de dónde sale y su
**vista previa** como anticipo; el poema completo se lee al entrar.
La lista no tiene tope — cuantos poemas se añadan, tantos salen, y **el orden de
la lista es el orden en la página**.

`source` no arma pestañas ni filtros: es solo el dato de dónde sale el poema, y
se muestra debajo del título. **No todos los poemas salen del mismo libro**, así
que cada uno lleva el suyo, y el que sea inédito puede decir justamente eso.

`slug` es la dirección del poema (`/arte/titulo-del-poema`). Si se deja `""`, se
arma sola con el título. Conviene no cambiarla una vez publicada, para que un
enlace compartido siga funcionando.

Dentro de la página de cada poema hay enlaces al **anterior** y al **siguiente**,
en el orden de esta lista — así se pueden leer de corrido. Para cambiar ese
orden, se mueven los bloques dentro de `items`.

#### `songs`

Las canciones van debajo de los poemas, en una **pared de cuadraditos**: cada
una es un cuadrado con su título debajo, y al tocarlo se abre su video ahí
mismo, sin salir de la página. Solo suena una a la vez. Ninguna canción está
destacada sobre las otras.

Se acomodan solas: cinco por fila en una pantalla grande, dos en un teléfono, y
las que hagan falta en las filas que hagan falta. **La lista no tiene tope**, y
el orden de la lista es el orden en la pared.

Cada bloque de `items` lleva `title`, `year`, `note`, `photo` y `video`.

- `photo` es **la imagen cuadrada que se ve antes de tocar el video**. Conviene
  una imagen bonita; si se deja `""`, sale un marco de reserva.
- `video` funciona igual que en el resto del sitio: o el enlace de un video de
  internet en formato `embed`, o el nombre de un archivo puesto en
  `public/content/`.

**Una canción sin `video` sale igual**, con su cuadradito y su título y sin
botón — y el día que se grabe, basta con pegar el enlace ahí y gana el botón
sola, sin tocar nada más.

### `tejidos.json`

- `channels` — los dos canales de YouTube tal como salen **en esta página**
  (`name`, `short`, `description`, `url`, `logo`). La portada tiene su propia
  copia en `home.json`; son independientes a propósito.
  - `logo` es la foto redonda del canal, arriba de su tarjeta: el nombre de un
    archivo puesto en `public/content/`, igual que cualquier otra foto. La copia
    que está ahora se bajó del propio canal. Si se deja `""`, la tarjeta sale
    sin foto, solo con el nombre y la descripción.
  - `short` (`"Crochet"`, `"Palillos"`) es además la palabra con la que se
    etiqueta cada video de abajo. Si se cambia aquí, conviene cambiarla también
    en los videos para que sigan tomando el color de su canal.
- `featured.items` — **los videos escogidos**. Cada bloque es una tarjeta: la
  foto arriba con el botón de play encima, y debajo la etiqueta del canal, el
  título y la nota. Se pueden poner los que haga falta — las tarjetas se
  acomodan solas en las filas que hagan falta.
  - `photo` es **la imagen que se ve antes de tocar el video**, y es lo que
    hace que esta sección funcione: conviene una foto bonita de la prenda
    terminada, no una captura cualquiera. Al tocarla, el video se abre ahí
    mismo, sin salir de la página.
  - `channel` es de cuál de los dos canales sale el video: `"Crochet"` o
    `"Palillos"`, escrito igual que en `site.json`. Cada uno tiene su color de
    etiqueta. Si se deja vacío, no sale etiqueta.
  - `video` puede ser un enlace `embed` (YouTube, Vimeo, el que sea) o el
    nombre de un archivo suyo puesto en `public/content/`, como `"clase.mp4"`.
    Sin video, la foto se queda quieta y no aparece el botón de play.
  - Para quitar la sección entera, dejar `"items": []`.
- `gallery.items` — **la galería de trabajos terminados**. Cada bloque es una
  pieza colgada de un hilo: `photo` la foto, `title` el nombre de la prenda y
  `note` una línea corta debajo (el material, el punto, para quién fue).

  **La forma de la foto** se indica con `shape`: `"ancho"` para una prenda
  extendida, `"alto"` para una colgada, `"cuadrado"` para una doblada. Son las
  tres de siempre — ver *La forma de las fotos*.

  Se mezclan libremente: todas cuelgan del mismo hilo por arriba y cada una
  conserva su forma, sin recortarse ni deformarse. Además cuelgan a distinta
  altura a propósito, para que la fila no quede militar; eso sale solo de la
  posición de cada pieza, así que se pueden añadir o quitar sin pensar en el
  orden. Para quitar la sección entera, dejar `"items": []`.
- `playlists.items` — **lo que se enseña**. Cada bloque es una caja; las cajas
  se acomodan solas en las filas que hagan falta, así que se pueden añadir o
  quitar sin que nada se descuadre.

### `eventos.json`

- `upcoming` — **el próximo encuentro, uno solo**, con su afiche. Cuando pase,
  cámbiele los valores por los del siguiente en vez de añadir otro bloque.
  Cuando no haya ninguno confirmado, deje `date` y `title` en `""` y la franja
  entera desaparece: la página empieza directamente por el archivo, sin dejar un
  hueco.
  - `rol` — qué papel tiene ella en ese encuentro: «Organiza» si es suyo,
    «Invitada» o «Se presenta» si va a uno ajeno. Se escribe como se quiera.
  - `poster` — el afiche. **Sale entero, nunca recortado**, sea cual sea su
    forma, así que no hay que prepararlo de ningún tamaño en particular. Si
    todavía no hay, sale un marco de reserva.
  - `posterShape` — la forma del afiche, aparte de la de las fotos: un afiche
    casi siempre es alto y las fotos de la tarde suelen ser anchas, así que
    tienen su campo cada uno. Si se deja `""`, el afiche toma la forma de
    `shape`. Como el afiche no se recorta, esta forma solo reserva el hueco
    donde va.
  - `linkLabel` y `linkUrl` — opcionales. Vacíos, no sale ningún botón.
  - `body` y `fotos` — **le dan página propia**, igual que a los del archivo, y
    con eso aparece el enlace en la portada. Sin ninguna de las dos no hay
    página, que es lo normal para un encuentro que todavía no ha pasado. El
    afiche encabeza la galería solo.
- `past.items` — los encuentros anteriores. Cada uno lleva una `categoria`: la
  clase de encuentro — «Tertulia», «Recital», «Taller», la que sea — y tiene
  que ser una de las de `past.categorias`, escrita igual. Una `categoria` vacía
  no rompe nada: ese encuentro sale igual, solo que nada más en «Todos».
  Mientras haya una sola clase no salen pestañas, porque no habría nada que
  separar.
- **Cada encuentro puede tener su propia página**, con las fotos arriba y el
  relato debajo. Se abre sola en cuanto el encuentro tenga `body` o `fotos`: ese
  encuentro se vuelve clickeable en el archivo. El que no tenga ni lo uno ni lo
  otro sale igual en la parrilla, pero sin enlace, para que nunca se llegue a
  una página vacía.
  - `body` — el relato. Una línea en blanco (`\n\n`) separa un párrafo del
    siguiente, igual que en el resto del sitio.
  - `fotos` — la galería. Cada bloque es una foto: `src` (el nombre del archivo
    puesto en `public/content/`) y `alt` (qué se ve, para quien no puede verla).
    Pueden ser las que
    sean: dos o treinta se acomodan igual. La foto `photo` —la que se ve en el
    archivo— encabeza la galería sola, no hay que repetirla aquí.
  - `date` — la fecha completa («28 de septiembre de 2024»), si se sabe. Si se
    deja vacía se usa el `year`.
  - `shape` — **la forma de las fotos de ese encuentro**, una sola para todas:
    `"cuadrado"`, `"alto"` o `"ancho"`. Vale para la foto que se ve en el
    archivo y para todas las de la galería, y por eso la fila de fotos no
    cambia de alto al ir pasándolas. El `upcoming` lleva el suyo, y ahí manda
    también sobre el marco del afiche.
- `past.detalle` — cómo se llaman las cosas en esa página: `backLabel` (el enlace
  de vuelta) y `galleryLabel`.
- `past.lead` — la línea que se lee cuando está elegido «Todos».
- `past.categorias` — **las clases de encuentro**, en el orden de las pestañas.
  Cada bloque lleva `nombre` y un `texto` opcional: la línea de presentación
  que sale al elegir esa pestaña. Una clase quitada de aquí deja de tener
  pestaña; sus encuentros siguen saliendo en «Todos». Una clase que ningún
  encuentro usa no saca pestaña. Si la lista falta o queda vacía, las pestañas
  se arman solas con las clases de los encuentros.
- Encima de esa línea sale sola la franja de años de lo que se está mostrando
  («2019 — 2024»). No se escribe en ningún lado: se saca de los `year` de los
  encuentros, así que se corrige sola al añadir uno.

### `biografia.json`

- `body` — la biografía larga. Una línea en blanco (`\n\n`) separa un párrafo
  del siguiente.
- `formacion` — **la formación médica**, en su propia franja, presentada como un
  certificado: `degree` el título obtenido, `place` la universidad y `detail`
  la ciudad. `photo` puede ser el diploma o una foto suya de esa época. Si se
  vacía `degree`, la franja desaparece.
- `album.items` — **el álbum: las fotos de su vida**, después de los
  reconocimientos y antes de la cronología. Cada bloque es una foto pegada en la hoja del álbum, sujeta por
  cuatro esquineros de papel y puesta un poquito chueca a propósito, como en un
  álbum de verdad. Lleva `photo`, `photoAlt`, `shape`, `year` y `pie`.
  - `pie` es la línea que va debajo: dónde fue, quiénes salen. Puede quedar
    vacía.
  - `year` sale en dorado encima del pie. No tiene que ser un año — vale
    "Azogues" o "Queens". Si se deja `""`, no sale nada.
  - `shape` es la forma de la foto, las tres de siempre. **Aquí conviene
    mezclarlas**: todas las fotos salen del mismo alto y cada una ocupa el
    ancho que le toca por su forma, así que una foto ancha se estira a lo largo
    de la fila y una alta queda angostita al lado. Es lo que hace que la hoja
    se vea armada a mano y no como una cuadrícula.
  - **No hay tope**, y el orden de la lista es el orden en la hoja: conviene
    ponerlas de la más antigua a la más reciente. La inclinación de cada foto
    sale sola de su posición, así que no hay nada que ajustar al añadir una.
  - Las seis que están puestas son de muestra y están vacías, para ver cómo
    queda la hoja antes de tener las fotos. Para quitar la sección entera,
    dejar `"items": []`.
- `timeline.items` — la cronología. `year` no tiene que ser un año: también vale
  "11 años" o "Cuenca".
- `recognition.items` — **los reconocimientos**, cada uno enmarcado con su foto:
  `photo` (el diploma, la placa o una foto de la entrega), `year` — que sale en
  un sello dorado sobre el marco, y si se deja `""` el sello no aparece —,
  `title`, `text` y `shape`, la forma del marco: `"cuadrado"`, `"alto"` o
  `"ancho"`, las tres de siempre. La foto del diploma, arriba en `formacion`,
  lleva su propio `shape`, y el retrato de la cabecera lleva `portraitShape`. Los marcos cuelgan en
  una pared que se acomoda sola, así que da igual cuántos haya. Para añadir
  otro, copiar un bloque entero. **De los cinco que están puestos, solo el de
  2011 es real**: los otros cuatro están en blanco esperando los que faltan, y
  el que no se use se borra entero.

## Si algo se rompe

Un JSON se rompe casi siempre por lo mismo: **una coma de más al final de una
lista, o una coma que falta entre dos bloques**. Las comillas tienen que ser
rectas (`"`), no curvas (`"`). Si el sitio deja de cargar después de una
edición, revise primero eso.
