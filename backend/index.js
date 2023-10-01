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
  const timeDifference = currentDateTime - inputDateTime

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (timeDifference < week) {
    const daysAgo = Math.floor(timeDifference / day)
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`
  } else if (timeDifference < month) {
    const weeksAgo = Math.floor(timeDifference / week)
    return `${weeksAgo} week${weeksAgo !== 1 ? 's' : ''} ago`
  } else if (timeDifference < year) {
    const monthsAgo = Math.floor(timeDifference / month)
    return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`
  } else {
    const yearsAgo = Math.floor(timeDifference / year)
    return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`
  }
}

function yearStats(entries) {
  const currentYear = new Date().getFullYear()

  const currentYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear
  })

  const previousYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear - 1
  })

  const currentYearCount = currentYearEntries.length
  const previousYearCount = previousYearEntries.length

  const percentChange = previousYearCount !== 0 ? ((currentYearCount - previousYearCount) / previousYearCount) * 100 : 100

  const uniqueArtistsCurrentYear = []
  for (let entry of currentYearEntries) {
    for (let artist of entry.artists) {
      if (!uniqueArtistsCurrentYear.includes(artist)) uniqueArtistsCurrentYear.push(artist)
    }
  }

  const uniqueArtistsPreviousYear = []
  for (let entry of previousYearEntries) {
    for (let artist of entry.artists) {
      if (!uniqueArtistsPreviousYear.includes(artist)) uniqueArtistsPreviousYear.push(artist)
    }
  }

  const currentYearUniqueCount = uniqueArtistsCurrentYear.length
  const previousYearUniqueCount = uniqueArtistsPreviousYear.length

  const uniquePercentChange =
    previousYearUniqueCount !== 0 ? ((currentYearUniqueCount - previousYearUniqueCount) / previousYearUniqueCount) * 100 : 100

  return {
    currentYearCount,
    percentChange,
    unique: currentYearUniqueCount,
    uniquePercent: uniquePercentChange,
  }
}

function calculateTopArtistsAndVenues(entries, dateRange) {
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const oneDecade = 10 * oneYear

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const currentDate = new Date()

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

  const artistCount = {}
  const venueCount = {}

  filteredEntries.forEach((entry) => {
    entry.artists.forEach((artist) => {
      artistCount[artist] = (artistCount[artist] || 0) + 1
    })

    const venue = entry.venue
    venueCount[venue] = (venueCount[venue] || 0) + 1
  })

  const topArtists = Object.entries(artistCount)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topVenues = Object.entries(venueCount)
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    topArtists,
    topVenues,
  }
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
    year: {
      num: `${stats.currentYearCount}`,
      pct:
        stats.percentChange > 0
          ? `${Math.floor(stats.percentChange)}% more than last year`
          : `${Math.floor(Math.abs(stats.percentChange))}% less than last year`,
    },
    unique: {
      num: `${stats.unique}`,
      pct:
        stats.uniquePercent > 0
          ? `${Math.floor(stats.uniquePercent)}% more than last year`
          : `${Math.floor(Math.abs(stats.uniquePercent))}% less than last year`,
    },
  })
})

app.get('/top/:range', async (req, res) => {
  const allEntries = await db.fetch()
  const top = calculateTopArtistsAndVenues(allEntries.items, req.params.range)
  res.sendStatus(200).json(top)
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
