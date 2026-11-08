# F1 Circle of Doom Card

A timing-based **pit-stop rejoin estimate** for Home Assistant and [F1 Sensor](https://github.com/Nicxe/f1_sensor). Public timing is enough — no F1TV subscription, account token, GPS feed or external JavaScript library required.

**v0.1.0 · Experimental.** This is a gap-based estimate, not a professional strategy system or a live track map. The interface is currently German.

![Circle of Doom with synthetic demo data](docs/preview.jpg)

## Features

- Driver selection via dropdown or circle marker, with team colours.
- Adjustable total pit loss and ± uncertainty window.
- Estimated rejoin position, position range, and the cars immediately ahead and behind.
- Responsive layout, keyboard-accessible controls and explicit waiting states.
- No invented positions: projection pauses when required data is missing or unreliable.
- MIT licensed. No trackers, telemetry, requests to third parties or HA service calls.

## Installation

### Manual

1. Install F1 Sensor (developed against **v6.2.0**) and enable live data plus **Driver positions**, **Current session**, **Session status** and **Track status** in its configuration. The modular F1 Sensor card can work even when these separate entities are disabled: this card specifically needs the entities.
2. Download [dist/f1-circle-of-doom-card.js](dist/f1-circle-of-doom-card.js) and copy it to `/config/www/f1-circle-of-doom-card.js` (some systems display this directory as `/homeassistant/www`).
3. Add a dashboard resource: URL `/local/f1-circle-of-doom-card.js?v=0.1.0`, type **JavaScript module**. Reload your dashboard.
4. Add a manual card using the configuration below. Replace the entity IDs with the actual IDs in your installation; older installations may use names such as `sensor.f1_drivers_driver_positions`.

### HACS / Marketplace custom repository

The repository contains a HACS manifest and a built JavaScript module in `dist`.
Add `https://github.com/maikelfuhrmann/ha-f1-circle-of-doom-card` as a custom **Dashboard** repository, then install it. This repository is not part of the default catalog. Manual installation is the verified installation path for this first release; HACS installation has not yet been end-to-end tested.

```yaml
type: custom:f1-circle-of-doom-card
title: Circle of Doom
entity: sensor.f1_driver_positions
session_entity: sensor.f1_current_session
session_status_entity: sensor.f1_session_status
track_status_entity: sensor.f1_track_status
pit_loss: 22
uncertainty: 2
stale_after: 90
```

All four entity settings are required. `driver: "4"` optionally sets the initial racing number. `reference_lap_seconds: 72` optionally overrides the reference lap; otherwise the card uses the median of the leader's last three recorded laps, requiring at least two valid samples. The override only affects the circle scale and lap-boundary guard.

**22 ± 2 seconds is a starting assumption, not an Interlagos or other circuit-specific measurement.** Enter the expected total time lost relative to staying on track, including pit-lane transit and stationary service. Controls in the card are temporary for that card instance; save YAML defaults for persistence. They never change integration settings or other cards.

## Reading the circle

The leader is fixed at twelve o'clock. Increasing time gaps run clockwise; one full circle represents the reference lap. Markers show **relative time gaps**, not physical track coordinates or interpolated movement.

The selected driver's gap plus the chosen pit loss is the estimated rejoin gap. The red arc is the ± uncertainty window; the white diamond is its centre. The position range is a scenario range, not a statistical confidence interval. Competitors tied at a boundary are conservatively counted ahead.

Assumptions: all other drivers stay on track and keep their current relative pace; no traffic, tyre warm-up, penalties, double stacking or rival pit stops are modelled. Session delay is inherited from F1 Sensor's entity updates. The card does not add its own delay.

### When the projection pauses

- Outside live Race or Sprint sessions, or during yellow, red, SC or VSC conditions.
- Unavailable sensors, missing timestamps, data older than `stale_after` seconds, or clocks more than ten seconds in the future.
- Missing gaps, inconsistent order, duplicate drivers, fewer than two active drivers, or insufficient reference lap samples.
- Any active driver in the pits, exiting the pits or stopped. This intentionally suppresses estimates during changing pit-cycle order.
- Explicit lap deficits or an estimated window reaching the end of the reference lap. This first version does not resolve lapped traffic.

Freshness uses the timing entity's `last_reported` when present, otherwise `last_updated`. This checks the entity timestamp, not each individual upstream field. F1 Sensor may retain some values; the underlying feed is not guaranteed complete. A future race is needed to validate actual live behaviour; current tests cover synthetic scenarios and the real between-session state.

## Development

Node.js 20+ and Python 3 (preview server only); no npm dependencies.

```sh
npm run check       # model tests, reproducible build, JS syntax
npm run preview     # http://127.0.0.1:8766/examples/preview.html
```

The preview is a separate page using explicitly labelled synthetic data. It is never used as a fallback in Home Assistant. `src/model.js` contains the pure calculation; `src/card.js` renders the custom element. `npm run build` generates the standalone distribution file. CI checks that committed output matches the source.

## Support this project

If this card is useful to you, you can [buy me a coffee via PayPal](https://paypal.me/maikeltimo). Donations are optional; all features stay free.

## Sources and independence

- [F1 Sensor driver timing schema](https://nicxe.github.io/f1_sensor/entities/driver-positions)
- [Public live data availability](https://nicxe.github.io/f1_sensor/entities/live-data)
- [Home Assistant custom cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)

Independent community project, not affiliated with Formula 1, the FIA, any team, Home Assistant, or F1 Sensor. No official marks, broadcast graphics, audio or video are distributed. MIT license covers this project's code, not third-party data.
