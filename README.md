# Protein Meter

A simple, mobile-first protein tracker. Tap +1, +5, +10, +20, +25 or +30 g after each meal and watch the meter fill toward your daily target.

## Features

- **Evidence-based target** from body weight, using the muscle-growth range of 1.6–2.2 g/kg/day
  - Minimum: 1.6 g/kg, Optimal: 1.9 g/kg, Upper: 2.2 g/kg
- **Visual meter** that fills from bottom to top, with headroom to show when you go over
- **Quick-add buttons** plus a custom amount (accepts `12.5` or `12,5`)
- **Undo**, remove single entries, or clear a day
- **Edit past days** with the ‹ › arrows or by tapping a bar in the 7-day chart
- **Automatic daily reset** at local midnight, with 60 days of history
- **Saved in your browser** (localStorage), no account or server needed
- Light and dark mode, follows your system setting

## Data

Data is stored only in your browser under the `protein-meter-v1` localStorage key. It does not sync between devices, and clearing site data removes it.

## Science

- Morton et al. (2018), _British Journal of Sports Medicine_: gains in fat-free mass plateau around 1.6 g/kg/day; the upper confidence bound reaches ~2.2 g/kg/day.
- Jäger et al. (2017), ISSN Position Stand: Protein and Exercise.
- Schoenfeld & Aragon (2018), _JISSN_: 1.6–2.2 g/kg/day spread over at least four meals.
