//const tables = document.querySelectorAll(".table");

// tables.forEach((table) => {
//   table.addEventListener("click", (e) => {
//     console.log("table clicked");
//   });
// });

// load data from api, dummy data for now

songs = [
  {
    artist: "Lil Baby",
    genre: "Hip Hop",
    title: "Life Goes On",
    duration: 247,
    explicit: true,
    license: "license info",
    description: "sample description",
    published: Date.now(),
    likes: 123,
    shares: 12,
    purchases: 1,
    streams: 1234,
  },
  {
    artist: "Kanye West",
    genre: "Hip Hop",
    title: "Good Life",
    duration: 207,
    explicit: true,
    license: "license info",
    description: "sample description",
    published: Date.now(),
    likes: 122,
    shares: 12,
    purchases: 1,
    streams: 1234,
  },
];

const populateTable = () => {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ``;

  let counter = 1;
  songs.forEach((song) => {
    tableBody.innerHTML =
      tableBody.innerHTML +
      `<tr>
      <th scope="row">${counter}</th>
      <td>${song.title}</td>
      <td>${song.artist}</td>
      <td>${song.likes}</td>
      <td>${
        Math.floor(song.duration / 60) +
        ":" +
        (song.duration % 60).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })
      }</td>
    </tr>`;
    counter += 1;
  });
};

populateTable();

document.querySelector("[key='title']").addEventListener("click", (e) => {
  songs.sort((a, b) => a.title.localeCompare(b.title));
  populateTable();
});

document.querySelector("[key='artist']").addEventListener("click", (e) => {
  songs.sort((a, b) => a.artist.localeCompare(b.artist));
  populateTable();
});

document.querySelector("[key='likes']").addEventListener("click", (e) => {
  songs.sort((a, b) => b.likes - a.likes);
  populateTable();
});

document.querySelector("[key='duration']").addEventListener("click", (e) => {
  songs.sort((a, b) => a.duration - b.duration);
  populateTable();
});
