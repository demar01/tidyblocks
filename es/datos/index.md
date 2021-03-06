---
permalink: /es/datos/
title: "Datos"
language: es
headings:
- id: colores
  text: Colores
- id: terremotos
  text: Terremotos
- id: pingüinos
  text: Pingüinos
- id: secuencia
  text: Secuencia
- id: datos-de-usuario
  text: Datos de usuario
---

## Colores

<img class="block" src="{{page.permalink | append: 'colors.svg' | relative_url}}" alt="color block"/>

Los conjuntos de datos `colores` tiene valores rojo-verde-azul (RGB) para once colores estándar:
negro, rojo, granate, lima, verde, azul, azul marino, amarillo, fucsia, aguamarina y blanco
Cada valor es un número entero en el rango 0… 255.

| Columna    | Tipodedatos        | Valor       |
| ---------  | ---------------    | ----------- |
| name       | text               | nombre color|
| red        | integer (0…255)    | valor rojo  |
| green      | integer (0…255)    | valor verde |
| blue       | integer (0…255)    | valor azul  |

## Terremotos

<img class="block" src="{{page.permalink | append: 'earthquakes.svg' | relative_url}}" alt="earthquakes block"/>

Este bloque proporciona un subconjunto de datos del Servicio Geológico de EE. UU. sobre terremotos de 2016.

| Columna   | Tipodedatos    | Valor |
| --------- | -----------    | ----- |
| Time      | datetime       | Tiempo universal coordinado |
| Latitude  | number         | grados fraccionarios |
| Longitude | number         | grados fraccionarios |
| Deepth_Km | number (km)    | profundidad en kilómetros fraccionarios |
| Magnitude | number         | Escala Richter  |

## Pingüinos

<img class="block" src="{{page.permalink | append: 'penguins.svg' | relative_url}}" alt="penguins block"/>

| Columna            | Tipodedatos    | Valor |
| -----------------  | -----------    | ----- |
| species            | text           | tipo de pingüino |
| island             | text           | donde se encontro al pingüino |
| bill_length_mm     | number (mm)    | longuitud del pico |
| bill_depth_mm      | number (mm)    | profundidad del pico |
| flipper_length_mm  | number (mm)    | longuitud de las aletas |
| body_mass_g        | number (g)     | masa corporal |
| sex                | text           | sexo |

## Sequencia

<img class="block" src="{{page.permalink | append: 'sequence.svg' | relative_url}}" alt="sequence block"/>

Cre una secuencia de números del 1 al N inclusive.

- **nombre**: El nombre de la columna que contiene los valores.
- **rango**: El límite superior del rango.

## Datos de usuario

<img class="block" src="{{page.permalink | append: 'user_data.svg' | relative_url}}" alt="user data block"/>

Utilice un conjunto de datos previamente cargado.

- *desplegable*: Seleccione el conjunto de datos por nombre.
 