const express = require('express')
const { Deta } = require('deta')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.options('*', cors())

const port = process.env.PORT || 8080

const deta = Deta()
const db = deta.Base('echo')
const db2 = deta.Base('artists')
const drive = deta.Drive('echo')

function d2s(date) {
  const currentDate = new Date()
  const dateObj = new Date(date)
  const inputDateTime = dateObj.getTime()
  const currentDateTime = currentDate.getTime()
  const timeDifference = inputDateTime - currentDateTime

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (timeDifference < 0) {
    // Date is in the past
    if (timeDifference > -day) {
      return 'Today'
    } else if (timeDifference > -week) {
      const daysAgo = Math.floor(-timeDifference / day)
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`
    } else if (timeDifference > -month) {
      const weeksAgo = Math.floor(-timeDifference / week)
      return `${weeksAgo} week${weeksAgo !== 1 ? 's' : ''} ago`
    } else if (timeDifference > -year) {
      const monthsAgo = Math.floor(-timeDifference / month)
      return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`
    } else if (timeDifference > -year * 2) {
      return 'Last year'
    } else {
      const yearsAgo = Math.floor(-timeDifference / year)
      return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`
    }
  } else if (timeDifference < day) {
    return 'Today'
  } else if (timeDifference < week) {
    const daysLeft = Math.floor(timeDifference / day)
    return `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
  } else if (timeDifference < month) {
    const weeksLeft = Math.floor(timeDifference / week)
    return `In ${weeksLeft} week${weeksLeft !== 1 ? 's' : ''}`
  } else if (timeDifference < year) {
    const monthsLeft = Math.floor(timeDifference / month)
    return `In ${monthsLeft} month${monthsLeft !== 1 ? 's' : ''}`
  } else if (timeDifference < year * 2) {
    return 'Next year'
  } else {
    const yearsLeft = Math.floor(timeDifference / year)
    return `In ${yearsLeft} year${yearsLeft !== 1 ? 's' : ''}`
  }
}

function yearStats(entries) {
  const currentYear = new Date().getFullYear()

  // Filter entries for the current year
  const currentYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear
  })

  // Filter entries for the previous year
  const previousYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear - 1
  })

  // Calculate counts and changes for the current and previous year
  const currentYearCount = currentYearEntries.length
  const previousYearCount = previousYearEntries.length
  const change = currentYearCount - previousYearCount
  const percentChange = previousYearCount !== 0 ? Math.abs(Math.round((change / previousYearCount) * 100)) : 100
  const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same'

  // Calculate unique artists for the current and previous year
  const uniqueArtistsCurrentYear = new Set()
  for (let entry of currentYearEntries) {
    for (let artist of entry.artists) {
      uniqueArtistsCurrentYear.add(artist)
    }
  }
  const currentYearUniqueCount = uniqueArtistsCurrentYear.size

  const uniqueArtistsPreviousYear = new Set()
  for (let entry of previousYearEntries) {
    for (let artist of entry.artists) {
      uniqueArtistsPreviousYear.add(artist)
    }
  }
  const previousYearUniqueCount = uniqueArtistsPreviousYear.size

  // Calculate changes in unique artists for the current and previous year
  const uniqueChange = currentYearUniqueCount - previousYearUniqueCount
  const uniquePercentChange = previousYearUniqueCount !== 0 ? Math.abs(Math.round((uniqueChange / previousYearUniqueCount) * 100)) : 100
  const uniqueChangeType = uniqueChange > 0 ? 'increase' : uniqueChange < 0 ? 'decrease' : 'same'

  // Calculate total number of entries (all time)
  const totalEntriesCount = entries.length

  // Calculate total number of unique artists (all time)
  const allTimeUniqueArtists = new Set()
  for (let entry of entries) {
    for (let artist of entry.artists) {
      allTimeUniqueArtists.add(artist)
    }
  }
  const totalUniqueArtistsCount = allTimeUniqueArtists.size

  // Create objects for total concerts and unique artists
  const totalConcerts = {
    count: currentYearCount,
    percentChange,
    change,
    changeType,
    total: totalEntriesCount,
  }

  const uniqueArtists = {
    count: currentYearUniqueCount,
    percentChange: uniquePercentChange,
    change: uniqueChange,
    changeType: uniqueChangeType,
    total: totalUniqueArtistsCount,
  }

  return { totalConcerts, uniqueArtists }
}

