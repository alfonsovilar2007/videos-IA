# Formato del guion (`guiones/<slug>.json`)

```json
{
  "titulo": "Por Qué El Rojo Siempre Va Arriba",
  "descripcion": "Una frase para la descripción de YouTube.",
  "hashtags": ["#curiosidades", "#sabiasque", "#shorts"],
  "motor_voz": "chatterbox",
  "velocidad_audio": 1.1,
  "escenas": [
    {
      "texto": "Lo que dice el narrador en esta escena.",
      "fondo": "english prompt describing ONLY the place, no people",
      "camara": "avance",
      "particulas": "polvo",
      "personajes": [
        {"vestuario": "policia", "expresion": "chulo", "pose": "senyala", "x": 0.5, "habla": true}
      ]
    }
  ]
}
```

## Campos generales
| Campo | Valores |
|---|---|
| `motor_voz` | `chatterbox` (natural, por defecto, ~5 s por cada segundo de audio) o `kokoro` (rápida, más robótica) |
| `voz_referencia` | Audio de 8-15 s cuya voz imita Chatterbox. Por defecto `shorts/voces/narrador_vivo.wav` (voz C elegida por el usuario) |
| `expresividad` | 0.3-0.9 (Chatterbox). Más alto, más emoción y teatralidad. Por defecto 1.0 |
| `velocidad_audio` | 1.0-1.2. Acelera la voz sin cambiar el tono. Por defecto 1.1 |
| `voz` | Solo para Kokoro: `em_alex`, `em_santa` o `ef_dora` |
| `musica` | Ruta opcional a un MP3 libre de derechos (se mezcla bajito) |

## Campos de cada escena
| Campo | Valores |
|---|---|
| `camara` | `avance`, `retroceso`, `orbita`, `paneo_izq`, `paneo_der` o `grua`. Si no se pone, va rotando |
| `intensidad_camara` | 0.5-1.3. Cuánto se mueve la cámara (1 por defecto) |
| `particulas` | `polvo` (por defecto), `nieve` o `ninguna`: partículas flotando en el espacio 3D |

## Campos de cada personaje
| Campo | Valores |
|---|---|
| `vestuario` | normal, preso, policia, guardia, millonario, caballero, minero, vaquero, soldado, general, marinero, capitan, samurai, rey, cientifico, conductor, obrero, granjero, doctor, ninio |
| `expresion` | neutral, feliz, chulo, enfadado, furioso (ojos rojos), sorprendido, triste, asustado, pensativo |
| `pose` | Pose de base a la que vuelve tras cada gesto: normal, saludo (saluda con la mano), senyala, brazos_arriba, jarras, pensar, cruzados |
| `accion` | `caminar`: cruza la escena de `desde` a `hasta` (posiciones x de 0 a 1) |
| `x`, `y` | Dónde están sus pies en la imagen (0-1). `y` 0.9 por defecto. Se quedan pegados al suelo 3D |
| `escala` | Tamaño (1.0 con un personaje, 0.8 con varios) |
| `habla` | `true` si mueve la boca y gesticula con la voz (por defecto el primero) |
| `voltear` | `true` para que mire al otro lado |
| `mirar` | -1, 0 o 1: desvío fijo de la mirada (además del movimiento natural de los ojos) |

Máximo recomendado: 3 personajes por escena.
