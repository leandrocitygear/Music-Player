const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const ARTIST_ARTWORK_DIR = path.join(
  app.getPath("userData"),
  "artist-artwork"
);


// Make sure the folder exists
if (!fs.existsSync(ARTIST_ARTWORK_DIR)) {
  fs.mkdirSync(ARTIST_ARTWORK_DIR, {
    recursive: true
  });
}


// =========================
// GET DEEZER ARTIST
// =========================

async function findDeezerArtist(artistName) {

  try {

    const url =
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    return data.data[0];

  } catch (error) {

    console.error(
      "Deezer artist search failed:",
      error.message
    );

    return null;
  }
}


// =========================
// DOWNLOAD ARTWORK
// =========================

async function downloadArtistArtwork(
  artistName,
  artistId
) {

  const artist = await findDeezerArtist(
    artistName
  );

  if (!artist) {

    console.log(
      `No Deezer artist found for: ${artistName}`
    );

    return null;
  }


  const imageUrl =
    artist.picture_xl ||
    artist.picture_big ||
    artist.picture_medium;


  if (!imageUrl) {

    console.log(
      `No artwork found for: ${artistName}`
    );

    return null;
  }


  const filePath = path.join(
    ARTIST_ARTWORK_DIR,
    `${artistId}.jpg`
  );


  try {

    const response = await fetch(
      imageUrl
    );

    if (!response.ok) {
      return null;
    }


    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );


    fs.writeFileSync(
      filePath,
      buffer
    );


    console.log(
      `Artist artwork saved: ${artistName}`
    );


    return filePath;

  } catch (error) {

    console.error(
      `Failed downloading artwork for ${artistName}:`,
      error.message
    );

    return null;
  }
}


module.exports = {
  findDeezerArtist,
  downloadArtistArtwork
};