function calculateTopArtistsAndVenues(entries, artists, dateRange) {
  // Define time intervals
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const oneDecade = 10 * oneYear

  // Filter entries based on the selected date range
  const currentDate = new Date()
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)

    switch (dateRange) {
      case 'allTime':
        return true
      case 'lastYear':
        return currentDate - entryDate <= oneYear
      case 'lastDecade':
        return currentDate - entryDate <= oneDecade
      default:
        return false
    }
  })

  // Count artists and venues occurrences
  const artistCount = {}
  const venueCount = {}
  const venueMediaMap = {} // Map to store media associated with venues

  filteredEntries.forEach((entry) => {
    entry.artists.forEach((artist) => {
      artistCount[artist] = (artistCount[artist] || 0) + 1
    })

    const venue = entry.venue
    venueCount[venue] = (venueCount[venue] || 0) + 1

    // Store media associated with venues
    if (entry.media && entry.media.length > 0 && !venueMediaMap[venue]) {
      venueMediaMap[venue] = entry.media[0]
    }
  })

  // Sort artists and venues by count in descending order
  const sortedArtists = Object.entries(artistCount)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const sortedVenues = Object.entries(venueCount)
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Match artists and venues to their media
  const topArtistMedia = sortedArtists.map((entry) => {
    const artist = entry.artist
    const matchingArtist = artists.find((a) => a.key === artist)
    return {
      artist,
      count: entry.count,
      media: matchingArtist ? (matchingArtist.media ? matchingArtist.media[0] || '' : '') : '',
    }
  })

  const topVenueMedia = sortedVenues.map((entry) => {
    const venue = entry.venue
    return {
      venue,
      count: entry.count,
      media: venueMediaMap[venue] || '',
    }
  })

  return { topArtistMedia, topVenueMedia }
}

function getContentType(fileName) {
  const extension = fileName.split('.').pop()
  switch (extension) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    default:
      return 'application/octet-stream' // Default to binary data
  }
}

function search(entries, query) {
  return new Promise((resolve, reject) => {
    // Normalize the query to lowercase for case-insensitive search
    const normalizedQuery = query.toLowerCase()

    // Filter entries based on the search query
    const searchedEntries = entries.filter((entry) => {
      // Check if any artist name matches the query
      const artistMatch = entry.artists.some((artist) => artist.toLowerCase().includes(normalizedQuery))

      // Check if the venue name matches the query
      const venueMatch = entry.venue.toLowerCase().includes(normalizedQuery)

      // Return true if either artist or venue matches the query
      return artistMatch || venueMatch
    })

    // Resolve the Promise with the searched entries
    resolve(searchedEntries)
  })
}

app.get('/formData', async (req, res) => {
  const allEntries = await db.fetch()
  let venues = []
  let artists = []
  let genres = []
  for (let entry of allEntries.items) {
    if (!venues.includes(entry.venue) && entry.venue !== null && entry.venue !== undefined && entry.venue !== '') venues.push(entry.venue)
    for (let artist of entry.artists) {
      if (!artists.includes(artist) && artist !== null && artist !== undefined && artist !== '') artists.push(artist)
    }
    if (entry.genres) {
      for (let genre of entry.genres) {
        if (!genres.includes(genre) && genre !== null && genre !== undefined && genre !== '') genres.push(genre)
      }
    }
  }
  res.json({ venues, artists, genres })
})

app.get('/artist/:artist/:page', async (req, res) => {
  const allEntries = await db.fetch({ 'artists?contains': req.params.artist })
  const dbMedia = await db2.get(req.params.artist)
  const pages = Math.ceil(allEntries.count / 10)

  const start = (req.params.page - 1) * 10
  const end = Math.min(start + 10, allEntries.count)

  allEntries.items.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })

  const slicedEntries = allEntries.items.slice(start, end)

  let entries = []
  for (let entry of slicedEntries) {
    entries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }

  let media = []
  if (dbMedia) {
    if (dbMedia.media) media = dbMedia.media
  }

  res.status(200).json({ pages, entries, media, count: allEntries.count })
})

