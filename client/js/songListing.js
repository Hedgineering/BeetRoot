const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector("#dropdown-menu");

const songName = document.querySelector("#song-name");
const artist = document.querySelector("#artist");
const shares = document.querySelector("#shares");
const purchases = document.querySelector("#purchases");
const streams = document.querySelector("#streams");
const price = document.querySelector("#price");

// dummy data
listedSong = {
  creator: {
    //more stuff is here but keeping it simple
    name: "Metro Boomin",
  },
  song: {
    genre: "638e8a6296fe394b65ad6038", //object id
    name: "Superhero",
    duration: 200,
    explicit: true,
    license: "example license",
    description: "example description",
    likes: 12344,
    shares: 1332,
    purchases: 1239,
    streams: 124910,
  },
  format: [
    {
      song: "638e8a6296fe394b65ad603c",
      type: "Digital",
      price: 2.99,
    },
    {
      song: "638e8a6296fe394b65ad603c",
      type: "Vinyl",
      price: 12.99,
    },
    {
      type: "CD",
      price: 5.99,
    },
  ],
};

songName.textContent = listedSong.song.name;
artist.textContent = listedSong.creator.name;
shares.textContent = "Shares: " + listedSong.song.shares;
streams.textContent = "Streams: " + listedSong.song.streams;
purchases.textContent = "Purchases: " + listedSong.song.purchases;

// dropdown.on("hide.bs.dropdown", () => {
//   console.log("Format Selected");
// });

console.log(dropdownMenu.innerHTML);

listedSong.format.forEach((f) => {
  console.log("adding " + f.type);
  dropdownMenu.innerHTML += `<a id="${f.type}" class="dropdown-item" href="#">${f.type}</a>`;
  console.log(dropdownMenu.innerHTML);
  document.querySelector(`#${f.type}`).addEventListener(
    "click",
    () => {
      price.textContent = "Price: $" + f.price;
      console.log("set price for " + f.type);
    },
    false
  );
});
