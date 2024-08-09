const powers = ['Russia', 'France', 'Germany', 'Austria', 'Turkey', 'Italy', 'England'] as const;
type Power = (typeof powers)[number];

const players = {
  Russia: { name: '', link: '' },
  France: { name: '', link: '' },
  Germany: { name: '', link: '' },
  Austria: { name: '', link: '' },
  Turkey: { name: '', link: '' },
  Italy: { name: '', link: '' },
  England: { name: '', link: '' },
} as Record<Power, { name: string; link: string }>;

const powerRegex = new RegExp(`(${powers.join('|')})`, 'g');
const emPowerRegex = new RegExp(`<em>(${powers.join('|')})</em>`, 'g');
let arePlayersSet = false;

async function deferRetrieval<T>(
  callback: () => T,
  validator = (val: any) => !!val,
  delay = 100
): Promise<T> {
  try {
    const deferred = await new Promise<T>((resolve) => {
      window.setTimeout(() => {
        resolve(callback());
      }, delay);
    });
    if (validator(deferred)) return deferred;
    else return deferRetrieval(callback, validator, delay * 2);
  } catch (error) {
    console.error('deferRetrieval error', error);
    return deferRetrieval(callback, validator, delay * 2);
  }
}

function getPlayerNames(infoPanel: HTMLTableElement) {
  let parentHeader: HTMLTableCellElement;
  infoPanel.querySelectorAll('th').forEach((header) => {
    if (header.textContent === 'Players') {
      parentHeader = header;
    }
  });
  if (!parentHeader!) return console.error('parentHeader not found');
  const parentTR = parentHeader!.parentElement;
  if (!parentTR) return console.error('parentTR not found');
  const listItems = parentTR?.querySelectorAll('li');
  listItems.forEach((listItem) => {
    const player = listItem.querySelector('a');
    if (!player) return console.error('player not found');
    const playerName = player.textContent?.trim().replace('\n', '').split('#')[0];
    const playerPower = listItem.textContent?.match(powerRegex)?.[0] as Power;
    const playerLink = player.href;
    if (!playerName || !playerPower) return console.error('playerName or playerPower not found');
    players[playerPower] = { name: playerName, link: playerLink };
  });
  arePlayersSet = true;
}

let isAppendingOrders = false;
function appendPlayerNamesToOrders() {
  if (isAppendingOrders) return;
  isAppendingOrders = true;
  let allSucceeded = true;
  const ordersTable = document.querySelector('table#orders-text') as HTMLTableElement;
  if (!ordersTable) throw new Error('ordersTable not found');
  const rows = ordersTable.querySelectorAll('tr');
  rows.forEach((row) => {
    if (row.innerHTML.includes('bn-set')) return;
    const countryDiv = row.querySelector('div.country') as HTMLDivElement;
    if (!countryDiv) return (allSucceeded = false);
    const powerText = countryDiv.textContent?.match(powerRegex)?.[0] as Power;
    if (!powerText) return (allSucceeded = false);
    const player = players[powerText];
    if (!player) return;
    const a = `<a class="bn-set" href="${player.link}">${player.name}</a>`;
    const th = row.querySelector('th') as HTMLTableCellElement;
    th.innerHTML += ` (${a})`;
  });
  isAppendingOrders = false;
  return allSucceeded;
}

let isAppendingPressMessages = false;
function appendPlayerNamesToPressMessages() {
  if (isAppendingPressMessages) return;
  isAppendingPressMessages = true;
  let allSucceeded = true;
  const pressMessages = document.querySelector('div#press-messages') as HTMLDivElement;
  if (!pressMessages) throw new Error('pressMessages not found');
  pressMessages.querySelectorAll('em').forEach((em) => {
    if (em.innerHTML.includes('bn-set')) return;
    const powerText = em.textContent?.match(powerRegex)?.[0] as Power;
    if (!powerText) return (allSucceeded = false);
    const player = players[powerText];
    if (!player) return (allSucceeded = false);
    em.classList.add('bn-set');
    const a = `<a href="${player.link}">${player.name}</a>`;
    em.innerHTML = `${powerText} (${a})`;
  });
  isAppendingPressMessages = false;
  return allSucceeded;
}

let isAppendingPressThreadHeaders = false;
function appendPlayerNamesToPressThreadHeaders() {
  if (isAppendingPressThreadHeaders) return;
  isAppendingPressThreadHeaders = true;
  let allSucceeded = true;
  const pressThreadHeaders = document.querySelectorAll(
    'a.press-thread-header'
  ) as NodeListOf<HTMLAnchorElement>;
  pressThreadHeaders.forEach((header) => {
    const ems = header.querySelectorAll('em');
    ems.forEach((em) => {
      // for these, I actually just want to replace the power name "Turkey" eg, with a link to the player's profile
      if (em.innerHTML.includes('bn-set')) return;
      const powerText = em.textContent?.match(powerRegex)?.[0] as Power;
      if (!powerText) return (allSucceeded = false);
      const player = players[powerText];
      if (!player) return (allSucceeded = false);
      em.classList.add('bn-set');
      const innerHTML = em.innerHTML;
      const a = `<a href="${player.link}" title="${player.name}">${powerText}</a>`;
      const lastIndex = innerHTML.lastIndexOf(powerText);

      if (lastIndex !== -1) {
        const beforeLast = innerHTML.substring(0, lastIndex);
        const afterLast = innerHTML.substring(lastIndex + powerText.length);
        em.innerHTML = beforeLast + a + afterLast;
      }
    });
  });
  isAppendingPressThreadHeaders = false;
  return allSucceeded;
}

const getInfoPanel = async (): Promise<HTMLTableElement> => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = window.location.pathname.split('/');
      const url = `${window.location.origin}/game/${path[2]}/${path[3]}/ajax/info`;
      const requested = await fetch(url);
      const requestedText = await requested.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(requestedText, 'text/html');
      return resolve(doc.querySelector('table') as HTMLTableElement);
    } catch (error) {
      console.error('getInfoPanel request error', error);
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const infoPanel = document.querySelector('div#info') as HTMLDivElement;
        const infoPanelTable = infoPanel?.querySelector('table') as HTMLTableElement;
        if (infoPanelTable?.nodeName === 'TABLE') {
          observer.disconnect();
          resolve(infoPanelTable);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

async function init() {
  const infoPanel = await getInfoPanel();

  await deferRetrieval(
    () => getPlayerNames(infoPanel),
    () => arePlayersSet
  );
  appendPlayerNamesToOrders();

  // Initialize the MutationObserver
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const target = mutation.target as Element;
        // early return if target is not actually an element
        if (!(target instanceof Element)) return;

        // Handle the "load more" button for press headers
        if (target.matches('#press-headers')) {
          deferRetrieval(appendPlayerNamesToPressThreadHeaders);
        }

        // Handle press messages
        if (target.matches('#press-messages')) {
          deferRetrieval(appendPlayerNamesToPressMessages);
        }
      }
    }
  });
  const pressElement = document.getElementById('press');

  observer.observe(pressElement as Node, {
    childList: true,
    subtree: true,
  });
}

init();
