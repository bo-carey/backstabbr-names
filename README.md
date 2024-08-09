# Backstabbr Names

Backstabbr Names is a cross-browser extension designed to enhance the user interface of the online Diplomacy game client, Backstabbr. It adds player names to various parts of the game interface, such as orders, press messages, and press thread headers, making it easier to remember who you're interacting with.

## Features

- Fetches player information from the game's info panel.
- Appends player names to orders.
- Appends player names to press messages.
- Appends player names to press thread headers.
- Uses MutationObserver to detect changes in the game's interface and update player names accordingly.

## Code Overview

The script defines several constants and types related to the game's powers and players. It also defines several regular expressions for matching power names in the game's interface.

The `deferRetrieval` function is used to delay the execution of a callback function until a certain condition is met.

The `getPlayerNames` function fetches player names from the game's info panel.

The `appendPlayerNamesToOrders`, `appendPlayerNamesToPressMessages`, and `appendPlayerNamesToPressThreadHeaders` functions append player names to various parts of the game's interface.

The `getInfoPanel` function fetches the game's info panel.

The `init` function initializes the script, fetching player names and setting up a MutationObserver to detect changes in the game's interface.

## Usage

This script is designed to be run as a browser extension. It should be included as a script in the extension's manifest file, and will run in the context of the Backstabbr game's web interface.

## Limitations

This script is specific to the Backstabbr game's current interface and may not work if the game's interface changes. It also relies on certain elements being present in the game's interface, and may not work correctly if these elements are not present.

## Future Work

Future improvements could include making the script more robust to changes in the Backstabbr game's interface, and adding more features to enhance the game's user interface.