app.get('/venue/:venue/:page', async (req, res) => {
  const allEntries = await db.fetch({ venue: req.params.venue })
  const pages = Math.ceil(allEntries.count / 10)

  const start = (req.params.page - 1) * 10
  const end = Math.min(start + 10, allEntries.count)

  allEntries.items.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })

  const slicedEntries = allEntries.items.slice(start, end)

  let entries = []
  let media = []
  for (let entry of slicedEntries) {
    entries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
    if (entry.media) {
      for (let img of entry.media) {
        if (!media.includes(img)) media.push(img)
      }
    }
  }

  res.status(200).json({ pages, entries, media, count: allEntries.count })
})

app.get('/stats', async (req, res) => {
  const allEntries = await db.fetch()
  const stats = yearStats(allEntries.items)

  res.json({
    concerts: {
      num: stats.totalConcerts.count,
      pct: stats.totalConcerts.percentChange,
      change: stats.totalConcerts.change,
      changeType: stats.totalConcerts.changeType,
      total: stats.totalConcerts.total,
    },
    artists: {
      num: stats.uniqueArtists.count,
      pct: stats.uniqueArtists.percentChange,
      change: stats.uniqueArtists.change,
      changeType: stats.uniqueArtists.changeType,
      total: stats.uniqueArtists.total,
    },
  })
})

app.get('/top/:range', async (req, res) => {
  const allEntries = await db.fetch()
  const allArtists = await db2.fetch()
  const { topArtistMedia, topVenueMedia } = calculateTopArtistsAndVenues(allEntries.items, allArtists.items, req.params.range)
  res.status(200).json({ artists: topArtistMedia, venues: topVenueMedia })
})

app.patch('/entry', async (req, res) => {
  let update = {}
  for (let key in req.body) {
    if (key !== 'id') update[key] = req.body[key]
  }
  try {
    await db.update(update, req.body.id)
  } catch (err) {
    console.log(err)
  }
  res.sendStatus(200)
})

app.put('/artist', async (req, res) => {
  for (let artist of req.body.artists) {
    try {
      const entry = await db2.get(artist)
      let update = entry.media || []
      if (!update.includes(req.body.media)) update.push(req.body.media)
      try {
        await db2.update({ media: update }, artist)
      } catch (err) {
        console.log(err)
      }
    } catch (err) {
      await db2.put({ media: [req.body.media] }, artist)
    }
  }
  res.sendStatus(200)
})

app.put('/media', async (req, res) => {
  const entry = await db.get(req.body.id)
  let update = entry.media || []
  if (!update.includes(req.body.media)) update.push(req.body.media)
  try {
    await db.update({ media: update }, req.body.id)
  } catch (err) {
    console.log(err)
  }
  res.sendStatus(200)
})

app.patch('/media', async (req, res) => {
  const entry = await db.get(req.body.id)
  let update = entry.media || []
  if (update.includes(req.body.media)) update = update.filter((item) => item !== req.body.media)
  try {
    await db.update({ media: update }, req.body.id)
  } catch (err) {
    console.log(err)
  }
  for (let artist of req.body.artists) {
    try {
      const artistEntry = await db2.get(artist)
      let update = artistEntry.media || []
      if (update.includes(req.body.media)) {
        update = update.filter((item) => item !== req.body.media)
        await db2.update({ media: update }, artist)
      }
    } catch (err) {
      continue
    }
  }
  res.sendStatus(200)
})

app.post('/entry', async (req, res) => {
  const entry = await db.put(req.body)
  res.json({ id: entry.key })
})

app.get('/entry/:id', async (req, res) => {
  const entry = await db.get(req.params.id)
  res.json(entry)
})

app.get('/entries/:page', async (req, res) => {
  const allEntries = await db.fetch()
  const pages = Math.ceil(allEntries.count / 10)

  const start = (req.params.page - 1) * 10
  const end = Math.min(start + 10, allEntries.count)

  allEntries.items.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })

  const slicedEntries = allEntries.items.slice(start, end)

  const entries = []
  for (let entry of slicedEntries) {
    entries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }

  res.status(200).json({ pages, entries })
})

app.get('/search/:query/:page', async (req, res) => {
  const allEntries = await db.fetch()
  const searchedEntries = await search(allEntries.items, req.params.query)

  const pages = Math.ceil(searchedEntries.length / 10)

  const start = (req.params.page - 1) * 10
  const end = Math.min(start + 10, searchedEntries.length)

  searchedEntries.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })

  const slicedEntries = searchedEntries.slice(start, end)

  const entries = []
  for (let entry of slicedEntries) {
    entries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }

  res.status(200).json({ pages, entries })
})

