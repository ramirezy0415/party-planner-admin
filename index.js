// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-CT-WEB-PT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function addParty(partyObj) {
  try {
    await fetch(`${API}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(partyObj),
    });
    await getParties();
  } catch (error) {
    console.log(error, "Error with /POST");
  }
}

async function removeParty(id) {
  try {
    await fetch(`${API}/events/${id}`, {
      method: "DELETE",
    });
    if (selectedParty && selectedParty.id === id) {
      selectedParty = null;
    }
    await getParties();
  } catch (error) {
    console.log(error, "Error with /DELETE");
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button class="delete" data-action="delete" data-id="${selectedParty.id}">
      Delete Party
    </button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  $party
    .querySelector(".delete")
    .addEventListener("click", async function (event) {
      event.preventDefault();
      const id = event.currentTarget.dataset.id;
      await removeParty(id);
    });

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function AddParty() {
  const $form = document.createElement("form");
  $form.innerHTML = `
        <label for="name">Name</label>
        <input type="text" name="name" type="name" id="name" required>
        <label for="description">Description</label>
        <input type="text" name="description" type="description" id="description" required>
        <label for="date">Date</label>
        <input name="date" type="date" id="date" required>
        <label for="location">Location</label>
        <input type="text" name="location" type="location" id="location" required>
        <button>Add Party</button>
  `;

  $form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const data = new FormData($form);
    const isoDate = new Date(data.get("date")).toISOString();
    const newPartyObj = {
      name: data.get("name"),
      description: data.get("description"),
      date: isoDate,
      location: data.get("location"),
    };

    await addParty(newPartyObj);
    $form.reset();
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section id="add-event">
        <h2>Add a new party</h2>
        <AddParty></AddParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("AddParty").replaceWith(AddParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
