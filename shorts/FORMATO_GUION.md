# Formato del guion (`guiones/<slug>.json`)

```json
{
  "titulo": "Por Qué El Rojo Siempre Va Arriba",
  "descripcion": "Una frase para la descripción de YouTube.",
  "hashtags": ["#curiosidades", "#sabiasque", "#shorts"],
  "voz": "em_alex",
  "velocidad": 1.1,
  "escenas": [
    {
      "texto": "Lo que dice el narrador en esta escena.",
      "fondo": "english prompt describing ONLY the place, no people",
      "zoom": "in",
      "personajes": [
        {"vestuario": "policia", "expresion": "chulo", "pose": "senyala", "x": 0.5, "habla": true}
      ]
    }
  ]
}
```

| Campo | Valores |
|---|---|
| `voz` | `em_alex` (hombre, recomendada), `em_santa` (hombre grave), `ef_dora` (mujer) |
| `velocidad` | 1.0-1.2 (1.1 da ritmo de short) |
| `zoom` | `in` (acercar, por defecto) o `out` |
| `vestuario` | normal, preso, policia, guardia, millonario, caballero, minero, vaquero, soldado, general, marinero, capitan, samurai, rey, cientifico, conductor, obrero, granjero, doctor, ninio |
| `expresion` | neutral, feliz, chulo, enfadado, furioso (ojos rojos), sorprendido, triste, asustado, pensativo |
| `pose` | normal, saludo, senyala, brazos_arriba, jarras |
| `x` | posición horizontal 0-1 (por defecto: centrado, o repartidos si hay varios) |
| `escala` | tamaño (1.15 con 1 personaje, 0.95 con varios) |
| `habla` | `true` si mueve la boca con la voz (por defecto el primero) |
| `voltear` | `true` para que mire al otro lado |
| `mirar` | -1, 0 o 1: hacia dónde miran los ojos |

Máximo recomendado: 3 personajes por escena.