app.delete('/entry/:id', async (req, res) => {
  await db.delete(req.params.id)
  res.sendStatus(200)
})

app.get('/image/:name', async (req, res) => {
  const blob = await drive.get(req.params.name)
  const contentType = getContentType(req.params.name)

  const buffer = await blob.arrayBuffer()

  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Length', blob.size.toString())
  res.send(Buffer.from(buffer))
})

app.get('/key', async (req, res) => {
  res.json({ key: process.env.DETA_PROJECT_KEY })
})

app.get('/data', async (req, res) => {
  const echo = [
    { artists: ['Dom Dolla'], date: '2023-02-12T03:14:00.000Z', key: '1gwl1ewzfafo', venue: 'The Ave' },
    {
      artists: ['Martin Garrix', 'Joel Corry', 'Audien', 'Vintage Culture', 'James Hype', 'Wooli', 'Whethan', 'Troyboi', 'DJ Snake'],
      date: '2022-11-14T03:34:00.000Z',
      key: '200vafqlrca8',
      venue: 'EDC Orlando',
    },
    {
      artists: ['Lil Durk', 'Roddy Ricch', 'Bobby Shmurda', 'Justin Bieber'],
      date: '2021-09-06T02:26:00.000Z',
      key: '4skhzk4fvop3',
      venue: 'Made in America',
    },
    { artists: ['Loud Luxury'], date: '2019-11-10T02:57:00.000Z', key: '5e5bu76d3dtn', venue: 'Franklin Music Hall' },
    { artists: ['Armnhmr'], date: '2021-08-21T02:06:00.000Z', key: '5y12u62oo63z', venue: 'The Ave' },
    { artists: ['Martin Garrix'], date: '2019-09-29T01:52:00.000Z', key: '6ajy17tw7f8j', venue: 'Wells Fargo Center' },
    { artists: ['Galantis'], date: '2019-03-29T01:50:00.000Z', key: '6qxececuh8g8', media: ['IMG_2963.jpg'], venue: 'Franklin Music Hall' },
    { artists: ['100 gecs'], date: '2020-04-27T02:03:00.000Z', key: '73dxynmfoaqj', venue: 'The Foundry' },
    { artists: ['Seven Lions', 'Mitis'], date: '2023-05-13T02:16:00.000Z', key: '75p9iprexjht', venue: 'The Fillmore Philly' },
    { artists: ['100 gecs'], date: '2021-12-09T03:11:00.000Z', key: '7c4lw91tmzt0', media: ['IMG_1403.jpg'], venue: 'Union Transfer' },
    { artists: ['Illenium', 'Blackbear', '21 Savage', 'Tiesto'], date: '2019-08-12T02:24:00.000Z', key: '7z59m1euwq1b', venue: 'Moonrise' },
    {
      artists: ['Riz La Vie', 'Johan Lenox'],
      date: '2023-03-03T03:15:00.000Z',
      key: '8dqplyki48gc',
      media: ['IMG_5054.jpg'],
      venue: 'The Foundry',
    },
    {
      artists: ['Travis Scott', 'Kygo', 'Brockhampton', 'Alison Wonderland', '$uicideboy$', 'Saba', 'Passion Pit', 'Flipp Dinero'],
      date: '2019-06-23T02:22:00.000Z',
      key: '8dtu1vsxguek',
      venue: 'Firefly',
    },
    {
      artists: [
        'Cheat Codes',
        'Adventure Club',
        'Two Friends',
        'Zedd',
        'Mitis',
        'Audien',
        'Lost Kings',
        'Subtronics',
        'Zeds Dead',
        'Don Diablo',
        'Teisto',
      ],
      date: '2022-08-08T02:31:00.000Z',
      key: '8fd2mio52fxb',
      venue: 'Moonrise',
    },
    { artists: ['100 gecs'], date: '2023-04-27T02:16:00.000Z', key: '8ymreuelvnr9', venue: 'Franklin Music Hall' },
    { artists: ['Charli XCX'], date: '2022-04-19T02:13:00.000Z', key: 'advrgz2yax9m', venue: 'The Fillmore Philly' },
    {
      artists: ['The Lumineers', 'Death Cab for Cutie', 'Grouplove'],
      date: '2019-06-03T01:50:00.000Z',
      key: 'afz9giqit8to',
      venue: 'BB\u0026T Pavilion',
    },
    { artists: ['Subtronics'], date: '2023-02-18T03:15:00.000Z', key: 'ahc0rra6rcde', media: ['IMG_5031.jpg'], venue: 'The Met Philly' },
    { artists: ['Mitis'], date: '2021-10-16T02:08:00.000Z', key: 'bj4ojs5k0tvl', media: ['IMG_1235.jpg'], venue: 'The Ave' },
    { artists: ['Cash Cash'], date: '2021-08-15T02:05:00.000Z', key: 'bvv7n3rv49md', venue: 'The Ave' },
    {
      artists: ['Wavedash', 'Crankdat', 'Gryffin', 'Tiesto', 'Kream', 'Timmy Trumpet', 'Madeon', 'Zeds Dead', 'Kygo', 'Kill The Noise'],
      date: '2023-05-01T02:35:00.000Z',
      key: 'cdgk688q7yoy',
      venue: 'Project Glow',
    },
    { artists: ['24kGoldn'], date: '2022-05-17T03:00:00.000Z', key: 'ci3q4iuo84iw', venue: 'The Foundry' },
    { artists: ['Hardwell'], date: '2023-05-18T02:38:00.000Z', key: 'cl77eifzmmus', venue: 'NOTO' },
    { artists: ['Jack Harlow', 'Swae Lee'], date: '2022-04-22T02:29:00.000Z', key: 'e842p9a2v2wq', venue: 'Liacouras Center' },
    { artists: ['Porter Robinson'], date: '2021-10-18T02:09:00.000Z', key: 'f246m6r409j3', venue: 'The Met Philly' },
    { artists: ['Amine'], date: '2022-03-02T03:12:00.000Z', key: 'f4bhy0hr2jkj', media: ['IMG_2002.jpeg'], venue: 'The Fillmore Philly' },
    { artists: ['Amine'], date: '2019-10-06T02:25:00.000Z', key: 'frt98eo7oy0d', venue: 'Lot F' },
    {
      artists: [
        'Earthgang',
        '99 Neighbors',
        '24kGoldn',
        'Billie Eilish',
        'Bleachers',
        'Cordae',
        'Amine',
        'A$AP Rocky',
        'Dominic Fike',
        'Post Malone',
      ],
      date: '2021-09-27T02:28:00.000Z',
      key: 'ft2ne0pouelg',
      venue: 'Governors Ball',
    },
    { artists: ['100 gecs', 'Tony Velour'], date: '2020-02-07T03:02:00.000Z', key: 'hewrvg7tnsg2', venue: 'Rotunda' },
    { artists: ['Puppet'], date: '2022-10-09T02:13:00.000Z', key: 'hq8dvxhki6vk', venue: 'Kung Fu Necktie' },
    { artists: ['Party Favor'], date: '2022-10-16T02:14:00.000Z', key: 'ihw32xaj7xlf', venue: 'Marquee' },
    { artists: ['Ericdoa'], date: '2022-04-30T02:13:00.000Z', key: 'jtknzum6h6g1', venue: 'The Foundry' },
    { artists: ['Madeon'], date: '2019-12-05T03:00:00.000Z', key: 'lbcojyegsspy', media: ['IMG_3938.jpg'], venue: 'Franklin Music Hall' },
    {
      artists: ['Brockhampton', 'Slowthai', '100 gecs'],
      date: '2019-11-28T02:59:00.000Z',
      key: 'lmj8kc9ftpdt',
      media: ['IMG_3892.jpg'],
      venue: 'The Fillmore Philly',
    },
    { artists: ['Glaive', 'aldn', 'midwxst'], date: '2022-02-21T03:11:00.000Z', key: 'ltce3jcxvkb3', venue: 'The Foundry' },
    { artists: ['Saint Motel'], date: '2020-02-11T03:02:00.000Z', key: 'nn9r9jqar73u', venue: 'Theatre of Living Arts' },
    { artists: ['Buku'], date: '2020-03-01T03:03:00.000Z', key: 'nrc5qqb9w8si', venue: 'The Ave' },
    { artists: ['Smallpools'], date: '2021-11-06T02:10:00.000Z', key: 'nx3h59x9op8k', venue: 'The Foundry' },
    {
      artists: ['Slander', 'Wavedash', 'Zomboy'],
      date: '2023-10-08T12:13:00.000Z',
      genres: [],
      key: 'o5nfu7iqx763',
      location: null,
      rating: 0,
      venue: 'Brooklyn Mirage',
    },
    {
      artists: ['Zomboy', 'Ray Volpe', 'Loud Luxury', 'Sam Feldt', 'Alok', 'Dillon Francis', 'Alan Walker', 'Kaskade'],
      date: '2023-08-14T02:39:00.000Z',
      genres: [],
      key: 'om5mp7ilhnx8',
      venue: 'Moonrise',
    },
    {
      artists: ['Neon Trees', 'Laundry Day'],
      date: '2023-09-27T02:17:00.000Z',
      genres: [],
      key: 'oxkfv2vfarwt',
      media: ['IMG_6739.jpg'],
      rating: 0,
      venue: 'Theatre of Living Arts',
    },
    {
      artists: ['Young the Giant', 'Walk the Moon', 'Matt and Kim', 'lovelytheband'],
      date: '2019-02-10T03:19:00.000Z',
      key: 'pscewgdezwsf',
      venue: 'Wells Fargo Center',
    },
    { artists: ['AJR'], date: '2019-11-15T02:58:00.000Z', key: 'rdr95c94ei3p', venue: 'The Met Philly' },
    { artists: ['Flo Rida', 'Bebe Rexha'], date: '2021-07-05T02:04:00.000Z', key: 'sfkgwk6v4zyh', venue: 'The Mann' },
    { artists: ['Emo Night Brooklyn'], date: '2021-08-14T02:05:00.000Z', key: 'tu1jlpt10k4d', venue: 'The Foundry' },
    { artists: ['Injury Reserve'], date: '2019-09-27T01:51:00.000Z', key: 'v4me18jdfllx', venue: 'The Foundry' },
    { artists: ['Flux Pavilion'], date: '2023-05-13T02:37:00.000Z', key: 'wbnriiizbe2x', media: ['IMG_5319.jpg'], venue: 'The Ave' },
    {
      artists: ['Jaden Smith', 'Will Smith', 'Tyler Cole'],
      date: '2019-11-26T02:58:00.000Z',
      key: 'wvtyauxn8uba',
      venue: 'The Fillmore Philly',
    },
    { artists: ['Deadmau5'], date: '2020-01-25T03:01:00.000Z', key: 'yuk4ikw4h68c', venue: 'The Met Philly' },
    {
      artists: ['Vince Staples', 'Galantis', 'Illenium', 'Marshmello'],
      date: '2018-08-13T02:17:00.000Z',
      key: 'ywt0zracokyd',
      venue: 'Moonrise',
    },
    { artists: ['NOTD'], date: '2021-10-02T02:08:00.000Z', key: 'z5rqxg6nhlob', media: ['IMG_4024.jpg'], venue: 'The Ave' },
    { artists: ['Earl Sweatshirt', 'Na-Kel Smith'], date: '2019-03-29T01:49:00.000Z', key: 'zvxbi6ao52h3', venue: 'Baltimore Soundstage' },
  ]

  const artists = [
    { key: '100 gecs', media: ['IMG_1403.jpg'] },
    { key: 'Amine', media: ['IMG_2002.jpeg'] },
    { key: 'Brockhampton', media: ['IMG_3892.jpg'] },
    { key: 'Flux Pavilion', media: ['IMG_5319.jpg'] },
    { key: 'Galantis', media: ['IMG_2963.jpg'] },
    { key: 'Johan Lenox', media: ['IMG_5054.jpg'] },
    { key: 'Madeon', media: ['IMG_3938.jpg'] },
    { key: 'Mitis', media: ['IMG_1235.jpg'] },
    { key: 'NOTD', media: ['IMG_4024.jpg'] },
    { key: 'Neon Trees', media: ['IMG_6739.jpg'] },
    { key: 'Subtronics', media: ['IMG_5031.jpg'] },
  ]

  for (let i = 0; i < echo.length; i += 25) {
    const chunk = echo.slice(i, i + 25)
    await db.putMany(chunk)
  }
  for (let i = 0; i < artists.length; i += 25) {
    const chunk = artists.slice(i, i + 25)
    await db2.putMany(chunk)
  }
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
