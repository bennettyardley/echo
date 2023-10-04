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
    case 'gif':
      return 'image/gif'
    // Add more cases as needed for other image formats
    default:
      return 'application/octet-stream' // Default to binary data
  }
}

app.get('/formData', async (req, res) => {
  const allEntries = await db.fetch()
  let venues = []
  let artists = []
  for (let entry of allEntries.items) {
    if (!venues.includes(entry.venue) && entry.venue !== null && entry.venue !== undefined && entry.venue !== '') venues.push(entry.venue)
    for (let artist of entry.artists) {
      if (!artists.includes(artist) && artist !== null && artist !== undefined && artist !== '') artists.push(artist)
    }
  }
  res.json({ venues, artists })
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

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
