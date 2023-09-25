const express = require('express')
const { Deta } = require('deta')
const multer = require('multer')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const upload = multer({ dest: './tmp/media/' })
const port = process.env.PORT || 8080

const deta = Deta()
const db = deta.Base('echo')

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

function calculateTopEntries(entries, artistName, dateRange) {
  // Get the current date
  const currentDate = new Date()

  // Define time intervals in milliseconds for last year and last decade
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const oneDecade = 10 * oneYear

  // Filter entries by artist name
  const filteredEntries = entries.filter((entry) => {
    return entry.artist === artistName
  })

  // Filter entries by date range
  const filteredEntriesByDate = filteredEntries.filter((entry) => {
    const entryDate = new Date(entry.date)

    switch (dateRange) {
      case 'allTime':
        return true // No date filter for all time
      case 'lastYear':
        return currentDate - entryDate <= oneYear
      case 'lastDecade':
        return currentDate - entryDate <= oneDecade
      default:
        return false
    }
  })

  // Sort entries by a relevant metric (e.g., by date or another field)
  // Replace 'date' with the actual field you want to sort by
  filteredEntriesByDate.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA // Sort in descending order by date
  })

  // Get the top 5 entries
  const topEntries = filteredEntriesByDate.slice(0, 5)

  return topEntries
}

app.options('*', cors())

app.get('/formData', async (req, res) => {
  const allEntries = await db.fetch()
  let venues = []
  let artists = []
  for (let entry of allEntries.items) {
    if (!venues.includes(entry.venue) && entry.venue !== null) venues.push(entry.venue)
    for (let artist of entry.artists) {
      if (!artists.includes(artist) && artist !== null) artists.push(artist)
    }
  }
  res.json({ venues, artists })
})

app.get('/artist/:artist', async (req, res) => {
  const entries = await db.fetch({ 'artists?contains': req.params.artist })
  let formattedEntries = []
  let media = []
  for (let entry in entries.items) {
    formattedEntries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }
  res.json({ entries: formattedEntries, media })
})

app.get('/venue/:venue', async (req, res) => {
  const entries = await db.fetch({ venue: req.params.venue })
  let formattedEntries = []
  let media = []
  for (let entry in entries.items) {
    formattedEntries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }
  res.json({ entries: formattedEntries, media })
})

app.get('/stats', async (req, res) => {
  const allEntries = await db.fetch()
  const stats = yearStats(allEntries.items)

  res.json({
    year: {
      num: `${stats.currentYearCount}`,
      pct: `${stats.percentChange.toFixed(2)}%`,
    },
    unique: {
      num: `${stats.unique}`,
      pct: `${stats.uniquePercent.toFixed(2)}%`,
    },
  })
})

app.get('/top', async (req, res) => {
  const allEntries = await db.fetch()
  calculateTopEntries(allEntries.items)
  res.sendStatus(200)
})

app.post('/upload', upload.array('media'), function (req, res) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  console.log(req.files)
  res.send(200)
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

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
